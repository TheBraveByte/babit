import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "@/App";
import { AuthProvider } from "@/lib/auth";
import { ErrorBoundary } from "@/lib/ErrorBoundary";
import { RouterProvider } from "@/lib/router";
import { SkipLink } from "@/lib/SkipLink";
import { initTheme } from "@/lib/theme";

initTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider>
          <SkipLink />
          <App />
        </RouterProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
