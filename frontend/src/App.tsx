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
import { Receipts as ActionsScreen } from "@/pages/dashboard/Receipts";
import { Delegations as DelegationsScreen } from "@/pages/dashboard/Delegations";
import { Settings as SettingsScreen } from "@/pages/dashboard/Settings";

// Core screens
import { Sessions as SessionsScreen } from "@/screens/Sessions";
import { Verify as VerifyScreen } from "@/screens/Verify";
import { Events as EventsScreen } from "@/screens/Events";

export function App() {
  const { path, navigate } = useRouter();

  // Root route is Landing Page
  if (path === "/" || path === "") {
    return <Landing />;
  }

  // Auth routes
  if (path === "/login") {
    return <Login />;
  }

  if (path === "/signup") {
    return <Signup />;
  }

  if (path === "/forgot-password") {
    return <ForgotPassword />;
  }

  // Dashboard routes: /dashboard, /dashboard/actions, /dashboard/delegations, /dashboard/sessions, /dashboard/verify, /dashboard/events, /dashboard/settings
  if (path.startsWith("/dashboard")) {
    const parts = path.split("/");
    const activeTab = (parts[2] as DashboardTab) || "overview";

    const handleTabChange = (tab: DashboardTab) => {
      navigate(`/dashboard/${tab}`);
    };

    return (
      <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
        {activeTab === "overview" && <Overview onNavigate={handleTabChange} />}
        {activeTab === "actions" && <ActionsScreen />}
        {activeTab === "delegations" && <DelegationsScreen />}
        {activeTab === "sessions" && <SessionsScreen />}
        {activeTab === "verify" && <VerifyScreen />}
        {activeTab === "events" && <EventsScreen />}
        {activeTab === "settings" && <SettingsScreen />}
      </DashboardLayout>
    );
  }

  // Fallback to landing
  return <Landing />;
}
