import cuid from "cuid";
import { DBType } from "../db/init";
import { TodoListProps } from "../types";

export class API {
  constructor(readonly db: DBType) {}

  async getTodos() {
    return this.db.collections.todos.find();
  }

  async addTodo(text: string) {
    return this.db.collections.todos.insert({
      _id: cuid(),
      name: text,
      completed: false,
      updatedAt: Date.now(),
    });
  }

  async updateTodo(id: string, newTodo: Partial<TodoListProps>) {
    const todo = await this.db.collections.todos
      .findOne({ selector: { _id: id } })
      .exec();
    if (todo) {
      const updateData: Partial<TodoListProps> = {};

      if (newTodo.name !== undefined) updateData.name = newTodo.name;
      if (newTodo.completed !== undefined)
        updateData.completed = newTodo.completed;

      return todo.update({
        $set: updateData,
      });
    }
  }

  async removeTodoByIds(ids: string[]) {
    const query = this.db.collections.todos.find({
      selector: {
        _id: {
          $in: ids,
        },
      },
    });
    return query.remove();
  }
}
