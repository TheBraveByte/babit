import { CardGrid, FlushCard, Section, SectionHeader } from "./Section";

const SECTORS = [
  {
    sector: "Financial services",
    agentDoes: "AI just moved money.",
    benefit: "A receipt that names the person who said yes.",
  },
  {
    sector: "Insurance",
    agentDoes: "Settles claims while you sleep.",
    benefit: "Replay the exact moment it decided.",
  },
  {
    sector: "Healthcare",
    agentDoes: "Touches patient records.",
    benefit: "Tied to a real clinician, not a black box.",
  },
  {
    sector: "Software teams",
    agentDoes: "Deploys code and touches prod.",
    benefit: "Every deploy has a paper trail.",
  },
  {
    sector: "Legal and audit",
    agentDoes: "Reviews contracts at 3am.",
    benefit: "Still verifiable in 2035.",
  },
  {
    sector: "Public sector",
    agentDoes: "Decides who gets benefits.",
    benefit: "Explicit, revocable, court-ready.",
  },
];

export function SectionWhoItsFor() {
  return (
    <Section id="who">
      <SectionHeader
        eyebrow="Who it's for"
        title="Industries that can't take 'the agent did it' as an answer."
        lead="For teams that answer to regulators, auditors, customers, or courts."
      />

      <CardGrid cols={3} className="mt-14">
        {SECTORS.map((s) => (
          <FlushCard key={s.sector}>
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
          </FlushCard>
        ))}
      </CardGrid>
    </Section>
  );
}
