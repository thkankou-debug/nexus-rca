import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { DemandeForm } from "@/components/DemandeForm";
import { MessageCircle, Phone, MapPin } from "lucide-react";
import { whatsappLink } from "@/lib/utils";
import { NEXUS_CONTACT } from "@/lib/contact";

export const metadata = {
  title: "Faire une demande de service | Nexus RCA",
  description:
    "Envoyez votre demande à Nexus RCA depuis Bangui et recevez une réponse sous 24 h. Visa, études, business, voyages, transferts.",
};

export default function DemandePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-nexus-blue-950 pt-40 pb-20 text-white">
          <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
          <div className="grain pointer-events-none absolute inset-0 opacity-20" />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-overline text-nexus-orange-300 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Demande de service
            </div>

            <h1
              className="font-display text-display-xl text-white lg:text-display-2xl"
              style={{ paddingBottom: "0.15em" }}
            >
              Parlons de{" "}
              <span className="text-gradient-orange">votre projet.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-body-lg text-slate-300">
              Remplissez ce formulaire en 2 minutes. Un conseiller Nexus analyse
              votre demande et vous rappelle sous 24 heures.
            </p>
          </div>
        </section>

        {/* CONTENT ──────────────────────────────────────────────── */}
        <section className="bg-surface-sunken py-16 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-3 lg:px-8">
            <div className="lg:col-span-2">
              <Suspense
                fallback={
                  <div className="flex h-96 items-center justify-center rounded-3xl border border-line bg-surface-elevated">
                    <p className="text-body-sm text-ink-muted">
                      Chargement…
                    </p>
                  </div>
                }
              >
                <DemandeForm />
              </Suspense>
            </div>

            <aside className="space-y-4">
              {/* Dossier complet (recommandé) */}
              <div className="relative overflow-hidden rounded-3xl border-2 border-brand/40 bg-gradient-to-br from-surface-elevated to-brand-subtle/40 p-6 shadow-elev-3">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-nexus-orange-200/40 blur-2xl" />
                <div className="relative">
                  <span className="inline-block rounded-full bg-brand px-2.5 py-0.5 text-overline text-white">
                    Recommandé
                  </span>
                  <h3 className="mt-3 font-display text-headline text-ink">
                    Dossier complet avec documents
                  </h3>
                  <p className="mt-2 text-body-sm text-ink-muted">
                    Formulaire détaillé, champs dynamiques selon le service,
                    upload de pièces (passeport, CV, diplômes…) et traitement
                    prioritaire possible.
                  </p>
                  <a
                    href="/demande/complet"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-nexus-blue-950 px-5 py-2.5 text-body-sm font-semibold text-white shadow-elev-2 transition hover:bg-nexus-blue-900"
                  >
                    Ouvrir le dossier complet →
                  </a>
                </div>
              </div>

              {/* WhatsApp urgent */}
              <div className="rounded-3xl bg-gradient-to-br from-nexus-blue-900 to-nexus-blue-950 p-6 text-white shadow-elev-3">
                <h3 className="mb-2 font-display text-headline">
                  Besoin urgent ?
                </h3>
                <p className="mb-4 text-body-sm text-slate-300">
                  Contactez-nous directement sur WhatsApp — réponse en quelques
                  minutes.
                </p>
                <a
                  href={whatsappLink("Bonjour Nexus, j'ai besoin d'aide urgente.")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-body-sm font-semibold transition hover:bg-[#1fb855]"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp Nexus
                </a>
              </div>

              {/* Coordonnées */}
              <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                <h3 className="mb-4 font-display text-headline text-ink">
                  Nous joindre
                </h3>
                <ul className="space-y-3 text-body-sm">
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-brand" />
                    <div className="text-ink">
                      {NEXUS_CONTACT.addressLine1}
                      <br />
                      {NEXUS_CONTACT.addressLine2}
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-brand" />
                    <a
                      href={`tel:+${NEXUS_CONTACT.phoneRcaRaw}`}
                      className="text-ink hover:text-brand"
                    >
                      {NEXUS_CONTACT.phoneRca}
                    </a>
                  </li>
                </ul>
              </div>

              {/* Conseil */}
              <div className="rounded-3xl border border-brand/30 bg-brand-subtle/40 p-6">
                <h3 className="mb-2 font-display text-headline text-nexus-orange-700 dark:text-brand">
                  💡 Conseil
                </h3>
                <p className="text-body-sm text-ink-muted">
                  Plus votre description est précise, plus vite nous pourrons
                  vous proposer une solution adaptée. N'hésitez pas à détailler
                  dates, objectifs et contraintes.
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
