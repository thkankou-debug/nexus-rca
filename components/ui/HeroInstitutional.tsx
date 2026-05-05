import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Hero "cabinet" pour pages services — fond sombre sobre, zéro orange dominant.
// Diffère du Hero homepage (flagship, gradient orange dominant) — réservé aux
// pages institutionnelles : services, à propos, contact.
//
// Usage :
//   <HeroInstitutional eyebrow="..." eyebrowIcon={<Plane />}>
//     <h1>...</h1>
//     <p>...</p>
//     <div>CTAs</div>
//   </HeroInstitutional>
interface HeroInstitutionalProps {
  eyebrow?: string;
  eyebrowIcon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function HeroInstitutional({
  eyebrow,
  eyebrowIcon,
  children,
  className,
}: HeroInstitutionalProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-nexus-hero-institutional pt-32 pb-20 text-white lg:pt-36 lg:pb-24",
        className
      )}
    >
      {/* Mesh très subtil — pas de blur color blob agressif */}
      <div className="absolute inset-0 bg-mesh-gradient-subtle" />
      <div className="grain pointer-events-none absolute inset-0 opacity-15" />

      <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
        <div className="text-center">
          {eyebrow && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-overline text-nexus-orange-300 backdrop-blur">
              {eyebrowIcon}
              {eyebrow}
            </div>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
