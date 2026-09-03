import { Nav } from "./landing/Nav";
import { Hero } from "./landing/Hero";
import { ProductPreview } from "./landing/ProductPreview";
import { SectionHowItWorks } from "./landing/SectionHowItWorks";
import { SectionWhoItsFor } from "./landing/SectionWhoItsFor";
import { SectionSurfaces } from "./landing/SectionSurfaces";
import { SectionLogsVsEvidence } from "./landing/SectionLogsVsEvidence";
import { SectionAuthorityChain } from "./landing/SectionAuthorityChain";
import { SectionVerifyRecord } from "./landing/SectionVerifyRecord";
import { SectionBuiltForEngineers } from "./landing/SectionBuiltForEngineers";
import { SectionOfflineEvidence } from "./landing/SectionOfflineEvidence";
import { SectionGlobalAnchor } from "./landing/SectionGlobalAnchor";
import { FinalCTA } from "./landing/FinalCTA";
import { Footer } from "./landing/Footer";

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
        <SectionVerifyRecord />
        <SectionBuiltForEngineers />
        <SectionOfflineEvidence />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
