import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconActivity,
  IconCpu,
  IconFileText,
  IconGitBranch,
  IconLayers,
  IconSearch,
  IconSettings,
  IconShieldCheck,
} from "./icons";
import { useRouter } from "./router";

interface CommandItem {
  id: string;
  category: "Navigation";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { navigate } = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<Element | null>(null);

  const items: CommandItem[] = [
    {
      id: "nav-overview",
      category: "Navigation",
      title: "Overview",
      subtitle: "Workspace summary and notary key",
      icon: <IconActivity className="w-4 h-4 text-[color:var(--muted)]" />,
      action: () => {
        navigate("/dashboard/overview");
        onClose();
      },
    },
    {
      id: "nav-activity",
      category: "Navigation",
      title: "Activity",
      subtitle: "Look up an action event by ID",
      icon: <IconFileText className="w-4 h-4 text-[color:var(--muted)]" />,
      action: () => {
        navigate("/dashboard/activity");
        onClose();
      },
    },
    {
      id: "nav-agents",
      category: "Navigation",
      title: "Agents",
      subtitle: "Autonomous subjects under delegated authority",
      icon: <IconCpu className="w-4 h-4 text-[color:var(--muted)]" />,
      action: () => {
        navigate("/dashboard/agents");
        onClose();
      },
    },
    {
      id: "nav-delegations",
      category: "Navigation",
      title: "Delegations",
      subtitle: "Issue, delegate, verify and revoke grants",
      icon: <IconGitBranch className="w-4 h-4 text-[color:var(--muted)]" />,
      action: () => {
        navigate("/dashboard/delegations");
        onClose();
      },
    },
    {
      id: "nav-sessions",
      category: "Navigation",
      title: "Sessions",
      subtitle: "Inspect a capture session's external anchor",
      icon: <IconLayers className="w-4 h-4 text-[color:var(--muted)]" />,
      action: () => {
        navigate("/dashboard/sessions");
        onClose();
      },
    },
    {
      id: "nav-receipts",
      category: "Navigation",
      title: "Receipts",
      subtitle: "Fetch a sealed inclusion proof by event ID",
      icon: <IconShieldCheck className="w-4 h-4 text-[color:var(--muted)]" />,
      action: () => {
        navigate("/dashboard/receipts");
        onClose();
      },
    },
    {
      id: "nav-verify",
      category: "Navigation",
      title: "Verify Evidence",
      subtitle: "Independent receipt and proof validator",
      icon: <IconShieldCheck className="w-4 h-4 text-[color:var(--color-verified)]" />,
      action: () => {
        navigate("/dashboard/verify");
        onClose();
      },
    },
    {
      id: "nav-settings",
      category: "Navigation",
      title: "Settings",
      subtitle: "Account profile, branding and notary key",
      icon: <IconSettings className="w-4 h-4 text-[color:var(--muted)]" />,
      action: () => {
        navigate("/dashboard/settings");
        onClose();
      },
    },
  ];

  const filtered = items.filter(
    (i) =>
      i.title.toLowerCase().includes(query.toLowerCase()) ||
      (i.subtitle && i.subtitle.toLowerCase().includes(query.toLowerCase())) ||
      i.category.toLowerCase().includes(query.toLowerCase()),
  );

  const getFocusable = useCallback(() => {
    if (!dialogRef.current) return [];
    return Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex >= 0);
  }, []);

  useEffect(() => {
    if (open) {
      previousActiveRef.current = document.activeElement;
      setQuery("");
      setSelectedIndex(0);
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else {
      if (previousActiveRef.current instanceof HTMLElement) {
        previousActiveRef.current.focus();
      }
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab") {
        const focusable = getFocusable();
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, getFocusable]);

  const activeId = filtered[selectedIndex]?.id;

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    }
  };

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50 bg-[var(--fg)]/40 backdrop-blur-xs flex items-start justify-center pt-24 px-4 sm:px-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[var(--surface)] border border-[color:var(--border)] rounded-babit-md shadow-2xl overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownList}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-[color:var(--border)] gap-3">
          <IconSearch className="w-4 h-4 text-[color:var(--muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search actions, agents, receipts, or navigate (⌘K)..."
            className="w-full text-sm outline-none text-[color:var(--fg)] placeholder:text-[color:var(--muted)] bg-transparent"
            aria-autocomplete="list"
            aria-controls="command-palette-results"
            aria-activedescendant={activeId}
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] font-mono text-[color:var(--muted)] bg-[var(--secondary)] border border-[color:var(--border)] rounded">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div
          id="command-palette-results"
          role="listbox"
          className="max-h-80 overflow-y-auto p-2 space-y-1"
        >
          {filtered.length === 0 ? (
            <div
              className="py-8 text-center text-xs text-[color:var(--muted)] font-mono"
              role="status"
              aria-live="polite"
            >
              No matching records or commands found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  id={item.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-babit flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[var(--secondary)] text-[color:var(--fg)]"
                      : "text-[color:var(--fg)] hover:bg-[var(--secondary)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded bg-[var(--bg)] border border-[color:var(--border)]">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium leading-snug">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-[11px] text-[color:var(--muted)] leading-tight">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-[color:var(--muted)] bg-[var(--bg)] px-1.5 py-0.5 rounded border border-[color:var(--border)]">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[color:var(--border)] bg-[var(--secondary)] flex items-center justify-between text-[11px] text-[color:var(--muted)] font-mono">
          <div className="flex items-center gap-2">
            <span>↑↓ to navigate</span>
            <span>•</span>
            <span>↵ to select</span>
            <span>•</span>
            <span>Tab to cycle</span>
          </div>
          <span>Babit FastSearch</span>
        </div>
      </div>
    </div>
  );
}
