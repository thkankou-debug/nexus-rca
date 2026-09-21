import Image from "next/image";
import { cn } from "@/lib/utils";
import { resolveServiceVisual } from "@/lib/service-images";

type CoverVariant = "hero" | "card" | "thumb";

const SIZES: Record<CoverVariant, string> = {
  hero: "(max-width: 768px) 100vw, 560px",
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px",
  thumb: "64px",
};

export function ServiceCover({
  slug,
  categorie,
  alt,
  variant = "card",
  priority = false,
  className,
  imgClassName,
}: {
  slug?: string | null;
  categorie?: string | null;
  alt?: string;
  variant?: CoverVariant;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  const visual = resolveServiceVisual(slug, categorie);
  const ratio =
    variant === "hero" ? "aspect-[16/10] sm:aspect-[16/9]" : variant === "thumb" ? "aspect-square" : "aspect-[16/10]";

  return (
    <div className={cn("relative overflow-hidden bg-nexus-blue-950", ratio, className)}>
      <Image
        src={visual.src}
        alt={alt || visual.alt}
        fill
        priority={priority}
        sizes={SIZES[variant]}
        className={cn("object-cover object-[center_28%]", imgClassName)}
      />
    </div>
  );
}
