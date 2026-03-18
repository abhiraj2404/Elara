import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProofStream } from "@/components/landing/ProofStream";
import { ProtocolStack } from "@/components/landing/ProtocolStack";
import { UseCases } from "@/components/landing/UseCases";
import { TechSpecs } from "@/components/landing/TechSpecs";
import { Pricing } from "@/components/landing/Pricing";
import { FinalCTA } from "@/components/landing/FinalCTA";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col font-[family-name:var(--font-display)] text-[#121212]">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <ProofStream />
        <ProtocolStack />
        <UseCases />
        <TechSpecs />
        <Pricing />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
