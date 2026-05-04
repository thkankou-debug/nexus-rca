import { Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ServicesGrid } from "@/components/ServicesGrid";
import { FinalCTA } from "@/components/FinalCTA";
import { SERVICES } from "@/lib/services";

export const metadata = {
  title: "Tous nos services | Nexus RCA — Bangui",
  description:
    "Dix services Nexus RCA depuis Bangui : visa, TCF Canada, bourses, financement business, billets d'avion, change, transferts, démarches administratives, IA et digitalisation.",
};

const STATS = [
  { value: `${SERVICES.length}`, label: "Services Nexus" },
  { value: "Bangui", label: "Siège & accueil" },
  { value: "0 FCFA", label: "Étude initiale" },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-nexus-blue-950 pt-40 pb-24 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-nexus-orange-500/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-nexus-blue-500/30 blur-3xl" />
          <div className="grain pointer-events-none absolute inset-0 opacity-20" />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-overline text-nexus-orange-300 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Nos services
            </div>

            <h1
              className="font-display text-display-xl text-white lg:text-display-2xl"
              style={{ paddingBottom: "0.15em" }}
            >
              Une agence,{" "}
              <span className="text-gradient-orange">toutes les portes.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-body-lg text-slate-300">
              Dix expertises Nexus RCA — du dossier visa au financement
              d'entreprise, en passant par les études au Canada, les transferts
              et la digitalisation. Préparé à Bangui, opérationnel partout.
            </p>

            {/* Stats strip */}
            <div className="mt-16 grid max-w-3xl grid-cols-3 gap-6 border-t border-white/10 pt-10">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-display-sm text-nexus-orange-400">
                    {s.value}
                  </div>
                  <div className="mt-1 text-overline text-slate-400">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
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
