// Read theme design tokens as concrete colors for <canvas>, which cannot use CSS vars.
// Re-read on demand so the visual follows light/dark and org-branding changes.
export function readToken(name: string, fallback = "#000000"): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function vizPalette() {
  return {
    fg: readToken("--fg", "#111111"),
    muted: readToken("--muted", "#6B6B6B"),
    border: readToken("--border", "#E8E8E5"),
    surface: readToken("--surface", "#FFFFFF"),
    accent: readToken("--brand-accent", "#0D9488"),
    verified: readToken("--color-verified", "#059669"),
    failed: readToken("--color-failed", "#DC2626"),
  };
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}
