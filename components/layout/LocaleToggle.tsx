"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────────────────────
// Toggle FR/EN — set le cookie NEXUS_LOCALE et reload la page (RSC).
// Présent dans la Navbar (desktop + mobile menu).
// ────────────────────────────────────────────────────────────────────────────

interface Props {
  variant?: "ink" | "light";
  /** Affichage compact (juste FR/EN sans icône Languages) */
  compact?: boolean;
}

const ONE_YEAR_SEC = 60 * 60 * 24 * 365;

export function LocaleToggle({ variant = "ink", compact = false }: Props) {
  const locale = useLocale();
  const t = useTranslations("LocaleToggle");
  const router = useRouter();

  function switchLocale() {
    const next = locale === "fr" ? "en" : "fr";
    document.cookie = `NEXUS_LOCALE=${next}; path=/; max-age=${ONE_YEAR_SEC}; samesite=lax`;
    router.refresh();
  }

  const label = locale === "fr" ? t("switch_to_en") : t("switch_to_fr");

  return (
    <button
      type="button"
      onClick={switchLocale}
      aria-label={`${t("current_label")}: ${locale.toUpperCase()}. Cliquer pour basculer.`}
      className={cn(
        // M6 — cible tactile >= 44x44 px, y compris en variante compacte :
        // un selecteur de langue reduit a deux mots minuscules est le
        // premier exemple cite par la regle.
        "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm font-bold transition-all duration-300",
        variant === "ink"
          ? "border-slate-200 bg-white text-slate-700 hover:border-nexus-orange-300/60 hover:text-nexus-orange-600"
          : "border-white/20 bg-white/5 text-white backdrop-blur-md hover:border-white/40 hover:bg-white/10",
        compact && "min-w-11 justify-center px-3"
      )}
    >
      {!compact && <Languages className="h-3.5 w-3.5" />}
      <span className="font-mono tracking-wider">{label}</span>
    </button>
  );
}
