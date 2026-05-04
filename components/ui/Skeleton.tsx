import { cn } from "@/lib/utils";

/**
 * Skeleton — placeholder de chargement avec un highlight qui balaie.
 *
 * Pattern visuel : Linear / Stripe — fond `surface-sunken`, overlay
 * `via-white` qui translateX de gauche à droite. Adaptatif dark mode
 * via opacités différentes.
 *
 * Pour des formes spécifiques, ajouter des classes via `className` :
 *   <Skeleton className="h-8 w-32" />            // ligne de texte
 *   <Skeleton className="h-40 rounded-2xl" />    // carte
 *   <Skeleton className="h-10 w-10 rounded-full" /> // avatar
 */
export function Skeleton({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      role="presentation"
      {...rest}
      className={cn(
        "relative overflow-hidden rounded-xl bg-surface-sunken",
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-skeleton bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />
    </div>
  );
}
