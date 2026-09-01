import { Nav } from "./landing/Nav";
import { Hero } from "./landing/Hero";
import { ProductSection } from "./landing/ProductSection";
import { AuthorizationSection } from "./landing/AuthorizationSection";
import { DelegationSection } from "./landing/DelegationSection";
import { SealedRecordSection } from "./landing/SealedRecordSection";
import { TamperDemo } from "./landing/TamperDemo";
import { VerificationSection } from "./landing/VerificationSection";
import { DeveloperSection } from "./landing/DeveloperSection";
import { FinalCTA } from "./landing/FinalCTA";
import { Footer } from "./landing/Footer";

export function Landing() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white font-sans">
      <Nav />
      <main>
        <Hero />
        <ProductSection />
        <AuthorizationSection />
        <DelegationSection />
        <SealedRecordSection />
        <TamperDemo />
        <VerificationSection />
        <DeveloperSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
