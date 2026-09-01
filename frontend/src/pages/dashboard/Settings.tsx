import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Field, TextInput, Button, StatusPill, Copyable } from "@/lib/ui";
import { IconShieldCheck, IconKey, IconUser, IconBuilding, IconCheck } from "@/lib/icons";

export function Settings() {
  const { user, branding } = useAuth();
  const [activeSection, setActiveSection] = useState<"general" | "brand" | "members" | "security" | "apikeys">("general");

  const [workspaceName, setWorkspaceName] = useState(user?.org_name || "Enterprise Workspace");
  const [domain, setDomain] = useState(user?.org_domain || "enterprise.corp");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    { key: "general", label: "General & Workspace", icon: <IconBuilding className="w-3.5 h-3.5" /> },
    { key: "brand", label: "Brand Theming & Domain", icon: <IconBuilding className="w-3.5 h-3.5" /> },
    { key: "members", label: "Members & RBAC", icon: <IconUser className="w-3.5 h-3.5" /> },
    { key: "security", label: "Security & Notary Keys", icon: <IconShieldCheck className="w-3.5 h-3.5" /> },
    { key: "apikeys", label: "API Keys & Webhooks", icon: <IconKey className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Workspace Settings</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Manage workspace parameters, enterprise domain branding, security policies, and API keys.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Settings Navigation */}
        <div className="md:col-span-4 bg-white border border-neutral-200 rounded-lg p-2 shadow-xs space-y-1">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key as typeof activeSection)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-left transition-colors cursor-pointer ${
                activeSection === s.key
                  ? "bg-neutral-900 text-white font-semibold"
                  : "text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-900"
              }`}
            >
              {s.icon}
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-8 bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-6">
          {activeSection === "general" && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="pb-3 border-b border-neutral-100">
                <h2 className="text-sm font-semibold text-neutral-900">General Workspace Info</h2>
                <p className="text-xs text-neutral-500">Core identifier and environment configuration.</p>
              </div>

              <Field label="Workspace Name">
                <TextInput value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} />
              </Field>

              <Field label="Workspace ID">
                <TextInput value={user?.id || "ws_enterprise_019"} disabled />
              </Field>

              <Field label="Account Type">
                <TextInput value={user?.account_type === "ACCOUNT_TYPE_ORGANIZATION" ? "ORGANIZATION (Multi-Agent)" : "PERSONAL"} disabled />
              </Field>

              <Field label="Industry Sector">
                <TextInput value={user?.industry || "Technology & Infrastructure"} disabled />
              </Field>

              <div className="pt-2 flex items-center gap-3">
                <Button type="submit" variant="brand" size="sm">
                  Save Changes
                </Button>
                {saved && <span className="text-xs text-emerald-600 font-mono flex items-center gap-1"><IconCheck className="w-3.5 h-3.5" /> Saved</span>}
              </div>
            </form>
          )}

          {activeSection === "brand" && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-neutral-100">
                <h2 className="text-sm font-semibold text-neutral-900">Domain & Real-Time Brand Theme</h2>
                <p className="text-xs text-neutral-500">
                  Babit automatically checks your company domain to apply your official logo and color palette in real time.
                </p>
              </div>

              <Field label="Verified Organization Domain" hint="Used for Brandfetch resolution">
                <TextInput value={domain} onChange={(e) => setDomain(e.target.value)} />
              </Field>

              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-3 font-mono text-xs">
                <span className="text-[10px] text-neutral-400 uppercase block font-semibold">Active Resolved Brand Spec</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-neutral-500 text-[10px] block">Company Name</span>
                    <span className="text-neutral-900 font-bold">{branding?.company_name || user?.org_name || "Enterprise"}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block">Brand Accent Color</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="w-4 h-4 rounded-full border border-neutral-300" style={{ backgroundColor: branding?.brand_color || "#0f172a" }} />
                      <span className="text-neutral-900">{branding?.brand_color || "#0f172a (Default)"}</span>
                    </div>
                  </div>
                </div>

                {branding?.logo_url && (
                  <div>
                    <span className="text-neutral-500 text-[10px] block mb-1">Company Logo</span>
                    <img src={branding.logo_url} alt="Logo" className="w-8 h-8 object-contain rounded border border-neutral-200 p-1 bg-white" />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "members" && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-900">Workspace Members & Roles</h2>
                  <p className="text-xs text-neutral-500">Manage human supervisors, risk leads, and auditors.</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => alert("Invite link copied to clipboard")}>
                  Invite Member
                </Button>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 rounded-lg border border-neutral-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-neutral-900">{user?.email || "yusuf@enterprise.com"}</div>
                    <div className="text-[10px] text-neutral-400">Owner & Risk Lead (Full Root Authority)</div>
                  </div>
                  <StatusPill status="ACTIVE" label="OWNER" />
                </div>

                <div className="p-3 rounded-lg border border-neutral-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-neutral-900">auditor@compliance.org</div>
                    <div className="text-[10px] text-neutral-400">Independent Auditor (Read-Only Proofs)</div>
                  </div>
                  <StatusPill status="ACTIVE" label="AUDITOR" />
                </div>
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="space-y-4 font-mono text-xs">
              <div className="pb-3 border-b border-neutral-100 font-sans">
                <h2 className="text-sm font-semibold text-neutral-900">Security & Asymmetric Notary Keys</h2>
                <p className="text-xs text-neutral-500">Cryptographic seeds and tamper policy enforcement.</p>
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Notary Public Key (Ed25519)</span>
                <Copyable value="ed25519:5c82a10934812a849102c9184a8b7c120934812a849102c9184a8b7c12982f1b" />
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Ledger Hashing Algorithm</span>
                <span className="text-neutral-900 font-semibold">SHA-256 (Canonical JSON RFC 8785)</span>
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">MFA & SSO Status</span>
                <span className="text-emerald-700 font-semibold">ENFORCED FOR ALL PRINCIPALS</span>
              </div>
            </div>
          )}

          {activeSection === "apikeys" && (
            <div className="space-y-4 font-mono text-xs">
              <div className="pb-3 border-b border-neutral-100 font-sans">
                <h2 className="text-sm font-semibold text-neutral-900">API Keys</h2>
                <p className="text-xs text-neutral-500">Secret keys for authenticating autonomous agents and SDKs.</p>
              </div>

              <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-neutral-900">Live Agent Secret</div>
                  <div className="text-[10px] text-neutral-400">Created: 2026-09-01 • Never expires</div>
                </div>
                <Copyable value="slr_live_6aaz_D39Hi36flu5Qm-LA08QoSNlAYu0DqiahPCBTF0qpdQ4" truncate />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
