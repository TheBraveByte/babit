import createClient from "openapi-fetch";
import type { paths } from "./schema";

const apiKey = import.meta.env.VITE_API_KEY as string | undefined;


let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  // No longer persist to localStorage. The httpOnly cookie handles persistence.
}

export function getAuthToken(): string | null {
  return authToken;
}

export function clearSessionCookie() {
  fetch(`${apiBaseUrl}/v1/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
}

const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080";

export const api = createClient<paths>({
  baseUrl: apiBaseUrl,
  headers: {
    ...(apiKey ? { "x-api-key": apiKey } : {}),
  },
  credentials: "include",
});

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
