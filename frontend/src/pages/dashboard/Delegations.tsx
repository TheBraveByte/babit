import { useState } from "react";
import { StatusPill, Copyable, Button, Field, TextInput, Error, EmptyState } from "@/lib/ui";
import { IconGitBranch, IconCheck, IconShieldCheck } from "@/lib/icons";
import { api, errText } from "@/api/client";
import type { components } from "@/api/schema";

type VerifyChain = components["schemas"]["v1VerifyChainResponse"];
type Grant = components["schemas"]["v1Grant"];

type Mode = "verify" | "issue-root" | "delegate" | "revoke";

export function Delegations() {
  const [mode, setMode] = useState<Mode>("verify");

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl sm:text-[32px] font-semibold tracking-tight leading-tight" style={{ color: "var(--fg)" }}>
          Delegations
        </h1>
        <p className="text-sm sm:text-[15px] mt-1" style={{ color: "var(--muted)" }}>
          Issue and verify capability grants. Authority attenuates monotonically from a root principal down each delegation.
        </p>
      </div>

      <div
        className="inline-flex items-center gap-1 p-1 rounded-babit"
        style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)" }}
      >
        {([
          ["verify", "Verify Chain"],
          ["issue-root", "Issue Root"],
          ["delegate", "Delegate"],
          ["revoke", "Revoke"],
        ] as [Mode, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className="px-3 py-1.5 rounded-babit-sm text-xs font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: mode === key ? "var(--fg)" : "transparent",
              color: mode === key ? "var(--surface)" : "var(--muted)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "verify" && <VerifyChainPanel />}
      {mode === "issue-root" && <IssueRootPanel />}
      {mode === "delegate" && <DelegatePanel />}
      {mode === "revoke" && <RevokePanel />}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-babit-lg p-6 shadow-xs space-y-5"
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {children}
    </div>
  );
}

function GrantCard({ grant, depth }: { grant: Grant; depth: number }) {
  return (
    <div
      className="p-3 rounded-babit flex items-center justify-between font-mono text-xs"
      style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)" }}
    >
      <div>
        <div className="text-[11px]" style={{ color: "var(--fg)" }}>
          <span className="font-semibold">{grant.principal_id || "?"}</span> → <span>{grant.subject_id || "?"}</span>
        </div>
        <span className="text-[10px]" style={{ color: "var(--muted)" }}>Grant: {grant.grant_id || "—"}</span>
      </div>
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-babit-sm"
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}
      >
        Depth #{depth}
      </span>
    </div>
  );
}

function VerifyChainPanel() {
  const [grantId, setGrantId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyChain | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!grantId.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.GET("/v1/grants/{grant_id}:verify", {
        params: { path: { grant_id: grantId.trim() } },
      });
      if (res.error || !res.data) setError(errText(res.error) || "Grant not found.");
      else setResult(res.data);
    } catch (err) {
      setError(errText(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel>
      <form onSubmit={run} className="space-y-3">
        <label className="text-xs font-medium" style={{ color: "var(--fg)" }}>Verify a grant and its chain to root</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <TextInput value={grantId} onChange={(e) => setGrantId(e.target.value)} placeholder="e.g. BAL-417849" className="flex-1" />
          <Button type="submit" variant="primary" size="md" loading={loading} disabled={!grantId.trim()}>
            <IconShieldCheck className="w-4 h-4" />
            <span>Verify</span>
          </Button>
        </div>
      </form>

      {error && <Error message={error} />}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <span className="text-xs font-semibold uppercase" style={{ color: "var(--fg)" }}>Authority Chain</span>
            <StatusPill ok={result.valid === true} label={result.valid ? "VALID" : "INVALID"} />
          </div>
          {(result.chain ?? []).length === 0 ? (
            <p className="text-xs font-mono" style={{ color: "var(--muted)" }}>Chain empty.</p>
          ) : (
            <div className="space-y-2">
              {result.chain!.map((g, i) => <GrantCard key={g.grant_id || i} grant={g} depth={i + 1} />)}
            </div>
          )}
          {result.reason && (
            <div className="p-3 rounded-babit bg-red-50 border border-red-200 text-red-800 text-xs font-mono">
              <strong>Reason:</strong> {result.reason}
            </div>
          )}
        </div>
      )}

      {!result && !error && (
        <EmptyState
          title="No grant loaded"
          description="Enter a grant ID to verify its signature chain and delegation authority. There is no grant listing endpoint yet, so grants are verified individually by ID."
          icon={<IconGitBranch className="w-5 h-5" />}
        />
      )}
    </Panel>
  );
}

