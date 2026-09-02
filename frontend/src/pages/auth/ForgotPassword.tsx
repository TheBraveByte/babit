import React, { useState } from "react";
import { AuthLayout } from "./AuthLayout";
import { Link } from "@/lib/router";
import { Button, Field, TextInput, Error } from "@/lib/ui";
import { IconCheck } from "@/lib/icons";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please provide your account email.");
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate link dispatch
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your verified work email and we'll dispatch a secure recovery token."
      footer={
        <p>
          Remember your credentials?{" "}
          <Link to="/login" className="font-semibold underline hover:opacity-80" style={{ color: "var(--fg)" }}>
            Sign in
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="space-y-4 text-center font-sans">
          <div className="p-4 rounded-babit bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
            <div className="flex items-center justify-center gap-1.5 font-bold">
              <IconCheck className="w-4 h-4 text-emerald-700" />
              <span>Recovery link sent</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              If an active workspace is associated with <strong>{email}</strong>, you will receive password reset instructions shortly.
            </p>
          </div>

          <Link
            to="/login"
            className="block text-xs font-semibold py-2 rounded-babit text-center transition-colors"
            style={{
              backgroundColor: "var(--fg)",
              color: "var(--surface)",
            }}
          >
            Return to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          {error && <Error message={error} />}

          <Field label="Work email">
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alice@company.com"
              autoComplete="email"
              required
            />
          </Field>

          <Button
            type="submit"
            variant="brand"
            size="md"
            loading={loading}
            className="w-full justify-center mt-2"
          >
            Send recovery link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
