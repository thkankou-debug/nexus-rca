import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ChangeForm } from "@/components/change/ChangeForm";

export const metadata = {
  title: "Devis de change — Nexus RCA",
  description:
    "Soumettez votre demande de change de devises. Devis avec taux du jour annoncé sous 30 minutes ouvrées. Sans engagement.",
};

export const dynamic = "force-dynamic";

export default function ChangeDemarrerPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-nexus-blue-50/40 via-surface to-surface pt-28 pb-20 dark:from-blue-500/5 dark:to-surface">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ChangeForm />
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
