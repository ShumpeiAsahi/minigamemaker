import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // runtime のソースを直接参照
      "@my-maker/runtime": resolve(__dirname, "../../packages/runtime/src")
    }
  }
});
