import { Section, SectionHeader } from "./Section";

/**
 * SectionTestimonials — social proof from teams using Babit.
 * Clean, simple cards with short quotes. Not wordy.
 */
export function SectionTestimonials() {
  const testimonials = [
    {
      quote: "We can finally prove what our agents did, not just log it.",
      author: "Head of Risk",
      company: "Insurance, Fortune 500",
    },
    {
      quote: "Audits went from weeks to hours. The receipts speak for themselves.",
      author: "Compliance Lead",
      company: "Financial services",
    },
    {
      quote: "It's the first time 'trust but verify' actually means something for AI.",
      author: "CTO",
      company: "Healthtech startup",
    },
  ];

  return (
    <Section id="testimonials" tone="raised">
      <SectionHeader
        eyebrow="What teams say"
        title="Built for teams who need proof."
        align="center"
      />
      <div className="mt-16 grid md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.author}
            className="rounded-babit-md p-7"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <p
              className="text-[18px] leading-relaxed font-medium tracking-[-0.01em]"
              style={{ color: "var(--fg)" }}
            >
              "{t.quote}"
            </p>
            <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <div className="text-[14px] font-medium" style={{ color: "var(--fg)" }}>
                {t.author}
              </div>
              <div className="text-[13px] mt-0.5" style={{ color: "var(--muted)" }}>
                {t.company}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
