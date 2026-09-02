import type { DashboardTab } from "./DashboardLayout";
import { PageHeader, EmptyState, Button } from "@/lib/ui";
import { IconCpu, IconGitBranch, IconShieldCheck } from "@/lib/icons";

export function Agents({ onNavigate }: { onNavigate?: (tab: DashboardTab) => void }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Agents"
        description="Autonomous subjects that act under delegated authority."
      />

      <EmptyState
        icon={<IconCpu className="w-5 h-5" />}
        title="No agent registry yet"
        description="Babit does not expose an agent listing endpoint. Agents exist only as the subject_id of the grants that authorize them. Verify a grant chain to inspect an agent's authority, or look up an action event or receipt by ID to see what it did."
        action={
          onNavigate && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => onNavigate("delegations")}>
                <IconGitBranch className="w-3.5 h-3.5" />
                <span>Verify a grant</span>
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onNavigate("verify")}>
                <IconShieldCheck className="w-3.5 h-3.5" />
                <span>Verify evidence</span>
              </Button>
            </div>
          )
        }
      />
    </div>
  );
}
