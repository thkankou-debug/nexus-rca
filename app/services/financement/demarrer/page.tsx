import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { FinancementForm } from "@/components/financement/FinancementForm";

export const metadata = {
  title: "Étude de faisabilité — Financement & partenariat | Nexus RCA",
  description:
    "Soumettez votre projet pour étude par un conseiller Nexus RCA. Bilan de faisabilité honnête sous 24 heures ouvrées. Étude initiale gratuite, sans engagement.",
};

export const dynamic = "force-dynamic";

export default function FinancementDemarrerPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-nexus-blue-50/40 via-surface to-surface pt-28 pb-20 dark:from-blue-500/5 dark:to-surface">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FinancementForm />
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
