import Image from "next/image";
import { cn } from "@/lib/utils";

// ============================================================================
// ILLUSTRATION DE PAGE — v2 (13/09/2026, après rejet de la v1 par Thierry :
// « images très grandes, mal placées, aucune harmonie »).
// Bandeau CINÉMATIQUE à hauteur maîtrisée (240→340 px), jamais un bloc
// pleine hauteur : l'image est recadrée (object-cover) avec un point de
// cadrage par image pour préserver les visages, alignée sur la grille des
// sections (max-w-6xl), cadre assorti au registre de la page.
// Illustrations de marque déposées par Thierry (public/illustrations/) —
// présentées comme des ILLUSTRATIONS (alt explicite), jamais comme des
// photographies (E4).
// ============================================================================

export function ServiceIllustration({
  src,
  alt,
  tone = "light",
  position = "center 40%",
  className,
}: {
  src: string;
  alt: string;
  tone?: "light" | "dark";
  /** Point de cadrage CSS object-position — préserve les visages. */
  position?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "px-4 py-10 sm:px-6 sm:py-12 lg:px-8",
        tone === "light" ? "bg-white" : "bg-nexus-blue-950",
        className
      )}
    >
      <figure className="mx-auto max-w-6xl">
        <div
          className={cn(
            "relative h-[240px] overflow-hidden rounded-3xl sm:h-[300px] lg:h-[340px]",
            tone === "light"
              ? "border border-slate-200 shadow-sm"
              : "border border-white/10 ring-1 ring-white/5"
          )}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="object-cover"
            style={{ objectPosition: position }}
          />
        </div>
      </figure>
    </section>
  );
}
