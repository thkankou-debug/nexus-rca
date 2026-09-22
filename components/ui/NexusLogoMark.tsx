import { cn } from "@/lib/utils";

// ============================================================================
// MARQUE OFFICIELLE NEXUS RCA — dessin unique, celui de la HomePage
// (components/ui/Logo.tsx). Carré dégradé navy → orange, croix, point,
// pastille orange. Ne pas redessiner, ne pas remplacer par l’icône « N »
// de public/icones (réservée au PWA).
// L’orange de CE bloc est le logo, pas un accent d’interface.
// ============================================================================

export function NexusLogoMark({
  size = 40,
  className,
}: {
  /** 40 = taille exacte de la HomePage. */
  size?: number;
  /** Classes du carré (ombre, rotation au survol sur le site public). */
  className?: string;
}) {
  const svg = size * 0.6;
  const dot = size * 0.25;
  const overflow = size * 0.05;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className={cn(
          "flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-800 to-nexus-orange-500",
          className
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="text-white"
          style={{ width: svg, height: svg }}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 3 L21 21" />
          <path d="M21 3 L3 21" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      </div>
      <span
        className="absolute rounded-full bg-nexus-orange-500 ring-2 ring-white"
        style={{ width: dot, height: dot, right: -overflow, bottom: -overflow }}
      />
    </div>
  );
}
