import { useState } from "react";
import { Nav } from "./landing/Nav";
import { Footer } from "./landing/Footer";
import { Section, SectionHeader } from "./landing/Section";
import { Field, TextInput, TextArea, Button } from "@/lib/ui";

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production this would POST to /v1/contact or an email service.
    // For now we show a confirmation.
    setSubmitted(true);
  };

  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
    >
      <Nav />
      <main className="pt-20">
        <Section id="contact" tone="base">
          <SectionHeader
            eyebrow="Contact"
            align="center"
            title="Talk to us."
            lead="Questions about security, pricing, or deployment. We respond within one business day."
          />

          <div className="mt-12 max-w-md mx-auto">
            {submitted ? (
              <div
                className="p-8 text-center"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "4px",
                }}
              >
                <h3 className="type-h3 mb-2">Thanks.</h3>
                <p className="type-body" style={{ color: "var(--muted)" }}>
                  We will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Field label="Email">
                  <TextInput
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                </Field>
                <Field label="Message">
                  <TextArea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What do you need?"
                    rows={5}
                  />
                </Field>
                <Button type="submit" variant="brand" size="lg" className="w-full">
                  Send message
                </Button>
              </form>
            )}
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
