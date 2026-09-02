import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Copyable, PageHeader } from "@/lib/ui";
import { IconShieldCheck, IconKey, IconBuilding } from "@/lib/icons";
import { api } from "@/api/client";

type Section = "general" | "workspace" | "notary";

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
  const { user, branding } = useAuth();
  const [section, setSection] = useState<Section>("general");
  const [keyId, setKeyId] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [keyError, setKeyError] = useState(false);

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
          className="md:col-span-4 rounded-babit-lg p-2 shadow-xs space-y-0.5 animate-float-up"
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
          className="md:col-span-8 rounded-babit-lg p-6 sm:p-8 shadow-xs space-y-4"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {section === "general" && (
            <>
              <SectionHead
                title="Account"
                description={<>Profile returned by <span className="font-mono">/v1/auth/me</span>.</>}
              />
              <ReadonlyRow label="Email" value={user?.email || "—"} mono />
              <ReadonlyRow label="User ID" value={user?.id || "—"} mono />
              <ReadonlyRow label="Account type" value={user?.account_type === "ACCOUNT_TYPE_ORGANIZATION" ? "Organization" : "Personal"} />
              {user?.industry && <ReadonlyRow label="Industry" value={user.industry} />}
              {user?.created_at && <ReadonlyRow label="Created" value={user.created_at} mono />}
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
                        className="w-8 h-8 rounded border p-0.5 bg-white object-contain"
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
