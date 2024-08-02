export interface TodoListProps {
  _id: string;
  name?: string;
  completed?: boolean;
  updatedAt?: number;
}

export interface Checkpoint {
  updatedAt: number;
  _id: string;
}

export interface RxBlockDocument {
  id: string;
  name: string;
  updatedAt: number;
}
