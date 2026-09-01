import { useState } from "react";
import { Verify } from "@/screens/Verify";
import { Grants } from "@/screens/Grants";
import { Sessions } from "@/screens/Sessions";
import { Events } from "@/screens/Events";

type Key = "verify" | "grants" | "sessions" | "events";

const nav: { key: Key; label: string }[] = [
  { key: "verify", label: "Verify" },
  { key: "grants", label: "Grants" },
  { key: "sessions", label: "Sessions" },
  { key: "events", label: "Events" },
];

export function App() {
  const [active, setActive] = useState<Key>("verify");

  return (
    <div className="min-h-screen grid grid-cols-[13rem_1fr]">
      <aside className="border-r border-neutral-200 bg-white">
        <div className="px-5 py-4 border-b border-neutral-200">
          <span className="font-mono text-sm font-semibold tracking-tight">babit</span>
          <span className="ml-2 text-xs text-neutral-400">console</span>
        </div>
        <nav className="p-3 grid gap-0.5">
          {nav.map((n) => (
            <button
              key={n.key}
              onClick={() => setActive(n.key)}
              className={`text-left rounded-md px-3 py-1.5 text-sm ${
                active === n.key
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="p-8 max-w-4xl w-full">
        <h1 className="text-lg font-medium text-neutral-900 mb-6 capitalize">{active}</h1>
        {active === "verify" && <Verify />}
        {active === "grants" && <Grants />}
        {active === "sessions" && <Sessions />}
        {active === "events" && <Events />}
      </main>
    </div>
  );
}
