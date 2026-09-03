import { IconCpu, IconLayers, IconMonitor, IconTerminal } from "@/lib/icons";
import { CardGrid, CardIcon, FlushCard, LandingCard, Section, SectionHeader } from "./Section";

const SURFACES = [
  {
    Icon: IconMonitor,
    tag: "Browser",
    title: "Agents in a browser.",
    body: "Clicks and forms, signed live.",
  },
  {
    Icon: IconTerminal,
    tag: "Sandbox",
    title: "Agents running code.",
    body: "Commands and writes, each notarized.",
  },
  {
    Icon: IconCpu,
    tag: "Desktop",
    title: "Agents driving an app.",
    body: "Desktop actions, with permission.",
  },
];

const CURL = `# Record one action an agent just took.
curl -X POST https://api.babit.dev/v1/sessions/ses_019284/actions \\
  -H "Authorization: Bearer $BABIT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "grant_id": "BAL-417849",
    "surface": "BROWSER",
    "action_type": "submit_form",
    "resource": "https://claims.internal/CLM-48102"
  }'`;

export function SectionSurfaces() {
  return (
    <Section id="surfaces" tone="raised">
      <SectionHeader
        eyebrow="Surfaces"
        title="Wherever the agent acts, babit records it."
        lead="Browser, sandbox, or desktop, you reach it the same way every time."
      />

      <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <CardGrid cols={3} className="lg:col-span-3">
          {SURFACES.map((s) => (
            <FlushCard key={s.tag} className="space-y-4">
              <div className="flex items-center justify-between">
                <CardIcon>
                  <s.Icon className="w-4 h-4" />
                </CardIcon>
                <span className="type-eyebrow">{s.tag}</span>
              </div>
              <h3 className="type-h3" style={{ color: "var(--fg)" }}>
                {s.title}
              </h3>
              <p className="type-body">{s.body}</p>
            </FlushCard>
          ))}
        </CardGrid>

        {/* Dominant tile: any language, one HTTP call */}
        <LandingCard emphasis="raised" className="space-y-5 lg:col-span-2">
          <div className="flex items-center gap-3">
            <CardIcon>
              <IconLayers className="w-4 h-4" />
            </CardIcon>
            <div className="space-y-0.5">
              <h3 className="type-h3" style={{ color: "var(--fg)" }}>
                Any language, one HTTP call.
              </h3>
              <p className="type-body">
                A plain REST API. Name the surface, post the action, get a signed record back.
              </p>
            </div>
          </div>

          <div
            className="rounded-babit overflow-hidden"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div
              className="px-4 py-2 text-[11px] font-mono flex items-center justify-between"
              style={{
                backgroundColor: "var(--secondary)",
                borderBottom: "1px solid var(--border)",
                color: "var(--muted)",
              }}
            >
              <span>cURL</span>
              <span>POST /v1/sessions/{"{id}"}/actions</span>
            </div>
            <div
              className="p-4 overflow-x-auto font-mono text-xs leading-relaxed"
              style={{ color: "var(--fg)" }}
            >
              <pre tabIndex={0} className="outline-none">
                <code>{CURL}</code>
              </pre>
            </div>
          </div>
        </LandingCard>

        {/* Supporting tile: verify anywhere */}
        <LandingCard className="flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <span className="type-eyebrow block" style={{ color: "var(--brand-accent)" }}>
              Verify anywhere
            </span>
            <h3 className="type-h3" style={{ color: "var(--fg)" }}>
              The receipt outlives the surface.
            </h3>
            <p className="type-body">
              However the action happened, the record checks out the same way. Post a proof, or
              fetch the public key and check it yourself.
            </p>
          </div>
          <div className="grid gap-2 font-mono text-[12px]">
            {[
              { m: "POST", p: "/v1/proofs:verify" },
              { m: "GET", p: "/v1/notary/public-key" },
            ].map((e) => (
              <div
                key={e.p}
                className="flex items-center gap-2.5 px-3 py-2 rounded-babit"
                style={{ backgroundColor: "var(--secondary)" }}
              >
                <span className="font-semibold shrink-0" style={{ color: "var(--muted)" }}>
                  {e.m}
                </span>
                <span style={{ color: "var(--fg)" }}>{e.p}</span>
              </div>
            ))}
          </div>
        </LandingCard>
      </div>
    </Section>
  );
}
