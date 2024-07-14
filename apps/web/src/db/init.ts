import cuid from "cuid";
import { createRxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";

export enum TodoStatus {
  NotStarted = "not-started",
  Done = "done",
}

export const initDb = async () => {
  const db = await createRxDatabase({
    name: "nhung-db", // <- name
    storage: getRxStorageDexie(), // <- RxStorage
    password: "myPassword", // <- password (optional)
    multiInstance: true, // <- multiInstance (optional, default: true)
    eventReduce: true, // <- eventReduce (optional, default: false)
    cleanupPolicy: {}, // <- custom cleanup policy (optional)
  });

  const collections = await db.addCollections({
    // key = collectionName
    todos: {
      schema: {
        title: "todo schema",
        version: 0,
        description: "describe a simple todo",
        primaryKey: "id",
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          name: {
            type: "string",
          },
          status: {
            type: "string",
            enum: Object.values(TodoStatus),
            default: TodoStatus.NotStarted,
          },
        },
        required: ["id", "name"],
      },
      statics: {}, // (optional) ORM-functions for this collection
      methods: {}, // (optional) ORM-functions for documents
      attachments: {}, // (optional) ORM-functions for attachments
      options: {}, // (optional) Custom parameters that might be used in plugins
      migrationStrategies: {}, // (optional)
      autoMigrate: true, // (optional) [default=true]
      cacheReplacementPolicy: function () {}, // (optional) custom cache replacement policy
    },
  });

  const todoCollection = collections.todos;
  todoCollection.insert({
    id: cuid(),
    name: "My Todo",
  });

  return {
    db,
    collections,
  };
};
