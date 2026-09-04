import { IconCpu, IconLayers, IconMonitor, IconTerminal } from "@/lib/icons";
import { CardGrid, CardIcon, FlushCard, Section, SectionHeader } from "./Section";

const SURFACES = [
  {
    Icon: IconMonitor,
    tag: "Browser",
    title: "Cloud browsers with receipts.",
    body: "Every click, form, and page. Signed while it happens.",
  },
  {
    Icon: IconTerminal,
    tag: "Sandbox",
    title: "Signed code runs.",
    body: "Every command and write gets a notarized fingerprint.",
  },
  {
    Icon: IconCpu,
    tag: "Desktop",
    title: "Desktop apps, witnessed.",
    body: "Every tap and keystroke tied back to permission.",
  },
];

export function SectionSurfaces() {
  return (
    <Section id="surfaces" tone="raised">
      <SectionHeader
        eyebrow="Surfaces"
        title="If the agent touches it, babit signs it."
        lead="Cloud browser, sandbox, desktop — same API, same receipt. babit does not care where the agent runs."
      />

      <div className="mt-14">
        <CardGrid cols={3}>
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

        <div
          className="mt-5 rounded-babit p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}
        >
          <div className="flex items-start gap-3">
            <CardIcon>
              <IconLayers className="w-4 h-4" />
            </CardIcon>
            <div className="space-y-0.5">
              <h3 className="text-[15px] font-medium" style={{ color: "var(--fg)" }}>
                One API. Any language.
              </h3>
              <p className="type-body">
                Send the action, the surface, and the grant. Get a signed event ID back.
              </p>
            </div>
          </div>
          <span
            className="text-xs font-mono px-3 py-1.5 rounded-babit-sm shrink-0"
            style={{ backgroundColor: "var(--secondary)", color: "var(--muted)" }}
          >
            REST · gRPC · OpenAPI
          </span>
        </div>
      </div>
    </Section>
  );
}
