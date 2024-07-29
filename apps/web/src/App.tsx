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
      "http://localhost:4000/api/todo/pullStream",
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

    // Initialize replication
    await setupReplication(initializedDb.collections.todos, myPullStream$);

    // Create observable for the todos query
    (await api.getTodos()).$.subscribe((todos: RxDocument<TodoListProps>[]) => {
      setTodos([...todos]);
    });
  });

  return (
    <div class="bg-slate-500 p-[50px] flex flex-col gap-4">
      <div>
        <input ref={input} />
        <button
          onClick={() => {
            if (!input.value.trim()) return;
            addTodo(input.value);
            input.value = "";
          }}>
          Add Todo
        </button>
      </div>

      {todos.length > 0 && (
        <TodoList
          todos={todos}
          removeTodo={removeTodo}
          toggleTodo={toggleTodo}
        />
      )}
    </div>
  );
};

export default App;
