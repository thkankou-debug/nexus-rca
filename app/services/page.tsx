import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ServicesGrid } from "@/components/ServicesGrid";
import { FinalCTA } from "@/components/FinalCTA";

export const metadata = {
  title: "Tous nos services | Nexus RCA",
  description:
    "Découvrez tous les services Nexus RCA : visa, TCF, bourses Canada, financement business, billets d'avion, transferts d'argent, Nexus IA.",
};

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-nexus-blue-950 pt-40 pb-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-nexus-orange-300">
              Nos services
            </div>
            <h1 className="font-display text-5xl font-bold sm:text-6xl md:text-7xl">
              Une agence,{" "}
              <span className="text-gradient-orange">toutes les portes.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-300">
              Neuf pôles d'expertise pour transformer vos projets — du dossier visa
              au financement d'entreprise, en passant par les études au Canada.
            </p>
          </div>
        </section>
        <ServicesGrid />
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
