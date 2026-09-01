import createClient from "openapi-fetch";
import type { paths } from "./schema";

const apiKey = import.meta.env.VITE_API_KEY as string | undefined;

export const api = createClient<paths>({
  baseUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080",
  headers: apiKey ? { "x-api-key": apiKey } : undefined,
});

export function errText(error: unknown): string {
  if (!error) return "request failed";
  if (typeof error === "string") return error;
  const e = error as { message?: string };
  return e.message ?? JSON.stringify(error);
}
