import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { NexusIaForm } from "@/components/nexus-ia/NexusIaForm";

export const metadata = {
  title: "Cadrage projet Nexus IA — assistant dédié | Nexus RCA",
  description:
    "Soumettez votre projet d'assistant IA dédié à votre activité. Démo personnalisée et devis fixe sous 48 heures ouvrées. Sans engagement.",
};

export const dynamic = "force-dynamic";

export default function NexusIaDemarrerPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-nexus-blue-50/40 via-surface to-surface pt-28 pb-20 dark:from-blue-500/5 dark:to-surface">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <NexusIaForm />
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
