import { IconUser, IconActivity, IconLock, IconShieldCheck, IconArrowRight } from "@/lib/icons";

const STEPS = [
  {
    label: "Authority",
    Icon: IconUser,
    title: "A person gives permission.",
    body: "Someone allows an agent to do one specific thing, and only that thing.",
  },
  {
    label: "Action",
    Icon: IconActivity,
    title: "The agent acts.",
    body: "It does the work: clicks in a browser, runs code, or moves money.",
  },
  {
    label: "Evidence",
    Icon: IconLock,
    title: "babit records and seals it.",
    body: "It writes down what happened and who allowed it, then seals the record so it cannot be changed later.",
  },
  {
    label: "Verification",
    Icon: IconShieldCheck,
    title: "Anyone can check it.",
    body: "Anyone can confirm the record is real and unchanged on their own, without taking babit's word for it.",
  },
];

export function SectionHowItWorks() {
  return (
    <section id="how" className="py-24 sm:py-32 border-t relative overflow-hidden" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="absolute inset-0 grid-fade pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 relative z-10">
        <div className="max-w-3xl space-y-4 animate-float-up">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-medium uppercase tracking-[0.14em] glass-subtle"
            style={{ color: "var(--muted)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--brand-accent)" }} />
            <span>How it works</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-[46px] font-semibold tracking-tight leading-tight"
            style={{ color: "var(--fg)" }}
          >
            From permission to proof.
          </h2>
          <p className="text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
            When an agent acts on its own, babit ties what it did to the person who allowed it, and turns
            that into evidence anyone can check.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-5">
          {/* Dominant lead tile: the whole flow */}
          <div className="relative rounded-babit-lg p-6 space-y-5 h-full overflow-hidden glass animate-float-up sm:col-span-2 lg:col-span-2">
            <div className="h-px accent-hairline absolute inset-x-0 top-0" />
            <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--brand-accent)" }}>
              The flow
            </span>
            <h3 className="text-xl font-semibold leading-snug tracking-tight" style={{ color: "var(--fg)" }}>
              One thread, from the moment someone says yes.
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              Each action an agent takes stays tied to the person who allowed it. babit carries that link
              through every step below, so what comes out the other end is evidence, not just a log.
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
                  {i < STEPS.length - 1 && (
                    <IconArrowRight className="w-3.5 h-3.5" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Supporting tiles: the four points */}
          {STEPS.map((step, idx) => (
            <div
              key={step.label}
              className="relative rounded-babit-lg p-6 space-y-4 h-full overflow-hidden glass-subtle animate-float-up"
              style={{ animationDelay: `${(idx + 1) * 80}ms` }}
            >
              <div
                className="w-9 h-9 rounded-babit flex items-center justify-center"
                style={{ backgroundColor: "var(--secondary)", color: "var(--fg)" }}
              >
                <step.Icon className="w-4 h-4" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                  {step.label}
                </span>
                <h3 className="text-[17px] font-semibold leading-snug" style={{ color: "var(--fg)" }}>
                  {step.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
