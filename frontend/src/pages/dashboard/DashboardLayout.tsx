import { useState, type ReactNode } from "react";
import { BabitLogo, IconActivity, IconShieldCheck, IconGitBranch, IconCpu, IconLayers, IconSettings, IconLogOut, IconFileText } from "@/lib/icons";
import { useAuth } from "@/lib/auth";
import { useRouter, Link } from "@/lib/router";

export type DashboardTab =
  | "overview"
  | "actions"
  | "delegations"
  | "sessions"
  | "verify"
  | "events"
  | "settings";

interface NavItem {
  key: DashboardTab;
  label: string;
  icon: ReactNode;
  badge?: string;
}

const mainNav: NavItem[] = [
  { key: "overview", label: "Overview", icon: <IconActivity className="w-4 h-4" /> },
  { key: "actions", label: "Actions & Receipts", icon: <IconFileText className="w-4 h-4" /> },
  { key: "delegations", label: "Delegations & Grants", icon: <IconGitBranch className="w-4 h-4" /> },
  { key: "sessions", label: "Capture Sessions", icon: <IconLayers className="w-4 h-4" /> },
  { key: "verify", label: "Verification", icon: <IconShieldCheck className="w-4 h-4" /> },
  { key: "events", label: "Events & Proofs", icon: <IconCpu className="w-4 h-4" /> },
];

const secondaryNav: NavItem[] = [
  { key: "settings", label: "Settings", icon: <IconSettings className="w-4 h-4" /> },
];

export function DashboardLayout({
  activeTab,
  onTabChange,
  children,
}: {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  children: ReactNode;
}) {
  const { user, branding, logout } = useAuth();
  const { navigate } = useRouter();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Compute display org name & logo
  const orgName = branding?.company_name || user?.org_name || (user?.account_type === "ACCOUNT_TYPE_ORGANIZATION" ? "Organization" : "Personal Workspace");
  const logoUrl = branding?.logo_url;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 grid grid-cols-1 md:grid-cols-[15rem_1fr] relative font-sans">
      {/* Dynamic Brand Accent Top Stripe */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[var(--brand-accent,#0f172a)] z-50 transition-colors duration-200" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between border-r border-neutral-200 bg-white min-h-screen sticky top-0 h-screen overflow-y-auto">
        <div>
          {/* Brand / Organization Header */}
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={orgName}
                  className="w-6 h-6 object-contain rounded border border-neutral-200 p-0.5 bg-white shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <BabitLogo className="w-5 h-5 text-neutral-900" />
              )}
              <div className="truncate">
                <span className="font-mono text-sm font-semibold tracking-tight text-neutral-900 block truncate">
                  {orgName}
                </span>
                <span className="text-[11px] font-mono text-neutral-400 block -mt-0.5">
                  babit console
                </span>
              </div>
            </Link>
          </div>

          {/* Primary Navigation */}
          <div className="p-3 space-y-6">
            <div>
              <span className="px-2.5 text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block mb-2">
                Ledger Operations
              </span>
              <nav className="space-y-1">
                {mainNav.map((n) => {
                  const isActive = activeTab === n.key;
                  return (
                    <button
                      key={n.key}
                      onClick={() => {
                        onTabChange(n.key);
                        navigate(`/dashboard/${n.key}`);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-[14px] font-medium transition-all cursor-pointer ${
                        isActive
                          ? "bg-[var(--brand-accent,#0f172a)] text-white shadow-2xs font-semibold"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? "text-white" : "text-neutral-400"}>{n.icon}</span>
                        <span>{n.label}</span>
                      </div>
                      {n.badge && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${isActive ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                          {n.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Workspace Navigation */}
            <div>
              <span className="px-2.5 text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block mb-2">
                Workspace
              </span>
              <nav className="space-y-1">
                {secondaryNav.map((n) => {
                  const isActive = activeTab === n.key;
                  return (
                    <button
                      key={n.key}
                      onClick={() => {
                        onTabChange(n.key);
                        navigate(`/dashboard/${n.key}`);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[14px] font-medium transition-all cursor-pointer ${
                        isActive
                          ? "bg-[var(--brand-accent,#0f172a)] text-white shadow-2xs font-semibold"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      }`}
                    >
                      <span className={isActive ? "text-white" : "text-neutral-400"}>{n.icon}</span>
                      <span>{n.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* User Account / Sign Out Footer */}
        <div className="p-3 border-t border-neutral-200 bg-neutral-50/50">
          <div className="p-3 rounded-md bg-white border border-neutral-200 space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded bg-neutral-900 text-white flex items-center justify-center font-mono text-xs font-bold shrink-0">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="truncate">
                <span className="text-xs font-medium text-neutral-900 block truncate">
                  {user?.email || "admin@babit.dev"}
                </span>
                <span className="text-[11px] font-mono text-neutral-400 block truncate">
                  {user?.industry || "Enterprise"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
              <a
                href="/docs"
                target="_blank"
                rel="noreferrer"
                className="text-neutral-500 hover:text-neutral-900 font-mono text-[11px]"
              >
                API Docs ↗
              </a>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer text-xs"
              >
                <IconLogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-14 px-6 border-b border-neutral-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="md:hidden p-1 text-neutral-600 hover:text-neutral-900"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-semibold text-neutral-900 capitalize">
                {activeTab.replace("-", " ")}
              </span>
              <span className="text-neutral-300">/</span>
              <span className="text-neutral-500">
                {orgName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>NOTARY OPERATIONAL</span>
            </div>

            <Link
              to="/"
              className="text-xs font-medium text-neutral-600 hover:text-neutral-900 px-3 py-1.5 rounded hover:bg-neutral-100 transition-colors"
            >
              Website ↗
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileDrawerOpen && (
          <div className="md:hidden bg-white border-b border-neutral-200 p-4 space-y-2 animate-fade-in shadow-lg">
            <div className="grid grid-cols-2 gap-2">
              {mainNav.concat(secondaryNav).map((n) => (
                <button
                  key={n.key}
                  onClick={() => {
                    onTabChange(n.key);
                    navigate(`/dashboard/${n.key}`);
                    setMobileDrawerOpen(false);
                  }}
                  className={`p-2.5 rounded text-xs text-left font-medium flex items-center gap-2 ${
                    activeTab === n.key ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-700"
                  }`}
                >
                  {n.icon}
                  <span>{n.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Inner Content Page */}
        <main className="p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
