import { IconBuilding, IconCpu, IconShieldCheck, IconDatabase, IconLayers, IconActivity } from "@/lib/icons";

export function TrustStrip() {
  const sectors = [
    { title: "Financial Services", icon: <IconBuilding className="w-4 h-4" /> },
    { title: "Healthcare & Life Sciences", icon: <IconActivity className="w-4 h-4" /> },
    { title: "Insurance & Underwriting", icon: <IconShieldCheck className="w-4 h-4" /> },
    { title: "Enterprise Software", icon: <IconLayers className="w-4 h-4" /> },
    { title: "Government & Defense", icon: <IconDatabase className="w-4 h-4" /> },
    { title: "AI Infrastructure", icon: <IconCpu className="w-4 h-4" /> },
  ];

  return (
    <section className="py-12 border-y border-neutral-200/80 bg-white/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-mono uppercase tracking-widest text-neutral-400 mb-6">
          Built for environments where agent actions must be accountable
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {sectors.map((s) => (
            <div
              key={s.title}
              className="flex items-center gap-2.5 p-3 rounded-lg border border-neutral-200/80 bg-neutral-50/50 hover:bg-neutral-100/60 hover:border-neutral-300 transition-all text-neutral-700"
            >
              <div className="text-neutral-500 shrink-0">{s.icon}</div>
              <span className="text-xs font-medium tracking-tight truncate">{s.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
