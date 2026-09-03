import { IconCpu, IconLayers, IconMonitor, IconTerminal } from "@/lib/icons";
import { CardGrid, CardIcon, FlushCard, Section, SectionHeader } from "./Section";

const SURFACES = [
  {
    Icon: IconMonitor,
    tag: "Browser",
    title: "Agents in a browser.",
    body: "Clicks, forms and navigation, signed live.",
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

export function SectionSurfaces() {
  return (
    <Section id="surfaces" tone="raised">
      <SectionHeader
        eyebrow="Surfaces"
        title="Wherever the agent acts, babit records it."
        lead="Browser, sandbox, or desktop, you reach the same API and get the same signed receipt."
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
                Same surface, any language.
              </h3>
              <p className="type-body">
                Post the action, the surface, and the grant. The API returns a signed event ID.
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
