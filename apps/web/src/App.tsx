
import { RxDocument } from "rxdb";
import { Component, createEffect, createSignal, onMount } from "solid-js";
import { API } from "./api";
import { DBType, initDb } from "./db/init";
import { createStore, produce } from "solid-js/store";
import { TodoList } from "./components";
import { BroadcastChannel } from 'broadcast-channel';
import { TodoListProps } from "./types";

const App: Component= () => {
  const [db, setDB] = createSignal<DBType | null>(null);
  const [api, setAPI] = createSignal<API>();  
  const channel = new BroadcastChannel('todo-task');

  const [todos, setTodos] = createStore<RxDocument<TodoListProps>[]>([]);
  let input!: HTMLInputElement;

  const addTodo = async (text: string) => {
    try {
      const response = await api()?.addTodo(text);
      if (response) {
        channel.postMessage({ action: 'add', todo: response.toJSON() });
        setTodos(
        produce((todos) => {
          todos.push(response);
        })
      );
      }  
      
    } catch (error) {
      console.log('error ass', error);  
    }
  }

   const removeTodo = async (id: string) => {
    try {
      await api()?.removeTodoById(id);
      channel.postMessage({ action: 'remove', id });

      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error('Failed to remove todo:', error);
    }
  };

  const fetchTodos = async () => {
      await api()?.getTodos().then(data => {
      setTodos([...data]);
    });
  }

  onMount(async() => {        
    const initializedDb = await initDb();
    setDB(initializedDb);
    setAPI(new API(initializedDb));

    channel.onmessage = (message) => {            
        if (message.action === 'add') {
          setTodos(
            produce((todos) => {
              todos.push(message.todo);
            })
          );
        } else if (message.action === 'remove') {
          setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== message.id));
        }
      };
  });

   createEffect(() => {        
    if (api()) {
      fetchTodos();
    }
  });

  return <div class="bg-slate-500 p-[50px] flex flex-col gap-4">
       <div>
        <input ref={input} />
        <button
          onClick={() => {
            if (!input.value.trim()) return;
            addTodo(input.value);
            input.value = "";
          }}
        >
          Add Todo
        </button>
      </div>
      {todos.length > 0 && <TodoList todos={todos} removeTodo={removeTodo} />}
  </div>
};

export default App;
