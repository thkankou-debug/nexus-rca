import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/utils";

interface ServiceHeroProps {
  badge?: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  ctaLabel?: string;
  ctaHref?: string;
  whatsappMessage?: string;
}

export function ServiceHero({
  badge,
  title,
  subtitle,
  image,
  imageAlt,
  ctaLabel = "Démarrer ce service",
  ctaHref = "/demande/complet",
  whatsappMessage,
}: ServiceHeroProps) {
  return (
    <section className="relative overflow-hidden bg-nexus-blue-950 pt-40 pb-20 text-white sm:pt-48">
      {/* Décor : mesh gradient + 2 orbes */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-60" />
      <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-nexus-orange-500/20 blur-3xl" />
      <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-nexus-blue-500/20 blur-3xl" />
      <div className="grain pointer-events-none absolute inset-0 opacity-20" />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            {badge && (
              <span className="mb-6 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-overline text-nexus-orange-300 backdrop-blur">
                {badge}
              </span>
            )}

            <h1
              className="font-display text-display-xl text-white lg:text-display-2xl"
              style={{ paddingBottom: "0.15em" }}
            >
              {title}
            </h1>

            <p className="mt-6 max-w-xl text-body-lg text-slate-300">
              {subtitle}
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-body-sm font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href={whatsappLink(
                  whatsappMessage || "Bonjour Nexus, je m'intéresse à ce service."
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-body-sm font-semibold backdrop-blur transition hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
                Parler à un conseiller
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-elev-5 ring-1 ring-white/10">
              <Image
                src={image}
                alt={imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-nexus-blue-950/40 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
