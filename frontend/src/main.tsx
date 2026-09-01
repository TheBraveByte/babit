import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "@/App";
import { RouterProvider } from "@/lib/router";
import { AuthProvider } from "@/lib/auth";
import { initTheme } from "@/lib/theme";

initTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider>
        <App />
      </RouterProvider>
    </AuthProvider>
  </StrictMode>,
);
