import React, { useState } from "react";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "@/lib/auth";
import { useRouter, Link } from "@/lib/router";
import { Button, Field, TextInput, Error } from "@/lib/ui";

export function Login() {
  const { login } = useAuth();
  const { navigate } = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate("/dashboard");
    } else {
      setError(res.error || "Failed to sign in. Please check your credentials.");
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Babit accountability workspace"
      footer={
        <p>
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium hover:underline" style={{ color: "var(--fg)" }}>
            Create workspace
          </Link>
        </p>
      }
    >
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

        <Field
          label="Password"
          hint={
            <Link to="/forgot-password" className="transition-colors hover:opacity-80" style={{ color: "var(--muted)" }}>
              Forgot password?
            </Link>
          }
        >
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            autoComplete="current-password"
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
          Sign in
        </Button>

        <div className="mt-4 pt-4 text-center" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <button
            type="button"
            onClick={() => {
              setEmail("demo@babit.dev");
              setPassword("demo1234");
            }}
            className="text-xs font-mono transition-colors cursor-pointer hover:opacity-80"
            style={{ color: "var(--muted)" }}
          >
            Fill demo credentials
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
