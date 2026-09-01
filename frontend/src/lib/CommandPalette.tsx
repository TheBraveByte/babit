import { useState, useEffect, useRef } from "react";
import { useRouter } from "./router";
import { IconSearch, IconActivity, IconCpu, IconGitBranch, IconFileText, IconShieldCheck, IconSettings } from "./icons";

interface CommandItem {
  id: string;
  category: "Navigation";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { navigate } = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else onClose(); // parent handles toggle
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const items: CommandItem[] = [
    {
      id: "nav-overview",
      category: "Navigation",
      title: "Overview",
      subtitle: "Workspace summary and notary key",
      icon: <IconActivity className="w-4 h-4 text-neutral-500" />,
      action: () => { navigate("/dashboard/overview"); onClose(); },
    },
    {
      id: "nav-activity",
      category: "Navigation",
      title: "Activity",
      subtitle: "Look up an action event by ID",
      icon: <IconFileText className="w-4 h-4 text-neutral-500" />,
      action: () => { navigate("/dashboard/activity"); onClose(); },
    },
    {
      id: "nav-agents",
      category: "Navigation",
      title: "Agents",
      subtitle: "Autonomous subjects under delegated authority",
      icon: <IconCpu className="w-4 h-4 text-neutral-500" />,
      action: () => { navigate("/dashboard/agents"); onClose(); },
    },
    {
      id: "nav-delegations",
      category: "Navigation",
      title: "Delegations",
      subtitle: "Issue, delegate, verify and revoke grants",
      icon: <IconGitBranch className="w-4 h-4 text-neutral-500" />,
      action: () => { navigate("/dashboard/delegations"); onClose(); },
    },
    {
      id: "nav-receipts",
      category: "Navigation",
      title: "Receipts",
      subtitle: "Fetch a sealed inclusion proof by event ID",
      icon: <IconShieldCheck className="w-4 h-4 text-neutral-500" />,
      action: () => { navigate("/dashboard/receipts"); onClose(); },
    },
    {
      id: "nav-verify",
      category: "Navigation",
      title: "Verify Evidence",
      subtitle: "Independent receipt and proof validator",
      icon: <IconShieldCheck className="w-4 h-4 text-emerald-600" />,
      action: () => { navigate("/dashboard/verify"); onClose(); },
    },
    {
      id: "nav-settings",
      category: "Navigation",
      title: "Settings",
      subtitle: "Account profile, branding and notary key",
      icon: <IconSettings className="w-4 h-4 text-neutral-500" />,
      action: () => { navigate("/dashboard/settings"); onClose(); },
    },
  ];

  const filtered = items.filter(
    (i) =>
      i.title.toLowerCase().includes(query.toLowerCase()) ||
      (i.subtitle && i.subtitle.toLowerCase().includes(query.toLowerCase())) ||
      i.category.toLowerCase().includes(query.toLowerCase())
  );

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
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-24 px-4 sm:px-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white border border-[#E8E8E5] rounded-babit-md shadow-2xl overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownList}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E8E8E5] gap-3">
          <IconSearch className="w-4 h-4 text-[#6B6B6B]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search actions, agents, receipts, or navigate (⌘K)..."
            className="w-full text-sm outline-none text-[#111111] placeholder-[#6B6B6B] bg-transparent"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] font-mono text-[#6B6B6B] bg-[#F7F7F5] border border-[#E8E8E5] rounded">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6B6B6B] font-mono">
              No matching records or commands found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-babit flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected ? "bg-[#F7F7F5] text-[#111111]" : "text-[#111111] hover:bg-[#F7F7F5]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded bg-[#FCFCFB] border border-[#E8E8E5]">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium leading-snug">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-[11px] text-[#6B6B6B] leading-tight">{item.subtitle}</div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-[#6B6B6B] bg-[#FCFCFB] px-1.5 py-0.5 rounded border border-[#E8E8E5]">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#E8E8E5] bg-[#F7F7F5] flex items-center justify-between text-[11px] text-[#6B6B6B] font-mono">
          <div className="flex items-center gap-2">
            <span>↑↓ to navigate</span>
            <span>•</span>
            <span>↵ to select</span>
          </div>
          <span>Babit FastSearch</span>
        </div>
      </div>
    </div>
  );
}
