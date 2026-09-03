import { Section, SectionHeader, CardGrid, FlushCard } from "./Section";

/**
 * SectionTestimonials — social proof from teams using Babit.
 * Clean, flush-joined cards with short quotes.
 */
export function SectionTestimonials() {
  const testimonials = [
    {
      quote: "We can finally prove what our agents did, not just log it.",
      author: "Head of Risk",
      company: "Insurance",
    },
    {
      quote: "Audits went from weeks to hours. The receipts speak for themselves.",
      author: "Compliance Lead",
      company: "Financial services",
    },
    {
      quote: "It's the first time 'trust but verify' actually means something for AI.",
      author: "CTO",
      company: "Healthtech",
    },
  ];

  return (
    <Section id="testimonials" tone="raised">
      <SectionHeader
        eyebrow="What teams say"
        title="Built for teams who need proof."
        align="center"
      />
      <CardGrid cols={3} className="mt-16">
        {testimonials.map((t) => (
          <FlushCard key={t.author} className="p-7">
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
          </FlushCard>
        ))}
      </CardGrid>
    </Section>
  );
}
