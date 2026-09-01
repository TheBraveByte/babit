import { useRouter } from "@/lib/router";

export function FinalCTA() {
  const { navigate } = useRouter();

  return (
    <section className="py-28 sm:py-36 bg-[#090A0A] text-[#F5F6F4] relative overflow-hidden">
      {/* Background Variant C: Subtle Evidence Grid */}
      <div className="absolute inset-0 bg-grid-subtle opacity-30 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-babit-sm bg-[#151817] border border-[#242826] text-xs font-mono text-[#929894] uppercase tracking-wider">
          <span>PRODUCTION-READY ACCOUNTABILITY</span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-tight text-[#F5F6F4] leading-[1.1]">
          Make autonomous actions accountable.
        </h2>

        <p className="text-base sm:text-lg text-[#929894] max-w-xl mx-auto leading-relaxed">
          Give every consequential action a clear chain of authority and verifiable evidence.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate("/signup")}
            className="px-6 py-3 text-[15px] font-medium bg-[#F5F6F4] text-[#090A0A] rounded-babit hover:bg-white transition-all shadow-2xs cursor-pointer"
          >
            Get started
          </button>

          <a
            href="/docs"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 text-[15px] font-medium bg-transparent text-[#F5F6F4] border border-[#242826] rounded-babit hover:bg-[#151817] transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Read the docs</span>
            <span className="text-[#929894]">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
