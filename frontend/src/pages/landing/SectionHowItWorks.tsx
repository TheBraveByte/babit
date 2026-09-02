import { IconUser, IconActivity, IconLock, IconShieldCheck } from "@/lib/icons";

const STEPS = [
  {
    n: "01",
    label: "Authority",
    Icon: IconUser,
    title: "A person gives permission.",
    body: "Someone allows an agent to do one specific thing, and only that thing.",
  },
  {
    n: "02",
    label: "Action",
    Icon: IconActivity,
    title: "The agent acts.",
    body: "It does the work: clicks in a browser, runs code, or moves money.",
  },
  {
    n: "03",
    label: "Evidence",
    Icon: IconLock,
    title: "babit records and seals it.",
    body: "It writes down what happened and who allowed it, then seals the record so it cannot be changed later.",
  },
  {
    n: "04",
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
            Four steps, from permission to proof.
          </h2>
          <p className="text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
            When an agent acts on its own, babit ties what it did to the person who allowed it, and turns
            that into evidence anyone can check.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, idx) => {
            const isLast = idx === STEPS.length - 1;
            return (
              <div
                key={step.n}
                className={`relative rounded-babit-lg p-6 space-y-4 h-full overflow-hidden animate-float-up ${isLast ? "glass" : "glass-subtle"}`}
                style={{ animationDelay: `${idx * 90}ms` }}
              >
                {isLast && <div className="h-px accent-hairline absolute inset-x-0 top-0" />}
                <div className="flex items-center justify-between">
                  <div
                    className="w-9 h-9 rounded-babit flex items-center justify-center"
                    style={{ backgroundColor: "var(--secondary)", color: "var(--fg)" }}
                  >
                    <step.Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>
                    {step.n}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-mono uppercase tracking-wider" style={{ color: isLast ? "var(--brand-accent)" : "var(--muted)" }}>
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
