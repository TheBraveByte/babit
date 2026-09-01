import { Nav } from "./landing/Nav";
import { Hero } from "./landing/Hero";
import { SectionLogsVsEvidence } from "./landing/SectionLogsVsEvidence";
import { SectionAuthorityChain } from "./landing/SectionAuthorityChain";
import { SectionReceiptCenterpiece } from "./landing/SectionReceiptCenterpiece";
import { SectionVerifyRecord } from "./landing/SectionVerifyRecord";
import { SectionBuiltForEngineers } from "./landing/SectionBuiltForEngineers";
import { SectionOfflineEvidence } from "./landing/SectionOfflineEvidence";
import { FinalCTA } from "./landing/FinalCTA";
import { Footer } from "./landing/Footer";

export function Landing() {
  return (
    <div className="min-h-screen bg-[#FCFCFB] text-[#111111] selection:bg-[#111111] selection:text-white font-sans">
      <Nav />
      <main>
        {/* Hero Section */}
        <Hero />
        {/* Section 2: Autonomous software needs more than logs */}
        <SectionLogsVsEvidence />
        {/* Section 3: Follow the authority */}
        <SectionAuthorityChain />
        {/* Section 4: Every consequential action leaves evidence (Centerpiece Receipt) */}
        <SectionReceiptCenterpiece />
        {/* Section 5: Verify the record */}
        <SectionVerifyRecord />
        {/* Section 6: Built for engineers */}
        <SectionBuiltForEngineers />
        {/* Section 7: Evidence that stands on its own */}
        <SectionOfflineEvidence />
        {/* Final CTA */}
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
