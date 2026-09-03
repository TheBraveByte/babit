import type { ReactNode } from "react";

/**
 * Marketing layout primitives. Every landing section is built from these so the
 * measure, vertical rhythm, header alignment and card treatment stay identical
 * down the page.
 */

export function Section({
  id,
  tone = "base",
  size = "default",
  className = "",
  children,
}: {
  id?: string;
  tone?: "base" | "raised";
  size?: "default" | "lg";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`${size === "lg" ? "section-y-lg" : "section-y"} border-t ${className}`}
      style={{
        borderColor: "var(--border)",
        backgroundColor: tone === "raised" ? "var(--secondary)" : "var(--bg)",
      }}
    >
      <div className="container-babit">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <header
      className={`${align === "center" ? "mx-auto text-center" : ""} max-w-[46rem] ${className}`}
    >
      {eyebrow && <p className="type-eyebrow mb-4">{eyebrow}</p>}
      <h2 className="type-h2" style={{ color: "var(--fg)" }}>
        {title}
      </h2>
      {lead && <p className="type-lead mt-5">{lead}</p>}
    </header>
  );
}

export function LandingCard({
  className = "",
  padding = "default",
  emphasis = "flat",
  children,
}: {
  className?: string;
  padding?: "default" | "none";
  emphasis?: "flat" | "raised";
  children: ReactNode;
}) {
  return (
    <div
      className={`h-full transition-colors duration-200 ${padding === "default" ? "p-6 sm:p-7" : ""} ${className}`}
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "6px",
        boxShadow: emphasis === "raised" ? "0 1px 2px 0 color-mix(in srgb, var(--fg) 3%, transparent)" : "none",
      }}
    >
      {children}
    </div>
  );
}

/**
 * CardGrid — a flush grid where cards share hairline borders (Cloudflare style).
 * No gap between cards. The outer container has one border; each card adds
 * only its left and top border so lines are never doubled.
 */
export function CardGrid({
  cols = 3,
  className = "",
  children,
}: {
  cols?: 2 | 3 | 4;
  className?: string;
  children: ReactNode;
}) {
  const colClass = cols === 4 ? "lg:grid-cols-4" : cols === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3";
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 ${colClass} ${className}`}
      style={{
        border: "1px solid var(--border-subtle)",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

/**
 * FlushCard — a card designed to sit inside CardGrid. No rounded corners,
 * no individual border. Only a left + top hairline so borders join cleanly.
 */
export function FlushCard({
  className = "",
  padding = "default",
  children,
}: {
  className?: string;
  padding?: "default" | "none";
  children: ReactNode;
}) {
  return (
    <div
      className={`h-full transition-colors duration-200 ${padding === "default" ? "p-6 sm:p-7" : ""} ${className}`}
      style={{
        borderLeft: "1px solid var(--border-subtle)",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      {children}
    </div>
  );
}

export function CardIcon({ children }: { children: ReactNode }) {
  return (
    <div
      className="w-8 h-8 rounded-babit-sm flex items-center justify-center"
      style={{ backgroundColor: "transparent", border: "none", color: "var(--brand-accent)" }}
    >
      {children}
    </div>
  );
}