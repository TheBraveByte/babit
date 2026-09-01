import createClient from "openapi-fetch";
import type { paths } from "./schema";

const apiKey = import.meta.env.VITE_API_KEY as string | undefined;

let authToken: string | null = typeof window !== "undefined" ? localStorage.getItem("babit_token") : null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem("babit_token", token);
  } else {
    localStorage.removeItem("babit_token");
  }
}

export function getAuthToken(): string | null {
  return authToken || (typeof window !== "undefined" ? localStorage.getItem("babit_token") : null);
}

export const api = createClient<paths>({
  baseUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080",
  headers: {
    ...(apiKey ? { "x-api-key": apiKey } : {}),
  },
});

// Middleware to inject Authorization header dynamically
api.use({
  async onRequest({ request }) {
    const token = getAuthToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
});

export function errText(error: unknown): string {
  if (!error) return "request failed";
  if (typeof error === "string") return error;
  const e = error as { message?: string; error?: string };
  return e.message || e.error || JSON.stringify(error);
}
