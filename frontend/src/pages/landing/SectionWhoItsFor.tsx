import { Section, SectionHeader, LandingCard } from "./Section";

const SECTORS = [
  {
    sector: "Financial services",
    agentDoes: "Moves money, approves payouts.",
    benefit: "Proof of who authorized it.",
  },
  {
    sector: "Insurance",
    agentDoes: "Triages and settles claims.",
    benefit: "Replay any decision exactly.",
  },
  {
    sector: "Healthcare",
    agentDoes: "Handles records and prior auth.",
    benefit: "Tied to a named clinician.",
  },
  {
    sector: "Software teams",
    agentDoes: "Ships code, runs migrations.",
    benefit: "Every deploy has a trail.",
  },
  {
    sector: "Legal and audit",
    agentDoes: "Reviews contracts, exports records.",
    benefit: "Verifies offline, years later.",
  },
  {
    sector: "Public sector",
    agentDoes: "Processes benefits and licences.",
    benefit: "Explicit, revocable, auditable.",
  },
];

export function SectionWhoItsFor() {
  return (
    <Section id="who">
      <SectionHeader
        eyebrow="Who it's for"
        title="Where an agent's word isn't good enough."
        lead="For teams that answer to regulators, auditors, customers, or courts."
      />

      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SECTORS.map((s) => (
          <LandingCard key={s.sector}>
            <div className="flex flex-col h-full">
              <h3 className="type-h3" style={{ color: "var(--fg)" }}>
                {s.sector}
              </h3>
              <p className="mt-2 text-[13px] font-mono" style={{ color: "var(--muted)" }}>
                {s.agentDoes}
              </p>
              <div className="my-5 h-px" style={{ backgroundColor: "var(--border-subtle)" }} />
              <p className="type-body" style={{ color: "var(--fg)" }}>
                {s.benefit}
              </p>
            </div>
          </LandingCard>
        ))}
      </div>
    </Section>
  );
}
