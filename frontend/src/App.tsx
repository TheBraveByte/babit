import type { DashboardTab } from "@/pages/dashboard/DashboardLayout";
import { useRouter } from "@/lib/router";

// Pages
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/auth/Login";
import { Signup } from "@/pages/auth/Signup";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";

// Dashboard
import { DashboardLayout } from "@/pages/dashboard/DashboardLayout";
import { Overview } from "@/pages/dashboard/Overview";
import { Activity } from "@/pages/dashboard/Activity";
import { Agents } from "@/pages/dashboard/Agents";
import { Delegations } from "@/pages/dashboard/Delegations";
import { Receipts } from "@/pages/dashboard/Receipts";
import { Verify } from "@/screens/Verify";
import { Settings } from "@/pages/dashboard/Settings";

export function App() {
  const { path, navigate } = useRouter();

  // Root route is Marketing Landing Page
  if (path === "/" || path === "") {
    return <Landing />;
  }

  // Authentication routes
  if (path === "/login") {
    return <Login />;
  }

  if (path === "/signup") {
    return <Signup />;
  }

  if (path === "/forgot-password") {
    return <ForgotPassword />;
  }

  // Dashboard routes: /dashboard, /dashboard/overview, /dashboard/activity, /dashboard/agents, /dashboard/delegations, /dashboard/receipts, /dashboard/verify, /dashboard/settings
  if (path.startsWith("/dashboard")) {
    const parts = path.split("/");
    const activeTab = (parts[2] as DashboardTab) || "overview";

    const handleTabChange = (tab: DashboardTab) => {
      navigate(`/dashboard/${tab}`);
    };

    return (
      <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
        {activeTab === "overview" && <Overview onNavigate={handleTabChange} />}
        {activeTab === "activity" && <Activity />}
        {activeTab === "agents" && <Agents onNavigate={handleTabChange} />}
        {activeTab === "delegations" && <Delegations />}
        {activeTab === "receipts" && <Receipts />}
        {activeTab === "verify" && <Verify />}
        {activeTab === "settings" && <Settings />}
      </DashboardLayout>
    );
  }

  // Fallback to landing
  return <Landing />;
}
