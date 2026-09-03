import { FinalCTA } from "./landing/FinalCTA";
import { Footer } from "./landing/Footer";
import { Hero } from "./landing/Hero";
import { Nav } from "./landing/Nav";
import { ProductPreview } from "./landing/ProductPreview";
import { SectionAuthorityChain } from "./landing/SectionAuthorityChain";
import { SectionBuiltForEngineers } from "./landing/SectionBuiltForEngineers";
import { SectionGlobalAnchor } from "./landing/SectionGlobalAnchor";
import { SectionHowItWorks } from "./landing/SectionHowItWorks";
import { SectionLogsVsEvidence } from "./landing/SectionLogsVsEvidence";
import { SectionOfflineEvidence } from "./landing/SectionOfflineEvidence";
import { SectionReceiptCenterpiece } from "./landing/SectionReceiptCenterpiece";
import { SectionSurfaces } from "./landing/SectionSurfaces";
import { SectionVerifyRecord } from "./landing/SectionVerifyRecord";
import { SectionWhoItsFor } from "./landing/SectionWhoItsFor";

export function Landing() {
  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
    >
      <Nav />

      <main>
        <Hero />
        <ProductPreview />
        <SectionHowItWorks />
        <SectionLogsVsEvidence />
        <SectionGlobalAnchor />
        <SectionWhoItsFor />
        <SectionSurfaces />
        <SectionAuthorityChain />
        <SectionReceiptCenterpiece />
        <SectionVerifyRecord />
        <SectionBuiltForEngineers />
        <SectionOfflineEvidence />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
