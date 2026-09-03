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
      className={`rounded-babit-md h-full ${padding === "default" ? "p-6 sm:p-7" : ""} ${className}`}
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: emphasis === "raised" ? "0 1px 3px 0 rgba(0,0,0,0.06), 0 12px 32px -20px rgba(0,0,0,0.35)" : "none",
      }}
    >
      {children}
    </div>
  );
}

export function CardIcon({ children }: { children: ReactNode }) {
  return (
    <div
      className="w-9 h-9 rounded-babit flex items-center justify-center"
      style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border-subtle)", color: "var(--fg)" }}
    >
      {children}
    </div>
  );
}