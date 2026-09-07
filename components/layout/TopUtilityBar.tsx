"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────────────────────
// TopUtilityBar — fine bande navy au-dessus du Navbar (localisation + FR|EN).
// Usage opt-in via Navbar `showTopBar` (voir Navbar.tsx) — n'affecte que les
// pages qui l'activent explicitement. Masquée sur mobile pour ne pas
// surcharger l'écran (le LocaleToggle du menu mobile reste disponible).
// ────────────────────────────────────────────────────────────────────────────

const ONE_YEAR_SEC = 60 * 60 * 24 * 365;

export function TopUtilityBar() {
  const locale = useLocale();
  const t = useTranslations("TopBar");
  const router = useRouter();

  function setLocale(next: "fr" | "en") {
    if (next === locale) return;
    document.cookie = `NEXUS_LOCALE=${next}; path=/; max-age=${ONE_YEAR_SEC}; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[60] hidden h-9 items-center justify-between bg-nexus-blue-950 px-4 text-[11px] text-white/70 sm:flex lg:px-8">
      <span className="inline-flex items-center gap-1.5">
        <MapPin className="h-3 w-3 text-brand" />
        {t("location")}
      </span>
      <div className="inline-flex items-center gap-1.5 font-mono tracking-wider">
        <button
          type="button"
          onClick={() => setLocale("fr")}
          aria-current={locale === "fr"}
          className={cn(
            "transition-colors",
            locale === "fr" ? "font-bold text-white" : "text-white/50 hover:text-white/80"
          )}
        >
          FR
        </button>
        <span className="text-white/30">|</span>
        <button
          type="button"
          onClick={() => setLocale("en")}
          aria-current={locale === "en"}
          className={cn(
            "transition-colors",
            locale === "en" ? "font-bold text-white" : "text-white/50 hover:text-white/80"
          )}
        >
          EN
        </button>
      </div>
    </div>
  );
}
