import { Accessor } from "solid-js";

export interface TodoListProps {
  _id: string;
  name?: string;
  user: User;
  completed?: boolean;
  updatedAt?: number;
}

export interface Checkpoint {
  updatedAt: number;
  id: string;
}

export interface RxBlockDocument {
  id: string;
  name: string;
  updatedAt: number;
}

export interface User {
  googleId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  profileImage: string;
}

export interface AuthContextType {
  user: () => User | null;
  isAuthenticated: Accessor<boolean>;
  checkAuthStatus: () => Promise<void>;
}
