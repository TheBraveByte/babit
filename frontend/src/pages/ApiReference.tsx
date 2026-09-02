import { useState } from "react";
import specRaw from "../../openapi.v3.json";
import { Nav } from "./landing/Nav";
import { Footer } from "./landing/Footer";
import { Json } from "@/lib/ui";

// The spec is the single source of truth; traverse it loosely.
const spec = specRaw as any;

/* ─── Spec helpers ──────────────────────────────────────────────────────────── */

function resolveRef(ref: string): any {
  // "#/components/schemas/v1Foo" → spec.components.schemas.v1Foo
  const name = ref.replace("#/components/schemas/", "");
  return spec.components?.schemas?.[name];
}

function refName(ref: string): string {
  return ref.replace("#/components/schemas/", "");
}

// A human-readable type label for a property schema.
function typeLabel(schema: any): string {
  if (!schema) return "any";
  if (schema.$ref) return refName(schema.$ref);
  if (schema.type === "array") return `${typeLabel(schema.items)}[]`;
  if (schema.enum) return "enum";
  if (schema.format) return `${schema.type} · ${schema.format}`;
  return schema.type || "object";
}

// Build a representative example value from a schema (prefers spec `example`).
function exampleFor(schema: any, depth = 0): any {
  if (!schema || depth > 4) return null;
  if (schema.$ref) {
    const target = resolveRef(schema.$ref);
    if (target?.example !== undefined) return target.example;
    return exampleFor(target, depth + 1);
  }
  if (schema.example !== undefined) return schema.example;
  if (schema.enum) return schema.default ?? schema.enum[0];
  switch (schema.type) {
    case "object": {
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(schema.properties || {})) {
        out[k] = exampleFor(v, depth + 1);
      }
      return out;
    }
    case "array":
      return [exampleFor(schema.items, depth + 1)];
    case "boolean":
      return true;
    case "integer":
      return 0;
    case "string":
      if (schema.format === "date-time") return "2026-09-01T12:00:00Z";
      if (schema.format === "byte") return "base64…";
      if (schema.format === "int64") return "0";
      return "string";
    default:
      return null;
  }
}

// Flatten the top-level fields of a request/response schema for a compact table.
function fieldsOf(schema: any): { name: string; type: string; required: boolean }[] {
  if (!schema) return [];
  const resolved = schema.$ref ? resolveRef(schema.$ref) : schema;
  if (!resolved?.properties) return [];
  const required: string[] = resolved.required || [];
  return Object.entries(resolved.properties).map(([name, v]) => ({
    name,
    type: typeLabel(v),
    required: required.includes(name),
  }));
}

/* ─── Endpoint model ────────────────────────────────────────────────────────── */

type Endpoint = {
  id: string;
  method: string;
  path: string;
  summary: string;
  op: any;
};

// Plain-language notes, accurate to each summary — keyed by operationId.
const NOTES: Record<string, string> = {
  AuthService_Login: "Exchange email and password for a session token you attach to later calls.",
  AuthService_Me: "Return the signed-in user and their organization's branding.",
  AuthService_Signup: "Create a personal or organization account and receive a session token.",
  LedgerService_GetEvent: "Fetch a single sealed action event by its id.",
  LedgerService_GetInclusionProof: "Assemble an offline-verifiable proof that an event belongs to the sealed ledger.",
  DelegationService_Delegate: "Hand an agent or sub-agent a scoped, signed slice of authority under a parent grant.",
  DelegationService_Revoke: "Revoke a grant and every grant delegated beneath it.",
  DelegationService_VerifyChain: "Walk a grant's delegation chain back to its root and confirm each signature.",
  DelegationService_IssueRootGrant: "Mint the top-level grant for a human principal that all delegations descend from.",
  NotaryService_GetPublicKey: "Return the notary's public key so anyone can verify signatures offline.",
  VerifyService_VerifyProof: "Check a proof's chain, signature, anchor and authority in one call.",
  CaptureService_BeginSession: "Open a capture session bound to a root grant on a chosen surface.",
  CaptureService_RecordAction: "Record one executed action and have the notary seal it into the session chain.",
  NotaryService_GetAnchor: "Fetch the external anchor that publishes a session's sealed root.",
  CaptureService_EndSession: "Close a capture session so no further actions can be appended.",
  ReplayService_GetReplay: "Stream a session's events in order for a deterministic replay.",
};

// Groups derived from the real paths — order is intentional.
const GROUPS: { title: string; match: (p: string) => boolean }[] = [
  { title: "Auth", match: (p) => p.startsWith("/v1/auth") },
  { title: "Grants & Delegation", match: (p) => p.startsWith("/v1/grants") && !p.endsWith(":verify") },
  { title: "Sessions", match: (p) => p.startsWith("/v1/sessions") },
  { title: "Events & Proofs", match: (p) => p.startsWith("/v1/events") || (p.startsWith("/v1/proofs") && !p.endsWith(":verify")) },
  { title: "Notary", match: (p) => p.startsWith("/v1/notary") },
  { title: "Verification", match: (p) => p.endsWith(":verify") },
];

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildGroups() {
  const paths = spec.paths || {};
  return GROUPS.map((g) => {
    const endpoints: Endpoint[] = [];
    for (const [path, methods] of Object.entries<any>(paths)) {
      if (!g.match(path)) continue;
      for (const [method, op] of Object.entries<any>(methods)) {
        endpoints.push({
          id: op.operationId || `${method}-${slug(path)}`,
          method: method.toUpperCase(),
          path,
          summary: op.summary || "",
          op,
        });
      }
    }
    endpoints.sort((a, b) => a.path.localeCompare(b.path));
    return { title: g.title, id: slug(g.title), endpoints };
  }).filter((g) => g.endpoints.length > 0);
}

