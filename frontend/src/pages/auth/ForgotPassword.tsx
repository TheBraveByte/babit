import React, { useState } from "react";
import { AuthLayout } from "./AuthLayout";
import { Link } from "@/lib/router";
import { Button, Field, TextInput } from "@/lib/ui";
import { IconCheckCircle } from "@/lib/icons";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <AuthLayout
      title={submitted ? "Check your inbox" : "Reset your password"}
      subtitle={
        submitted
          ? `We've sent password reset instructions to ${email}`
          : "Enter your email address and we will send you a secure link to reset your password."
      }
      footer={
        <p>
          Remember your password?{" "}
          <Link to="/login" className="font-medium text-neutral-900 hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      {submitted ? (
        <div className="text-center py-4 space-y-4 animate-fade-in">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IconCheckCircle className="w-6 h-6" />
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            If an account exists with this email, you will receive an authorization email shortly with instructions.
          </p>
          <Link to="/login">
            <Button variant="secondary" size="md" className="w-full mt-2">
              Return to login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Work email">
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alice@company.com"
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
