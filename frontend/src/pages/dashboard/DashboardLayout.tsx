import { useState, useEffect, type ReactNode } from "react";
import { BabitLogo, IconActivity, IconShieldCheck, IconGitBranch, IconCpu, IconSettings, IconLogOut, IconFileText, IconSearch } from "@/lib/icons";
import { useAuth } from "@/lib/auth";
import { useRouter, Link } from "@/lib/router";
import { CommandPalette } from "@/lib/CommandPalette";
import { api } from "@/api/client";

export type DashboardTab =
  | "overview"
  | "activity"
  | "agents"
  | "delegations"
  | "receipts"
  | "verify"
  | "settings";

interface NavItem {
  key: DashboardTab;
  label: string;
  icon: ReactNode;
}

const mainNav: NavItem[] = [
  { key: "overview", label: "Overview", icon: <IconActivity className="w-4 h-4" /> },
  { key: "activity", label: "Activity", icon: <IconFileText className="w-4 h-4" /> },
  { key: "agents", label: "Agents", icon: <IconCpu className="w-4 h-4" /> },
  { key: "delegations", label: "Delegations", icon: <IconGitBranch className="w-4 h-4" /> },
  { key: "receipts", label: "Receipts", icon: <IconFileText className="w-4 h-4" /> },
  { key: "verify", label: "Verification", icon: <IconShieldCheck className="w-4 h-4" /> },
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
  const [notaryOnline, setNotaryOnline] = useState<boolean | null>(null);

  // Reflect real notary availability rather than a hard-coded status
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.GET("/v1/notary/public-key", {});
        if (active) setNotaryOnline(!!res.data?.public_key);
      } catch {
        if (active) setNotaryOnline(false);
      }
    })();
    return () => { active = false; };
  }, []);

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
          <div className="p-4 border-b border-[#E8E8E5] flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={orgName}
                  className="w-6 h-6 object-contain rounded border border-[#E8E8E5] p-0.5 bg-white shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <BabitLogo className="w-5 h-5 text-[#111111]" />
              )}
              <div className="truncate">
                <span className="font-mono text-sm font-semibold tracking-tight text-[#111111] block truncate">
                  {orgName}
                </span>
                <span className="text-[11px] font-mono text-[#6B6B6B] block -mt-0.5">
                  babit console
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Search bar */}
          <div className="px-3 pt-3">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-babit-sm bg-[#F7F7F5] border border-[#E8E8E5] text-xs text-[#6B6B6B] hover:text-[#111111] hover:border-[#CCCCCC] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <IconSearch className="w-3.5 h-3.5" />
                <span>Search...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-[#E8E8E5]">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Navigation Items */}
          <div className="p-3 space-y-6">
            <div>
              <span className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-[#6B6B6B] font-semibold block mb-1.5">
                OPERATIONAL EVIDENCE
              </span>
              <nav className="space-y-0.5">
                {mainNav.map((n) => {
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
            </div>

            <div>
              <span className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-[#6B6B6B] font-semibold block mb-1.5">
                WORKSPACE
              </span>
              <nav className="space-y-0.5">
                {secondaryNav.map((n) => {
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
            </div>
          </div>
        </div>

        {/* User Account Footer */}
        <div className="p-3 border-t border-[#E8E8E5] bg-[#F7F7F5]">
          <div className="p-2.5 rounded-babit bg-[#FFFFFF] border border-[#E8E8E5] space-y-2">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-6 h-6 rounded bg-[#111111] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="truncate">
                <span className="text-xs font-medium text-[#111111] block truncate">
                  {user?.email || "admin@babit.dev"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#F0F0ED] text-[11px]">
              <a
                href="/docs"
                target="_blank"
                rel="noreferrer"
                className="text-[#6B6B6B] hover:text-[#111111] font-mono"
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
        <header className="h-14 px-6 border-b border-[#E8E8E5] bg-[#FFFFFF]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="md:hidden p-1 text-[#111111]"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-semibold text-[#111111] capitalize">
                {activeTab}
              </span>
              <span className="text-[#E8E8E5]">/</span>
              <span className="text-[#6B6B6B]">
                {orgName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {notaryOnline !== null && (
              notaryOnline ? (
                <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>NOTARY ONLINE</span>
                </div>
              ) : (
                <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-[#6B6B6B] bg-[#F7F7F5] px-2.5 py-0.5 rounded border border-[#E8E8E5] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B0B0AC]" />
                  <span>NOTARY OFFLINE</span>
                </div>
              )
            )}

            <Link
              to="/"
              className="text-xs font-medium text-[#6B6B6B] hover:text-[#111111] px-2.5 py-1 rounded hover:bg-[#F7F7F5] transition-colors"
            >
              Website ↗
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileDrawerOpen && (
          <div className="md:hidden bg-[#FFFFFF] border-b border-[#E8E8E5] p-4 space-y-2 animate-fade-in shadow-lg">
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
                    activeTab === n.key ? "bg-[#111111] text-white" : "bg-[#F7F7F5] text-[#111111]"
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