function IssueRootPanel() {
  const [principalId, setPrincipalId] = useState("");
  const [maxDepth, setMaxDepth] = useState("3");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grant, setGrant] = useState<Grant | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!principalId.trim()) return;
    setLoading(true);
    setError(null);
    setGrant(null);
    try {
      const res = await api.POST("/v1/grants:root", {
        body: {
          principal_id: principalId.trim(),
          scope: { max_depth: Number(maxDepth) || 1 },
        },
      });
      if (res.error || !res.data?.grant) setError(errText(res.error) || "Failed to issue root grant.");
      else setGrant(res.data.grant);
    } catch (err) {
      setError(errText(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel>
      <form onSubmit={run} className="space-y-4">
        <div className="pb-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Issue Root Grant</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Establish a top-level authority for a human principal.</p>
        </div>
        <Field label="Principal ID">
          <TextInput value={principalId} onChange={(e) => setPrincipalId(e.target.value)} placeholder="e.g. usr_alice" required />
        </Field>
        <Field label="Max Delegation Depth">
          <TextInput type="number" min={1} value={maxDepth} onChange={(e) => setMaxDepth(e.target.value)} />
        </Field>
        <Button type="submit" variant="primary" size="md" loading={loading} disabled={!principalId.trim()}>
          Issue Root Grant
        </Button>
      </form>

      {error && <Error message={error} />}
      {grant && <IssuedGrant grant={grant} />}
    </Panel>
  );
}

function DelegatePanel() {
  const [parentGrantId, setParentGrantId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [capabilities, setCapabilities] = useState("");
  const [resourceGlobs, setResourceGlobs] = useState("");
  const [maxValueCents, setMaxValueCents] = useState("");
  const [maxDepth, setMaxDepth] = useState("2");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grant, setGrant] = useState<Grant | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!parentGrantId.trim() || !subjectId.trim()) return;
    setLoading(true);
    setError(null);
    setGrant(null);
    try {
      const res = await api.POST("/v1/grants", {
        body: {
          parent_grant_id: parentGrantId.trim(),
          subject_id: subjectId.trim(),
          capabilities: capabilities.split(",").map((c) => c.trim()).filter(Boolean),
          scope: {
            resource_globs: resourceGlobs.split(",").map((g) => g.trim()).filter(Boolean),
            ...(maxValueCents.trim() ? { max_value_cents: maxValueCents.trim() } : {}),
            max_depth: Number(maxDepth) || 1,
          },
        },
      });
      if (res.error || !res.data?.grant) setError(errText(res.error) || "Failed to delegate grant.");
      else setGrant(res.data.grant);
    } catch (err) {
      setError(errText(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel>
      <form onSubmit={run} className="space-y-4">
        <div className="pb-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Delegate Grant</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Attenuate authority from a parent grant to a subject.</p>
        </div>
        <Field label="Parent Grant ID">
          <TextInput value={parentGrantId} onChange={(e) => setParentGrantId(e.target.value)} placeholder="e.g. BAL-417849" required />
        </Field>
        <Field label="Subject ID">
          <TextInput value={subjectId} onChange={(e) => setSubjectId(e.target.value)} placeholder="e.g. agt_shopper" required />
        </Field>
        <Field label="Capabilities" hint="comma separated">
          <TextInput value={capabilities} onChange={(e) => setCapabilities(e.target.value)} placeholder="browser.click, browser.type" />
        </Field>
        <Field label="Resource Globs" hint="comma separated">
          <TextInput value={resourceGlobs} onChange={(e) => setResourceGlobs(e.target.value)} placeholder="https://shop.example.com/*" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Max Value (cents)">
            <TextInput type="number" min={0} value={maxValueCents} onChange={(e) => setMaxValueCents(e.target.value)} placeholder="50000" />
          </Field>
          <Field label="Max Depth">
            <TextInput type="number" min={1} value={maxDepth} onChange={(e) => setMaxDepth(e.target.value)} />
          </Field>
        </div>
        <Button type="submit" variant="primary" size="md" loading={loading} disabled={!parentGrantId.trim() || !subjectId.trim()}>
          Sign &amp; Delegate
        </Button>
      </form>

      {error && <Error message={error} />}
      {grant && <IssuedGrant grant={grant} />}
    </Panel>
  );
}

function RevokePanel() {
  const [grantId, setGrantId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revoked, setRevoked] = useState<boolean | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!grantId.trim()) return;
    setLoading(true);
    setError(null);
    setRevoked(null);
    try {
      const res = await api.POST("/v1/grants/{grant_id}/revoke", {
        params: { path: { grant_id: grantId.trim() } },
        body: {},
      });
      if (res.error || !res.data) setError(errText(res.error) || "Failed to revoke grant.");
      else setRevoked(res.data.revoked ?? false);
    } catch (err) {
      setError(errText(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel>
      <form onSubmit={run} className="space-y-4">
        <div className="pb-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Revoke Grant</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Invalidate a grant and every authority delegated beneath it.</p>
        </div>
        <Field label="Grant ID">
          <TextInput value={grantId} onChange={(e) => setGrantId(e.target.value)} placeholder="e.g. BAL-DEL-8921" required />
        </Field>
        <Button type="submit" variant="danger" size="md" loading={loading} disabled={!grantId.trim()}>
          Revoke Grant
        </Button>
      </form>

      {error && <Error message={error} />}
      {revoked !== null && (
        <div
          className="p-3 rounded-babit flex items-center gap-2 text-xs font-mono"
          style={{
            backgroundColor: revoked ? "var(--color-verified-bg)" : "var(--color-pending-bg)",
            border: `1px solid ${revoked ? "var(--color-verified-border)" : "var(--color-pending-border)"}`,
            color: revoked ? "var(--color-verified)" : "var(--color-pending)",
          }}
        >
          <IconCheck className="w-3.5 h-3.5" />
          <span>{revoked ? "Grant revoked." : "Grant was not revoked (already inactive or not found)."}</span>
        </div>
      )}
    </Panel>
  );
}

function IssuedGrant({ grant }: { grant: Grant }) {
  return (
    <div className="space-y-3 pt-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="flex items-center gap-2">
        <IconCheck className="w-3.5 h-3.5 text-emerald-700" />
        <span className="text-xs font-semibold" style={{ color: "var(--fg)" }}>Grant issued</span>
      </div>
      <div className="font-mono text-xs space-y-2">
        <div>
          <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>Grant ID</span>
          <Copyable value={grant.grant_id || "—"} />
        </div>
        {grant.parent_signature && (
          <div>
            <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>Parent Signature</span>
            <span className="text-[11px] break-all block" style={{ color: "var(--muted)" }}>{grant.parent_signature}</span>
          </div>
        )}
        {grant.expires_at && (
          <div>
            <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>Expires At</span>
            <span className="tnum" style={{ color: "var(--fg)" }}>{grant.expires_at}</span>
          </div>
        )}
      </div>
    </div>
  );
}
