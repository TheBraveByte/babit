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
    <div className="min-h-screen font-sans" style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}>
      <Nav />

      <main>
        {/* Hero */}
        <Hero />

        {/* Section 2: id="product" — Logs vs Evidence */}
        <div id="product">
          <SectionLogsVsEvidence />
        </div>

        {/* Section 3: Authority chain — also under #product */}
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
