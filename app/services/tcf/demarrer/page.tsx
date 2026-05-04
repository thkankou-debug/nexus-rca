import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { TcfForm } from "@/components/tcf/TcfForm";

export const metadata = {
  title: "Test de positionnement TCF Canada | Nexus RCA",
  description:
    "Soumettez votre demande de préparation TCF Canada pour un test de positionnement gratuit. Bilan honnête sous 48 heures ouvrées. Sans engagement.",
};

export const dynamic = "force-dynamic";

export default function TcfDemarrerPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-nexus-blue-50/40 via-surface to-surface pt-28 pb-20 dark:from-blue-500/5 dark:to-surface">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <TcfForm />
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
