import { useRequireAuth } from "@/lib/auth";
import { IconCpu, IconGitBranch, IconShieldCheck } from "@/lib/icons";
import { Button, EmptyState, PageHeader } from "@/lib/ui";
import type { DashboardTab } from "./DashboardLayout";

export function Agents({ onNavigate }: { onNavigate?: (tab: DashboardTab) => void }) {
  useRequireAuth();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Agents"
        description="Autonomous subjects that act under delegated authority."
      />

      <EmptyState
        icon={<IconCpu className="w-5 h-5" />}
        title="No agent registry yet"
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
