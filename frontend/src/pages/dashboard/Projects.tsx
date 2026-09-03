import { useEffect, useState, useCallback } from "react";
import {
  PageHeader,
  Card,
  Button,
  Field,
  TextInput,
  EmptyState,
  StatusPill,
  Copyable,
  Error as ErrorBox,
  ConfirmDialog,
} from "@/lib/ui";
import { IconFolder, IconKey, IconChevronDown, IconClock } from "@/lib/icons";
import { useAuth } from "@/lib/auth";
import { api, errText } from "@/api/client";
import { usePagination } from "@/lib/usePagination";
import { LoadMoreButton } from "@/components/LoadMoreButton";
import type { components } from "@/api/schema";

type Project = components["schemas"]["v1Project"];
type ApiKey = components["schemas"]["v1ApiKey"];

const PAGE_SIZE = 50;

export function Projects() {
  const { isAuthenticated } = useAuth();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const {
    items: projects,
    loading,
    error,
    hasMore,
    hasInitialLoaded,
    refresh,
    loadMore,
  } = usePagination<Project>();

  const fetcher = useCallback(async (params: { page_size: number; page_token: string }) => {
    const res = await api.GET("/v1/projects", { params: { query: params } });
    if (res.error) throw new Error(errText(res.error));
    return { items: res.data?.projects ?? [], next_page_token: res.data?.next_page_token };
  }, []);

  useEffect(() => {
    if (isAuthenticated) refresh(fetcher, PAGE_SIZE);
  }, [isAuthenticated, refresh, fetcher]);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    const res = await api.POST("/v1/projects", { body: { name: name.trim() } });
    if (res.error) {
      // error is handled via the hook's error state on refresh
    } else {
      setName("");
      setShowForm(false);
      await refresh(fetcher, PAGE_SIZE);
    }
    setCreating(false);
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <PageHeader title="Projects" description="Group your agents and API keys by project." />
        <Card>
          <EmptyState
            icon={<IconFolder className="w-5 h-5" />}
            title="Sign in to manage projects"
            description="Projects and their API keys are tied to your account. Sign in to create and view them."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Group your agents and API keys by project so each application or team has its own set of credentials."
        action={
          <Button variant="brand" size="md" onClick={() => setShowForm((v) => !v)}>
            <IconFolder className="w-4 h-4" />
            <span>New project</span>
          </Button>
        }
      />

      {showForm && (
        <Card className="animate-float-up">
          <form onSubmit={createProject} className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <Field label="Project name">
                <TextInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production"
                  autoFocus
                />
              </Field>
            </div>
            <Button
              type="submit"
              variant="brand"
              size="md"
              loading={creating}
              disabled={!name.trim()}
            >
              Create project
            </Button>
          </form>
        </Card>
      )}

      {error && <ErrorBox message={error} />}

      {loading && !hasInitialLoaded ? (
        <Card>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Loading projects…
          </p>
        </Card>
      ) : projects.length === 0 ? (
        <Card>
          <EmptyState
            icon={<IconFolder className="w-5 h-5" />}
            title="No projects yet"
            description="Create a project to start issuing API keys for your agents."
            action={
              <Button variant="secondary" size="md" onClick={() => setShowForm(true)}>
                New project
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <ProjectRow key={p.id} project={p} onChanged={() => refresh(fetcher, PAGE_SIZE)} />
          ))}
          <LoadMoreButton
            onClick={() => loadMore(fetcher, PAGE_SIZE)}
            loading={loading}
            disabled={!hasMore}
          />
        </div>
      )}
    </div>
  );
}

