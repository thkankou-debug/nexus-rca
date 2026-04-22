import { Suspense } from "react";
import { Sparkles, ShieldCheck, Zap, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { DemandeFormComplete } from "@/components/DemandeFormComplete";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Demande de service complète | Nexus RCA",
  description:
    "Formulaire de traitement de dossier complet : visa, études, business, voyages. Joignez vos documents et obtenez un accompagnement personnalisé.",
};

export default function DemandeCompletePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-nexus-blue-50 via-white to-white pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-nexus-orange-100 px-4 py-1.5 text-sm font-semibold text-nexus-orange-700">
              <ShieldCheck className="h-4 w-4" />
              Formulaire complet · traitement de dossier
            </div>
            <h1 className="font-display text-4xl font-bold text-nexus-blue-950 sm:text-5xl">
              Faites traiter votre{" "}
              <span className="text-gradient-nexus">dossier</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
              Renseignez votre dossier de A à Z, joignez vos pièces justificatives, et un conseiller Nexus RCA prend le relais.
            </p>

            {/* Quick benefits */}
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs sm:text-sm">
              <Pill icon={Zap} label="Réponse sous 24h" />
              <Pill icon={ShieldCheck} label="Documents sécurisés" />
              <Pill icon={Sparkles} label="Accompagnement dédié" />
            </div>
          </div>

          {/* Form */}
          <Suspense
            fallback={
              <div className="flex h-96 items-center justify-center rounded-3xl border border-slate-200 bg-white">
                <p className="text-slate-500">Chargement du formulaire...</p>
              </div>
            }
          >
            <DemandeFormComplete />
          </Suspense>

          {/* Alternative contact */}
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <p className="text-sm text-slate-600">
              Vous préférez d'abord parler à quelqu'un ?
            </p>
            <a
              href={whatsappLink(
                "Bonjour Nexus RCA, j'aimerais échanger avant de remplir un formulaire."
              )}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-nexus-orange-600 hover:text-nexus-orange-700"
            >
              <MessageCircle className="h-5 w-5" />
              Discuter d'abord sur WhatsApp
            </a>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

function Pill({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-semibold text-nexus-blue-900 shadow-sm ring-1 ring-slate-200">
      <Icon className="h-4 w-4 text-nexus-orange-500" />
      {label}
    </span>
  );
}
