import Image from "next/image";
import { cn } from "@/lib/utils";

// ============================================================================
// ILLUSTRATION DE PAGE — bandeau image unique, sobre (D8).
// Illustrations de marque déposées par Thierry le 13/09/2026
// (public/illustrations/*.png) : style peint navy/or, présentées comme des
// ILLUSTRATIONS (alt explicite) — jamais comme des photographies (E4).
// tone="light" : sections claires · tone="dark" : sections navy.
// ============================================================================

export function ServiceIllustration({
  src,
  alt,
  tone = "light",
  width = 1536,
  height = 1024,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  tone?: "light" | "dark";
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "px-4 pt-12 sm:px-6 lg:px-8",
        tone === "light" ? "bg-white" : "bg-nexus-blue-950",
        className
      )}
    >
      <div className="mx-auto max-w-5xl">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes="(min-width: 1024px) 1024px, 100vw"
          className={cn(
            "h-auto w-full rounded-3xl",
            tone === "light"
              ? "border border-slate-200 shadow-[0_24px_60px_-30px_rgba(2,7,31,0.35)]"
              : "border border-white/10 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)]"
          )}
        />
      </div>
    </section>
  );
}
