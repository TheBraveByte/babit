import { useState } from "react";
import { Section, SectionHeader } from "./Section";

const LANGUAGES = [
  {
    label: "cURL",
    code: `curl -X POST https://api.babit.dev/v1/capture/events \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "session_id": "BAL-973396",
    "action_type": "browser.submit",
    "recording_ref": "https://dashboard.stripe.com/payments/pi_3abc123"
  }'`,
  },
  {
    label: "Go",
    code: `ctx := context.Background()
res, err := client.RecordAction(ctx, &ledgerv1.RecordActionRequest{
    SessionId:    "BAL-973396",
    ActionType:   "browser.submit",
    RecordingRef: "https://dashboard.stripe.com/payments/pi_3abc123",
})`,
  },
  {
    label: "Python",
    code: `requests.post(
    "https://api.babit.dev/v1/capture/events",
    headers={"Authorization": f"Bearer {token}"},
    json={
        "session_id": "BAL-973396",
        "action_type": "browser.submit",
        "recording_ref": "https://dashboard.stripe.com/payments/pi_3abc123",
    },
)`,
  },
];

export function SectionApiSnippet() {
  const [active, setActive] = useState(0);

  return (
    <Section id="api-snippet" tone="raised">
      <SectionHeader
        eyebrow="Get started"
        title="One call. Signed. Tamper-evident."
        lead="Record an action from any language and get back a receipt ID you can verify later."
      />

      <div className="mt-14 max-w-3xl mx-auto">
        <div
          className="rounded-babit-md overflow-hidden"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 30px 70px -24px color-mix(in srgb, var(--fg) 10%, transparent)",
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ backgroundColor: "var(--secondary)", borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FF5F57" }} />
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FEBC2E" }} />
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#28C840" }} />
            </div>
            <div className="flex items-center gap-1">
              {LANGUAGES.map((l, i) => (
                <button
                  key={l.label}
                  onClick={() => setActive(i)}
                  className="px-3 py-1 text-[12px] font-medium rounded-babit-sm transition-colors cursor-pointer"
                  style={{
                    backgroundColor: active === i ? "var(--bg)" : "transparent",
                    color: active === i ? "var(--fg)" : "var(--muted)",
                    border: active === i ? "1px solid var(--border)" : "1px solid transparent",
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5 overflow-x-auto">
            <pre className="font-mono text-[13px] leading-relaxed" style={{ color: "var(--fg)" }}>
              <code>{LANGUAGES[active].code}</code>
            </pre>
          </div>
          <div
            className="px-5 py-3 text-[12px]"
            style={{ borderTop: "1px solid var(--border)", color: "var(--muted)" }}
          >
            Returns{" "}
            <span className="font-mono" style={{ color: "var(--fg)" }}>
              {"{ event_id, content_hash, notary_signature }"}
            </span>
          </div>
        </div>

        <p className="mt-6 text-center type-body">
          No SDK required. gRPC and OpenAPI are documented right in the console.
        </p>
      </div>
    </Section>
  );
}
