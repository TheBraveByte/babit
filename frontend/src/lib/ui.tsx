import { useState, type ReactNode } from "react";
import { IconCopy, IconCheck, IconAlertCircle } from "./icons";

/* ─── Card ─────────────────────────────────────────────────────────────────── */
export function Card({
  title,
  subtitle,
  children,
  action,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`border bg-[var(--surface)] rounded-babit-lg shadow-xs overflow-hidden ${className}`}
      style={{ borderColor: "var(--border)" }}
    >
      {title && (
        <header
          className="px-5 py-3.5 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--secondary)" }}
        >
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{title}</h2>
            {subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/* ─── Field ─────────────────────────────────────────────────────────────────── */
export function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: ReactNode;
  hint?: ReactNode;
  error?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: "var(--fg)" }}>{label}</span>
        {hint && <span className="text-[11px]" style={{ color: "var(--muted)" }}>{hint}</span>}
      </div>
      {children}
      {error && (
        <span className="text-xs text-red-600 flex items-center gap-1">
          <IconAlertCircle className="w-3 h-3" />{error}
        </span>
      )}
    </label>
  );
}

/* ─── Input base ────────────────────────────────────────────────────────────── */
const inputCls =
  "w-full rounded-babit border px-3 py-2 text-sm outline-none transition-colors font-mono disabled:opacity-50";

const inputStyle = {
  borderColor: "var(--border)",
  backgroundColor: "var(--surface)",
  color: "var(--fg)",
};

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`${inputCls} ${props.className || ""}`}
      style={{ ...inputStyle, ...props.style }}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${inputCls} min-h-32 resize-y ${props.className || ""}`}
      style={{ ...inputStyle, ...props.style }}
    />
  );
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${inputCls} ${props.className || ""}`}
      style={{ ...inputStyle, ...props.style }}
    >
      {children}
    </select>
  );
}

/* ─── Button ────────────────────────────────────────────────────────────────── */
export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "brand";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 font-medium rounded-babit transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer";

  const sizes = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-[15px]",
  };

  const variants = {
    primary:   "bg-[var(--fg)] text-[var(--surface)] hover:opacity-85 active:opacity-75 shadow-xs",
    secondary: "bg-[var(--surface)] text-[var(--fg)] border border-[var(--border)] hover:bg-[var(--secondary)] shadow-xs",
    danger:    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-xs",
    ghost:     "bg-transparent text-[var(--muted)] hover:bg-[var(--secondary)] hover:text-[var(--fg)]",
    brand:     "bg-[var(--brand-accent)] text-white hover:opacity-90 active:opacity-80 shadow-xs",
  };

  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${props.className || ""}`}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5 text-current shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}

/* ─── Copyable ──────────────────────────────────────────────────────────────── */
export function Copyable({ value, truncate = false }: { value: string; truncate?: boolean }) {
  const [copied, setCopied] = useState(false);
  const displayValue =
    truncate && value.length > 22 ? `${value.slice(0, 10)}…${value.slice(-8)}` : value;

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      title={`Copy: ${value}`}
      className="group inline-flex items-center gap-1.5 font-mono tnum text-xs px-2 py-1 rounded-babit-sm transition-colors"
      style={{
        color: "var(--fg)",
        backgroundColor: "var(--secondary)",
        border: "1px solid var(--border)",
      }}
    >
      <span className="truncate max-w-[200px]">{displayValue}</span>
      <span style={{ color: "var(--muted)" }} className="shrink-0">
        {copied ? <IconCheck className="w-3 h-3 text-emerald-600" /> : <IconCopy className="w-3 h-3" />}
      </span>
    </button>
  );
}

/* ─── MonospaceHash ─────────────────────────────────────────────────────────── */
export function MonospaceHash({ hash }: { hash: string }) {
  return <Copyable value={hash} truncate />;
}

/* ─── StatusPill ────────────────────────────────────────────────────────────── */
export function StatusPill({
  status,
  label,
  ok,
}: {
  status?: "VERIFIED" | "FAILED" | "PENDING" | "ACTIVE" | "REVOKED" | "UNKNOWN";
  label?: string;
  ok?: boolean;
}) {
  const displayLabel = label ?? status ?? (ok ? "VERIFIED" : "FAILED");

  let cls = "";
  let dotCls = "bg-gray-400";

  if (ok === true || status === "VERIFIED" || status === "ACTIVE") {
    cls = "bg-emerald-50 text-emerald-800 border-emerald-200";
    dotCls = "bg-emerald-500";
  } else if (ok === false || status === "FAILED" || status === "REVOKED") {
    cls = "bg-red-50 text-red-800 border-red-200";
    dotCls = "bg-red-500";
  } else if (status === "PENDING") {
    cls = "bg-amber-50 text-amber-800 border-amber-200";
    dotCls = "bg-amber-500";
  } else {
    cls = "bg-[var(--secondary)] text-[var(--muted)] border-[var(--border)]";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-medium tracking-tight ${cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotCls}`} />
      {displayLabel}
    </span>
  );
}

/* ─── MetricCard ────────────────────────────────────────────────────────────── */
export function MetricCard({
  label,
  value,
  change,
  sublabel,
  icon,
}: {
  label: string;
  value: string | number;
  change?: string;
  sublabel?: string;
  icon?: ReactNode;
}) {
  return (
    <div
      className="rounded-babit-lg p-5 shadow-xs"
      style={{
        border: "1px solid var(--border)",
        backgroundColor: "var(--surface)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>
          {label}
        </span>
        {icon && <span style={{ color: "var(--muted)" }}>{icon}</span>}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold font-mono tracking-tight tnum" style={{ color: "var(--fg)" }}>
          {value}
        </span>
        {change && (
          <span className="text-xs font-medium text-emerald-600 font-mono">{change}</span>
        )}
      </div>
      {sublabel && (
        <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{sublabel}</p>
      )}
    </div>
  );
}

/* ─── Json ──────────────────────────────────────────────────────────────────── */
export function Json({ data }: { data: unknown }) {
  return (
    <pre className="overflow-auto rounded-babit-sm p-3.5 text-xs font-mono leading-relaxed max-h-72 bg-[#0E1010] text-[#A8B5A2] border border-[#1C2020]">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

/* ─── Error ─────────────────────────────────────────────────────────────────── */
export function Error({ message }: { message: string }) {
  return (
    <div className="rounded-babit bg-red-50 border border-red-200 p-3 flex items-start gap-2 text-xs font-mono text-red-700">
      <IconAlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
      <span>{message}</span>
    </div>
  );
}

/* ─── EmptyState ────────────────────────────────────────────────────────────── */
export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div
      className="border-dashed border-2 rounded-babit-lg p-10 text-center"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--secondary)" }}
    >
      {icon && (
        <div
          className="mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-3"
          style={{ backgroundColor: "var(--border)", color: "var(--muted)" }}
        >
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{title}</h3>
      <p className="mt-1 text-xs max-w-sm mx-auto" style={{ color: "var(--muted)" }}>{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
