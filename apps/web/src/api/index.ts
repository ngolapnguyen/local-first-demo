import cuid from "cuid";
import { DBType } from "../db/init";
import { TodoStatus } from "../types";

export class API {
  constructor(readonly db: DBType) {}

  async getTodos() {    
    return this.db.collections.todos.find().exec();
  }

  async addTodo(text: string) {
    return this.db.collections.todos.insert({ id: cuid(), name: text, status: TodoStatus.NotStarted });
  }

  async removeTodoById(id: string) {
    const query = this.db.collections.todos.find({
      selector: {
        id,
      },
    });
    return query.remove();
  }
}