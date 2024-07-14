import type { Component } from "solid-js";
import { initDb } from "./db/init";

initDb();

const App: Component = () => {
  return <div class="text-red-500">Hello</div>;
};

export default App;
