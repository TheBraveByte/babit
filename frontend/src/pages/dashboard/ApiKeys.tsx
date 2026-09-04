import { IconFolder, IconKey } from "@/lib/icons";
import { useRequireAuth } from "@/lib/auth";
import { useRouter } from "@/lib/router";
import { Button, Card, EmptyState, PageHeader } from "@/lib/ui";

export function ApiKeys() {
  useRequireAuth();
  const { navigate } = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader
        title="API keys"
        description="Keys authenticate your calls to the babit API. Each key belongs to a project so you can separate environments and revoke access independently."
      />

      <Card className="animate-float-up">
        <EmptyState
          icon={<IconKey className="w-5 h-5" />}
          title="Manage keys inside a project"
          action={
            <Button variant="brand" size="md" onClick={() => navigate("/dashboard/projects")}>
              <IconFolder className="w-4 h-4" />
              <span>Go to projects</span>
            </Button>
          }
        />
      </Card>
    </div>
  );
}
