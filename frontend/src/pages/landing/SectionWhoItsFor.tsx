import { Section, SectionHeader, LandingCard } from "./Section";

const SECTORS = [
  {
    sector: "Financial services",
    agentDoes: "Moves money, approves payouts, rebalances accounts.",
    benefit:
      "Every transfer carries the grant that authorized it and the supervisor behind that grant, so a disputed payment is settled with a receipt instead of an investigation.",
  },
  {
    sector: "Insurance",
    agentDoes: "Triages claims and settles them inside policy limits.",
    benefit:
      "Adjusters and regulators can replay a decision exactly as the agent made it, and confirm the limits it was allowed to work within.",
  },
  {
    sector: "Healthcare",
    agentDoes: "Handles prior authorization, scheduling, record requests.",
    benefit:
      "Access to a patient record is tied to a named clinician's authority, and the audit trail proves the scope was never exceeded.",
  },
  {
    sector: "Software teams",
    agentDoes: "Ships code, runs migrations, touches production.",
    benefit:
      "A change window becomes an evidence trail: which agent deployed, under whose delegation, against which resource, sealed at the moment it happened.",
  },
  {
    sector: "Legal and audit",
    agentDoes: "Reviews contracts, exports records, files submissions.",
    benefit:
      "Receipts verify offline, years later, without a live babit account, in a format an auditor or opposing counsel can check independently.",
  },
  {
    sector: "Public sector",
    agentDoes: "Processes benefits, licences and citizen requests.",
    benefit:
      "Delegated authority is explicit and revocable, and the public anchor lets an oversight body confirm no record was rewritten after the fact.",
  },
];

export function SectionWhoItsFor() {
  return (
    <Section id="who">
      <SectionHeader
        eyebrow="Who it's for"
        title="Where an agent's word isn't good enough."
        lead="babit is built for teams that have to answer for what their agents did, to a regulator, an auditor, a customer, or a court."
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
