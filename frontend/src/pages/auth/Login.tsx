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
          <Link to="/signup" className="font-medium text-neutral-900 hover:underline">
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
            <Link to="/forgot-password" className="hover:text-neutral-900 transition-colors">
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

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-neutral-400">or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setEmail("demo@babit.dev");
              setPassword("demo1234");
            }}
            className="flex items-center justify-center gap-2 py-2 px-3 border border-neutral-200 rounded-md text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("admin@enterprise.com");
              setPassword("enterprise1234");
            }}
            className="flex items-center justify-center gap-2 py-2 px-3 border border-neutral-200 rounded-md text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <span>GitHub</span>
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
