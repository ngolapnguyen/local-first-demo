import { API } from "../api";
import { TodoStatus } from "../types";

export const syncData = async (api: API) => {
  try {    
    const newTodos = await api.getTodosByStatus(TodoStatus.New);
    const updatedTodos = await api.getTodosByStatus(TodoStatus.Updated);
    const deletedTodos = await api.getTodosByStatus(TodoStatus.Deleted);

    // Sync new and updated todos
    if (newTodos.length > 0 || updatedTodos.length > 0) {
      const response = await fetch('http://localhost:4000/api/todo/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newTodos,
          updatedTodos,
        }),
      });
      const result = await response.json();
      if (result.success) {
        // Mark todos as synced
        const syncedIds = [...newTodos, ...updatedTodos].map(todo => todo.id);
        await api.markTodoAsSynced(syncedIds); 
      }
    }

    if (deletedTodos.length > 0) {
      const response = await fetch('http://localhost:4000/api/todo/syncDeleted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deletedTodos,
        }),
      });
      const result = await response.json();
      if (result.success) {
        const deletedIts = [...deletedTodos].map(todo => todo.id);
        await api.removeTodoByIds(deletedIts); 
      }
    }
  } catch (error) {
    console.error('Failed to sync data:', error);
  }
}