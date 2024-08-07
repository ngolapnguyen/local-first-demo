// src/auth.js
import {
  createSignal,
  createContext,
  useContext,
  onMount,
  JSX,
} from "solid-js";
import { AuthContextType } from "../types";
import apiFetch from "../utils/apiFetch";

const AuthContext = createContext<AuthContextType>();

export function AuthProvider(props: { children: JSX.Element }) {
  const [user, setUser] = createSignal(null);
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);

  const checkAuthStatus = async () => {
    try {
      const response = await apiFetch("check-auth-status", {
        method: "GET",
      });
      if (response.success) {
        setIsAuthenticated(true);
        setUser(response.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  onMount(() => {
    checkAuthStatus();
  });

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, checkAuthStatus }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return authContext;
}
