import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, MessageCircle, Plane, Hotel, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { Button } from "@/components/ui/Button";
import { SERVICES, getService } from "@/lib/services";
import { whatsappLink, cn } from "@/lib/utils";

export async function generateStaticParams() {
  return SERVICES.filter((s) => s.slug !== "nexus-ia").map((s) => ({ slug: s.slug }));
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
        {/* Hero */}
        <section className="relative overflow-hidden bg-nexus-blue-950 pt-40 pb-20 text-white">
          <div className="absolute inset-0">
            <img
              src={service.image}
              alt=""
              className="h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900/90 to-nexus-blue-950/80" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <Link
              href="/services"
              className="mb-6 inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-nexus-orange-300"
            >
              ← Tous les services
            </Link>

            <div
              className={cn(
                "mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl shadow-xl",
                service.accent === "orange"
                  ? "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700"
                  : "bg-gradient-to-br from-nexus-blue-500 to-nexus-blue-800"
              )}
            >
              <Icon className="h-8 w-8 text-white" />
            </div>

            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl max-w-4xl">
              {service.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-300">
              {service.shortDesc}
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button href={`/demande?service=${service.slug}`} size="lg">
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

        {/* Content */}
        <section className="bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-3">
              {/* Description */}
              <div className="lg:col-span-2">
                <div className="mb-4 inline-block rounded-full bg-nexus-orange-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-nexus-orange-700">
                  Le service en détail
                </div>
                <h2 className="font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl">
                  Ce que Nexus prend en charge
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-slate-700">
                  {service.longDesc}
                </p>

                {/* Features */}
                <div className="mt-10 space-y-3">
                  {service.features.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-nexus-orange-300 hover:bg-nexus-orange-50/30"
                    >
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-nexus-orange-500 text-white">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </div>
                      <span className="text-slate-800">{f}</span>
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
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-nexus-blue-800 to-nexus-blue-950 p-6 text-white transition-transform hover:scale-[1.02]"
                    >
                      <Plane className="mb-3 h-8 w-8 text-nexus-orange-400" />
                      <div className="font-display text-xl font-bold">Rechercher un vol</div>
                      <div className="mt-1 text-sm text-slate-300">
                        Ouvrir Google Flights →
                      </div>
                    </a>
                    <a
                      href="https://www.skyscanner.net/hotels"
                      target="_blank"
                      rel="noreferrer"
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 p-6 text-white transition-transform hover:scale-[1.02]"
                    >
                      <Hotel className="mb-3 h-8 w-8" />
                      <div className="font-display text-xl font-bold">Réserver un hôtel</div>
                      <div className="mt-1 text-sm text-orange-50">Ouvrir Skyscanner →</div>
                    </a>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-28 space-y-5">
                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-nexus-blue-50 to-white p-6 shadow-card">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
                      <Sparkles className="h-4 w-4" /> Prêt à démarrer ?
                    </div>
                    <h3 className="mb-3 font-display text-xl font-bold text-nexus-blue-950">
                      Un conseiller vous rappelle
                    </h3>
                    <p className="mb-4 text-sm text-slate-600">
                      Envoyez-nous votre demande via le formulaire ou WhatsApp. Premier contact gratuit.
                    </p>
                    <div className="space-y-2">
                      <Button
                        href={`/demande?service=${service.slug}`}
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

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Agence
                    </div>
                    <div className="mt-2 text-sm text-slate-700">
                      Relais Sica, vers Hôpital Général
                      <br />
                      Bangui, République Centrafricaine
                    </div>
                    <div className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Téléphone
                    </div>
                    <div className="mt-1 text-sm font-semibold text-nexus-blue-900">
                      +1 587 327 6344
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Autres services */}
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="font-display text-3xl font-bold text-nexus-blue-950 sm:text-4xl">
                Explorer d'autres services
              </h2>
              <Link
                href="/services"
                className="hidden items-center gap-2 text-sm font-semibold text-nexus-orange-600 hover:gap-3 sm:inline-flex"
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
                    className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-nexus-orange-300 hover:shadow-xl"
                  >
                    <div
                      className={cn(
                        "mb-4 flex h-11 w-11 items-center justify-center rounded-xl",
                        o.accent === "orange"
                          ? "bg-nexus-orange-100 text-nexus-orange-600"
                          : "bg-nexus-blue-100 text-nexus-blue-700"
                      )}
                    >
                      <OIcon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-nexus-blue-950 group-hover:text-nexus-orange-600">
                      {o.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">
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
