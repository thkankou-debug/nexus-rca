import { cn } from "@/lib/utils";

// ─── AgentAvatar ────────────────────────────────────────────────────────────
// Avatar d'agent partagé pour toutes les listes dashboards.
// Initiales blanches sur gradient navy → orange (cohérent DashboardShell).
// ────────────────────────────────────────────────────────────────────────────

export type AvatarSize = "xs" | "sm" | "md" | "lg";

const SIZE_CLASS: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
};

interface Props {
  /** Nom complet (ex: "Marie Ngounio") — les initiales sont calculées */
  name: string;
  size?: AvatarSize;
  /** Si true, gradient inversé orange → navy (pour distinguer "vous" dans une liste) */
  highlight?: boolean;
  /** Slot pour un mini-badge en surimpression (ex: rang gold/silver/bronze) */
  badge?: React.ReactNode;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AgentAvatar({
  name,
  size = "md",
  highlight = false,
  badge,
  className,
}: Props) {
  const initials = getInitials(name);
  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        SIZE_CLASS[size],
        highlight
          ? "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700"
          : "bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-950",
        className
      )}
      aria-label={name}
    >
      {initials}
      {badge && (
        <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center rounded-full bg-white p-0.5 shadow-sm">
          {badge}
        </span>
      )}
    </div>
  );
}
