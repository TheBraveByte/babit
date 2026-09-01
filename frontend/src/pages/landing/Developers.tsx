import { useState } from "react";
import { IconCopy, IconCheck } from "@/lib/icons";

export function Developers() {
  const [lang, setLang] = useState<"go" | "python" | "typescript" | "rest">("typescript");
  const [copied, setCopied] = useState(false);

  const snippets = {
    typescript: `import { BabitClient } from "@babit/sdk";

const babit = new BabitClient({ apiKey: process.env.BABIT_API_KEY });

// 1. Issue root grant from human supervisor
const rootGrant = await babit.grants.issueRoot({
  principalId: "usr_yusuf",
  scope: { maxDepth: 3, resourceGlobs: ["https://internal.bank.io/*"] }
});

// 2. Delegate scoped authority to claims agent
const agentGrant = await babit.grants.delegate({
  parentGrantId: rootGrant.grantId,
  subjectId: "agt_claims_01",
  capabilities: ["claims.approve"]
});

// 3. Record and notarize autonomous action
const receipt = await babit.capture.recordAction({
  sessionId: "ses_live_89102",
  grantId: agentGrant.grantId,
  actionType: "claims.approve",
  resource: "https://internal.bank.io/claims/48102"
});

console.log("Proof verified:", receipt.verified);`,

    python: `from babit import BabitClient

client = BabitClient(api_key="slr_live_...")

# 1. Issue root grant
root = client.grants.issue_root(
    principal_id="usr_yusuf",
    scope={"max_depth": 3, "resource_globs": ["https://internal.bank.io/*"]}
)

# 2. Sub-delegate authority
grant = client.grants.delegate(
    parent_grant_id=root.grant_id,
    subject_id="agt_claims_01",
    capabilities=["claims.approve"]
)

# 3. Notarize action
receipt = client.capture.record_action(
    session_id="ses_live_89102",
    grant_id=grant.grant_id,
    action_type="claims.approve",
    resource="https://internal.bank.io/claims/48102"
)

assert receipt.is_verified()`,

    go: `package main

import (
    "context"
    "fmt"
    "github.com/babit/nal/pkg/client"
)

func main() {
    c := client.New("http://localhost:8080", "api_key_...")
    
    // Record executed agent action with cryptographic proof
    resp, err := c.RecordAction(context.Background(), &client.RecordRequest{
        SessionID:  "ses_live_89102",
        GrantID:    "BAL-DEL-8921",
        ActionType: "claims.approve",
        Resource:   "https://internal.bank.io/claims/48102",
    })
    if err != nil {
        panic(err)
    }

    fmt.Printf("Action event sealed: %s, Notary Sig: %s\\n", resp.EventID, resp.Signature)
}`,

    rest: `curl -X POST https://api.babit.dev/v1/sessions/ses_live_89102/actions \\
  -H "Authorization: Bearer babit_live_token_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "grant_id": "BAL-DEL-8921",
    "action_type": "claims.approve",
    "resource": "https://internal.bank.io/claims/48102",
    "recording_ref": "slr://session/rec_49102"
  }'`,
  };

  const handleCopy = () => {
    void navigator.clipboard?.writeText(snippets[lang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section id="developers" className="py-20 sm:py-28 bg-neutral-50 border-b border-neutral-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            Developer Integration
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
            One API. Verifiable agent actions.
          </h2>
          <p className="text-sm text-neutral-600 max-w-xl mx-auto">
            Drop Babit into any agent framework (LangChain, CrewAI, AutoGen, or custom agent runtimes) in under 5 minutes.
          </p>
        </div>

        {/* Code Editor Box */}
        <div className="max-w-4xl mx-auto rounded-xl border border-neutral-800 bg-neutral-950 shadow-xl overflow-hidden font-mono text-xs text-neutral-200">
          {/* Tabs Bar */}
          <div className="px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {(["typescript", "python", "go", "rest"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer capitalize ${
                    lang === l
                      ? "bg-neutral-800 text-white font-semibold"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
                  }`}
                >
                  {l === "typescript" ? "TypeScript" : l === "python" ? "Python" : l === "go" ? "Go" : "cURL / REST"}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white px-2 py-1 rounded hover:bg-neutral-800 transition-colors"
            >
              {copied ? <IconCheck className="w-3.5 h-3.5 text-emerald-400" /> : <IconCopy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Snippet */}
          <pre className="p-6 text-xs text-neutral-200 overflow-x-auto leading-relaxed bg-black/60">
            {snippets[lang]}
          </pre>
        </div>
      </div>
    </section>
  );
}
