import { useState } from "react";
import { IconCheck, IconCopy } from "@/lib/icons";

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
console.log("Sealed event:", event.id);`,

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
print("Sealed event:", event["id"])`,

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
    <section id="developers" className="py-24 sm:py-32 border-t relative overflow-hidden" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="absolute inset-0 mesh-bg pointer-events-none" />
      <div className="absolute inset-0 grid-fade pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 animate-float-up">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-medium uppercase tracking-[0.14em] glass-subtle"
            style={{ color: "var(--muted)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--brand-accent)" }} />
            <span>For developers</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-[46px] font-semibold tracking-tight leading-tight"
            style={{ color: "var(--fg)" }}
          >
            Wire it in with a few HTTP calls.
          </h2>
          <p className="text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
            babit is a plain REST and gRPC API. Record what an agent did with one call, and anyone can
            verify the receipt with another. No SDK required.
          </p>
        </div>

        {/* Bento grid: code playground dominant, endpoints supporting */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Dominant tile: code playground */}
        <div className="relative animate-float-up lg:col-span-2" style={{ animationDelay: "120ms" }}>
          <div className="ambient-glow" style={{ inset: "-8% 8% 12% 8%", opacity: 0.22 }} />
          <div
            className="rounded-babit-lg overflow-hidden relative h-full"
            style={{
              backgroundColor: "#0A0C0C",
              border: "1px solid #222626",
              boxShadow: "0 30px 70px -24px rgba(0,0,0,0.5)",
            }}
          >
          {/* Header tabs bar */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{
              backgroundColor: "#111414",
              borderBottom: "1px solid #222626",
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
                    backgroundColor: activeLang === lang ? "#202626" : "transparent",
                    color: activeLang === lang ? "#F5F6F4" : "#8A9490",
                  }}
                >
                  {lang === "curl" ? "cURL" : lang === "typescript" ? "TypeScript" : lang === "python" ? "Python" : "Go"}
                </button>
              ))}
            </div>

            {/* Copy code button */}
            <button
              onClick={copyCode}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-babit-sm text-xs font-mono text-[#8A9490] hover:text-[#F5F6F4] bg-[#1A1F1F] hover:bg-[#252C2C] transition-colors cursor-pointer"
            >
              {copied ? <IconCheck className="w-3.5 h-3.5 text-emerald-400" /> : <IconCopy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Code content */}
          <div className="p-6 overflow-x-auto font-mono text-xs leading-relaxed text-[#D8E0DC]">
            <pre tabIndex={0} className="outline-none">
              <code>{CODE_EXAMPLES[activeLang]}</code>
            </pre>
          </div>

          {/* Status bar */}
          <div
            className="px-4 py-2 flex items-center justify-between text-[11px] font-mono"
            style={{
              backgroundColor: "#0E1111",
              borderTop: "1px solid #1C2020",
              color: "#737D79",
            }}
          >
            <span>POST /v1/sessions/{'{session_id}'}/actions</span>
            <span>REST + gRPC · OpenAPI</span>
          </div>
          </div>
        </div>

        {/* Supporting tile: the API surface */}
        <div
          className="rounded-babit-lg p-6 h-full glass-subtle animate-float-up flex flex-col"
          style={{ animationDelay: "200ms" }}
        >
          <div className="space-y-1.5 mb-4">
            <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--brand-accent)" }}>
              The API surface
            </span>
            <h3 className="text-[17px] font-semibold leading-snug" style={{ color: "var(--fg)" }}>
              Real endpoints, nothing hidden.
            </h3>
          </div>
          <div className="grid gap-2 font-mono text-[12px]">
            {[
              { m: "POST", p: "/v1/auth/signup" },
              { m: "POST", p: "/v1/auth/login" },
              { m: "GET", p: "/v1/auth/me" },
              { m: "POST", p: "/v1/grants:root" },
              { m: "POST", p: "/v1/grants" },
              { m: "POST", p: "/v1/sessions" },
              { m: "POST", p: "/v1/sessions/{id}/actions" },
              { m: "POST", p: "/v1/proofs:verify" },
              { m: "GET", p: "/v1/notary/public-key" },
            ].map((e) => (
              <div
                key={e.p}
                className="flex items-center gap-2.5 px-3 py-2 rounded-babit"
                style={{ backgroundColor: "var(--secondary)" }}
              >
                <span className="font-semibold shrink-0" style={{ color: "var(--muted)" }}>{e.m}</span>
                <span style={{ color: "var(--fg)" }}>{e.p}</span>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
