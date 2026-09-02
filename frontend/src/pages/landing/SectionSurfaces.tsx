import { IconMonitor, IconTerminal, IconCpu, IconLayers } from "@/lib/icons";

const SURFACES = [
  {
    Icon: IconMonitor,
    tag: "Browser",
    title: "Agents in a web browser.",
    body: "Clicks, navigation, and form fills get recorded as they happen, tied to the grant that allowed them.",
  },
  {
    Icon: IconTerminal,
    tag: "Sandbox",
    title: "Agents running code.",
    body: "Shell commands, file writes, and network calls inside an isolated sandbox each leave a sealed record.",
  },
  {
    Icon: IconCpu,
    tag: "Desktop",
    title: "Agents driving an app.",
    body: "When an agent controls a real desktop application, babit records what it did and who permitted it.",
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
    <section
      id="surfaces"
      className="py-24 sm:py-32 border-t relative overflow-hidden"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
    >
      <div className="absolute inset-0 mesh-bg pointer-events-none" />
      <div className="absolute inset-0 grid-fade pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 relative z-10">
        {/* Header */}
        <div className="max-w-3xl space-y-4 animate-float-up">
          <h2
            className="text-3xl sm:text-4xl lg:text-[46px] font-semibold tracking-tight leading-tight"
            style={{ color: "var(--fg)" }}
          >
            Wherever the agent acts, babit records it.
          </h2>
          <p className="text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
            Browser, sandbox, or desktop, you reach it the same way every time.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {SURFACES.map((s, idx) => (
            <div
              key={s.tag}
              className="rounded-babit-lg p-6 space-y-4 h-full glass-subtle animate-float-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-9 h-9 rounded-babit flex items-center justify-center"
                  style={{ backgroundColor: "var(--secondary)", color: "var(--fg)" }}
                >
                  <s.Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                  {s.tag}
                </span>
              </div>
              <h3 className="text-[17px] font-semibold leading-snug" style={{ color: "var(--fg)" }}>
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                {s.body}
              </p>
            </div>
          ))}

          {/* Dominant tile: any language, one HTTP call */}
          <div
            className="rounded-babit-lg p-6 space-y-5 h-full glass-subtle animate-float-up lg:col-span-2 relative overflow-hidden"
            style={{ animationDelay: "240ms" }}
          >
            <div className="h-px accent-hairline absolute inset-x-0 top-0" />
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-babit flex items-center justify-center"
                style={{ backgroundColor: "var(--secondary)", color: "var(--fg)" }}
              >
                <IconLayers className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-[17px] font-semibold leading-snug" style={{ color: "var(--fg)" }}>
                  Any language, one HTTP call.
                </h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  A plain REST API. Name the surface, post the action, get a sealed record back.
                </p>
              </div>
            </div>

            <div
              className="rounded-babit overflow-hidden"
              style={{ backgroundColor: "#0A0C0C", border: "1px solid #222626" }}
            >
              <div
                className="px-4 py-2 text-[11px] font-mono flex items-center justify-between"
                style={{ backgroundColor: "#111414", borderBottom: "1px solid #222626", color: "#8A9490" }}
              >
                <span>cURL</span>
                <span>POST /v1/sessions/{"{id}"}/actions</span>
              </div>
              <div className="p-4 overflow-x-auto font-mono text-xs leading-relaxed text-[#D8E0DC]">
                <pre tabIndex={0} className="outline-none">
                  <code>{CURL}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Supporting tile: verify anywhere */}
          <div
            className="rounded-babit-lg p-6 space-y-4 h-full glass-subtle animate-float-up flex flex-col justify-between"
            style={{ animationDelay: "320ms" }}
          >
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--brand-accent)" }}>
                Verify anywhere
              </span>
              <h3 className="text-[17px] font-semibold leading-snug" style={{ color: "var(--fg)" }}>
                The receipt outlives the surface.
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                However the action happened, the record checks out the same way. Post a proof, or fetch the public key and check it yourself.
              </p>
            </div>
            <div className="grid gap-2 font-mono text-[12px]">
              {[
                { m: "POST", p: "/v1/proofs:verify" },
                { m: "GET", p: "/v1/notary/public-key" },
              ].map((e) => (
                <div key={e.p} className="flex items-center gap-2.5 px-3 py-2 rounded-babit" style={{ backgroundColor: "var(--secondary)" }}>
                  <span className="font-semibold shrink-0" style={{ color: "var(--muted)" }}>{e.m}</span>
                  <span style={{ color: "var(--fg)" }}>{e.p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
