import { RxDocument, RxReplicationPullStreamItem } from "rxdb";
import { Checkpoint, RxBlockDocument, TodoListProps } from "../types";
import { API } from "../api";
import { TodoList } from "../components";
import { createStore } from "solid-js/store";
import { createSignal, onMount } from "solid-js";
import { initDb, setupReplication } from "../db/init";
import { Subject } from "rxjs";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [api, setAPI] = createSignal<API>();
  const [todos, setTodos] = createStore<RxDocument<TodoListProps>[]>([]);
  let input!: HTMLInputElement;
  const { user } = useAuth();

  const addNote = () => {
    if (!input.value.trim()) return;
    addTodo(input.value);
    input.value = "";
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      addNote();
    }
  };

  const addTodo = async (text: string) => {
    try {
      api()?.addTodo(text, user());
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };

  const removeTodo = async (id: string) => {
    try {
      api()?.removeTodoByIds([id]);
    } catch (error) {
      console.error("Failed to remove todo:", error);
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      api()?.updateTodo(id, {
        completed: !todos.find((todo) => todo._id === id)?.completed,
      });
    } catch (error) {
      console.error("Failed to toggle todo:", error);
    }
  };

  onMount(async () => {
    const initializedDb = await initDb();

    const api = new API(initializedDb);
    setAPI(api);

    const myPullStream$ = new Subject<
      RxReplicationPullStreamItem<RxBlockDocument, Checkpoint>
    >();
    const eventSource = new EventSource(
      `${import.meta.env.VITE_SERVER_API}/api/todo/pullStream`,
      {
        withCredentials: true,
      }
    );

    eventSource.onmessage = (event) => {
      const eventData = JSON.parse(event.data);
      myPullStream$.next({
        documents: eventData.documents,
        checkpoint: eventData.checkpoint,
      });
    };

    // Handle the client looses the connection
    eventSource.onerror = () => {
      myPullStream$.next("RESYNC");
    };

    // Initialize replication
    await setupReplication(initializedDb.collections.todos, myPullStream$);

    // Create observable for the todos query
    (await api.getTodos()).$.subscribe((todos: RxDocument<TodoListProps>[]) => {
      setTodos([...todos]);
    });
  });

  return (
    <>
      <div class="relative w-[80%] bg-white mx-auto mt-[32px] mb-[16px]">
        <div class="border rounded-md p-4">
          <p class="font-bold">Note</p>
          <input
            ref={input}
            placeholder="Take a note ..."
            class="w-full text-sm"
            onKeyPress={handleKeyPress}
          />
          <div class="text-end">
            <button
              type="button"
              class="text-medium font-boldd border border-primary hover:bg-gray-200 p-1 rounded-md"
              onClick={addNote}>
              Save
            </button>
          </div>
        </div>
      </div>

      <div class="w-[80%] p-2">
        <div class="flex flex-wrap gap-2 ">
          {todos.length > 0 && (
            <TodoList
              todos={todos}
              removeTodo={removeTodo}
              toggleTodo={toggleTodo}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
