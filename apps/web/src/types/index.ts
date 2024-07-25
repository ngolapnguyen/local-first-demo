export enum TodoStatus {
  New = "new",
  Updated = "updated",
  Deleted = "deleted",
  Synced = "synced",
}


export interface TodoListProps {
  id: string;
  name?: string;
  completed?: boolean;
  status?: TodoStatus;
}
