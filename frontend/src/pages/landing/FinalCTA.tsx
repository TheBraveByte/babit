import { useRouter } from "@/lib/router";
import { IconArrowRight, IconShieldCheck } from "@/lib/icons";

export function FinalCTA() {
  const { navigate } = useRouter();

  return (
    <section className="py-24 sm:py-32 bg-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-mono text-neutral-800">
          <IconShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Production Ready Infrastructure</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-900 leading-[1.15]">
          Make autonomous actions <br className="hidden sm:inline" />
          <span className="text-neutral-500">accountable.</span>
        </h2>

        <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
          Build trust into every consequential action your agents take. Deploy in minutes with our
          high-performance Go backend and TypeScript SDKs.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate("/signup")}
            className="px-6 py-3 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <span>Get started</span>
            <IconArrowRight className="w-4 h-4 text-neutral-400" />
          </button>

          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 text-sm font-medium bg-white text-neutral-800 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all shadow-xs cursor-pointer"
          >
            <span>Sign in to console</span>
          </button>
        </div>
      </div>
    </section>
  );
}
