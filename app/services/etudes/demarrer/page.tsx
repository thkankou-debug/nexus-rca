import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { EtudesForm } from "@/components/etudes/EtudesForm";

export const metadata = {
  title: "Étude de faisabilité — Admission & permis d'études | Nexus RCA",
  description:
    "Soumettez votre projet d'études au Canada pour étude par un conseiller Nexus RCA. Bilan de faisabilité honnête sous 24 heures ouvrées. Étude initiale gratuite, sans engagement.",
};

export const dynamic = "force-dynamic";

export default function EtudesDemarrerPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-nexus-blue-50/40 via-surface to-surface pt-28 pb-20 dark:from-blue-500/5 dark:to-surface">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <EtudesForm />
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
