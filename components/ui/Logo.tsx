import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "dark" | "light";
  className?: string;
}

export function Logo({ variant = "dark", className }: LogoProps) {
  const isLight = variant === "light";

  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-3", className)}
      aria-label="Nexus RCA — Accueil"
    >
      <span
        aria-hidden
        className="font-serif text-3xl font-bold leading-none text-brand transition-transform duration-300 group-hover:scale-105"
      >
        N
      </span>
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-base font-bold tracking-tight",
            isLight ? "text-white" : "text-nexus-blue-950"
          )}
        >
          NEXUS RCA
        </span>
        <span
          className={cn(
            "hidden text-[9px] font-semibold uppercase tracking-[0.16em] sm:inline",
            isLight ? "text-white/60" : "text-slate-500"
          )}
        >
          Agence internationale
        </span>
      </div>
    </Link>
  );
}
