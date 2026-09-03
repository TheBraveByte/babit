import { Suspense, useCallback, useEffect, useState } from "react";
import { api, errText } from "@/api/client";
import type { components } from "@/api/schema";
import { LoadMoreButton } from "@/components/LoadMoreButton";
import { AuthorityGraph, chainToGraph, type GrantRole } from "@/components/viz/AuthorityGraph";
import { GrantTree } from "@/components/viz/GrantTree";

import { IconCheck, IconGitBranch, IconShieldCheck } from "@/lib/icons";
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Error as ErrorBox,
  PageHeader,
  StatusPill,
  TableSkeleton,
} from "@/lib/ui";
import { useProject } from "@/lib/project";
import { usePagination } from "@/lib/usePagination";

type VerifyChain = components["schemas"]["v1VerifyChainResponse"];
type Grant = components["schemas"]["v1Grant"];

const PAGE_SIZE = 50;

function grantsToGraph(chain: Grant[]) {
  return chainToGraph(
    chain.map((g, i) => {
      const role: GrantRole = i === 0 ? "principal" : i === 1 ? "agent" : "subagent";
      const scopeParts: string[] = [];
      const globs = g.scope?.resource_globs;
      if (globs && globs.length) scopeParts.push(globs.slice(0, 2).join(", "));
      if (g.scope?.max_value_cents)
        scopeParts.push(`≤ $${(Number(g.scope.max_value_cents) / 100).toLocaleString()}`);
      return {
        role,
        subject: (i === 0 ? g.principal_id : g.subject_id) || g.subject_id || g.principal_id || "—",
        capabilities: g.capabilities ?? undefined,
        scope: scopeParts.join(" · ") || undefined,
      };
    }),
  );
}

