import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

// Toujours navy/blanc, indépendant du thème clair/sombre — un tooltip est
// un survol transitoire, pas une surface qui doit suivre le thème.
export function Tooltip({ content, children, className }: TooltipProps) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xs bg-nexus-blue-950 px-2 py-1 text-caption text-white opacity-0 shadow-elev-2 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
