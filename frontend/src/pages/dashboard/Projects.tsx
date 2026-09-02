import { useState } from "react";
import {
  PageHeader,
  Card,
  Button,
  Field,
  TextInput,
  EmptyState,
  StatusPill,
  Copyable,
} from "@/lib/ui";
import {
  IconFolder,
  IconKey,
  IconClock,
  IconRefresh,
  IconAlertCircle,
  IconChevronDown,
} from "@/lib/icons";

/* Local-only demo. Real keys are minted by the backend once the projects
   API ships; here we synthesize a realistic-looking secret in the browser
   so the create/reveal/revoke flow can be exercised end to end. */
function randomToken(len: number): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

function newSecret(): string {
  return `bak_live_${randomToken(32)}`;
}

function today(): string {
  return new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type ApiKey = {
  id: string;
  /** Full secret, held in memory for this session only, cleared after the one-time reveal. */
  secret: string;
  last4: string;
  created: string;
  status: "ACTIVE" | "REVOKED";
};

type Project = {
  id: string;
  name: string;
  created: string;
  keys: ApiKey[];
};

function LocalNote() {
  return (
    <div
      className="glass-subtle rounded-babit p-3 flex items-start gap-2.5 text-xs"
      style={{ color: "var(--muted)", border: "1px solid var(--border-subtle)" }}
    >
      <span style={{ color: "var(--brand-accent)" }} className="shrink-0 mt-px"><IconAlertCircle className="w-4 h-4" /></span>
      <span>
        Projects are stored in this browser for now. They will sync once the projects API is live,
        and any keys shown here are generated locally for the demo, not by the babit backend.
      </span>
    </div>
  );
}

function KeyRow({
  apiKey,
  onRevoke,
  onRotate,
}: {
  apiKey: ApiKey;
  onRevoke: () => void;
  onRotate: () => void;
}) {
  const masked = `bak_live_${"•".repeat(8)}${apiKey.last4}`;
  return (
    <div
      className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-babit"
      style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border-subtle)" }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span style={{ color: "var(--muted)" }} className="shrink-0"><IconKey className="w-4 h-4" /></span>
        <span className="font-mono text-xs truncate" style={{ color: "var(--fg)" }}>
          {masked}
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[11px] font-mono hidden sm:inline" style={{ color: "var(--muted)" }}>
          {apiKey.created}
        </span>
        <StatusPill status={apiKey.status} />
        {apiKey.status === "ACTIVE" && (
          <>
            <Button variant="ghost" size="sm" onClick={onRotate} title="Revoke this key and issue a replacement">
              <IconRefresh className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Create new</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onRevoke} style={{ color: "var(--color-failed)" }}>
              Revoke
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function RevealPanel({ secret, onDone }: { secret: string; onDone: () => void }) {
  return (
    <div
      className="rounded-babit p-4 space-y-3"
      style={{
        border: "1px solid color-mix(in srgb, var(--color-verified) 32%, transparent)",
        backgroundColor: "color-mix(in srgb, var(--color-verified) 8%, transparent)",
      }}
    >
      <div className="flex items-center gap-2">
        <span style={{ color: "var(--color-verified)" }}><IconKey className="w-4 h-4" /></span>
        <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
          Copy your key now
        </span>
      </div>
      <p className="text-xs" style={{ color: "var(--muted)" }}>
        This is the only time the full key is shown. Store it somewhere safe. After you close this
        panel only the masked prefix remains.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Copyable value={secret} />
      </div>
      <div
        className="rounded-babit-sm p-2.5 font-mono text-[11px] leading-relaxed overflow-x-auto"
        style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border-subtle)", color: "var(--muted)" }}
      >
        curl -H "x-api-key: {secret}" https://api.babit.dev/v1/receipts
      </div>
      <Button variant="secondary" size="sm" onClick={onDone}>
        I saved it, close
      </Button>
    </div>
  );
}

function ProjectCard({
  project,
  expanded,
  onToggle,
  onCreateKey,
  onRevokeKey,
  onDelete,
  revealSecret,
  onDismissReveal,
}: {
  project: Project;
  expanded: boolean;
  onToggle: () => void;
  onCreateKey: () => void;
  onRevokeKey: (keyId: string) => void;
  onDelete: () => void;
  revealSecret: string | null;
  onDismissReveal: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const activeKeys = project.keys.filter((k) => k.status === "ACTIVE").length;

  return (
    <Card className="animate-float-up">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-babit flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--secondary)", color: "var(--muted)", border: "1px solid var(--border-subtle)" }}
          >
            <IconFolder className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate" style={{ color: "var(--fg)" }}>
              {project.name}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-[11px] font-mono" style={{ color: "var(--muted)" }}>
              <span className="inline-flex items-center gap-1">
                <IconClock className="w-3 h-3" /> {project.created}
              </span>
              <span className="inline-flex items-center gap-1">
                <IconKey className="w-3 h-3" /> {activeKeys} active
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={onToggle}>
            <IconKey className="w-3.5 h-3.5" />
            <span>Manage keys</span>
            <IconChevronDown
              className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </Button>
          <div className="relative">
            <Button variant="ghost" size="sm" onClick={() => setMenuOpen((v) => !v)} aria-label="Project menu">
              <span className="tracking-widest leading-none">···</span>
            </Button>
            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-10 w-40 rounded-babit p-1 glass"
                style={{ border: "1px solid var(--border)" }}
              >
                <button
                  type="button"
                  className="w-full text-left text-xs px-2.5 py-1.5 rounded-babit-sm transition-colors hover:bg-[var(--secondary)]"
                  style={{ color: "var(--color-failed)" }}
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                >
                  Delete project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3" style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: "var(--fg)" }}>
              API keys
            </span>
            <Button variant="secondary" size="sm" onClick={onCreateKey}>
              <IconKey className="w-3.5 h-3.5" />
              <span>Create key</span>
            </Button>
          </div>

          {revealSecret && <RevealPanel secret={revealSecret} onDone={onDismissReveal} />}

          {project.keys.length === 0 ? (
            <p className="text-xs py-2" style={{ color: "var(--muted)" }}>
              No keys in this project yet. Create one to authenticate API calls.
            </p>
          ) : (
            <div className="space-y-2">
              {project.keys.map((k) => (
                <KeyRow
                  key={k.id}
                  apiKey={k}
                  onRevoke={() => onRevokeKey(k.id)}
                  onRotate={() => {
                    onRevokeKey(k.id);
                    onCreateKey();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [revealFor, setRevealFor] = useState<{ projectId: string; secret: string } | null>(null);

  function addProject() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setProjects((prev) => [
      { id: crypto.randomUUID(), name: trimmed, created: today(), keys: [] },
      ...prev,
    ]);
    setName("");
    setShowForm(false);
  }

  function createKey(projectId: string) {
    const secret = newSecret();
    const key: ApiKey = {
      id: crypto.randomUUID(),
      secret,
      last4: secret.slice(-4),
      created: today(),
      status: "ACTIVE",
    };
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, keys: [key, ...p.keys] } : p)),
    );
    setRevealFor({ projectId, secret });
  }

  function revokeKey(projectId: string, keyId: string) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, keys: p.keys.map((k) => (k.id === keyId ? { ...k, status: "REVOKED", secret: "" } : k)) }
          : p,
      ),
    );
  }

  function deleteProject(projectId: string) {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (expandedId === projectId) setExpandedId(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Console"
        title="Projects"
        description="Group your API keys by project so each application or team has its own set of credentials."
        action={
          <Button variant="brand" size="md" onClick={() => setShowForm((v) => !v)}>
            <IconFolder className="w-4 h-4" />
            <span>New project</span>
          </Button>
        }
      />

      <LocalNote />

      {showForm && (
        <Card title="New project" className="animate-float-up">
          <div className="space-y-4">
            <Field label="Project name" hint="required">
              <TextInput
                autoFocus
                placeholder="billing-agent"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addProject()}
              />
            </Field>
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" onClick={addProject} disabled={!name.trim()}>
                Create project
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setName("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {projects.length === 0 ? (
        <EmptyState
          icon={<IconFolder className="w-5 h-5" />}
          title="No projects yet"
          description="Create one to start issuing API keys. Everything you create here lives in this browser until the projects API ships."
          action={
            <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
              <IconFolder className="w-3.5 h-3.5" />
              <span>New project</span>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              expanded={expandedId === p.id}
              onToggle={() => setExpandedId((cur) => (cur === p.id ? null : p.id))}
              onCreateKey={() => createKey(p.id)}
              onRevokeKey={(keyId) => revokeKey(p.id, keyId)}
              onDelete={() => deleteProject(p.id)}
              revealSecret={revealFor?.projectId === p.id ? revealFor.secret : null}
              onDismissReveal={() => setRevealFor(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
