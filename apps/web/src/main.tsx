import React from "react";
import ReactDOM from "react-dom/client";
import { hello } from "@my-maker/runtime";   // ← パス参照が効く
import App from "./App";
console.log(hello());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
