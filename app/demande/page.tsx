import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { DemandeForm } from "@/components/DemandeForm";
import { MessageCircle, Phone, MapPin } from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Faire une demande de service | Nexus RCA",
  description:
    "Envoyez votre demande à Nexus RCA et recevez une réponse sous 24h. Visa, études, business, voyages.",
};

export default function DemandePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-nexus-blue-950 pt-40 pb-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-nexus-orange-300">
              Demande de service
            </div>
            <h1 className="font-display text-5xl font-bold sm:text-6xl">
              Parlons de <span className="text-gradient-orange">votre projet.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-300">
              Remplissez ce formulaire en 2 minutes. Un conseiller Nexus analyse votre
              demande et vous rappelle sous 24 heures.
            </p>
          </div>
        </section>

        <section className="bg-slate-50 py-16 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-3 lg:px-8">
            <div className="lg:col-span-2">
              <Suspense fallback={<div>Chargement...</div>}>
                <DemandeForm />
              </Suspense>
            </div>

            <aside className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl border-2 border-nexus-orange-300 bg-gradient-to-br from-white to-nexus-orange-50 p-6 shadow-lg">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-nexus-orange-200/40 blur-2xl" />
                <div className="relative">
                  <span className="inline-block rounded-full bg-nexus-orange-500 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                    Recommandé
                  </span>
                  <h3 className="mt-3 font-display text-xl font-bold text-nexus-blue-950">
                    Dossier complet avec documents
                  </h3>
                  <p className="mt-2 text-sm text-slate-700">
                    Formulaire détaillé, champs dynamiques selon le service, upload de pièces (passeport, CV, diplômes...) et traitement prioritaire possible.
                  </p>
                  <a
                    href="/demande/complet"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-nexus-blue-950 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-nexus-blue-900"
                  >
                    Ouvrir le dossier complet →
                  </a>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-nexus-blue-900 to-nexus-blue-950 p-6 text-white shadow-lg">
                <h3 className="mb-2 font-display text-xl font-bold">Besoin urgent ?</h3>
                <p className="mb-4 text-sm text-slate-300">
                  Contactez-nous directement sur WhatsApp — réponse en quelques minutes.
                </p>
                <a
                  href={whatsappLink("Bonjour Nexus, j'ai besoin d'aide urgente.")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#1fb855]"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp Nexus
                </a>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                <h3 className="mb-4 font-display text-lg font-bold text-nexus-blue-950">
                  Nous joindre
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-nexus-orange-500" />
                    <div className="text-slate-700">
                      Relais Sica, vers Hôpital Général, Bangui, RCA
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-nexus-orange-500" />
                    <a href="tel:+15873276344" className="text-slate-700 hover:text-nexus-orange-600">
                      +1 587 327 6344
                    </a>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-nexus-orange-200 bg-nexus-orange-50 p-6">
                <h3 className="mb-2 font-display text-lg font-bold text-nexus-orange-700">
                  💡 Conseil
                </h3>
                <p className="text-sm text-slate-700">
                  Plus votre description est précise, plus vite nous pourrons vous proposer
                  une solution adaptée. N'hésitez pas à détailler dates, objectifs et contraintes.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
