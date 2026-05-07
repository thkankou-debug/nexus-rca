import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { AppointmentForm } from "@/components/AppointmentForm";
import { PublicHero } from "@/components/PublicHero";
import {
  Zap,
  FilePlus,
  Phone,
  MapPin,
  Lightbulb,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";
import { NEXUS_CONTACT } from "@/lib/contact";

export const metadata = {
  title: "Prendre un rendez-vous | Nexus RCA — Bangui",
  description:
    "Réservez un échange structuré avec l'équipe Nexus RCA pour analyser votre besoin, clarifier votre situation et définir les prochaines étapes.",
};

export default function RendezVousPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-sunken">
        {/* HERO ─────────────────────────────────────────────── */}
        <PublicHero
          eyebrow="Prendre rendez-vous"
          titleStart="Un agent. Un créneau. "
          accentWord="C'est parti"
          titleEnd="."
          subtitle="Choisissez le service, le motif, votre créneau. Confirmation immédiate par email et WhatsApp."
        />

        {/* CONTENT ───────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Form */}
            <div className="lg:col-span-2">
              <AppointmentForm />
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-5">
                {/* WhatsApp urgent */}
                <div className="relative overflow-hidden rounded-3xl border-2 border-brand/40 bg-gradient-to-br from-brand-subtle/60 to-surface-elevated p-6 shadow-elev-3">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-nexus-orange-500/10" />
                  <div className="relative">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-elev-2">
                        <Zap className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-headline text-ink">
                        Besoin urgent ?
                      </h3>
                    </div>
                    <p className="mb-4 text-body-sm text-ink-muted">
                      Pour une réponse immédiate, contactez-nous directement
                      sur WhatsApp. Notre équipe répond rapidement.
                    </p>
                    <a
                      href={whatsappLink(
                        "Bonjour Nexus, j'ai un besoin urgent."
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 px-5 py-3 text-body-sm font-semibold text-white shadow-elev-3 transition hover:shadow-elev-4"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Ouvrir WhatsApp
                    </a>
                  </div>
                </div>

                {/* Dossier complet */}
                <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-100 text-nexus-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                      <FilePlus className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-headline text-ink">
                      Dossier complet avec documents
                    </h3>
                  </div>
                  <p className="mb-4 text-body-sm text-ink-muted">
                    Si vous souhaitez déposer un dossier complet avec documents
                    et pièces justificatives, utilisez plutôt notre formulaire
                    dédié.
                  </p>
                  <Link
                    href="/demande/complet"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-nexus-blue-900 bg-surface-elevated px-5 py-2.5 text-body-sm font-semibold text-ink transition hover:bg-nexus-blue-900 hover:text-white dark:border-line dark:hover:bg-brand dark:hover:border-brand"
                  >
                    Ouvrir un dossier
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Coordonnées */}
                <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-100 text-nexus-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                      <Phone className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-headline text-ink">
                      Nous joindre
                    </h3>
                  </div>
                  <div className="space-y-3 text-body-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <div>
                        <p className="text-overline text-ink-muted">Agence</p>
                        <p className="mt-0.5 text-ink">
                          {NEXUS_CONTACT.addressLine1}
                          <br />
                          {NEXUS_CONTACT.addressLine2}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <div>
                        <p className="text-overline text-ink-muted">
                          WhatsApp (RCA)
                        </p>
                        <a
                          href={`tel:+${NEXUS_CONTACT.phoneRcaRaw}`}
                          className="mt-0.5 block text-ink hover:text-brand"
                        >
                          {NEXUS_CONTACT.phoneRca}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conseil */}
                <div className="rounded-3xl border border-line bg-gradient-to-br from-nexus-blue-50 to-surface-elevated p-6 dark:from-blue-500/5 dark:to-surface-elevated">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-900 text-white shadow-elev-2">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-headline text-ink">
                      Conseil
                    </h3>
                  </div>
                  <p className="text-body-sm text-ink-muted">
                    Plus votre demande est précise, plus notre réponse sera
                    rapide. Décrivez clairement votre situation et vos
                    objectifs dans le formulaire.
                  </p>
                </div>
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
