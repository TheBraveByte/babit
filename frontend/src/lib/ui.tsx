import React, { type ReactNode, useEffect, useRef, useState } from "react";
import { IconAlertCircle, IconCheck, IconCopy, IconShieldCheck } from "./icons";

/* ─── PageHeader (dashboard) ────────────────────────────────────────────────── */
export function PageHeader({
  title,
  description,
  eyebrow,
  action,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="space-y-1 animate-float-up">
        {eyebrow && (
          <span
            className="text-[11px] font-mono uppercase tracking-[0.14em] block"
            style={{ color: "var(--muted)" }}
          >
            {eyebrow}
          </span>
        )}
        <h1 className="text-2xl font-medium tracking-[-0.02em]" style={{ color: "var(--fg)" }}>
          {title}
        </h1>
        {description && (
          <p className="text-sm max-w-2xl" style={{ color: "var(--muted)" }}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

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
      className={`border bg-[var(--surface)] rounded-babit-md overflow-hidden ${className}`}
      style={{ borderColor: "var(--border)" }}
    >
      {title && (
        <header
          className="px-5 py-3.5 flex items-center justify-between"
          style={{
            borderBottom: "1px solid var(--border-subtle)",
            backgroundColor: "var(--secondary)",
          }}
        >
          <div>
            <h2
              className="text-[13px] font-mono font-semibold uppercase tracking-wider"
              style={{ color: "var(--fg)" }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                {subtitle}
              </p>
            )}
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
  id,
}: {
  label: string;
  children: ReactNode;
  hint?: ReactNode;
  error?: string;
  id?: string;
}) {
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  return (
    <label className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: "var(--fg)" }}>
          {label}
        </span>
        {hint && (
          <span id={hintId} className="text-[11px]" style={{ color: "var(--muted)" }}>
            {hint}
          </span>
        )}
      </div>
      {error ? (
        <span id={errorId} aria-live="assertive" className="sr-only">
          {error}
        </span>
      ) : null}
      {/* Clone the child input to inject aria props */}
      {(() => {
        const child = children as React.ReactElement<React.InputHTMLAttributes<HTMLInputElement>>;
        return React.cloneElement(child, {
          id: fieldId,
          "aria-describedby": describedBy,
          "aria-invalid": error ? true : undefined,
        });
      })()}
      {error && (
        <span className="text-xs flex items-center gap-1" style={{ color: "var(--color-failed)" }}>
          <IconAlertCircle className="w-3 h-3" />
          {error}
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
    "inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer";

  const sizes = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-[15px]",
  };

  const variants = {
    primary:
      "rounded-pill bg-[var(--fg)] text-[var(--surface)] hover:opacity-85 active:opacity-75 shadow-xs",
    secondary:
      "rounded-babit bg-[var(--surface)] text-[var(--fg)] border border-[var(--border)] hover:bg-[var(--secondary)] shadow-xs",
    danger:
      "rounded-pill bg-[var(--color-failed)] text-[var(--surface)] hover:opacity-90 active:opacity-80 shadow-xs",
    ghost:
      "rounded-babit bg-transparent text-[var(--muted)] hover:bg-[var(--secondary)] hover:text-[var(--fg)]",
    brand:
      "rounded-pill bg-[var(--brand-accent)] text-[var(--surface)] hover:bg-[var(--brand-accent-hover)] active:opacity-90 shadow-xs",
  };

  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${props.className || ""}`}
    >
      {loading && (
        <svg
          className="animate-spin h-3.5 w-3.5 text-current shrink-0"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
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
        {copied ? (
          <span style={{ color: "var(--color-verified)" }}>
            <IconCheck className="w-3 h-3" />
          </span>
        ) : (
          <IconCopy className="w-3 h-3" />
        )}
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

  // Token-driven tints via color-mix so both light and dark render correctly.
  let color = "var(--muted)";
  let tint = 0;

  if (ok === true || status === "VERIFIED" || status === "ACTIVE") {
    color = "var(--color-verified)";
    tint = 1;
  } else if (ok === false || status === "FAILED" || status === "REVOKED") {
    color = "var(--color-failed)";
    tint = 1;
  } else if (status === "PENDING") {
    color = "var(--color-pending)";
    tint = 1;
  }

  const style = tint
    ? {
        color,
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 32%, transparent)`,
      }
    : { color: "var(--muted)", backgroundColor: "var(--secondary)", borderColor: "var(--border)" };

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-medium tracking-tight"
      style={style}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: tint ? color : "var(--muted)" }}
      />
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
      className="rounded-babit-md p-5"
      style={{
        border: "1px solid var(--border)",
        backgroundColor: "var(--surface)",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-mono uppercase tracking-wider"
          style={{ color: "var(--muted)" }}
        >
          {label}
        </span>
        {icon && <span style={{ color: "var(--muted)" }}>{icon}</span>}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span
          className="text-2xl font-semibold font-mono tracking-tight tnum"
          style={{ color: "var(--fg)" }}
        >
          {value}
        </span>
        {change && (
          <span
            className="text-xs font-medium font-mono"
            style={{ color: "var(--color-verified)" }}
          >
            {change}
          </span>
        )}
      </div>
      {sublabel && (
        <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}

/* ─── Json ──────────────────────────────────────────────────────────────────── */
export function Json({ data }: { data: unknown }) {
  return (
    <pre
      className="overflow-auto rounded-babit-sm p-3.5 text-xs font-mono leading-relaxed max-h-72"
      style={{
        backgroundColor: "var(--secondary)",
        color: "var(--fg)",
        border: "1px solid var(--border)",
      }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

/* ─── Error ─────────────────────────────────────────────────────────────────── */
export function Error({ message }: { message: string }) {
  return (
    <div
      className="rounded-babit p-3 flex items-start gap-2 text-xs font-mono"
      style={{
        color: "var(--color-failed)",
        backgroundColor: "color-mix(in srgb, var(--color-failed) 10%, transparent)",
        border: "1px solid color-mix(in srgb, var(--color-failed) 30%, transparent)",
      }}
    >
      <IconAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
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
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div
      className="border-dashed border-2 rounded-babit-md p-10 text-center"
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
      <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-xs max-w-sm mx-auto" style={{ color: "var(--muted)" }}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ─── Skeleton ──────────────────────────────────────────────────────────────── */
export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={`skeleton ${className}`} style={style} />;
}

/* ─── TableSkeleton ────────────────────────────────────────────────────────── */
export function TableSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div
      className="overflow-hidden rounded-babit"
      style={{ border: "1px solid var(--border-subtle)" }}
    >
      <table className="w-full text-left">
        <thead>
          <tr
            style={{
              borderBottom: "1px solid var(--border-subtle)",
              backgroundColor: "var(--secondary)",
            }}
          >
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-3 py-2">
                <Skeleton style={{ height: 10, width: 60 }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr
              key={r}
              style={{ borderBottom: r < rows - 1 ? "1px solid var(--border-subtle)" : undefined }}
            >
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="px-3 py-2.5">
                  <Skeleton
                    style={{ height: 10, width: c === 0 ? 100 : c === cols - 1 ? 40 : 80 }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── ConfirmDialog ─────────────────────────────────────────────────────────── */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  danger?: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    // Save the element that had focus before the dialog opened
    previousFocus.current = document.activeElement as HTMLElement;

    // Focus the cancel button (safe default) on open
    const cancelBtn = dialogRef.current?.querySelector<HTMLButtonElement>("[data-cancel]");
    cancelBtn?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key === "Tab") {
        // Trap focus inside the dialog
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll while dialog is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      // Return focus to the element that had it before
      previousFocus.current?.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in-fast">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "color-mix(in srgb, var(--fg) 40%, transparent)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onCancel}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="relative rounded-babit-md p-6 max-w-md w-full"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 24px 60px -20px color-mix(in srgb, var(--fg) 20%, transparent)",
        }}
      >
        <div className="flex items-start gap-3 mb-4">
          {danger && (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{
                backgroundColor: "color-mix(in srgb, var(--color-failed) 12%, transparent)",
              }}
            >
              <span style={{ color: "var(--color-failed)" }}>
                <IconAlertCircle className="w-5 h-5" />
              </span>
            </div>
          )}
          <div>
            <h3
              id="confirm-dialog-title"
              className="text-base font-semibold"
              style={{ color: "var(--fg)" }}
            >
              {title}
            </h3>
            <p
              id="confirm-dialog-message"
              className="mt-1 text-sm"
              style={{ color: "var(--muted)" }}
            >
              {message}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          <Button data-cancel variant="secondary" size="md" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "brand"}
            size="md"
            onClick={onConfirm}
            loading={loading}
          >
            {danger && <IconShieldCheck className="w-3.5 h-3.5" />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
