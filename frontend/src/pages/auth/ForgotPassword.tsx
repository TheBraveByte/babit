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
      subtitle="Enter your work email and we'll send you a reset link."
      footer={
        <p>
          Remembered it?{" "}
          <Link to="/login" className="font-medium hover:underline" style={{ color: "var(--fg)" }}>
            Sign in
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="space-y-4">
          <div
            className="p-4 rounded-babit space-y-2"
            style={{ backgroundColor: "var(--color-verified-bg)", border: "1px solid var(--color-verified-border)", color: "var(--color-verified)" }}
          >
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <IconCheck className="w-4 h-4" />
              <span>Reset link sent</span>
            </div>
            <p className="text-[13px] leading-relaxed">
              If an account exists for <strong>{email}</strong>, the reset instructions are on their way.
            </p>
          </div>

          <Link
            to="/login"
            className="block text-sm font-medium py-2.5 rounded-babit text-center transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--fg)", color: "var(--bg)" }}
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
