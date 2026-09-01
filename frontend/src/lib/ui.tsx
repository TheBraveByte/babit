import { useState, type ReactNode } from "react";
import { IconCopy, IconCheck, IconAlertCircle } from "./icons";

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
    <section className={`border border-neutral-200 bg-white rounded-lg shadow-xs overflow-hidden ${className}`}>
      {title && (
        <header className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
            {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

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
        <span className="text-xs font-medium text-neutral-700">{label}</span>
        {hint && <span className="text-[11px] text-neutral-400">{hint}</span>}
      </div>
      {children}
      {error && <span className="text-xs text-red-600 flex items-center gap-1"><IconAlertCircle className="w-3 h-3" />{error}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono transition-colors disabled:bg-neutral-50 disabled:text-neutral-500";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className || ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} min-h-32 resize-y ${props.className || ""}`} />;
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${inputCls} ${props.className || ""}`}>
      {children}
    </select>
  );
}

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
  const base = "inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer";
  
  const sizes = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  const variants = {
    primary: "bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-950 shadow-xs",
    secondary: "bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 shadow-xs",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-xs",
    ghost: "bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
    brand: "bg-[var(--brand-accent,#0f172a)] text-white hover:opacity-90 active:opacity-95 shadow-xs",
  };

  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${props.className || ""}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}

export function Copyable({ value, truncate = false }: { value: string; truncate?: boolean }) {
  const [copied, setCopied] = useState(false);

  const displayValue = truncate && value.length > 20
    ? `${value.slice(0, 10)}…${value.slice(-8)}`
    : value;

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      title={`Copy: ${value}`}
      className="group inline-flex items-center gap-1.5 font-mono tnum text-xs text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 px-2 py-1 rounded transition-colors"
    >
      <span>{displayValue}</span>
      <span className="text-neutral-400 group-hover:text-neutral-600">
        {copied ? <IconCheck className="w-3 h-3 text-emerald-600" /> : <IconCopy className="w-3 h-3" />}
      </span>
    </button>
  );
}

export function MonospaceHash({ hash }: { hash: string }) {
  return <Copyable value={hash} truncate={true} />;
}

export function StatusPill({
  status,
  label,
  ok,
}: {
  status?: "VERIFIED" | "FAILED" | "PENDING" | "ACTIVE" | "REVOKED" | "UNKNOWN";
  label?: string;
  ok?: boolean;
}) {
  let displayLabel = label || status || (ok ? "VERIFIED" : "FAILED");
  let cls = "bg-neutral-100 text-neutral-700 border-neutral-200";

  if (ok === true || status === "VERIFIED" || status === "ACTIVE") {
    cls = "bg-emerald-50 text-emerald-800 border-emerald-200";
  } else if (ok === false || status === "FAILED" || status === "REVOKED") {
    cls = "bg-red-50 text-red-800 border-red-200";
  } else if (status === "PENDING") {
    cls = "bg-amber-50 text-amber-800 border-amber-200";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium tracking-tight ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok || status === "VERIFIED" || status === "ACTIVE" ? "bg-emerald-500" : status === "PENDING" ? "bg-amber-500" : "bg-red-500"}`} />
      {displayLabel}
    </span>
  );
}

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
    <div className="border border-neutral-200 bg-white rounded-lg p-4.5 shadow-xs">
      <div className="flex items-center justify-between text-neutral-500">
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        {icon && <span className="text-neutral-400">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold font-mono tracking-tight text-neutral-900 tnum">{value}</span>
        {change && (
          <span className="text-xs font-medium text-emerald-600 font-mono">{change}</span>
        )}
      </div>
      {sublabel && <p className="mt-1 text-xs text-neutral-400">{sublabel}</p>}
    </div>
  );
}

export function Json({ data }: { data: unknown }) {
  return (
    <pre className="overflow-auto rounded-md bg-neutral-900 text-neutral-100 border border-neutral-800 p-3.5 text-xs font-mono leading-relaxed max-h-96">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export function Error({ message }: { message: string }) {
  return (
    <div className="rounded-md bg-red-50 border border-red-200 p-3 flex items-start gap-2 text-xs font-mono text-red-700">
      <IconAlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
      <span>{message}</span>
    </div>
  );
}

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
    <div className="border border-dashed border-neutral-300 rounded-lg p-8 text-center bg-neutral-50/50">
      {icon && <div className="mx-auto w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 mb-3">{icon}</div>}
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
