// The frontend has no /docs route. The backend gateway serves Scalar API docs
// at its own origin's /docs, so point there rather than at a broken SPA route.
export const docsUrl: string =
  (import.meta.env.VITE_DOCS_URL as string | undefined) ||
  `${(import.meta.env.VITE_API_URL as string | undefined) || ""}/docs`;
