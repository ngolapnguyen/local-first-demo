import { RxDocument } from "rxdb";
import { For } from "solid-js";
import { TodoListProps } from "../types";

function TodoList(
  props: {todos: RxDocument<TodoListProps>[], removeTodo: (id: string) => void, toggleTodo: (id: string) => void}
) {
  const { todos, removeTodo, toggleTodo } = props; 
  
  return (
      <For each={todos}>
        {(todo) => {
          const { id, name } = todo;                    
          return <div>
            <input
              type="checkbox"
              checked={todo.completed}
              onchange={() => toggleTodo(id)}            />
            <span
              style={{ "text-decoration": todo.completed ? "line-through" : "none"}}
              class="ml-2"
            >{name}</span>
            <button type="button" class="ml-2 bg-red-500 p-1 text-white" onClick={() => removeTodo(id)}>Delete</button>
          </div>
        }}
      </For>
  );
}

export default TodoList;