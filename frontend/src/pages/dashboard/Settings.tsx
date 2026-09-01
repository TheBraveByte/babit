import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Field, TextInput, Button, Copyable } from "@/lib/ui";
import { IconShieldCheck, IconKey, IconUser, IconBuilding, IconCheck } from "@/lib/icons";

export function Settings() {
  const { user, branding } = useAuth();
  const [activeSection, setActiveSection] = useState<"general" | "workspace" | "security" | "api" | "members">("general");

  const [workspaceName, setWorkspaceName] = useState(user?.org_name || "Enterprise Workspace");
  const [domain, setDomain] = useState(user?.org_domain || "enterprise.corp");
  const [savedSection, setSavedSection] = useState<string | null>(null);

  const handleSave = (section: string) => (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSection(section);
    setTimeout(() => setSavedSection(null), 2200);
  };

  const sections = [
    { key: "general", label: "General", icon: <IconBuilding className="w-3.5 h-3.5" /> },
    { key: "workspace", label: "Workspace & Domain", icon: <IconBuilding className="w-3.5 h-3.5" /> },
    { key: "security", label: "Security & Keys", icon: <IconShieldCheck className="w-3.5 h-3.5" /> },
    { key: "api", label: "API & Webhooks", icon: <IconKey className="w-3.5 h-3.5" /> },
    { key: "members", label: "Members & Access", icon: <IconUser className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl sm:text-[32px] font-semibold tracking-tight leading-tight" style={{ color: "var(--fg)" }}>
          Settings
        </h1>
        <p className="text-sm sm:text-[15px] mt-1" style={{ color: "var(--muted)" }}>
          Manage workspace parameters, organization domain, security policies, and API keys.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Settings Navigation */}
        <div
          className="md:col-span-4 rounded-babit-lg p-2 shadow-xs space-y-0.5 font-mono text-xs"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key as typeof activeSection)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-babit font-medium text-left transition-colors cursor-pointer"
              style={{
                backgroundColor: activeSection === s.key ? "var(--fg)" : "transparent",
                color: activeSection === s.key ? "var(--surface)" : "var(--muted)",
                fontWeight: activeSection === s.key ? 600 : 400,
              }}
            >
              {s.icon}
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div
          className="md:col-span-8 rounded-babit-lg p-6 sm:p-8 shadow-xs space-y-6"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          {activeSection === "general" && (
            <form onSubmit={handleSave("general")} className="space-y-4 font-sans text-xs">
              <div className="pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <h2 className="text-base font-semibold" style={{ color: "var(--fg)" }}>General Configuration</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Core workspace identifier and environment metadata.</p>
              </div>

              <Field label="Workspace Name">
                <TextInput value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} />
              </Field>

              <Field label="Workspace ID">
                <TextInput value={user?.id || "ws_enterprise_019"} disabled />
              </Field>

              <Field label="Account Type">
                <TextInput value={user?.account_type === "ACCOUNT_TYPE_ORGANIZATION" ? "ORGANIZATION" : "PERSONAL"} disabled />
              </Field>

              <div className="pt-2 flex items-center gap-3">
                <Button type="submit" variant="primary" size="md">
                  Save Changes
                </Button>
                {savedSection === "general" && (
                  <span className="text-xs text-emerald-700 font-mono flex items-center gap-1">
                    <IconCheck className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
              </div>
            </form>
          )}

          {activeSection === "workspace" && (
            <form onSubmit={handleSave("workspace")} className="space-y-4 font-sans text-xs">
              <div className="pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <h2 className="text-base font-semibold" style={{ color: "var(--fg)" }}>Workspace Domain & Theme</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  Verified company domain used for automatic brand asset and accent injection.
                </p>
              </div>

              <Field label="Verified Domain" hint="Auto-resolves company branding">
                <TextInput value={domain} onChange={(e) => setDomain(e.target.value)} />
              </Field>

              {branding && (
                <div
                  className="p-4 rounded-babit flex items-center justify-between"
                  style={{
                    backgroundColor: "var(--secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    {branding.logo_url && (
                      <img
                        src={branding.logo_url}
                        alt="Logo"
                        className="w-8 h-8 rounded border p-0.5 bg-white object-contain"
                        style={{ borderColor: "var(--border)" }}
                      />
                    )}
                    <div>
                      <span className="text-xs font-semibold" style={{ color: "var(--fg)" }}>
                        {branding.company_name || domain}
                      </span>
                      <span className="text-[11px] font-mono block" style={{ color: "var(--muted)" }}>
                        Accent: {branding.brand_color || "#0D9488"}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    RESOLVED
                  </span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <Button type="submit" variant="primary" size="md">
                  Update Domain
                </Button>
                {savedSection === "workspace" && (
                  <span className="text-xs text-emerald-700 font-mono flex items-center gap-1">
                    <IconCheck className="w-3.5 h-3.5" /> Domain Updated
                  </span>
                )}
              </div>
            </form>
          )}

          {activeSection === "security" && (
            <form onSubmit={handleSave("security")} className="space-y-4 font-sans text-xs">
              <div className="pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <h2 className="text-base font-semibold" style={{ color: "var(--fg)" }}>Cryptographic Notary Keys</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  Public keys used to verify Ed25519 notary signatures on action events.
                </p>
              </div>

              <div>
                <span className="text-xs font-medium block mb-1" style={{ color: "var(--fg)" }}>Primary Ed25519 Public Key</span>
                <Copyable value="ed25519:9f81a82910bc491028a01928471029c" />
              </div>

              <div
                className="p-3 rounded-babit text-[11px] font-mono"
                style={{
                  backgroundColor: "var(--secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--muted)",
                }}
              >
                Notary key rotation policies enforce 90-day forward-secure signing windows.
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Button type="submit" variant="primary" size="md">
                  Rotate Notary Key
                </Button>
                {savedSection === "security" && (
                  <span className="text-xs text-emerald-700 font-mono flex items-center gap-1">
                    <IconCheck className="w-3.5 h-3.5" /> Policy Updated
                  </span>
                )}
              </div>
            </form>
          )}

          {activeSection === "api" && (
            <form onSubmit={handleSave("api")} className="space-y-4 font-sans text-xs">
              <div className="pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <h2 className="text-base font-semibold" style={{ color: "var(--fg)" }}>API Keys & Ingestion Tokens</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  Use bearer tokens to record autonomous actions via the Babit REST or gRPC endpoints.
                </p>
              </div>

              <div>
                <span className="text-xs font-medium block mb-1" style={{ color: "var(--fg)" }}>Active API Ingestion Key</span>
                <Copyable value="babit_live_98a012c481028ab3918fbc0192a" />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Button type="submit" variant="secondary" size="md">
                  Roll Token
                </Button>
                {savedSection === "api" && (
                  <span className="text-xs text-emerald-700 font-mono flex items-center gap-1">
                    <IconCheck className="w-3.5 h-3.5" /> Token Rolled
                  </span>
                )}
              </div>
            </form>
          )}

          {activeSection === "members" && (
            <form onSubmit={handleSave("members")} className="space-y-4 font-sans text-xs">
              <div className="pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <h2 className="text-base font-semibold" style={{ color: "var(--fg)" }}>Team Members & Supervisors</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  Human supervisors permitted to issue and revoke root delegation grants.
                </p>
              </div>

              <div
                className="p-3 rounded-babit flex items-center justify-between font-mono text-xs"
                style={{
                  backgroundColor: "var(--secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <span className="font-semibold" style={{ color: "var(--fg)" }}>{user?.email || "admin@babit.dev"}</span>
                  <span className="text-[11px] block font-sans" style={{ color: "var(--muted)" }}>Workspace Owner & Root Notary Signer</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  OWNER
                </span>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Button type="submit" variant="secondary" size="md">
                  Invite Supervisor
                </Button>
                {savedSection === "members" && (
                  <span className="text-xs text-emerald-700 font-mono flex items-center gap-1">
                    <IconCheck className="w-3.5 h-3.5" /> Invitation Sent
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
