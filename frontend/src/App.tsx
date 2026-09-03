import { lazy, type ReactNode, Suspense } from "react";
import { useRouter } from "@/lib/router";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import { Login } from "@/pages/auth/Login";
import { Signup } from "@/pages/auth/Signup";
import { ContactPage } from "@/pages/ContactPage";
import { ProjectProvider } from "@/lib/project";
import { DashboardLayout } from "@/pages/dashboard/DashboardLayout";
import type { DashboardTab } from "@/pages/dashboard/DashboardLayout";
// Eager: landing + auth are the entry surfaces, kept in the initial bundle.
import { Landing } from "@/pages/Landing";
import { NotFound } from "@/pages/NotFound";
import { PricingPage } from "@/pages/PricingPage";
import { SecurityPage } from "@/pages/SecurityPage";

// Lazy: heavy or route-gated screens are code-split out of the initial load
// (Scalar reference, react-flow graphs, recharts analytics, etc.).
const ApiReference = lazy(() =>
  import("@/pages/ApiReference").then((m) => ({ default: m.ApiReference })),
);
const Overview = lazy(() =>
  import("@/pages/dashboard/Overview").then((m) => ({ default: m.Overview })),
);
const Analytics = lazy(() =>
  import("@/pages/dashboard/Analytics").then((m) => ({ default: m.Analytics })),
);
const Activity = lazy(() =>
  import("@/pages/dashboard/Activity").then((m) => ({ default: m.Activity })),
);
const Agents = lazy(() => import("@/pages/dashboard/Agents").then((m) => ({ default: m.Agents })));
const Delegations = lazy(() =>
  import("@/pages/dashboard/Delegations").then((m) => ({ default: m.Delegations })),
);
const Sessions = lazy(() =>
  import("@/pages/dashboard/Sessions").then((m) => ({ default: m.Sessions })),
);
const Receipts = lazy(() =>
  import("@/pages/dashboard/Receipts").then((m) => ({ default: m.Receipts })),
);
const Verify = lazy(() => import("@/screens/Verify").then((m) => ({ default: m.Verify })));
const Projects = lazy(() =>
  import("@/pages/dashboard/Projects").then((m) => ({ default: m.Projects })),
);
const ApiKeys = lazy(() =>
  import("@/pages/dashboard/ApiKeys").then((m) => ({ default: m.ApiKeys })),
);
const Settings = lazy(() =>
  import("@/pages/dashboard/Settings").then((m) => ({ default: m.Settings })),
);

function Loading() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div
        className="w-5 h-5 rounded-full animate-spin"
        style={{ border: "2px solid var(--border)", borderTopColor: "var(--brand-accent)" }}
      />
    </div>
  );
}

function Boundary({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

export function App() {
  const { path, navigate } = useRouter();
  const route = path.split("?")[0]; // strip query string for matching

  if (route === "/" || route === "") return <Landing />;
  if (route === "/login") return <Login />;
  if (route === "/signup") return <Signup />;
  if (route === "/forgot-password") return <ForgotPassword />;
  if (route === "/security") return <SecurityPage />;
  if (route === "/contact") return <ContactPage />;
  if (route === "/pricing") return <PricingPage />;
  if (route === "/api" || route === "/docs/api") {
    return (
      <Boundary>
        <ApiReference />
      </Boundary>
    );
  }

  if (route.startsWith("/dashboard")) {
    const parts = route.split("/");
    const activeTab = (parts[2] as DashboardTab) || "overview";
    const handleTabChange = (tab: DashboardTab) => navigate(`/dashboard/${tab}`);

    return (
      <ProjectProvider>
        <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
          <Boundary>
            {activeTab === "overview" && <Overview onNavigate={handleTabChange} />}
            {activeTab === "analytics" && <Analytics />}
            {activeTab === "activity" && <Activity />}
            {activeTab === "agents" && <Agents onNavigate={handleTabChange} />}
            {activeTab === "delegations" && <Delegations />}
            {activeTab === "sessions" && <Sessions />}
            {activeTab === "receipts" && <Receipts />}
            {activeTab === "verify" && <Verify />}
            {activeTab === "projects" && <Projects />}
            {activeTab === "apikeys" && <ApiKeys />}
            {activeTab === "settings" && <Settings />}
          </Boundary>
        </DashboardLayout>
      </ProjectProvider>
    );
  }

  return <NotFound />;
}
