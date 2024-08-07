import { Component, JSX, onMount, Show } from "solid-js";
import { Route, Router } from "@solidjs/router";
import { Dashboard, Header, Home } from "./pages";
import { AuthProvider, useAuth } from "./context/AuthContext";

const ProtectedRoute = (props: { children?: JSX.Element }) => {
  const { isAuthenticated } = useAuth();

  return (
    <Show
      when={isAuthenticated()}
      fallback={
        <div class="h-full w-full bg-white flex flex-col items-center">
          <p class="text-[28px] text-red-400">You're not logged in</p>
        </div>
      }>
      {props.children}
    </Show>
  );
};

const App: Component = () => {
  return (
    <div class="min-h-screen bg-gray-100 flex flex-col items-center py-6">
      <AuthProvider>
        <Header />
        <Router>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={ProtectedRoute}>
            <Route path="/" component={Dashboard} />
          </Route>
        </Router>
      </AuthProvider>
    </div>
  );
};

export default App;
