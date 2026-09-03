import { useState } from "react";
import { IconCheck, IconCopy, IconArrowUpRight } from "@/lib/icons";
import { Link } from "@/lib/router";
import { Section, SectionHeader, LandingCard } from "./Section";

const CODE_EXAMPLES = {
  curl: `# 1. Record what an agent just did, one authenticated POST.
curl -X POST https://api.babit.dev/v1/sessions/ses_019284/actions \\
  -H "Authorization: Bearer $BABIT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "grant_id": "BAL-417849",
    "action_type": "approve_payout",
    "resource": "https://claims.internal/CLM-48102",
    "value_cents": 420000
  }'

# 2. Anyone can verify the result, no account needed.
curl -X POST https://api.babit.dev/v1/proofs:verify \\
  -H "Content-Type: application/json" \\
  -d @proof.json
# -> {"valid":true,"signature_valid":true,"chain_intact":true,"anchored":true}

# Fetch the public key to check it yourself, offline.
curl https://api.babit.dev/v1/notary/public-key`,

  typescript: `// Record what an agent just did, a single authenticated POST.
const res = await fetch(
  "https://api.babit.dev/v1/sessions/ses_019284/actions",
  {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.BABIT_TOKEN}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_id: "BAL-417849",
      action_type: "approve_payout",
      resource: "https://claims.internal/CLM-48102",
      value_cents: 420000,
    }),
  },
);

const { event } = await res.json();
console.log("Sealed event:", event.event_id);`,

  python: `import os, requests

# Record what an agent just did.
res = requests.post(
    "https://api.babit.dev/v1/sessions/ses_019284/actions",
    headers={"Authorization": f"Bearer {os.environ['BABIT_TOKEN']}"},
    json={
        "grant_id": "BAL-417849",
        "action_type": "approve_payout",
        "resource": "https://claims.internal/CLM-48102",
        "value_cents": 420000,
    },
)

event = res.json()["event"]
print("Sealed event:", event["event_id"])`,

  go: `package main

import (
    "bytes"
    "fmt"
    "net/http"
    "os"
)

func main() {
    body := bytes.NewBufferString(\`{
      "grant_id": "BAL-417849",
      "action_type": "approve_payout",
      "resource": "https://claims.internal/CLM-48102",
      "value_cents": 420000
    }\`)

    req, _ := http.NewRequest("POST",
        "https://api.babit.dev/v1/sessions/ses_019284/actions", body)
    req.Header.Set("Authorization", "Bearer "+os.Getenv("BABIT_TOKEN"))
    req.Header.Set("Content-Type", "application/json")

    res, _ := http.DefaultClient.Do(req)
    defer res.Body.Close()
    fmt.Println("status:", res.Status)
}`,
};

export function SectionBuiltForEngineers() {
  const [activeLang, setActiveLang] = useState<"curl" | "typescript" | "python" | "go">("curl");
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard?.writeText(CODE_EXAMPLES[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Section id="developers">
      <SectionHeader
        eyebrow="Built for engineers"
        title="Wire it in with a few HTTP calls."
        lead="Record an action with one call. Verify the receipt with another. REST and gRPC, no SDK required."
      />

      <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Dominant tile: code playground */}
        <div className="lg:col-span-2">
          <div
            className="rounded-babit-md overflow-hidden h-full"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 30px 70px -24px rgba(0,0,0,0.12)",
            }}
          >
            {/* Header tabs bar */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                backgroundColor: "var(--secondary)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {/* Language tabs */}
              <div className="flex items-center gap-1">
                {(["curl", "typescript", "python", "go"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className="px-3 py-1.5 rounded-babit-sm text-xs font-mono font-medium transition-colors cursor-pointer"
                    style={{
                      backgroundColor: activeLang === lang ? "var(--bg)" : "transparent",
                      color: activeLang === lang ? "var(--fg)" : "var(--muted)",
                    }}
                  >
                    {lang === "curl" ? "cURL" : lang === "typescript" ? "TypeScript" : lang === "python" ? "Python" : "Go"}
                  </button>
                ))}
              </div>

              {/* Copy code button */}
              <button
                onClick={copyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-babit-sm text-xs font-mono transition-colors cursor-pointer"
                style={{ color: "var(--muted)" }}
              >
                {copied ? <span style={{ color: "var(--color-verified)" }}><IconCheck className="w-3.5 h-3.5" /></span> : <IconCopy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Code content */}
            <div className="p-6 overflow-x-auto font-mono text-xs leading-relaxed" style={{ color: "var(--fg)" }}>
              <pre tabIndex={0} className="outline-none">
                <code>{CODE_EXAMPLES[activeLang]}</code>
              </pre>
            </div>

            {/* Status bar */}
            <div
              className="px-4 py-2 flex items-center justify-between text-[11px] font-mono"
              style={{
                backgroundColor: "var(--secondary)",
                borderTop: "1px solid var(--border)",
                color: "var(--muted)",
              }}
            >
              <span>POST /v1/sessions/{'{session_id}'}/actions</span>
              <span>REST + gRPC · OpenAPI</span>
            </div>
          </div>
        </div>

        {/* Supporting tile: the API surface */}
        <LandingCard className="flex flex-col">
          <div className="space-y-1.5 mb-4">
            <span className="type-eyebrow" style={{ color: "var(--brand-accent)" }}>
              The API surface
            </span>
            <h3 className="type-h3" style={{ color: "var(--fg)" }}>
              Every endpoint, documented.
            </h3>
            <p className="type-body">
              Auth, grants, sessions, events, and verification, with request and response examples you can run.
            </p>
          </div>
          <div className="mt-auto">
            <Link
              to="/api"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-pill transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--brand-accent)", color: "#fff" }}
            >
              <span>Open the API reference</span>
              <IconArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </LandingCard>
      </div>
    </Section>
  );
}
