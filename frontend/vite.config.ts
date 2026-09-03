import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
  server: {
    proxy: {
      "/v1": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  preview: {
    proxy: {
      "/v1": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
