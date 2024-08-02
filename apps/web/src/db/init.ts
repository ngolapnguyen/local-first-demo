import {
  addRxPlugin,
  createRxDatabase,
  RxCollection,
  RxReplicationPullStreamItem,
} from "rxdb";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { Checkpoint, RxBlockDocument, TodoListProps } from "../types";
import { replicateRxCollection } from "rxdb/plugins/replication";
import { RxDBLeaderElectionPlugin } from "rxdb/plugins/leader-election";
import { Subject } from "rxjs";

// Add the update plugin
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBLeaderElectionPlugin);

export async function setupReplication(
  todosCollection: RxCollection<TodoListProps>,
  myPullStream$: Subject<
    RxReplicationPullStreamItem<RxBlockDocument, Checkpoint>
  >
) {
  try {
    const replicationState = await replicateRxCollection({
      collection: todosCollection,
      replicationIdentifier: "my-http-replication",
      live: true,
      retryTime: 5000,
      autoStart: true,
      push: {
        async handler(changeRows) {
          try {
            const rawResponse = await fetch(
              `${import.meta.env.VITE_SERVER_API}/todo/sync/push`,
              {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(changeRows),
              }
            );
            const conflictsArray = await rawResponse.json();
            if (conflictsArray.success) {
              return [];
            } else {
              console.error("Error in push handler:", conflictsArray);
              return conflictsArray.data.conflicts;
            }
          } catch (error) {
            console.error("Push handler failed:", error);
            // return the docs to retry
            return changeRows;
          }
        },
        batchSize: 5,
      },
      pull: {
        async handler(checkpointOrNull) {
          console.log("checkpointOrNull", checkpointOrNull);

          const { updatedAt, id } = checkpointOrNull || { updatedAt: 0, id: 0 };

          const response = await fetch(
            `${import.meta.env.VITE_SERVER_API}/todo/sync/pull?minUpdatedAt=${updatedAt}&id=${id}&limit=10`
          );
          const { data } = await response.json();

          // Extract documents and the new checkpoint from the response
          const { documents, checkpoint } = data;

          // documents and checkpoint are saved in the database
          return {
            documents: documents,
            checkpoint: checkpoint,
          };
        },
        batchSize: 10,
        stream$: myPullStream$.asObservable(),
      },
    });

    return replicationState;
  } catch (error) {
    console.error("ReplicationState error:", error);
  }

  return null;
}

export const initDb = async () => {
  try {
    const db = await createRxDatabase<{
      todos: RxCollection<TodoListProps>;
    }>({
      name: "nhung-db", // <- name
      storage: getRxStorageDexie(), // <- RxStorage
      password: "myPassword", // <- password (optional)
      multiInstance: false, // <- multiInstance (optional, default: true)
      eventReduce: true, // <- eventReduce (optional, default: false)
      cleanupPolicy: {}, // <- custom cleanup policy (optional)
    });

    await db.addCollections({
      // key = collectionName
      todos: {
        schema: {
          title: "todo schema",
          version: 0,
          description: "describe a simple todo",
          primaryKey: "_id",
          type: "object",
          properties: {
            _id: {
              type: "string",
              maxLength: 100,
            },
            name: {
              type: "string",
            },
            completed: {
              type: "boolean",
            },
            updatedAt: {
              type: "number",
            },
          },
          required: ["_id", "name", "status", "updatedAt"],
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

    return db;
  } catch (error) {
    console.error("RxError:", error);
    throw error;
  }
};

export type DBType = Awaited<ReturnType<typeof initDb>>;
