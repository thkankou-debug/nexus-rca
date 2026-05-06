import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/lib/services";
import { cn } from "@/lib/utils";

// Card service Premium tech — ring + gradient interne + glow corner + lift sober.
// Conserve l'identité orange/navy + zones strictes (icône / titre / desc / CTA).
interface ServiceCardProps {
  service: Service;
  className?: string;
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  const Icon = service.icon;
  const isOrange = service.accent === "orange";
  const glowRgba = isOrange ? "255,102,0" : "30,64,175";

  return (
    <Link
      href={`/services/${service.slug}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 p-6 shadow-[0_16px_36px_-16px_rgba(12,28,64,0.16)] ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 active:-translate-y-0",
        className
      )}
    >
      {/* Glow corner orange/navy */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ backgroundColor: `rgba(${glowRgba}, 0.18)` }}
      />
      {/* Custom shadow au hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: `0 24px 60px -22px rgba(${glowRgba}, 0.28)` }}
      />
      {/* Indicator dot accent en top-right */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-5 top-5 h-1.5 w-1.5 rounded-full opacity-40 transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundColor: isOrange ? "#FF6600" : "#1E40AF" }}
      />

      <div className="relative flex h-full flex-col">
        {/* Icône — gradient + scale au hover */}
        <div
          className={cn(
            "mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105",
            isOrange
              ? "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700"
              : "bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* Titre */}
        <h3 className="font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
          {service.title}
        </h3>

        {/* Description courte */}
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {service.shortDesc}
        </p>

        {/* CTA flèche */}
        <div className="mt-auto pt-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-nexus-orange-600">
            Découvrir
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
