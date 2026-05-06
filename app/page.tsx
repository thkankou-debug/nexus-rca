import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { Hero } from "@/components/Hero";
import { TrustMarquee } from "@/components/TrustMarquee";
import { ServicesGrid } from "@/components/ServicesGrid";
import { HowItWorks } from "@/components/HowItWorks";
import { TravelCTA } from "@/components/TravelCTA";
import { Testimonials } from "@/components/Testimonials";
import { FinalCTA } from "@/components/FinalCTA";
import { ProblemsSolved } from "@/components/home/ProblemsSolved";
import { WhyTrust } from "@/components/home/WhyTrust";
import { NextSteps } from "@/components/home/NextSteps";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustMarquee />
        <ProblemsSolved />
        <ServicesGrid />
        <HowItWorks />
        <WhyTrust />
        <TravelCTA />
        <Testimonials />
        <NextSteps />
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
