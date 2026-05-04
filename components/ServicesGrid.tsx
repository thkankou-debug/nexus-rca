"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { SERVICES, type Service } from "@/lib/services";
import { TiltCard } from "@/components/ui/TiltCard";
import { cn } from "@/lib/utils";

// Bento layout : on définit explicitement la place de chaque service
// pour créer une composition variable, sans ré-ordonner SERVICES.
// "wide" = span 2 cols sur desktop ; "tall" = span 2 rows.
type Layout = { span?: "wide" | "tall" | "hero"; featured?: boolean };

const SLUG_LAYOUT: Record<string, Layout> = {
  financement: { span: "wide", featured: true }, // hero card
  "nexus-ia": { span: "wide", featured: true }, // 2e featured
};

export function ServicesGrid() {
  return (
    <section
      id="services"
      className="relative overflow-hidden bg-surface py-24 lg:py-32"
    >
      <div className="absolute inset-0 bg-mesh-gradient opacity-40 dark:opacity-25" />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-4 py-1.5 text-overline text-nexus-orange-700 dark:text-brand">
            <Sparkles className="h-3.5 w-3.5" />
            Nos expertises
          </div>
          <h2 className="font-display text-display-lg text-ink lg:text-display-xl">
            Tout ce qu&apos;il vous faut,{" "}
            <span className="text-gradient-nexus">sous un seul toit.</span>
          </h2>
          <p className="mt-5 text-body-lg text-ink-muted">
            Dix expertises pensées pour ouvrir les portes internationales depuis
            la Centrafrique.
          </p>
        </motion.div>

        {/* Bento grid : 6 colonnes sur desktop, auto-flow dense pour combler */}
        <div className="grid auto-rows-[minmax(220px,_auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          {SERVICES.map((service, index) => (
            <BentoCard
              key={service.id}
              service={service}
              index={index}
              layout={SLUG_LAYOUT[service.slug] ?? {}}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  service,
  index,
  layout,
}: {
  service: Service;
  index: number;
  layout: Layout;
}) {
  const Icon = service.icon;
  const wide = layout.span === "wide";
  const featured = layout.featured;

  // Spans : sur desktop on a 6 cols, donc wide = 4 cols, normal = 2 cols
  const spanClasses = cn(
    "lg:col-span-2", // default
    wide && "lg:col-span-4 sm:col-span-2"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.4) }}
      className={cn("h-full", spanClasses)}
    >
      <TiltCard
        maxTilt={featured ? 5 : 7}
        glowOpacity={featured ? 0.15 : 0.1}
        className={cn(
          "group h-full rounded-3xl",
          // L'overflow ici clippe le glow, pas le tilt
          "[&>a]:will-change-transform"
        )}
      >
        <Link
          href={`/services/${service.slug}`}
          className={cn(
            "group/link relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface-elevated transition-shadow duration-500",
            "hover:border-transparent hover:shadow-elev-4",
            featured && "lg:p-8",
            !featured && "p-6 lg:p-7"
          )}
        >
          {/* Hover gradient overlay */}
          <div
            className={cn(
              "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/link:opacity-100",
              service.accent === "orange"
                ? "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700"
                : "bg-gradient-to-br from-nexus-blue-800 to-nexus-blue-950"
            )}
          />

          {/* Mesh subtil au hover sur les cards featured */}
          {featured && (
            <div className="pointer-events-none absolute inset-0 bg-mesh-gradient opacity-0 transition-opacity duration-500 group-hover/link:opacity-100" />
          )}

          {/* Contenu lifté en 3D pour profondeur supplémentaire au tilt */}
          <div
            className="relative z-10 flex h-full flex-col"
            style={{ transform: "translateZ(30px)" }}
          >
            {/* Top : icon + numero */}
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "flex items-center justify-center rounded-2xl transition-all duration-500",
                  featured ? "h-16 w-16" : "h-14 w-14",
                  service.accent === "orange"
                    ? "bg-nexus-orange-100 text-nexus-orange-600 group-hover/link:bg-white/20 group-hover/link:text-white dark:bg-orange-500/15 dark:text-orange-300"
                    : "bg-nexus-blue-100 text-nexus-blue-700 group-hover/link:bg-white/20 group-hover/link:text-white dark:bg-blue-500/15 dark:text-blue-300"
                )}
              >
                <Icon className={featured ? "h-8 w-8" : "h-7 w-7"} />
              </div>

              {/* Numéro en filigrane */}
              <div
                className={cn(
                  "font-display font-bold leading-none tracking-tight transition-colors",
                  featured ? "text-7xl" : "text-5xl",
                  "text-line group-hover/link:text-white/15"
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </div>
            </div>

            {/* Body : titre + description */}
            <div className={cn("mt-auto pt-6", featured && "lg:pt-10")}>
              {featured && (
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand/15 px-2.5 py-0.5 text-overline text-brand transition-colors group-hover/link:bg-white/20 group-hover/link:text-white">
                  <Sparkles className="h-3 w-3" />
                  Signature
                </div>
              )}
              <h3
                className={cn(
                  "font-display text-ink transition-colors group-hover/link:text-white",
                  featured ? "text-display-sm lg:text-display-md" : "text-headline"
                )}
              >
                {service.title}
              </h3>
              <p
                className={cn(
                  "mt-2 text-ink-muted transition-colors group-hover/link:text-white/90",
                  featured ? "text-body lg:text-body-lg max-w-xl" : "text-body-sm"
                )}
              >
                {service.shortDesc}
              </p>

              {/* CTA */}
              <div
                className={cn(
                  "mt-5 inline-flex items-center gap-1.5 font-semibold text-brand transition-all group-hover/link:gap-2.5 group-hover/link:text-white",
                  featured ? "text-body" : "text-body-sm"
                )}
              >
                En savoir plus
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </Link>
      </TiltCard>
    </motion.div>
  );
}
