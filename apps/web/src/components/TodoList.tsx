import { RxDocument } from "rxdb";
import { For } from "solid-js";
import { TodoListProps } from "../types";

function TodoList(props: {
  todos: RxDocument<TodoListProps>[];
  removeTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
}) {
  const { todos, removeTodo } = props;

  return (
    <For each={todos}>
      {(todo) => {
        const { _id, name } = todo;
        return (
          <div class="flex flex-row gap-4 mx-auto items-center w-full">
            <div class="p-2 flex-1 bg-white rounded-md">
              <span>{name}</span>
            </div>
            <button
              type="button"
              class="border rounded-full w-8 h-8 bg-red-600 text-white p-1 hover:bg-red-500"
              onClick={() => removeTodo(_id)}>
              X
            </button>
          </div>
        );
      }}
    </For>
  );
}

export default TodoList;
