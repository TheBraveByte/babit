import React, { useState } from "react";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "@/lib/auth";
import { useRouter, Link } from "@/lib/router";
import { Button, Field, TextInput, Select, Error } from "@/lib/ui";
import { IconUser, IconBuilding, IconSparkles } from "@/lib/icons";

const INDUSTRIES = [
  "Technology & Software",
  "Financial Services & Banking",
  "Healthcare & Life Sciences",
  "Insurance",
  "Enterprise Software & SaaS",
  "AI & Autonomous Infrastructure",
  "Government & Defense",
  "Legal & Compliance",
  "Manufacturing & Logistics",
  "Retail & E-Commerce",
  "Energy & Utilities",
  "Consulting & Professional Services",
  "Other",
];

export function Signup() {
  const { signup } = useAuth();
  const { navigate } = useRouter();

  const [accountType, setAccountType] = useState<"ACCOUNT_TYPE_PERSONAL" | "ACCOUNT_TYPE_ORGANIZATION">("ACCOUNT_TYPE_ORGANIZATION");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgDomain, setOrgDomain] = useState("");
  const [industry, setIndustry] = useState("Technology & Software");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive domain guess from email if not filled
  const handleEmailBlur = () => {
    if (email.includes("@") && !orgDomain) {
      const parts = email.split("@");
      if (parts[1] && !["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"].includes(parts[1])) {
        setOrgDomain(parts[1]);
        if (!orgName) {
          const compName = parts[1].split(".")[0];
          setOrgName(compName.charAt(0).toUpperCase() + compName.slice(1));
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await signup({
      email,
      password,
      account_type: accountType,
      org_name: accountType === "ACCOUNT_TYPE_ORGANIZATION" ? orgName : undefined,
      org_domain: accountType === "ACCOUNT_TYPE_ORGANIZATION" ? orgDomain : undefined,
      industry: accountType === "ACCOUNT_TYPE_ORGANIZATION" ? industry : undefined,
    });

    setLoading(false);

    if (res.success) {
      navigate("/dashboard");
    } else {
      setError(res.error || "Failed to create workspace. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Create your Babit workspace"
      subtitle="Establish cryptographic evidence and accountability for autonomous agents"
      footer={
        <p>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-neutral-900 hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Error message={error} />}

        {/* Account Type Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-700">Account structure</label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setAccountType("ACCOUNT_TYPE_ORGANIZATION")}
              className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                accountType === "ACCOUNT_TYPE_ORGANIZATION"
                  ? "border-neutral-900 bg-neutral-900 text-white shadow-xs"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <IconBuilding className="w-4 h-4" />
                <span className="text-xs font-semibold">Organization</span>
              </div>
              <span className={`text-[11px] leading-tight ${accountType === "ACCOUNT_TYPE_ORGANIZATION" ? "text-neutral-300" : "text-neutral-400"}`}>
                Multi-agent teams & brand domain
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAccountType("ACCOUNT_TYPE_PERSONAL")}
              className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                accountType === "ACCOUNT_TYPE_PERSONAL"
                  ? "border-neutral-900 bg-neutral-900 text-white shadow-xs"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <IconUser className="w-4 h-4" />
                <span className="text-xs font-semibold">Personal</span>
              </div>
              <span className={`text-[11px] leading-tight ${accountType === "ACCOUNT_TYPE_PERSONAL" ? "text-neutral-300" : "text-neutral-400"}`}>
                Individual developer or researcher
              </span>
            </button>
          </div>
        </div>

        <Field label="Work email">
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleEmailBlur}
            placeholder="yusuf@acme.corp"
            autoComplete="email"
            required
          />
        </Field>

        <Field label="Full name">
          <TextInput
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Yusuf Sterling"
            autoComplete="name"
          />
        </Field>

        <Field
          label="Password"
          hint={password.length > 0 ? (password.length >= 8 ? "Strong password" : "Min 8 chars") : undefined}
        >
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            autoComplete="new-password"
            required
          />
        </Field>

        {accountType === "ACCOUNT_TYPE_ORGANIZATION" && (
          <div className="pt-2 border-t border-neutral-100 space-y-3 animate-fade-in">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-200">
              <IconSparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Domain auto-branding: we'll match your logo & brand palette in real time.</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Company name">
                <TextInput
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Corp"
                />
              </Field>

              <Field label="Domain">
                <TextInput
                  type="text"
                  value={orgDomain}
                  onChange={(e) => setOrgDomain(e.target.value)}
                  placeholder="acme.corp"
                />
              </Field>
            </div>

            <Field label="Industry sector">
              <Select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        )}

        <Button
          type="submit"
          variant="brand"
          size="md"
          loading={loading}
          className="w-full justify-center mt-3"
        >
          Create workspace
        </Button>
      </form>
    </AuthLayout>
  );
}
