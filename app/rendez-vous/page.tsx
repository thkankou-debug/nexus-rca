import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { AppointmentForm } from "@/components/AppointmentForm";
import { PublicHero } from "@/components/PublicHero";
import {
  ArrowRight,
  FilePlus,
  Lightbulb,
  MapPin,
  MessageCircle,
  Phone,
  Zap,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";
import { NEXUS_CONTACT } from "@/lib/contact";

export const metadata = {
  title: "Prendre un rendez-vous | Nexus RCA — Bangui",
  description:
    "Réservez un échange structuré avec l'équipe Nexus RCA pour analyser votre besoin, clarifier votre situation et définir les prochaines étapes.",
};

const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

export default function RendezVousPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO ─────────────────────────────────────────────── */}
        <PublicHero
          eyebrow="Réservation premium"
          titleStart="Prendre un rendez-vous avec "
          accentWord="Nexus RCA"
          titleEnd="."
          subtitle="Réservez un échange structuré avec notre équipe pour analyser votre besoin, clarifier votre situation et définir les prochaines étapes."
        />

        {/* CONTENT — formulaire + sidebar premium navy ─────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-16 text-white sm:py-20 lg:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.45]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/10 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 bottom-32 h-[36rem] w-[36rem] rounded-full bg-nexus-blue-500/15 blur-[140px]"
          />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
              {/* Form */}
              <div className="lg:col-span-7 xl:col-span-8">
                <AppointmentForm />
              </div>

              {/* Sidebar — 4 cards glass uniformes */}
              <aside className="lg:col-span-5 xl:col-span-4">
                <div className="space-y-4 lg:sticky lg:top-24">
                  {/* WhatsApp urgent */}
                  <SidebarCard
                    icon={Zap}
                    iconClass="bg-gradient-to-br from-emerald-500/30 to-emerald-700/20 text-emerald-300 ring-1 ring-emerald-400/30"
                    title="Besoin urgent ?"
                    accent
                  >
                    <p className="text-sm leading-relaxed text-slate-300">
                      Pour une réponse immédiate, contactez-nous directement
                      sur WhatsApp. Notre équipe répond rapidement.
                    </p>
                    <a
                      href={whatsappLink(
                        "Bonjour Nexus, j'ai un besoin urgent."
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-200 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400/60 hover:bg-emerald-500/15"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Ouvrir WhatsApp
                    </a>
                  </SidebarCard>

                  {/* Dossier complet */}
                  <SidebarCard
                    icon={FilePlus}
                    iconClass="bg-gradient-to-br from-nexus-orange-500/30 to-nexus-orange-700/20 text-nexus-orange-300 ring-1 ring-nexus-orange-400/30"
                    title="Dossier complet"
                  >
                    <p className="text-sm leading-relaxed text-slate-300">
                      Pour déposer un dossier avec documents et pièces
                      justificatives, utilisez le formulaire dédié.
                    </p>
                    <Link
                      href="/demande/complet"
                      className="mt-4 inline-flex w-full items-center justify-between rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-nexus-orange-400/40 hover:bg-white/[0.07]"
                    >
                      Soumettre une demande
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </SidebarCard>

                  {/* Coordonnées */}
                  <SidebarCard
                    icon={Phone}
                    iconClass="bg-gradient-to-br from-sky-500/30 to-sky-700/20 text-sky-300 ring-1 ring-sky-400/30"
                    title="Nous joindre"
                  >
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nexus-orange-300" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                            Agence
                          </p>
                          <p className="mt-0.5 text-slate-200">
                            {NEXUS_CONTACT.addressLine1}
                          </p>
                          <p className="text-slate-300">
                            {NEXUS_CONTACT.addressLine2}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 border-t border-white/10 pt-3">
                        <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nexus-orange-300" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                            WhatsApp · RCA
                          </p>
                          <a
                            href={`tel:+${NEXUS_CONTACT.phoneRcaRaw}`}
                            className="mt-0.5 block text-slate-200 transition-colors hover:text-nexus-orange-300"
                          >
                            {NEXUS_CONTACT.phoneRca}
                          </a>
                        </div>
                      </div>
                    </div>
                  </SidebarCard>

                  {/* Conseil */}
                  <SidebarCard
                    icon={Lightbulb}
                    iconClass="bg-gradient-to-br from-amber-500/30 to-amber-700/20 text-amber-300 ring-1 ring-amber-400/30"
                    title="Conseil"
                  >
                    <p className="text-sm leading-relaxed text-slate-300">
                      Plus votre demande est précise, plus notre réponse sera
                      rapide. Décrivez clairement votre situation et vos
                      objectifs.
                    </p>
                  </SidebarCard>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

// ─── Sidebar card glass uniforme ────────────────────────────────────────────
function SidebarCard({
  icon: Icon,
  iconClass,
  title,
  accent,
  children,
}: {
  icon: typeof Zap;
  iconClass: string;
  title: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white/[0.04] p-5 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.06] ${
        accent
          ? "border-emerald-400/30 hover:border-emerald-400/50"
          : "border-white/10 hover:border-white/20"
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl transition-all duration-500 ${
          accent
            ? "bg-emerald-500/0 group-hover:bg-emerald-500/15"
            : "bg-nexus-orange-500/0 group-hover:bg-nexus-orange-500/10"
        }`}
      />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${iconClass}`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="font-display text-base font-bold leading-tight text-white">
            {title}
          </h3>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
