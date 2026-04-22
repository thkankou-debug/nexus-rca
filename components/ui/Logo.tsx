import Link from "next/link";
import { cn } from "@/lib/utils";

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
      <div className="relative">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-800 to-nexus-orange-500 shadow-lg transition-transform group-hover:rotate-6">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-6 w-6 text-white"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3 L21 21" />
            <path d="M21 3 L3 21" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-nexus-orange-500 ring-2 ring-white" />
      </div>
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
