import { Component, type ErrorInfo, type ReactNode } from "react";
import { BabitLogo } from "@/lib/icons";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production, send to an error-tracking service (Sentry, Datadog, etc.)
    console.error("ErrorBoundary caught an error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        className="min-h-screen flex items-center justify-center p-6 font-sans"
        style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
      >
        <div
          className="max-w-md w-full rounded-babit-md p-8 text-center space-y-5"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 24px 60px -20px color-mix(in srgb, var(--fg) 10%, transparent)",
          }}
        >
          <div className="flex justify-center">
            <BabitLogo className="w-10 h-10" brandColor="var(--brand-accent)" />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-semibold" style={{ color: "var(--fg)" }}>
              Something went wrong
            </h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              The console hit an unexpected error. Your data is safe on the ledger.
            </p>
          </div>
          {this.state.error?.message && (
            <p
              className="text-xs font-mono p-3 rounded-babit-sm text-left"
              style={{
                backgroundColor: "var(--secondary)",
                border: "1px solid var(--border-subtle)",
                color: "var(--muted)",
              }}
            >
              {this.state.error.message}
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-pill px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: "var(--brand-accent)", color: "var(--surface)" }}
            >
              Reload console
            </button>
            <a
              href="/"
              className="rounded-pill px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer"
              style={{
                backgroundColor: "var(--secondary)",
                color: "var(--fg)",
                border: "1px solid var(--border)",
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
