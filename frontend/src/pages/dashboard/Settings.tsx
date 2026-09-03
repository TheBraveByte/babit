import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Copyable, PageHeader, Field, TextInput, Select, Button, Error } from "@/lib/ui";
import { IconShieldCheck, IconKey, IconBuilding, IconCheck } from "@/lib/icons";
import { api, errText } from "@/api/client";

type Section = "general" | "workspace" | "notary";

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

function ReadonlyRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-3 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      <span className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>{label}</span>
      <span className={`sm:col-span-2 text-xs break-all ${mono ? "font-mono tnum" : ""}`} style={{ color: "var(--fg)" }}>{value}</span>
    </div>
  );
}

function SectionHead({ title, description, icon }: { title: string; description: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      <h2 className="text-base font-semibold flex items-center gap-1.5" style={{ color: "var(--fg)" }}>
        {icon}{title}
      </h2>
      <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{description}</p>
    </div>
  );
}

export function Settings() {
  const { user, branding, refreshMe } = useAuth();
  const [section, setSection] = useState<Section>("general");
  const [keyId, setKeyId] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [keyError, setKeyError] = useState(false);

  const [orgName, setOrgName] = useState("");
  const [orgDomain, setOrgDomain] = useState("");
  const [industry, setIndustry] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Pre-fill from the authenticated profile whenever it changes.
  useEffect(() => {
    setOrgName(user?.org_name ?? "");
    setOrgDomain(user?.org_domain ?? "");
    setIndustry(user?.industry ?? "");
  }, [user?.org_name, user?.org_domain, user?.industry]);

  const accountType = user?.account_type === "ACCOUNT_TYPE_ORGANIZATION" ? "Organization" : "Personal";

  async function save() {
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      const res = await api.PATCH("/v1/auth/me", {
        body: { org_name: orgName, org_domain: orgDomain, industry },
      });
      if (res.error) {
        setSaveError(errText(res.error));
      } else {
        await refreshMe();
        setSaved(true);
      }
    } catch (e) {
      setSaveError(errText(e));
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (section !== "notary" || publicKey) return;
    let active = true;
    (async () => {
      try {
        const res = await api.GET("/v1/notary/public-key", {});
        if (!active) return;
        if (res.data?.public_key) {
          setKeyId(res.data.key_id ?? null);
          setPublicKey(res.data.public_key);
        } else setKeyError(true);
      } catch {
        if (active) setKeyError(true);
      }
    })();
    return () => { active = false; };
  }, [section, publicKey]);

  const sections: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: "general", label: "General", icon: <IconBuilding className="w-3.5 h-3.5" /> },
    { key: "workspace", label: "Workspace & Branding", icon: <IconBuilding className="w-3.5 h-3.5" /> },
    { key: "notary", label: "Notary Key", icon: <IconShieldCheck className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Settings"
        description="Your account profile and the notary key backing your evidence. Fields reflect what the Babit API returns and are read-only where no write endpoint exists."
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <nav
          className="md:col-span-4 rounded-babit-md p-2 shadow-xs space-y-0.5 animate-float-up"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {sections.map((s) => {
            const active = section === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-babit text-xs font-medium text-left transition-colors cursor-pointer"
                style={{
                  backgroundColor: active ? "var(--fg)" : "transparent",
                  color: active ? "var(--surface)" : "var(--muted)",
                }}
              >
                {s.icon}
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>

        <div
          className="md:col-span-8 rounded-babit-md p-6 sm:p-8 shadow-xs space-y-4"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {section === "general" && (
            <>
              <SectionHead
                title="Account"
                description="Update the organization details on your profile. Email and account type are fixed."
              />

              <ReadonlyRow label="Email" value={user?.email || "—"} mono />
              <ReadonlyRow label="Account type" value={accountType} />

              <form
                className="grid gap-4 pt-2"
                onSubmit={(e) => { e.preventDefault(); void save(); }}
              >
                <Field label="Organization name" hint="Optional">
                  <TextInput
                    value={orgName}
                    onChange={(e) => { setOrgName(e.target.value); setSaved(false); }}
                    placeholder="Acme Inc."
                    autoComplete="organization"
                  />
                </Field>

                <Field label="Domain" hint="Optional">
                  <TextInput
                    value={orgDomain}
                    onChange={(e) => { setOrgDomain(e.target.value); setSaved(false); }}
                    placeholder="acme.com"
                    autoComplete="url"
                  />
                </Field>

                <Field label="Industry" hint="Optional">
                  <Select
                    value={industry}
                    onChange={(e) => { setIndustry(e.target.value); setSaved(false); }}
                  >
                    <option value="">Not set</option>
                    {industry && !INDUSTRIES.includes(industry) && (
                      <option value={industry}>{industry}</option>
                    )}
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </Select>
                </Field>

                {saveError && <Error message={saveError} />}

                {saved && (
                  <div
                    className="rounded-babit p-3 flex items-center gap-2 text-xs"
                    style={{
                      color: "var(--color-verified)",
                      backgroundColor: "color-mix(in srgb, var(--color-verified) 10%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--color-verified) 30%, transparent)",
                    }}
                  >
                    <IconCheck className="w-4 h-4 shrink-0" />
                    <span>Profile saved.</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <Button type="submit" variant="brand" loading={saving} disabled={saving}>
                    Save changes
                  </Button>
                </div>
              </form>
            </>
          )}

          {section === "workspace" && (
            <>
              <SectionHead
                title="Workspace & Branding"
                description="Branding is resolved from your organization domain and applied to this console at runtime."
              />
              <ReadonlyRow label="Organization" value={user?.org_name || "—"} />
              <ReadonlyRow label="Domain" value={user?.org_domain || "—"} mono />
              {branding ? (
                <div
                  className="mt-2 p-4 rounded-babit flex items-center justify-between"
                  style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-3">
                    {branding.logo_url && (
                      <img
                        src={branding.logo_url}
                        alt="Logo"
                        className="w-8 h-8 rounded border p-0.5 bg-[var(--surface)] object-contain"
                        style={{ borderColor: "var(--border)" }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    )}
                    <div>
                      <span className="text-xs font-semibold" style={{ color: "var(--fg)" }}>{branding.company_name || user?.org_domain}</span>
                      {branding.brand_color && (
                        <span className="text-[11px] font-mono block flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
                          <span className="inline-block w-3 h-3 rounded-sm border" style={{ backgroundColor: branding.brand_color, borderColor: "var(--border)" }} />
                          {branding.brand_color}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>No branding resolved for this account.</p>
              )}
            </>
          )}

          {section === "notary" && (
            <>
              <SectionHead
                icon={<IconKey className="w-4 h-4" />}
                title="Notary public key"
                description="The public key used to verify notary signatures on action events."
              />
              {publicKey ? (
                <div className="space-y-3 font-mono text-xs">
                  {keyId && <ReadonlyRow label="Key ID" value={keyId} mono />}
                  <div>
                    <span className="text-[11px] font-medium block mb-1" style={{ color: "var(--muted)" }}>Public key</span>
                    <Copyable value={publicKey} truncate />
                  </div>
                </div>
              ) : (
                <p className="text-xs font-mono" style={{ color: "var(--muted)" }}>
                  {keyError ? "Notary key unavailable, the ledger service may be unreachable." : "Loading notary key…"}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
