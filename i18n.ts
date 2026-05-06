import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

// ────────────────────────────────────────────────────────────────────────────
// Configuration next-intl — routing par cookie (pas de préfixe URL).
// Locale stockée dans le cookie `NEXUS_LOCALE` (fr ou en, défaut fr).
// Pour migrer vers /fr/... /en/... plus tard : utiliser le routing officiel.
// ────────────────────────────────────────────────────────────────────────────

export const SUPPORTED_LOCALES = ["fr", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const cookieValue = cookieStore.get("NEXUS_LOCALE")?.value;
  const locale: Locale = SUPPORTED_LOCALES.includes(cookieValue as Locale)
    ? (cookieValue as Locale)
    : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
