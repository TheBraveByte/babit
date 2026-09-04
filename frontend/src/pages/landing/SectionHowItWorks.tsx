import { IconActivity, IconArrowRight, IconLock, IconShieldCheck, IconUser } from "@/lib/icons";
import { CardIcon, LandingCard, Section, SectionHeader } from "./Section";

const STEPS = [
  {
    label: "Authority",
    Icon: IconUser,
    title: "A human says yes.",
    body: "One specific permission. Nothing more.",
  },
  {
    label: "Action",
    Icon: IconActivity,
    title: "The agent does its thing.",
    body: "Clicks, code, or money movement.",
  },
  {
    label: "Evidence",
    Icon: IconLock,
    title: "babit notarizes it.",
    body: "Signed, hash-linked, and tamper-evident.",
  },
  {
    label: "Verification",
    Icon: IconShieldCheck,
    title: "Anyone can verify it.",
    body: "Independently auditable, even offline.",
  },
];

export function SectionHowItWorks() {
  return (
    <Section id="how">
      <SectionHeader
        eyebrow="How it works"
        title="From yes to receipt."
        lead="See who gave permission, what the agent did, and the proof that ties them together."
      />

      <div className="mt-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-5">
          <LandingCard emphasis="raised" className="sm:col-span-2 lg:col-span-2 space-y-5">
            <span className="type-eyebrow block" style={{ color: "var(--brand-accent)" }}>
              The flow
            </span>
            <h3 className="type-h3" style={{ color: "var(--fg)" }}>
              One thread, from yes to proof.
            </h3>
            <p className="type-body">
              Who allowed it follows every step. The result is a receipt, not just a log.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {STEPS.map((s, i) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-1 rounded-babit text-[11px] font-mono uppercase tracking-wider"
                    style={{ backgroundColor: "var(--secondary)", color: "var(--fg)" }}
                  >
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && <IconArrowRight className="w-3.5 h-3.5" />}
                </div>
              ))}
            </div>
          </LandingCard>
          {STEPS.map((step) => (
            <LandingCard key={step.label} className="space-y-4">
              <CardIcon>
                <step.Icon className="w-4 h-4" />
              </CardIcon>
              <div className="space-y-1.5">
                <span className="type-eyebrow block">{step.label}</span>
                <h3 className="type-h3" style={{ color: "var(--fg)" }}>
                  {step.title}
                </h3>
              </div>
              <p className="type-body">{step.body}</p>
            </LandingCard>
          ))}
        </div>
      </div>
    </Section>
  );
}
