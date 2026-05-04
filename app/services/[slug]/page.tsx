import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, MessageCircle, Plane, Hotel, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { Button } from "@/components/ui/Button";
import { SERVICES, getService } from "@/lib/services";
import { NEXUS_CONTACT } from "@/lib/contact";
import { whatsappLink, cn } from "@/lib/utils";

// Cette route [slug] est un fallback défensif. Tous les services actuels
// ont une page dédiée (priorité Next.js), donc generateStaticParams ne
// pré-rend rien : on évite des builds shadowés inutiles. Si un nouveau
// service est ajouté à lib/services.ts sans page custom, Next le servira
// dynamiquement via cette route.
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

  return (
    <>
      <Navbar />
      <main>
        {/* HERO ───────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-nexus-blue-950 pt-40 pb-20 text-white">
          <div className="absolute inset-0">
            <img
              src={service.image}
              alt=""
              className="h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900/90 to-nexus-blue-950/80" />
          </div>
          <div className="grain pointer-events-none absolute inset-0 opacity-20" />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <Link
              href="/services"
              className="mb-6 inline-flex items-center gap-2 text-body-sm text-slate-300 transition hover:text-nexus-orange-300"
            >
              ← Tous les services
            </Link>

            <div
              className={cn(
                "mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl shadow-elev-3",
                service.accent === "orange"
                  ? "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700"
                  : "bg-gradient-to-br from-nexus-blue-500 to-nexus-blue-800"
              )}
            >
              <Icon className="h-8 w-8 text-white" />
            </div>

            <h1
              className="font-display text-display-xl text-white lg:text-display-2xl max-w-4xl"
              style={{ paddingBottom: "0.15em" }}
            >
              {service.title}
            </h1>
            <p className="mt-6 max-w-2xl text-body-lg text-slate-300">
              {service.shortDesc}
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button href={`/demande/complet?service=${service.slug}`} size="lg">
                Demander ce service <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                href={whatsappLink(`Bonjour Nexus, je m'intéresse au service "${service.title}".`)}
                external
                variant="outline"
                size="lg"
              >
                <MessageCircle className="h-5 w-5" /> WhatsApp
              </Button>
            </div>
          </div>
        </section>

        {/* CONTENT ─────────────────────────────────────────────── */}
        <section className="bg-surface py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-3">
              {/* Description */}
              <div className="lg:col-span-2">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-4 py-1.5 text-overline text-nexus-orange-700 dark:text-brand">
                  <Sparkles className="h-3.5 w-3.5" />
                  Le service en détail
                </div>
                <h2 className="font-display text-display-md text-ink sm:text-display-lg">
                  Ce que Nexus prend en charge
                </h2>
                <p className="mt-6 text-body-lg text-ink-muted">
                  {service.longDesc}
                </p>

                {/* Features */}
                <div className="mt-10 space-y-3">
                  {service.features.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-2xl border border-line bg-surface-sunken p-4 transition-colors hover:border-brand/40 hover:bg-brand-subtle/40"
                    >
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </div>
                      <span className="text-body-sm text-ink">{f}</span>
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
                      className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-800 to-nexus-blue-950 p-6 text-white shadow-elev-3 transition-transform hover:scale-[1.02] hover:shadow-elev-4"
                    >
                      <Plane className="mb-3 h-8 w-8 text-nexus-orange-400" />
                      <div className="font-display text-headline">Rechercher un vol</div>
                      <div className="mt-1 text-body-sm text-slate-300">
                        Ouvrir Google Flights →
                      </div>
                    </a>
                    <a
                      href="https://www.skyscanner.net/hotels"
                      target="_blank"
                      rel="noreferrer"
                      className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 p-6 text-white shadow-elev-3 transition-transform hover:scale-[1.02] hover:shadow-glow-orange"
                    >
                      <Hotel className="mb-3 h-8 w-8" />
                      <div className="font-display text-headline">Réserver un hôtel</div>
                      <div className="mt-1 text-body-sm text-orange-50">
                        Ouvrir Skyscanner →
                      </div>
                    </a>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-28 space-y-5">
                  {/* CTA card */}
                  <div className="rounded-3xl border border-line bg-gradient-to-br from-nexus-blue-50 to-surface-elevated p-6 shadow-elev-2 dark:from-blue-500/5 dark:to-surface-elevated">
                    <div className="mb-2 flex items-center gap-2 text-overline text-brand">
                      <Sparkles className="h-3.5 w-3.5" /> Prêt à démarrer ?
                    </div>
                    <h3 className="mb-3 font-display text-headline text-ink">
                      Un conseiller vous rappelle
                    </h3>
                    <p className="mb-4 text-body-sm text-ink-muted">
                      Envoyez votre demande via le formulaire ou WhatsApp.
                      Premier contact gratuit.
                    </p>
                    <div className="space-y-2">
                      <Button
                        href={`/demande/complet?service=${service.slug}`}
                        variant="primary"
                        size="sm"
                        className="w-full"
                      >
                        Faire ma demande
                      </Button>
                      <Button
                        href={whatsappLink(`Bonjour Nexus, je m'intéresse au service "${service.title}".`)}
                        external
                        variant="secondary"
                        size="sm"
                        className="w-full"
                      >
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </Button>
                    </div>
                  </div>

                  {/* Agence card */}
                  <div className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
                    <div className="text-overline text-ink-muted">Agence</div>
                    <div className="mt-2 text-body-sm text-ink">
                      {NEXUS_CONTACT.addressLine1}
                      <br />
                      {NEXUS_CONTACT.addressLine2}
                    </div>
                    <div className="mt-4 text-overline text-ink-muted">
                      Téléphone (RCA)
                    </div>
                    <a
                      href={`tel:+${NEXUS_CONTACT.phoneRcaRaw}`}
                      className="mt-1 block text-body-sm font-semibold text-ink hover:text-brand"
                    >
                      {NEXUS_CONTACT.phoneRca}
                    </a>
                    <div className="mt-3 text-overline text-ink-muted">
                      International (Canada)
                    </div>
                    <a
                      href={`tel:+${NEXUS_CONTACT.phoneCanadaRaw}`}
                      className="mt-1 block text-body-sm font-semibold text-ink-muted hover:text-brand"
                    >
                      {NEXUS_CONTACT.phoneCanada}
                    </a>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* AUTRES SERVICES ────────────────────────────────────── */}
        <section className="bg-surface-sunken py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="font-display text-display-md text-ink sm:text-display-lg">
                Explorer d'autres services
              </h2>
              <Link
                href="/services"
                className="hidden items-center gap-2 text-body-sm font-semibold text-brand hover:gap-3 sm:inline-flex"
              >
                Tout voir <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {others.map((o) => {
                const OIcon = o.icon;
                return (
                  <Link
                    key={o.id}
                    href={`/services/${o.slug}`}
                    className="group rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-elev-4"
                  >
                    <div
                      className={cn(
                        "mb-4 flex h-11 w-11 items-center justify-center rounded-xl",
                        o.accent === "orange"
                          ? "bg-nexus-orange-100 text-nexus-orange-600 dark:bg-orange-500/15 dark:text-orange-300"
                          : "bg-nexus-blue-100 text-nexus-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                      )}
                    >
                      <OIcon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-headline text-ink group-hover:text-brand">
                      {o.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-ink-muted line-clamp-2">
                      {o.shortDesc}
                    </p>
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
