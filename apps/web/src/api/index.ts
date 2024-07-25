import cuid from "cuid";
import { DBType } from "../db/init";
import { TodoListProps, TodoStatus } from "../types";

export class API {
  constructor(readonly db: DBType) {}

  async getTodos() {    
    return this.db.collections.todos.find().exec();
  }

  async getTodosByStatus(status: TodoStatus) {
    return this.db.collections.todos.find({
      selector: {
        status
      },
    }).exec();
  }

  async addTodo(text: string) {
    return this.db.collections.todos.insert({ id: cuid(), name: text, completed: false , status: TodoStatus.New});
  }

  async updateTodo(id: string, newTodo: Partial<TodoListProps>) {
    const todo = await this.db.collections.todos.findOne({ selector: { id} }).exec();
    if (todo) {
      const updateData: Partial<TodoListProps> = {};
      
      if (newTodo.name !== undefined) updateData.name = newTodo.name;
      if (newTodo.completed !== undefined) updateData.completed = newTodo.completed;
      if (newTodo.status !== undefined) updateData.status = newTodo.status;

      return todo.update({
        $set: updateData,
      });
    }
  }

  async removeTodoByIds(ids: string[]) {
   const query = this.db.collections.todos.find({
      selector: {
        id: {
          $in: ids,
        },
      },
    });
    return query.remove();
  }

  async markTodoAsSynced(ids: string[]) {    
    const query = this.db.collections.todos.find({
      selector: {
        id: {
          $in: ids,
        },
      },
    });
    return query.update({
      $set: {
        status: TodoStatus.Synced,
      },
    });
  }
}