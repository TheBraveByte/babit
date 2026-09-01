import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Field, TextInput, Button, Copyable } from "@/lib/ui";
import { IconShieldCheck, IconKey, IconUser, IconBuilding, IconCheck } from "@/lib/icons";

export function Settings() {
  const { user, branding } = useAuth();
  const [activeSection, setActiveSection] = useState<"general" | "workspace" | "security" | "api" | "members">("general");

  const [workspaceName, setWorkspaceName] = useState(user?.org_name || "Enterprise Workspace");
  const [domain, setDomain] = useState(user?.org_domain || "enterprise.corp");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        <h1 className="text-2xl sm:text-[32px] font-semibold text-[#111111] tracking-tight leading-tight">
          Settings
        </h1>
        <p className="text-sm sm:text-[15px] text-[#6B6B6B] mt-1">
          Manage workspace parameters, organization domain, security policies, and API keys.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Settings Navigation */}
        <div className="md:col-span-4 bg-[#FFFFFF] border border-[#E8E8E5] rounded-babit-lg p-2 shadow-xs space-y-0.5 font-mono text-xs">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key as typeof activeSection)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-babit font-medium text-left transition-colors cursor-pointer ${
                activeSection === s.key
                  ? "bg-[#111111] text-white font-semibold"
                  : "text-[#6B6B6B] hover:bg-[#F7F7F5] hover:text-[#111111]"
              }`}
            >
              {s.icon}
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-8 bg-[#FFFFFF] border border-[#E8E8E5] rounded-babit-lg p-6 sm:p-8 shadow-xs space-y-6">
          {activeSection === "general" && (
            <form onSubmit={handleSave} className="space-y-4 font-sans text-xs">
              <div className="pb-3 border-b border-[#F0F0ED]">
                <h2 className="text-base font-semibold text-[#111111]">General Configuration</h2>
                <p className="text-xs text-[#6B6B6B] mt-0.5">Core workspace identifier and environment metadata.</p>
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
                {saved && (
                  <span className="text-xs text-emerald-700 font-mono flex items-center gap-1">
                    <IconCheck className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
              </div>
            </form>
          )}

          {activeSection === "workspace" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="pb-3 border-b border-[#F0F0ED]">
                <h2 className="text-base font-semibold text-[#111111]">Workspace Domain & Theme</h2>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  Verified company domain used for automatic brand asset and accent injection.
                </p>
              </div>

              <Field label="Verified Domain" hint="Auto-resolves company branding">
                <TextInput value={domain} onChange={(e) => setDomain(e.target.value)} />
              </Field>

              {branding && (
                <div className="p-4 rounded-babit bg-[#F7F7F5] border border-[#E8E8E5] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {branding.logo_url && (
                      <img src={branding.logo_url} alt="Logo" className="w-8 h-8 rounded border border-[#E8E8E5] p-0.5 bg-white object-contain" />
                    )}
                    <div>
                      <span className="text-xs font-semibold text-[#111111]">{branding.company_name || domain}</span>
                      <span className="text-[11px] text-[#6B6B6B] font-mono block">Accent: {branding.brand_color || "#0D9488"}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    RESOLVED
                  </span>
                </div>
              )}
            </div>
          )}

          {activeSection === "security" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="pb-3 border-b border-[#F0F0ED]">
                <h2 className="text-base font-semibold text-[#111111]">Cryptographic Notary Keys</h2>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  Public keys used to verify Ed25519 notary signatures on action events.
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-[#111111] block mb-1">Primary Ed25519 Public Key</span>
                <Copyable value="ed25519:9f81a82910bc491028a01928471029c" />
              </div>

              <div className="p-3 rounded-babit bg-[#F7F7F5] border border-[#E8E8E5] text-[11px] text-[#6B6B6B] font-mono">
                Notary key rotation policies enforce 90-day forward-secure signing windows.
              </div>
            </div>
          )}

          {activeSection === "api" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="pb-3 border-b border-[#F0F0ED]">
                <h2 className="text-base font-semibold text-[#111111]">API Keys & Ingestion Tokens</h2>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  Use bearer tokens to record autonomous actions via the Babit REST or gRPC endpoints.
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-[#111111] block mb-1">Active API Ingestion Key</span>
                <Copyable value="babit_live_98a012c481028ab3918fbc0192a" />
              </div>
            </div>
          )}

          {activeSection === "members" && (
            <div className="space-y-4 font-sans text-xs">
              <div className="pb-3 border-b border-[#F0F0ED]">
                <h2 className="text-base font-semibold text-[#111111]">Team Members & Supervisors</h2>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  Human supervisors permitted to issue and revoke root delegation grants.
                </p>
              </div>

              <div className="p-3 rounded-babit bg-[#F7F7F5] border border-[#E8E8E5] flex items-center justify-between font-mono text-xs">
                <div>
                  <span className="font-semibold text-[#111111]">{user?.email || "admin@babit.dev"}</span>
                  <span className="text-[11px] text-[#6B6B6B] block font-sans">Workspace Owner & Root Notary Signer</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  OWNER
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
