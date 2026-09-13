import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/lib/services";
import { cn } from "@/lib/utils";

// Card service Premium tech — fond navy gradient + accent orange.
// Style "tech card sombre" : dot grid, glow orange permanent, hover renforcé.
// 100% cliquable (Link wrapper, pointer-events-none sur tous overlays).
interface ServiceCardProps {
  service: Service;
  className?: string;
}

const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

export function ServiceCard({ service, className }: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <Link
      href={`/services/${service.slug}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-nexus-blue-900 via-nexus-blue-950 to-nexus-blue-900 p-6 shadow-[0_24px_60px_-30px_rgba(12,28,64,0.55)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_30px_70px_-25px_rgba(185,151,96,0.30)] active:-translate-y-0",
        className
      )}
    >
      {/* Dot grid pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={DOT_GRID_DARK}
      />

      {/* Glow or permanent (subtle) → renforcé au hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand/15 blur-[80px] transition-all duration-500 group-hover:bg-brand/30"
      />

      {/* Glow navy en bas-gauche pour profondeur */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-nexus-blue-500/15 blur-[80px]"
      />

      {/* Indicator dot or en top-right */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-5 top-5 z-10 h-1.5 w-1.5 rounded-full bg-brand opacity-60 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative flex h-full flex-col">
        {/* Icône carrée or avec halo */}
        <div className="relative mb-5">
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl bg-brand/40 opacity-50 blur-md transition-all duration-500 group-hover:opacity-100"
          />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-on-brand shadow-[0_10px_24px_-8px_rgba(185,151,96,0.55)] transition-transform duration-300 ease-out group-hover:scale-105">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {/* Titre blanc avec underline or au hover */}
        <h3 className="font-display text-base font-bold leading-tight text-white sm:text-lg">
          <span className="relative inline-block">
            {service.title}
            <span
              aria-hidden
              className="absolute inset-x-0 -bottom-0.5 h-px scale-x-0 bg-gradient-to-r from-transparent via-brand/70 to-transparent transition-transform duration-500 ease-out group-hover:scale-x-100"
            />
          </span>
        </h3>

        {/* Description slate-300 lisible sur navy */}
        <p className="mt-2.5 text-sm leading-relaxed text-slate-300/95">
          {service.shortDesc}
        </p>

        {/* CTA flèche or — full clickable area */}
        <div className="mt-auto pt-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand transition-colors duration-300 group-hover:text-brand-hover">
            Découvrir le service
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
