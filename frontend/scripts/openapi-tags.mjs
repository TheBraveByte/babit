import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const input = path.join(root, "openapi.v3.json");
const publicOut = path.join(root, "public", "openapi.v3.json");

const raw = fs.readFileSync(input, "utf-8");
const spec = JSON.parse(raw);

const tagMap = {
  AnalyticsService: "Analytics",
  AuthService: "Authentication",
  CaptureService: "Capture",
  DelegationService: "Delegation",
  LedgerService: "Ledger",
  NotaryService: "Notary",
  ProjectService: "Projects",
  ApiKeyService: "API keys",
  ReplayService: "Replay",
  VerifyService: "Verify",
};

const descriptions = {
  Analytics: "Activity summaries and trend data for the ledger.",
  Authentication: "Sign in, sign up, and session management.",
  Capture: "Record and persist agent actions.",
  Delegation: "Grants, authority chains, and revocation.",
  Ledger: "Ledger roots, receipts, and anchor operations.",
  Notary: "Signing and notary public key material.",
  Projects: "Project workspaces and scoped configuration.",
  "API keys": "Project-scoped API credentials.",
  Replay: "Reconstruct and replay recorded sessions.",
  Verify: "Cryptographic verification of events and proofs.",
};

function renameTags(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) => renameTags(item));
  }
  if (obj && typeof obj === "object") {
    const next = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "tags" && Array.isArray(value)) {
        next[key] = value.map((tag) => (typeof tag === "string" ? tagMap[tag] ?? tag : renameTags(tag)));
      } else {
        next[key] = renameTags(value);
      }
    }
    return next;
  }
  return obj;
}

const renamed = renameTags(spec);

renamed.tags = renamed.tags
  .map((tag) => {
    const name = typeof tag === "string" ? tagMap[tag] ?? tag : tagMap[tag.name] ?? tag.name;
    return {
      name,
      description: descriptions[name] ?? "",
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const output = JSON.stringify(renamed, null, 4) + "\n";
fs.writeFileSync(input, output);
fs.writeFileSync(publicOut, output);

console.log("OpenAPI tags renamed and public spec updated.");
