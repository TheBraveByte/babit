import { useState } from "react";
import { IconCheck, IconCopy } from "@/lib/icons";

const CODE_EXAMPLES = {
  typescript: `import { BabitClient } from "@babit/sdk";

// Initialize client with your notary ingestion token
const babit = new BabitClient({
  apiKey: process.env.BABIT_API_KEY,
  endpoint: "https://api.babit.dev",
});

// 1. Open an authenticated execution session bound to a root grant
const session = await babit.sessions.begin({
  grantId: "BAL-ROOT-100200",
  principal: "usr_alice",
  surface: "SURFACE_BROWSER",
});

// 2. Capture and notarize consequential agent action at point of effect
const receipt = await session.recordAction({
  action: "approve_payout",
  agentId: "claims-agent",
  resource: "https://internal.bank.io/claims/48102",
  payload: {
    claim_id: "CLM-48102",
    amount_usd: 4200.0,
    approved_by: "claims-agent",
  },
});

console.log("Sealed receipt:", receipt.id);
console.log("Merkle root:", receipt.merkleRoot);
console.log("Ed25519 signature:", receipt.notarySignature);`,

  python: `from babit import BabitClient

# Initialize client
client = BabitClient(api_key="babit_live_secret_...")

# 1. Open session bound to risk supervisor grant
session = client.sessions.begin(
    grant_id="BAL-ROOT-100200",
    principal="usr_alice",
    surface="SURFACE_SANDBOX",
)

# 2. Notarize action
receipt = session.record_action(
    action="approve_payout",
    agent_id="claims-agent",
    resource="https://internal.bank.io/claims/48102",
    payload={"claim_id": "CLM-48102", "amount_usd": 4200.00}
)

print(f"Receipt ID: {receipt.id}")
print(f"Verified: {receipt.is_valid()}")`,

  go: `package main

import (
    "context"
    "fmt"
    "github.com/thebravebyte/babit/pkg/client"
)

func main() {
    ctx := context.Background()
    c, _ := client.NewClient("https://api.babit.dev", client.WithAPIKey("babit_live_..."))

    // Record action event directly into notary ledger
    receipt, err := c.RecordAction(ctx, &client.RecordActionRequest{
        SessionID: "ses_019284",
        Action:    "approve_payout",
        AgentID:   "claims-agent",
        Resource:  "https://internal.bank.io/claims/48102",
        Payload:   map[string]interface{}{"amount_usd": 4200.00},
    })
    if err != nil {
        panic(err)
    }

    fmt.Printf("Sealed event hash: %s\\n", receipt.EventHash)
}`,

  curl: `# Record and seal an autonomous action via REST API
curl -X POST https://api.babit.dev/v1/sessions/ses_019284/actions \\
  -H "Authorization: Bearer babit_live_token_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "approve_payout",
    "agent_id": "claims-agent",
    "resource": "https://internal.bank.io/claims/48102",
    "payload": {
      "claim_id": "CLM-48102",
      "amount_usd": 4200.00
    }
  }'`,
};

export function SectionBuiltForEngineers() {
  const [activeLang, setActiveLang] = useState<"typescript" | "python" | "go" | "curl">("typescript");
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard?.writeText(CODE_EXAMPLES[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section id="developers" className="py-24 sm:py-32 border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            ENGINEER-FIRST INTEGRATION
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-[46px] font-semibold tracking-tight leading-tight"
            style={{ color: "var(--fg)" }}
          >
            Built for engineers.
          </h2>
          <p className="text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
            Integrate Babit into your agent orchestrators with a few lines of code. Native SDKs for TypeScript,
            Python, and Go with automatic Ed25519 signing and offline verification.
          </p>
        </div>

        {/* Code Playground Box */}
        <div
          className="rounded-babit-lg overflow-hidden shadow-sm"
          style={{
            backgroundColor: "#0A0C0C",
            border: "1px solid #222626",
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
              {(["typescript", "python", "go", "curl"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className="px-3 py-1.5 rounded-babit-sm text-xs font-mono font-medium capitalize transition-colors cursor-pointer"
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
            <span>gRPC & REST OpenAPI 3.1</span>
          </div>
        </div>
      </div>
    </section>
  );
}
