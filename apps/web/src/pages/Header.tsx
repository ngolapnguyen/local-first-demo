import { Show } from "solid-js";
import { useAuth } from "../context/AuthContext";
import apiFetch from "../utils/apiFetch";

const Header = () => {
  const { isAuthenticated } = useAuth();

  const login = () => {
    window.location.href = `${import.meta.env.VITE_SERVER_API}/auth/google`;
  };

  const logout = async () => {
    const response = await apiFetch("logout", {
      method: "POST",
    });

    if (response.success) {
      window.location.href = "/";
    }
  };

  return (
    <header class="w-full bg-primary text-white p-4 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">Local First To-Do App</h1>
        <p class="text-sm">Built with SolidJS, Express, and MongoDB</p>
      </div>
      <Show when={isAuthenticated()}>
        <div class="flex items-center space-x-4">
          <a href="/dashboard">
            <button class="bg-primary text-white border px-4 py-2 rounded hover:bg-white hover:text-primary">
              Dashboard
            </button>
          </a>
          <button
            class="bg-white text-primary px-4 py-2 rounded hover:bg-primary hover:text-white"
            onclick={logout}>
            Sign Out
          </button>
        </div>
      </Show>
      <Show when={!isAuthenticated()}>
        <button class="bg-white text-primary px-4 py-2 rounded" onclick={login}>
          Sign In
        </button>
      </Show>
    </header>
  );
};

export default Header;
