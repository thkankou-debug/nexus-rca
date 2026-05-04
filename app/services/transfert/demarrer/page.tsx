import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { TransfertForm } from "@/components/transfert/TransfertForm";

export const metadata = {
  title: "Devis de transfert d'argent | Nexus RCA",
  description:
    "Soumettez votre demande de transfert d'argent. Devis avec frais et délai garantis sous 24 heures ouvrées. Sans engagement.",
};

export const dynamic = "force-dynamic";

export default function TransfertDemarrerPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-nexus-blue-50/40 via-surface to-surface pt-28 pb-20 dark:from-blue-500/5 dark:to-surface">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <TransfertForm />
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
