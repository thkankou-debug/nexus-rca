import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { BilletsForm } from "@/components/billets/BilletsForm";

export const metadata = {
  title: "Devis voyage — vols & hôtels | Nexus RCA",
  description:
    "Soumettez votre projet de voyage. 2 à 3 options proposées sous 24 heures ouvrées. Sans engagement.",
};

export const dynamic = "force-dynamic";

export default function BilletsDemarrerPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-nexus-blue-50/40 via-surface to-surface pt-28 pb-20 dark:from-blue-500/5 dark:to-surface">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <BilletsForm />
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