function ProjectRow({ project, onChanged }: { project: Project; onChanged: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [keyErr, setKeyErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [reveal, setReveal] = useState<{ secret: string } | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  async function loadKeys() {
    if (!project.id) return;
    setLoadingKeys(true);
    setKeyErr(null);
    const res = await api.GET("/v1/projects/{project_id}/keys", {
      params: { path: { project_id: project.id }, query: { page_size: 50 } },
    });
    if (res.error) setKeyErr(errText(res.error));
    else setKeys(res.data?.keys ?? []);
    setLoadingKeys(false);
  }

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    if (next && keys.length === 0) loadKeys();
  }

  async function createKey() {
    if (!project.id) return;
    setCreating(true);
    setKeyErr(null);
    const res = await api.POST("/v1/projects/{project_id}/keys", {
      params: { path: { project_id: project.id } },
      body: { name: "" },
    });
    if (res.error) setKeyErr(errText(res.error));
    else if (res.data?.secret) {
      setReveal({ secret: res.data.secret });
      await loadKeys();
      onChanged();
    }
    setCreating(false);
  }

  async function revoke(keyId: string) {
    setKeyErr(null);
    const res = await api.POST("/v1/keys/{key_id}/revoke", {
      params: { path: { key_id: keyId } },
      body: {},
    });
    if (res.error) setKeyErr(errText(res.error));
    else {
      await loadKeys();
      onChanged();
    }
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-babit flex items-center justify-center shrink-0"
            style={{
              backgroundColor: "var(--secondary)",
              color: "var(--muted)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <IconFolder className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate" style={{ color: "var(--fg)" }}>
              {project.name}
            </h3>
            <div
              className="flex items-center gap-3 mt-1 text-[11px] font-mono"
              style={{ color: "var(--muted)" }}
            >
              <span className="inline-flex items-center gap-1">
                <IconKey className="w-3 h-3" /> {project.active_keys ?? 0} active
              </span>
              {project.created_at && (
                <span className="inline-flex items-center gap-1">
                  <IconClock className="w-3 h-3" />{" "}
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={toggle} aria-expanded={expanded}>
          <IconKey className="w-3.5 h-3.5" />
          <span>Manage keys</span>
          <IconChevronDown
            className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </Button>
      </div>

      {expanded && (
        <div
          className="mt-4 pt-4 space-y-3"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <ConfirmDialog
            open={!!confirmRevoke}
            title="Revoke API key"
            message="Revoked keys stop working immediately. This cannot be undone."
            confirmLabel="Revoke key"
            cancelLabel="Cancel"
            danger
            onConfirm={async () => {
              if (confirmRevoke) await revoke(confirmRevoke);
              setConfirmRevoke(null);
            }}
            onCancel={() => setConfirmRevoke(null)}
          />
          {reveal && <RevealPanel secret={reveal.secret} onDone={() => setReveal(null)} />}
          {keyErr && <ErrorBox message={keyErr} />}

          <div className="flex items-center justify-between">
            <span
              className="text-xs font-mono uppercase tracking-wider"
              style={{ color: "var(--muted)" }}
            >
              API keys
            </span>
            <Button variant="brand" size="sm" loading={creating} onClick={createKey}>
              <IconKey className="w-3.5 h-3.5" />
              <span>Create key</span>
            </Button>
          </div>

          {loadingKeys ? (
            <p className="text-xs font-mono" style={{ color: "var(--muted)" }}>
              Loading…
            </p>
          ) : keys.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              No keys yet. Create one to authenticate API calls for this project.
            </p>
          ) : (
            <div className="space-y-1.5">
              {keys.map((k) => (
                <KeyRow key={k.id} apiKey={k} onRevoke={() => k.id && setConfirmRevoke(k.id)} />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function KeyRow({ apiKey, onRevoke }: { apiKey: ApiKey; onRevoke: () => void }) {
  const masked = `${apiKey.prefix ?? "bak_live"}_${"•".repeat(6)}${apiKey.last4 ?? ""}`;
  return (
    <div
      className="flex items-center justify-between gap-3 py-2 px-3 rounded-babit"
      style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border-subtle)" }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span style={{ color: "var(--muted)" }} className="shrink-0">
          <IconKey className="w-4 h-4" />
        </span>
        <span className="font-mono text-xs truncate" style={{ color: "var(--fg)" }}>
          {masked}
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {apiKey.created_at && (
          <span
            className="text-[11px] font-mono hidden sm:inline"
            style={{ color: "var(--muted)" }}
          >
            {new Date(apiKey.created_at).toLocaleDateString()}
          </span>
        )}
        <StatusPill status={apiKey.revoked ? "REVOKED" : "ACTIVE"} />
        {!apiKey.revoked && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRevoke}
            style={{ color: "var(--color-failed)" }}
          >
            Revoke
          </Button>
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
        <span style={{ color: "var(--color-verified)" }}>
          <IconKey className="w-4 h-4" />
        </span>
        <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
          Copy your key now
        </span>
      </div>
      <p className="text-xs" style={{ color: "var(--muted)" }}>
        This is the only time the full key is shown. Store it somewhere safe. After you close this
        panel only the masked prefix remains.
      </p>
      <Copyable value={secret} />
      <div
        className="rounded-babit-sm p-2.5 font-mono text-[11px] leading-relaxed overflow-x-auto"
        style={{
          backgroundColor: "var(--secondary)",
          border: "1px solid var(--border-subtle)",
          color: "var(--muted)",
        }}
      >
        curl -H "x-api-key: {secret}" http://localhost:8080/v1/projects
      </div>
      <Button variant="secondary" size="sm" onClick={onDone}>
        I saved it, close
      </Button>
    </div>
  );
}