export function Delegations() {
  const [selected, setSelected] = useState<Grant | null>(null);
  const [chain, setChain] = useState<VerifyChain | null>(null);
  const [chainLoading, setChainLoading] = useState(false);
  const [chainError, setChainError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [revoked, setRevoked] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { selected: project } = useProject();
  const {
    items: grants,
    loading,
    error,
    hasMore,
    hasInitialLoaded,
    refresh,
    loadMore,
  } = usePagination<Grant>();

  const fetcher = useCallback(
    async (params: { page_size: number; page_token: string }) => {
      const res = await api.GET("/v1/grants", {
        params: { query: { ...params, project_id: project?.id ?? "" } },
      });
      if (res.error) throw new Error(errText(res.error));
      return { items: res.data?.grants ?? [], next_page_token: res.data?.next_page_token };
    },
    [project?.id],
  );

  useEffect(() => {
    refresh(fetcher, PAGE_SIZE);
  }, [refresh, fetcher]);

  // Verify chain when a grant is selected
  useEffect(() => {
    if (!selected) return;
    let active = true;
    setChain(null);
    setChainError(null);
    setChainLoading(true);
    setRevoked(false);
    setRevokeError(null);
    (async () => {
      const res = await api.GET("/v1/grants/{grant_id}:verify", {
        params: { path: { grant_id: selected.grant_id! } },
      });
      if (!active) return;
      if (res.error || !res.data) setChainError(errText(res.error) || "Grant not found.");
      else setChain(res.data);
      setChainLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [selected]);

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Delegations"
        description="Issue and verify capability grants. Authority attenuates monotonically from a root principal down each signed delegation. Click a grant to verify its chain."
      />

      {error && <ErrorBox message={error} />}

      {selected ? (
        <Card
          title={selected.grant_id}
          subtitle={`${selected.principal_id} → ${selected.subject_id}`}
          action={
            <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>
              Back
            </Button>
          }
        >
          <div className="space-y-5">
            <div className="h-px accent-hairline -mx-5 -mt-5" />

            {/* Grant details */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <span
                  className="text-[10px] font-mono uppercase tracking-wider block mb-1"
                  style={{ color: "var(--muted)" }}
                >
                  Principal
                </span>
                <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>
                  {selected.principal_id || "—"}
                </span>
              </div>
              <div>
                <span
                  className="text-[10px] font-mono uppercase tracking-wider block mb-1"
                  style={{ color: "var(--muted)" }}
                >
                  Subject
                </span>
                <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>
                  {selected.subject_id || "—"}
                </span>
              </div>
              <div>
                <span
                  className="text-[10px] font-mono uppercase tracking-wider block mb-1"
                  style={{ color: "var(--muted)" }}
                >
                  Parent Grant
                </span>
                <span className="font-mono text-xs" style={{ color: "var(--fg)" }}>
                  {selected.parent_grant_id || "root"}
                </span>
              </div>
              <div>
                <span
                  className="text-[10px] font-mono uppercase tracking-wider block mb-1"
                  style={{ color: "var(--muted)" }}
                >
                  Capabilities
                </span>
                <span className="font-mono text-xs" style={{ color: "var(--fg)" }}>
                  {(selected.capabilities ?? []).join(", ") || "—"}
                </span>
              </div>
            </div>

            {/* Chain verification */}
            <div className="pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <div className="flex items-center justify-between pb-2">
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--fg)" }}
                >
                  Authority Chain
                </span>
                {chainLoading ? (
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    Verifying…
                  </span>
                ) : chain ? (
                  <StatusPill ok={chain.valid === true} label={chain.valid ? "VALID" : "INVALID"} />
                ) : chainError ? (
                  <StatusPill status="PENDING" label="ERROR" />
                ) : null}
              </div>

              {chainError && (
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {chainError}
                </p>
              )}

              {chain && (chain.chain ?? []).length > 0 && (
                <>
                  <div className="rounded-babit overflow-hidden relative glass mb-3">
                    <div className="h-px accent-hairline" />
                    <Suspense fallback={<div style={{ height: 300 }} />}>
                      <AuthorityGraph
                        nodes={grantsToGraph(chain.chain!).nodes}
                        edges={grantsToGraph(chain.chain!).edges}
                        height={Math.min(560, Math.max(240, chain.chain!.length * 132))}
                        interactive
                      />
                    </Suspense>
                  </div>
                  <div className="space-y-2">
                    {chain.chain!.map((g, i) => (
                      <div
                        key={g.grant_id || i}
                        className="p-3 rounded-babit flex items-center justify-between font-mono text-xs"
                        style={{
                          backgroundColor: "var(--secondary)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div>
                          <span className="text-[11px]" style={{ color: "var(--fg)" }}>
                            <span className="font-semibold">{g.principal_id || "?"}</span> →{" "}
                            <span>{g.subject_id || "?"}</span>
                          </span>
                        </div>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-babit-sm"
                          style={{
                            backgroundColor: "var(--surface)",
                            border: "1px solid var(--border)",
                            color: "var(--muted)",
                          }}
                        >
                          Depth #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                  {chain.reason && (
                    <div
                      className="p-3 rounded-babit text-xs font-mono mt-3"
                      style={{
                        color: "var(--color-failed)",
                        backgroundColor: "color-mix(in srgb, var(--color-failed) 10%, transparent)",
                        border:
                          "1px solid color-mix(in srgb, var(--color-failed) 30%, transparent)",
                      }}
                    >
                      <strong>Reason:</strong> {chain.reason}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Revoke action */}
            <div className="pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              {revoked ? (
                <div
                  className="p-3 rounded-babit flex items-center gap-2 text-xs font-mono"
                  style={{
                    backgroundColor: "var(--color-verified-bg)",
                    border: "1px solid var(--color-verified-border)",
                    color: "var(--color-verified)",
                  }}
                >
                  <IconCheck className="w-3.5 h-3.5" />
                  <span>Grant revoked. All authority beneath it is now invalid.</span>
                </div>
              ) : (
                <Button variant="danger" size="md" onClick={() => setShowConfirm(true)}>
                  Revoke this grant
                </Button>
              )}
              {revokeError && (
                <div className="mt-3">
                  <ErrorBox message={revokeError} />
                </div>
              )}
            </div>

            <ConfirmDialog
              open={showConfirm}
              danger
              title="Revoke this grant?"
              message={`Revoking ${selected.grant_id} will invalidate all authority delegated beneath it. This action cannot be undone.`}
              confirmLabel="Revoke grant"
              onConfirm={async () => {
                setShowConfirm(false);
                setRevoking(true);
                setRevokeError(null);
                const res = await api.POST("/v1/grants/{grant_id}/revoke", {
                  params: { path: { grant_id: selected.grant_id! } },
                  body: {},
                });
                if (res.error || !res.data)
                  setRevokeError(errText(res.error) || "Failed to revoke.");
                else setRevoked(res.data.revoked ?? false);
                setRevoking(false);
              }}
              onCancel={() => setShowConfirm(false)}
              loading={revoking}
            />
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card
            title="Grant hierarchy"
            subtitle="Authority flows from the root principal down through signed delegations."
          >
            <div className="h-px accent-hairline -mx-5 -mt-5 mb-5" />
            {grants.length > 0 ? (
              <GrantTree grants={grants} onSelect={(g) => setSelected(g)} />
            ) : (
              <p className="text-sm py-8 text-center" style={{ color: "var(--muted)" }}>
                No grants to visualize yet.
              </p>
            )}
          </Card>

          <Card>
            <div className="h-px accent-hairline -mx-5 -mt-5 mb-5" />
            {loading && !hasInitialLoaded ? (
              <TableSkeleton rows={8} cols={4} />
            ) : error ? (
              <p className="text-sm py-8 text-center" style={{ color: "var(--muted)" }}>
                Couldn't load grants. Try refreshing.
              </p>
            ) : grants.length === 0 ? (
              <EmptyState
                icon={<IconGitBranch className="w-5 h-5" />}
                title="No grants issued yet"
                description="Issue a root grant for a human principal, then delegate scoped authority to agents and sub-agents."
              />
            ) : (
              <>
                <div
                  className="overflow-hidden rounded-babit"
                  style={{ border: "1px solid var(--border-subtle)" }}
                >
                  <table className="w-full text-left">
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                          backgroundColor: "var(--secondary)",
                        }}
                      >
                        <th
                          className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider"
                          style={{ color: "var(--muted)" }}
                        >
                          Grant ID
                        </th>
                        <th
                          className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider hidden sm:table-cell"
                          style={{ color: "var(--muted)" }}
                        >
                          Principal → Subject
                        </th>
                        <th
                          className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider hidden sm:table-cell"
                          style={{ color: "var(--muted)" }}
                        >
                          Capabilities
                        </th>
                        <th
                          className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-right"
                          style={{ color: "var(--muted)" }}
                        >
                          Verify
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {grants.map((g, i) => (
                        <tr
                          key={g.grant_id || i}
                          onClick={() => setSelected(g)}
                          className="cursor-pointer transition-colors hover:bg-[var(--secondary)]"
                          style={{
                            borderBottom:
                              i < grants.length - 1 ? "1px solid var(--border-subtle)" : undefined,
                          }}
                        >
                          <td
                            className="px-3 py-2.5 font-mono text-xs"
                            style={{ color: "var(--fg)" }}
                          >
                            {g.grant_id}
                          </td>
                          <td
                            className="px-3 py-2.5 font-mono text-xs hidden sm:table-cell"
                            style={{ color: "var(--muted)" }}
                          >
                            {g.principal_id} → {g.subject_id}
                          </td>
                          <td
                            className="px-3 py-2.5 text-xs hidden sm:table-cell"
                            style={{ color: "var(--muted)" }}
                          >
                            {(g.capabilities ?? []).slice(0, 3).join(", ")}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span
                              className="text-xs font-medium inline-flex items-center gap-1"
                              style={{ color: "var(--brand-accent)" }}
                            >
                              <IconShieldCheck className="w-3 h-3" /> Verify
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
                  Showing {grants.length} grant{grants.length !== 1 ? "s" : ""}.
                </p>
                <LoadMoreButton
                  onClick={() => loadMore(fetcher, PAGE_SIZE)}
                  loading={loading}
                  disabled={!hasMore}
                />
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
