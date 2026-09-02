import { Nav } from "./landing/Nav";
import { Hero } from "./landing/Hero";
import { SectionHowItWorks } from "./landing/SectionHowItWorks";
import { SectionSurfaces } from "./landing/SectionSurfaces";
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
    <div className="min-h-screen font-sans" style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}>
      <Nav />

      <main>
        {/* Hero */}
        <Hero />

        {/* How it works — the four plain steps */}
        <SectionHowItWorks />

        {/* id="surfaces" — where babit records: browser, sandbox, desktop, REST */}
        <SectionSurfaces />

        {/* id="product" — ordinary log vs babit evidence */}
        <div id="product">
          <SectionLogsVsEvidence />
        </div>

        {/* Authority chain — person to agent to sub-agent */}
        <SectionAuthorityChain />

        {/* Section 4: Centerpiece receipt */}
        <SectionReceiptCenterpiece />

        {/* Section 5: id="security" — Verify the record */}
        <div id="security">
          <SectionVerifyRecord />
        </div>

        {/* Section 6: id="developers" — Built for engineers */}
        <div id="developers">
          <SectionBuiltForEngineers />
        </div>

        {/* Section 7: Offline verification */}
        <SectionOfflineEvidence />

        {/* Final CTA */}
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
