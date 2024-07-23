export enum TodoStatus {
  NotStarted = "not-started",
  Done = "done",
}


export interface TodoListProps {
  id: string;
  name: string;
  status: TodoStatus.NotStarted | TodoStatus.Done;
}
