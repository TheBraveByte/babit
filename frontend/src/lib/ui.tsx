import { useState, type ReactNode } from "react";

export function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border border-neutral-200 bg-white rounded-lg">
      <header className="px-5 py-3 border-b border-neutral-200">
        <h2 className="text-sm font-medium text-neutral-900">{title}</h2>
      </header>
      <div className="p-5 grid gap-4">{children}</div>
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 font-mono";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={inputCls + " min-h-40 resize-y"} />;
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={inputCls}>
      {children}
    </select>
  );
}

export function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="justify-self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function Copyable({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        void navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      title="copy"
      className="font-mono tnum text-sm text-neutral-900 hover:text-neutral-500"
    >
      {value} <span className="text-neutral-400">{copied ? "copied" : "⧉"}</span>
    </button>
  );
}

export function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  const cls = ok
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-red-50 text-red-700 border-red-200";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      <span aria-hidden>{ok ? "✓" : "✗"}</span>
      {label}
    </span>
  );
}

export function Json({ data }: { data: unknown }) {
  return (
    <pre className="overflow-auto rounded-md bg-neutral-50 border border-neutral-200 p-3 text-xs font-mono text-neutral-800">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export function Error({ message }: { message: string }) {
  return <p className="text-sm text-red-600 font-mono">{message}</p>;
}
