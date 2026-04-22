import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { Hero } from "@/components/Hero";
import { ServicesGrid } from "@/components/ServicesGrid";
import { HowItWorks } from "@/components/HowItWorks";
import { TravelCTA } from "@/components/TravelCTA";
import { Testimonials } from "@/components/Testimonials";
import { FinalCTA } from "@/components/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ServicesGrid />
        <HowItWorks />
        <TravelCTA />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
