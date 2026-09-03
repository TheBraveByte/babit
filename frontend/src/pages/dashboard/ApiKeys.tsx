import { PageHeader, Card, Button, EmptyState } from "@/lib/ui";
import { IconKey, IconFolder, IconAlertCircle } from "@/lib/icons";
import { useRouter } from "@/lib/router";

export function ApiKeys() {
  const { navigate } = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader
        title="API keys"
        description="Keys authenticate your calls to the babit API. Each key belongs to a project so you can separate environments and revoke access independently."
      />

      <div
        className="glass-subtle rounded-babit p-3 flex items-start gap-2.5 text-xs"
        style={{ color: "var(--muted)", border: "1px solid var(--border-subtle)" }}
      >
        <span style={{ color: "var(--brand-accent)" }} className="shrink-0 mt-px">
          <IconAlertCircle className="w-4 h-4" />
        </span>
        <span>
          Keys are issued and managed inside a project. Create a project, then generate a key from
          it. The projects API is not live yet, so keys created here are held in your browser for
          now.
        </span>
      </div>

      <Card className="animate-float-up">
        <EmptyState
          icon={<IconKey className="w-5 h-5" />}
          title="Manage keys inside a project"
          description="Open a project to create a key, reveal it once, copy the matching curl command, and revoke or replace it later."
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
