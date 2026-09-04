import { type ReactNode, useEffect, useState } from "react";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { CommandPalette } from "@/lib/CommandPalette";
import {
  BabitLogo,
  IconActivity,
  IconBarChart,
  IconChevronRight,
  IconCpu,
  IconFileText,
  IconFolder,
  IconGitBranch,
  IconKey,
  IconLayers,
  IconLogOut,
  IconSearch,
  IconSettings,
  IconShieldCheck,
  IconUser,
} from "@/lib/icons";
import { useProject } from "@/lib/project";
import { docsUrl } from "@/lib/links";
import { Link, useRouter } from "@/lib/router";
import { ThemeToggle } from "@/lib/ThemeToggle";

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

const SIDEBAR_STORAGE_KEY = "babit-sidebar-collapsed";

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
  useRequireAuth();
  const { navigate } = useRouter();
  const { projects, selected, selectProject } = useProject();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [brandLogoError, setBrandLogoError] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  });

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

  // Persist the collapsed rail preference across sessions
  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const orgName =
    branding?.company_name ||
    user?.org_name ||
    (user?.account_type === "ACCOUNT_TYPE_ORGANIZATION"
      ? "Organization"
      : user?.email?.split("@")[0] || "babit");
  const logoUrl = branding?.logo_url;

  const allNav = [...mainNav, ...devNav, ...secondaryNav];
  const currentLabel = allNav.find((n) => n.key === activeTab)?.label ?? activeTab;
  const avatarInitial = (user?.email || orgName || "").charAt(0).toUpperCase();

  const avatar = (sizeClass: string) =>
    logoUrl && !avatarError ? (
      <img
        src={logoUrl}
        alt={orgName}
        className={`${sizeClass} rounded-full object-cover border border-[color:var(--border)] shrink-0`}
        onError={() => setAvatarError(true)}
      />
    ) : (
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center shrink-0 bg-[var(--secondary)] border border-[color:var(--border)] text-[color:var(--fg)]`}
      >
        {avatarInitial ? (
          <span className="font-mono text-xs font-bold">{avatarInitial}</span>
        ) : (
          <IconUser className="w-3.5 h-3.5" />
        )}
      </div>
    );

  return (
    <div
      className={`min-h-screen grid grid-cols-1 ${collapsed ? "md:grid-cols-[4rem_1fr]" : "md:grid-cols-[15rem_1fr]"} relative font-sans transition-[grid-template-columns] duration-200 ease-in-out`}
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
    >
      {/* Command Palette */}
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />

      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col justify-between min-h-screen sticky top-0 h-screen overflow-y-auto overflow-x-hidden"
        style={{ backgroundColor: "var(--surface)", borderRight: "1px solid var(--border)" }}
      >
        <div>
          {/* Brand Header + collapse toggle */}
          {collapsed ? (
            <div className="p-3 border-b border-[color:var(--border)] flex flex-col items-center gap-2">
              <Link to="/" title={orgName} className="flex items-center justify-center">
                {logoUrl && !brandLogoError ? (
                  <img
                    src={logoUrl}
                    alt={orgName}
                    className="w-6 h-6 object-contain rounded border border-[color:var(--border)] p-0.5 bg-[var(--surface)]"
                    onError={() => setBrandLogoError(true)}
                  />
                ) : (
                  <BabitLogo className="w-7 h-7 text-[color:var(--fg)]" />
                )}
              </Link>
              <button
                onClick={() => setCollapsed(false)}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                className="p-1.5 rounded-babit-sm text-[color:var(--muted)] hover:text-[color:var(--fg)] hover:bg-[var(--secondary)] border border-transparent hover:border-[color:var(--border)] transition-colors cursor-pointer"
              >
                <IconChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-4 border-b border-[color:var(--border)] flex items-center justify-between gap-2">
              <Link to="/" className="flex items-center gap-2.5 min-w-0">
                {logoUrl && !brandLogoError ? (
                  <img
                    src={logoUrl}
                    alt={orgName}
                    className="w-6 h-6 object-contain rounded border border-[color:var(--border)] p-0.5 bg-[var(--surface)] shrink-0"
                    onError={() => setBrandLogoError(true)}
                  />
                ) : (
                  <BabitLogo className="w-7 h-7 text-[color:var(--fg)] shrink-0" />
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
              <button
                onClick={() => setCollapsed(true)}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                className="p-1.5 rounded-babit-sm text-[color:var(--muted)] hover:text-[color:var(--fg)] hover:bg-[var(--secondary)] border border-transparent hover:border-[color:var(--border)] transition-colors cursor-pointer shrink-0"
              >
                <IconChevronRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          )}

          {/* Quick Search bar */}
          <div className={collapsed ? "px-2 pt-3 flex justify-center" : "px-3 pt-3"}>
            {collapsed ? (
              <button
                onClick={() => setCommandPaletteOpen(true)}
                title="Search (⌘K)"
                aria-label="Search"
                className="p-2 rounded-babit-sm bg-[var(--secondary)] border border-[color:var(--border)] text-[color:var(--muted)] hover:text-[color:var(--fg)] hover:border-[color:var(--muted)] transition-colors cursor-pointer"
              >
                <IconSearch className="w-4 h-4" />
              </button>
            ) : (
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
            )}
          </div>

          {/* Navigation — grouped by spacing + hairline, no shouty labels */}
          <div className={collapsed ? "p-2 space-y-3" : "px-3 py-3 space-y-3"}>
            {[mainNav, devNav, secondaryNav].map((group, gi) => (
              <nav
                key={gi}
                className="space-y-0.5"
                style={
                  gi > 0
                    ? { borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem" }
                    : undefined
                }
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
                      title={collapsed ? n.label : undefined}
                      className={`w-full flex items-center rounded-babit-sm text-[13px] font-medium transition-all cursor-pointer ${collapsed ? "justify-center px-0 py-2" : "gap-2.5 px-2.5 py-1.5"}`}
                      style={
                        isActive
                          ? {
                              backgroundColor: "var(--brand-accent-subtle)",
                              color: "var(--brand-accent)",
                              fontWeight: 600,
                              border: "1px solid var(--brand-accent-border)",
                            }
                          : {
                              color: "var(--muted)",
                              border: "1px solid transparent",
                            }
                      }
                    >
                      <span>{n.icon}</span>
                      {!collapsed && <span>{n.label}</span>}
                    </button>
                  );
                })}
              </nav>
            ))}
          </div>
        </div>

        {/* User Account Footer */}
        {collapsed ? (
          <div className="p-2 border-t border-[color:var(--border)] bg-[var(--secondary)] flex flex-col items-center gap-2">
            <div title={user?.email || "admin@babit.dev"}>{avatar("w-7 h-7")}</div>
            <a
              href={docsUrl}
              target="_blank"
              rel="noreferrer"
              title="Docs"
              className="p-1.5 rounded-babit-sm text-[color:var(--muted)] hover:text-[color:var(--fg)] hover:bg-[var(--surface)] transition-colors"
            >
              <IconFileText className="w-4 h-4" />
            </a>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              title="Sign out"
              aria-label="Sign out"
              className="p-1.5 rounded-babit-sm text-[var(--color-failed)] hover:text-[var(--color-failed)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
            >
              <IconLogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-3 border-t border-[color:var(--border)] bg-[var(--secondary)]">
            <div className="p-2.5 rounded-babit bg-[var(--surface)] border border-[color:var(--border)] space-y-2">
              <div className="flex items-center gap-2.5 truncate">
                {avatar("w-7 h-7")}
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
                  className="text-[var(--color-failed)] hover:text-[var(--color-failed)] font-medium flex items-center gap-1 cursor-pointer text-xs"
                >
                  <IconLogOut className="w-3 h-3" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col min-w-0">
        {/* Header Bar */}
        <header
          className="h-14 px-6 border-b border-[color:var(--border)] sticky top-0 z-30 flex items-center justify-between gap-4"
          style={{
            backgroundColor: "color-mix(in srgb, var(--surface) 80%, transparent)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="md:hidden p-1 text-[color:var(--fg)]"
              aria-label="Open menu"
              aria-expanded={mobileDrawerOpen}
              aria-controls="mobile-nav-drawer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Breadcrumb: workspace then current page */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 font-mono text-xs min-w-0"
            >
              <span className="text-[color:var(--muted)] truncate">{orgName}</span>
              <IconChevronRight className="w-3 h-3 text-[color:var(--muted)] shrink-0" />
              <span className="font-medium text-[color:var(--fg)] truncate">{currentLabel}</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {projects.length > 0 && (
              <select
                aria-label="Select project"
                className="text-xs font-mono bg-transparent border border-[color:var(--border)] rounded-babit-sm px-2 py-1.5 text-[color:var(--fg)] focus:outline-none focus:ring-1 focus:ring-[color:var(--accent)]"
                value={selected?.id ?? ""}
                onChange={(e) => {
                  const id = e.target.value;
                  const p = projects.find((x) => x.id === id);
                  if (p) selectProject(p);
                }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id ?? ""}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}

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
          <div
            id="mobile-nav-drawer"
            className="md:hidden bg-[var(--surface)] border-b border-[color:var(--border)] p-4 space-y-2 animate-fade-in shadow-lg"
          >
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
                    activeTab === n.key
                      ? "bg-[var(--fg)] text-[var(--surface)]"
                      : "bg-[var(--secondary)] text-[color:var(--fg)]"
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
        <main className="p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-6">{children}</main>
      </div>
    </div>
  );
}
