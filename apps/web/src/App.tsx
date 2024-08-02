import { RxDocument, RxReplicationPullStreamItem } from "rxdb";
import { Component, createSignal, onMount } from "solid-js";
import { API } from "./api";
import { initDb, setupReplication } from "./db/init";
import { createStore } from "solid-js/store";
import { TodoList } from "./components";
import { Checkpoint, RxBlockDocument, TodoListProps } from "./types";
import { Subject } from "rxjs";

const App: Component = () => {
  const [api, setAPI] = createSignal<API>();

  const [todos, setTodos] = createStore<RxDocument<TodoListProps>[]>([]);
  let input!: HTMLInputElement;

  const addTodo = async (text: string) => {
    try {
      api()?.addTodo(text);
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
      `${import.meta.env.VITE_SERVER_API}/todo/pullStream`,
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

  return (
    <div class="w-[100vw] h-[100vh]">
      <div class="relative w-[600px] mx-auto mt-[32px] mb-[16px]">
        <div class="border rounded-md p-4">
          <p class="text-gray-400 font-bold">Title</p>
          <input
            ref={input}
            placeholder="Take a note ..."
            class="w-full bg-[#202124] border-none outline-none pt-4 text-sm"
            onKeyPress={handleKeyPress}
          />
          <div class="text-end">
            <button
              type="button"
              class="text-medium font-bold"
              onClick={addNote}>
              Add note
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-4 mt-[32px] mx-8">
        {todos.length > 0 && (
          <TodoList
            todos={todos}
            removeTodo={removeTodo}
            toggleTodo={toggleTodo}
          />
        )}
      </div>
    </div>
  );
};

export default App;