/* ─── UI atoms ──────────────────────────────────────────────────────────────── */

function MethodBadge({ method }: { method: string }) {
  const isGet = method === "GET";
  const color = isGet ? "var(--color-verified)" : "var(--brand-accent)";
  return (
    <span
      className="inline-flex items-center rounded-babit-sm px-2 py-0.5 text-[11px] font-mono font-semibold tracking-wide shrink-0"
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      {method}
    </span>
  );
}

function FieldTable({
  title,
  fields,
}: {
  title: string;
  fields: { name: string; type: string; required: boolean }[];
}) {
  if (fields.length === 0) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
        {title}
      </h4>
      <div className="rounded-babit border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        {fields.map((f, i) => (
          <div
            key={f.name}
            className="flex items-center justify-between gap-3 px-3 py-2 text-xs"
            style={{
              borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
              backgroundColor: "var(--surface)",
            }}
          >
            <span className="font-mono" style={{ color: "var(--fg)" }}>
              {f.name}
              {f.required && <span style={{ color: "var(--brand-accent)" }}> *</span>}
            </span>
            <span className="font-mono text-[11px]" style={{ color: "var(--muted)" }}>{f.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Endpoint block ────────────────────────────────────────────────────────── */

function EndpointBlock({ ep }: { ep: Endpoint }) {
  const params = (ep.op.parameters || []).map((p: any) => ({
    name: p.name,
    type: `${typeLabel(p.schema)}${p.in === "path" ? " · path" : ""}`,
    required: !!p.required,
  }));

  const bodySchema = ep.op.requestBody?.content?.["application/json"]?.schema;
  const bodyFields = fieldsOf(bodySchema);

  const respSchema =
    ep.op.responses?.["200"]?.content?.["application/json"]?.schema;
  const respExample = respSchema ? exampleFor(respSchema) : null;
  const bodyExample = bodySchema ? exampleFor(bodySchema) : null;

  return (
    <section id={ep.id} className="scroll-mt-28 py-10 border-t first:border-t-0" style={{ borderColor: "var(--border)" }}>
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        {/* Description column */}
        <div className="space-y-5">
          <div className="flex items-center gap-2.5">
            <MethodBadge method={ep.method} />
            <code className="font-mono text-[13px] break-all" style={{ color: "var(--fg)" }}>{ep.path}</code>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-semibold tracking-tight" style={{ color: "var(--fg)" }}>
              {ep.summary}
            </h3>
            {NOTES[ep.id] && (
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                {NOTES[ep.id]}
              </p>
            )}
          </div>

          {params.length > 0 && <FieldTable title="Path parameters" fields={params} />}
          {bodyFields.length > 0 && <FieldTable title="Request body" fields={bodyFields} />}
        </div>

        {/* Example column */}
        <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
              Request
            </h4>
            <div
              className="rounded-babit-sm px-3.5 py-2.5 font-mono text-xs flex items-center gap-2 bg-[#0E1010] border border-[#1C2020]"
            >
              <span className="text-[#5FBF9F] font-semibold">{ep.method}</span>
              <span className="text-[#A8B5A2] break-all">{ep.path}</span>
            </div>
          </div>

          {bodyExample != null && Object.keys(bodyExample).length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                Body example
              </h4>
              <Json data={bodyExample} />
            </div>
          )}

          {respExample != null && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>
                Response
              </h4>
              <Json data={respExample} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export function ApiReference() {
  const groups = buildGroups();
  const [active, setActive] = useState<string>(groups[0]?.endpoints[0]?.id ?? "");

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}>
      <Nav />

      {/* Header */}
      <header className="mesh-bg relative border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-14">
          <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--brand-accent)" }}>
            {spec.info?.title} · v{spec.info?.version}
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight" style={{ color: "var(--fg)" }}>
            API reference
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {spec.info?.description} Every endpoint below is generated from the OpenAPI spec, so it
            never drifts from the backend.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href="/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono px-3 py-1.5 rounded-babit border transition-colors hover:bg-[var(--secondary)]"
              style={{ borderColor: "var(--border)", color: "var(--fg)" }}
            >
              OpenAPI spec ↗
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* Left sticky nav */}
          <aside className="hidden lg:block">
            <nav className="sticky top-28 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
              {groups.map((g) => (
                <div key={g.id} className="space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                    {g.title}
                  </div>
                  <ul className="space-y-0.5">
                    {g.endpoints.map((ep) => (
                      <li key={ep.id}>
                        <button
                          onClick={() => scrollTo(ep.id)}
                          className="w-full text-left flex items-center gap-2 px-2 py-1 rounded-babit-sm text-xs transition-colors cursor-pointer hover:bg-[var(--secondary)]"
                          style={{
                            color: active === ep.id ? "var(--fg)" : "var(--muted)",
                            backgroundColor: active === ep.id ? "var(--secondary)" : "transparent",
                          }}
                        >
                          <span
                            className="font-mono text-[9px] font-semibold w-9 shrink-0"
                            style={{ color: ep.method === "GET" ? "var(--color-verified)" : "var(--brand-accent)" }}
                          >
                            {ep.method}
                          </span>
                          <span className="truncate">{ep.summary}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Middle + right (endpoint blocks) */}
          <main>
            {groups.map((g) => (
              <div key={g.id} id={g.id} className="scroll-mt-28">
                <div className="pt-8">
                  <h2 className="text-lg font-semibold tracking-tight" style={{ color: "var(--fg)" }}>
                    {g.title}
                  </h2>
                </div>
                {g.endpoints.map((ep) => (
                  <EndpointBlock key={ep.id} ep={ep} />
                ))}
              </div>
            ))}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
