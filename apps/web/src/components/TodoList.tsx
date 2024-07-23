import { RxDocument } from "rxdb";
import { For } from "solid-js";
import { TodoListProps } from "../types";

function TodoList(
  props: {todos: RxDocument<TodoListProps>[], removeTodo: (id: string) => void}
) {
  const { todos, removeTodo } = props;  
  
  return (
      <For each={todos}>
        {(todo) => {
          const { id, name } = todo;                    
          return <div>
            <input
              type="checkbox"
              checked={todo.status === "done"}
              // onchange={[toggleTodo, id]}
            />
            <span
              style={{ "text-decoration": todo.status === 'done' ? "line-through" : "none"}}
              class="ml-2"
            >{name}</span>
            <button type="button" class="ml-2 bg-red-500 p-1 text-white" onClick={() => removeTodo(id)}>Delete</button>
          </div>
        }}
      </For>
  );
}

export default TodoList;