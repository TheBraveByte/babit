import { useState, useEffect, type ReactNode } from "react";
import { BabitLogo, IconActivity, IconShieldCheck, IconGitBranch, IconCpu, IconSettings, IconLogOut, IconFileText, IconSearch, IconLayers, IconBarChart, IconFolder, IconKey } from "@/lib/icons";
import { useAuth } from "@/lib/auth";
import { useRouter, Link } from "@/lib/router";
import { CommandPalette } from "@/lib/CommandPalette";
import { ThemeToggle } from "@/lib/ThemeToggle";
import { docsUrl } from "@/lib/links";

export type DashboardTab =
  | "overview"
  | "analytics"
  | "activity"
  | "agents"
  | "delegations"
  | "sessions"
  | "receipts"
  | "verify"
  | "projects"
  | "apikeys"
  | "settings";

interface NavItem {
  key: DashboardTab;
  label: string;
  icon: ReactNode;
}

const mainNav: NavItem[] = [
  { key: "overview", label: "Overview", icon: <IconActivity className="w-4 h-4" /> },
  { key: "analytics", label: "Analytics", icon: <IconBarChart className="w-4 h-4" /> },
  { key: "activity", label: "Activity", icon: <IconFileText className="w-4 h-4" /> },
  { key: "agents", label: "Agents", icon: <IconCpu className="w-4 h-4" /> },
  { key: "delegations", label: "Delegations", icon: <IconGitBranch className="w-4 h-4" /> },
  { key: "sessions", label: "Sessions", icon: <IconLayers className="w-4 h-4" /> },
  { key: "receipts", label: "Receipts", icon: <IconFileText className="w-4 h-4" /> },
  { key: "verify", label: "Verify", icon: <IconShieldCheck className="w-4 h-4" /> },
];

const devNav: NavItem[] = [
  { key: "projects", label: "Projects", icon: <IconFolder className="w-4 h-4" /> },
  { key: "apikeys", label: "API keys", icon: <IconKey className="w-4 h-4" /> },
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
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const orgName = branding?.company_name || user?.org_name || (user?.account_type === "ACCOUNT_TYPE_ORGANIZATION" ? "Organization" : "Personal Workspace");
  const logoUrl = branding?.logo_url;

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[15rem_1fr] relative font-sans" style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}>
      {/* Command Palette */}
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between min-h-screen sticky top-0 h-screen overflow-y-auto" style={{ backgroundColor: "var(--surface)", borderRight: "1px solid var(--border)" }}>
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-[color:var(--border)] flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={orgName}
                  className="w-6 h-6 object-contain rounded border border-[color:var(--border)] p-0.5 bg-[var(--surface)] shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <BabitLogo className="w-5 h-5 text-[color:var(--fg)]" />
              )}
              <div className="truncate">
                <span className="font-mono text-sm font-semibold tracking-tight text-[color:var(--fg)] block truncate">
                  {orgName}
                </span>
                <span className="text-[11px] font-mono text-[color:var(--muted)] block -mt-0.5">
                  babit console
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Search bar */}
          <div className="px-3 pt-3">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-babit-sm bg-[var(--secondary)] border border-[color:var(--border)] text-xs text-[color:var(--muted)] hover:text-[color:var(--fg)] hover:border-[color:var(--muted)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <IconSearch className="w-3.5 h-3.5" />
                <span>Search...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--surface)] rounded border border-[color:var(--border)]">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Navigation — grouped by spacing + hairline, no shouty labels */}
          <div className="p-3 space-y-3">
            {[mainNav, devNav, secondaryNav].map((group, gi) => (
              <nav
                key={gi}
                className="space-y-0.5"
                style={gi > 0 ? { borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem" } : undefined}
              >
                {group.map((n) => {
                  const isActive = activeTab === n.key;
                  return (
                    <button
                      key={n.key}
                      onClick={() => {
                        onTabChange(n.key);
                        navigate(`/dashboard/${n.key}`);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-babit text-[14px] font-medium transition-all cursor-pointer"
                      style={isActive ? {
                        backgroundColor: "var(--brand-accent)",
                        color: "white",
                        fontWeight: 600,
                      } : {
                        color: "var(--muted)",
                      }}
                    >
                      <span>{n.icon}</span>
                      <span>{n.label}</span>
                    </button>
                  );
                })}
              </nav>
            ))}
          </div>
        </div>

        {/* User Account Footer */}
        <div className="p-3 border-t border-[color:var(--border)] bg-[var(--secondary)]">
          <div className="p-2.5 rounded-babit bg-[var(--surface)] border border-[color:var(--border)] space-y-2">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-6 h-6 rounded bg-[var(--fg)] text-[var(--surface)] flex items-center justify-center font-mono text-xs font-bold shrink-0">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="truncate">
                <span className="text-xs font-medium text-[color:var(--fg)] block truncate">
                  {user?.email || "admin@babit.dev"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[color:var(--border-subtle)] text-[11px]">
              <a
                href={docsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[color:var(--muted)] hover:text-[color:var(--fg)] font-mono"
              >
                Docs ↗
              </a>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer text-xs"
              >
                <IconLogOut className="w-3 h-3" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col min-w-0">
        {/* Header Bar */}
        <header className="h-14 px-6 border-b border-[color:var(--border)] glass-subtle sticky top-0 z-30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="md:hidden p-1 text-[color:var(--fg)]"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-semibold text-[color:var(--fg)] capitalize">
                {activeTab}
              </span>
              <span className="text-[color:var(--border)]">/</span>
              <span className="text-[color:var(--muted)]">
                {orgName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle className="hover:bg-[var(--secondary)]" />

            <Link
              to="/"
              className="text-xs font-medium text-[color:var(--muted)] hover:text-[color:var(--fg)] px-2.5 py-1 rounded hover:bg-[var(--secondary)] transition-colors"
            >
              Website ↗
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileDrawerOpen && (
          <div className="md:hidden bg-[var(--surface)] border-b border-[color:var(--border)] p-4 space-y-2 animate-fade-in shadow-lg">
            <div className="grid grid-cols-2 gap-2">
              {mainNav.concat(devNav, secondaryNav).map((n) => (
                <button
                  key={n.key}
                  onClick={() => {
                    onTabChange(n.key);
                    navigate(`/dashboard/${n.key}`);
                    setMobileDrawerOpen(false);
                  }}
                  className={`p-2.5 rounded text-xs text-left font-medium flex items-center gap-2 ${
                    activeTab === n.key ? "bg-[var(--fg)] text-[var(--surface)]" : "bg-[var(--secondary)] text-[color:var(--fg)]"
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
