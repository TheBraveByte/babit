import { useTheme, type Theme } from "@/lib/theme";
import { IconSun, IconMoon, IconMonitor } from "@/lib/icons";

const order: Theme[] = ["light", "dark", "system"];

const meta: Record<Theme, { label: string; icon: (c: string) => React.ReactNode }> = {
  light: { label: "Light", icon: (c) => <IconSun className={c} /> },
  dark: { label: "Dark", icon: (c) => <IconMoon className={c} /> },
  system: { label: "System", icon: (c) => <IconMonitor className={c} /> },
};

// Cycles light -> dark -> system. Light is the default.
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useTheme();
  const cur = meta[theme];

  return (
    <button
      type="button"
      onClick={() => setTheme(order[(order.indexOf(theme) + 1) % order.length])}
      title={`Theme: ${cur.label} (click to switch)`}
      aria-label={`Theme: ${cur.label}`}
      className={`inline-flex items-center justify-center p-1.5 rounded-babit-sm transition-colors cursor-pointer ${className}`}
      style={{ color: "var(--muted)" }}
    >
      {cur.icon("w-4 h-4")}
    </button>
  );
}
