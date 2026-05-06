import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Hotel,
  MessageCircle,
  Plane,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { Button } from "@/components/ui/Button";
import { SERVICES, getService } from "@/lib/services";
import { NEXUS_CONTACT } from "@/lib/contact";
import { cn, whatsappLink } from "@/lib/utils";

const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};
const DOT_GRID_LIGHT_SUBTLE: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(12,28,64,0.04) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

// Cette route [slug] est un fallback défensif. Tous les services actuels
// ont une page dédiée (priorité Next.js), donc generateStaticParams ne
// pré-rend rien.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const service = getService(params.slug);
  if (!service) return { title: "Service introuvable" };
  return {
    title: `${service.title} | Nexus RCA`,
    description: service.shortDesc,
  };
}

export default function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const service = getService(params.slug);
  if (!service || service.slug === "nexus-ia") notFound();

  const Icon = service.icon;
  const isFlightsService = service.slug === "billets";
  const others = SERVICES.filter((s) => s.slug !== service.slug).slice(0, 3);
  const isOrange = service.accent === "orange";

  return (
    <>
      <Navbar />
      <main>
        {/* HERO Premium tech ───────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 pt-28 pb-20 text-white sm:pt-32 sm:pb-24 lg:pt-40">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 h-[36rem] w-[36rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <Link
              href="/services"
              className="group/back mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 transition-colors hover:text-nexus-orange-300"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/back:-translate-x-0.5" />
              Tous les services
            </Link>

            <div className="mt-2 flex items-center gap-4">
              <div className="relative">
                <div
                  aria-hidden
                  className={cn(
                    "absolute inset-0 rounded-2xl opacity-50 blur-md",
                    isOrange ? "bg-nexus-orange-500/40" : "bg-nexus-blue-500/40"
                  )}
                />
                <div
                  className={cn(
                    "relative flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-[0_8px_24px_-8px_rgba(255,102,0,0.5)]",
                    isOrange
                      ? "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700"
                      : "bg-gradient-to-br from-nexus-blue-500 to-nexus-blue-800"
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                Service Nexus
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {service.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {service.shortDesc}
            </p>

            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href={`/demande/complet?service=${service.slug}`}
                className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                />
                Demander ce service
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
              </Link>
              <a
                href={whatsappLink(
                  `Bonjour Nexus, je m'intéresse au service "${service.title}".`
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-emerald-500/10"
              >
                <MessageCircle className="h-4 w-4 text-emerald-300" />
                WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* CONTENT Premium tech ──────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
              {/* Description */}
              <div className="lg:col-span-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-200/70 bg-nexus-orange-50 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-700">
                  <Sparkles className="h-3 w-3" />
                  Le service en détail
                </span>
                <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                  Ce que Nexus prend en charge.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
                  {service.longDesc}
                </p>

                {/* Features Premium tech */}
                <div className="mt-10 space-y-3">
                  {service.features.map((f, i) => (
                    <div
                      key={i}
                      className="group/feat relative flex items-start gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_12px_28px_-12px_rgba(255,102,0,0.18)]"
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover/feat:bg-nexus-orange-500/12"
                      />
                      <div className="relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-sm transition-transform duration-300 ease-out group-hover/feat:scale-110">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </div>
                      <span className="relative text-sm leading-relaxed text-nexus-blue-950">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Flights special integration */}
                {isFlightsService && (
                  <div className="mt-12 grid gap-4 sm:grid-cols-2">
                    <a
                      href="https://www.google.com/flights"
                      target="_blank"
                      rel="noreferrer"
                      className="group/flights relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-900 via-nexus-blue-950 to-nexus-blue-900 p-6 text-white shadow-[0_20px_50px_-25px_rgba(12,28,64,0.45)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-25px_rgba(255,102,0,0.30)]"
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-[0.5]"
                        style={DOT_GRID_DARK}
                      />
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-nexus-orange-500/25 blur-[80px] transition-all duration-500 group-hover/flights:bg-nexus-orange-500/40"
                      />
                      <div className="relative">
                        <Plane className="mb-3 h-7 w-7 text-nexus-orange-400" />
                        <div className="font-display text-base font-bold">
                          Rechercher un vol
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-nexus-orange-300">
                          Ouvrir Google Flights
                          <ArrowRight className="h-3 w-3 transition-transform duration-300 ease-out group-hover/flights:translate-x-0.5" />
                        </div>
                      </div>
                    </a>
                    <a
                      href="https://www.skyscanner.net/hotels"
                      target="_blank"
                      rel="noreferrer"
                      className="group/hotels relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-orange-500 via-nexus-orange-600 to-nexus-orange-700 p-6 text-white shadow-[0_20px_50px_-25px_rgba(255,102,0,0.45)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-25px_rgba(255,102,0,0.55)]"
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-30"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at center, rgba(255,255,255,0.18) 1px, transparent 1px)",
                          backgroundSize: "28px 28px",
                        }}
                      />
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/20 blur-[80px] transition-all duration-500 group-hover/hotels:bg-white/30"
                      />
                      <div className="relative">
                        <Hotel className="mb-3 h-7 w-7" />
                        <div className="font-display text-base font-bold">
                          Réserver un hôtel
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-white/95">
                          Ouvrir Skyscanner
                          <ArrowRight className="h-3 w-3 transition-transform duration-300 ease-out group-hover/hotels:translate-x-0.5" />
                        </div>
                      </div>
                    </a>
                  </div>
                )}
              </div>

              {/* Sidebar Premium tech */}
              <aside className="lg:col-span-1">
                <div className="space-y-4 lg:sticky lg:top-28">
                  {/* CTA card navy glassmorphism */}
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-900 via-nexus-blue-950 to-nexus-blue-900 p-6 text-white shadow-[0_24px_60px_-25px_rgba(12,28,64,0.45)]">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-[0.4]"
                      style={DOT_GRID_DARK}
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-nexus-orange-500/20 blur-[80px]"
                    />
                    <div className="relative">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-nexus-orange-400/30 bg-nexus-orange-500/15 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-nexus-orange-300">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
                        </span>
                        Prêt à démarrer ?
                      </span>
                      <h3 className="mt-3 font-display text-base font-bold leading-tight text-white sm:text-lg">
                        Un conseiller vous rappelle.
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-300">
                        Envoyez votre demande via le formulaire ou WhatsApp.
                        Premier contact gratuit.
                      </p>
                      <div className="mt-5 space-y-2">
                        <Link
                          href={`/demande/complet?service=${service.slug}`}
                          className="group/btn relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-nexus-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgba(255,102,0,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600"
                        >
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/btn:left-[120%] group-hover/btn:opacity-100"
                          />
                          Faire ma demande
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <a
                          href={whatsappLink(
                            `Bonjour Nexus, je m'intéresse au service "${service.title}".`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-bold text-emerald-300 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/50 hover:bg-emerald-500/15"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Agence card */}
                  <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_-16px_rgba(12,28,64,0.16)] ring-1 ring-slate-100/80">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Agence
                    </span>
                    <div className="mt-2 text-sm leading-relaxed text-nexus-blue-950">
                      {NEXUS_CONTACT.addressLine1}
                      <br />
                      {NEXUS_CONTACT.addressLine2}
                    </div>
                    <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Téléphone (RCA)
                    </div>
                    <a
                      href={`tel:+${NEXUS_CONTACT.phoneRcaRaw}`}
                      className="mt-1 block text-sm font-bold text-nexus-blue-950 transition-colors hover:text-nexus-orange-600"
                    >
                      {NEXUS_CONTACT.phoneRca}
                    </a>
                    <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      International (Canada)
                    </div>
                    <a
                      href={`tel:+${NEXUS_CONTACT.phoneCanadaRaw}`}
                      className="mt-1 block text-sm font-bold text-slate-600 transition-colors hover:text-nexus-orange-600"
                    >
                      {NEXUS_CONTACT.phoneCanada}
                    </a>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* AUTRES SERVICES Premium tech ──────────────────────────── */}
        <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, rgba(12,28,64,0.05) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-32 h-96 w-96 rounded-full bg-nexus-orange-500/8 blur-[100px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                  Explorer
                </span>
                <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                  D&apos;autres services Nexus.
                </h2>
              </div>
              <Link
                href="/services"
                className="group/all hidden items-center gap-1.5 text-sm font-bold text-nexus-orange-600 transition-colors hover:text-nexus-orange-700 sm:inline-flex"
              >
                Tout voir
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/all:translate-x-0.5" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {others.map((o) => {
                const OIcon = o.icon;
                const oIsOrange = o.accent === "orange";
                const oGlowRgba = oIsOrange ? "255,102,0" : "30,64,175";
                return (
                  <Link
                    key={o.id}
                    href={`/services/${o.slug}`}
                    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 p-6 shadow-[0_16px_36px_-16px_rgba(12,28,64,0.16)] ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                      style={{ backgroundColor: `rgba(${oGlowRgba}, 0.18)` }}
                    />
                    <div className="relative">
                      <div
                        className={cn(
                          "mb-4 flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105",
                          oIsOrange
                            ? "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700"
                            : "bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900"
                        )}
                      >
                        <OIcon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
                        {o.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                        {o.shortDesc}
                      </p>
                      <p className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-nexus-orange-600">
                        Découvrir
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
