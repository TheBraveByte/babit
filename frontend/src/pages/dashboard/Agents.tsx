import type { DashboardTab } from "./DashboardLayout";
import { IconCpu, IconGitBranch, IconShieldCheck } from "@/lib/icons";

export function Agents({ onNavigate }: { onNavigate?: (tab: DashboardTab) => void }) {
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl sm:text-[32px] font-semibold tracking-tight leading-tight" style={{ color: "var(--fg)" }}>
          Agents
        </h1>
        <p className="text-sm sm:text-[15px] mt-1" style={{ color: "var(--muted)" }}>
          Autonomous subjects that act under delegated authority.
        </p>
      </div>

      <div
        className="rounded-babit-lg p-8 sm:p-10 text-center space-y-4"
        style={{ backgroundColor: "var(--secondary)", border: "2px dashed var(--border)" }}
      >
        <div
          className="mx-auto w-11 h-11 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--border)", color: "var(--muted)" }}
        >
          <IconCpu className="w-5 h-5" />
        </div>
        <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>No agent registry yet</h2>
        <p className="text-xs max-w-md mx-auto leading-relaxed" style={{ color: "var(--muted)" }}>
          Babit does not expose an agent listing endpoint. Agents exist only as the <span className="font-mono">subject_id</span> of the
          grants that authorize them. To inspect an agent's authority, verify its grant chain in Delegations; to see what it did, look up an
          action event or receipt by ID.
        </p>
        {onNavigate && (
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => onNavigate("delegations")}
              className="px-3.5 py-2 rounded-babit text-xs font-medium shadow-xs flex items-center gap-1.5 cursor-pointer"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--fg)" }}
            >
              <IconGitBranch className="w-3.5 h-3.5" />
              <span>Verify a grant</span>
            </button>
            <button
              onClick={() => onNavigate("verify")}
              className="px-3.5 py-2 rounded-babit text-xs font-medium shadow-xs flex items-center gap-1.5 cursor-pointer"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--fg)" }}
            >
              <IconShieldCheck className="w-3.5 h-3.5" />
              <span>Verify evidence</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
