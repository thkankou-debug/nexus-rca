import Link from "next/link";
import { cn } from "@/lib/utils";
import { NexusLogoMark } from "@/components/ui/NexusLogoMark";

interface LogoProps {
  variant?: "dark" | "light";
  className?: string;
}

export function Logo({ variant = "dark", className }: LogoProps) {
  const textColor = variant === "dark" ? "text-nexus-blue-900" : "text-white";

  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-2.5", className)}
      aria-label="Nexus RCA Accueil"
    >
      <NexusLogoMark className="shadow-lg transition-transform group-hover:rotate-6" />
      <div className="flex flex-col leading-none">
        <span className={cn("font-display text-xl font-bold tracking-tight", textColor)}>
          NEXUS
        </span>
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.2em]",
            variant === "dark" ? "text-nexus-orange-600" : "text-nexus-orange-300"
          )}
        >
          RCA
        </span>
      </div>
    </Link>
  );
}
