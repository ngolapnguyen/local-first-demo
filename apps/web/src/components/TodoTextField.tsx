
function TodoTextField() {
 let input: HTMLInputElement;

  return (
    <div>
        <input ref={input} />
        <button
          onClick={(e) => {
            if (!input.value.trim()) return;
            // setTodos(input.value);
            input.value = "";
          }}
        >
          Add Todo
        </button>
      </div>
  );
}

export default TodoTextField;