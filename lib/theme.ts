// Helpers de thème partagés (palette de commandes, toggle navbar, etc.)
// Source unique de vérité pour appliquer un thème et notifier les listeners.

export type Theme = "light" | "dark" | "system";
export const THEME_KEY = "nexus-theme";
export const THEME_EVENT = "nexus-theme-change";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

/** Lit le thème stocké, défaut "system" si absent ou invalide. */
export function readTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {}
  return "system";
}

/** Résout un thème ("system" → "light" ou "dark" selon la pref OS). */
export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system" && typeof window !== "undefined") {
    return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
  }
  return theme === "dark" ? "dark" : "light";
}

/** Applique la classe `.dark` selon le thème (sans persister). */
export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(
    "dark",
    resolveTheme(theme) === "dark"
  );
}

/**
 * Persiste le thème + applique + notifie. À appeler depuis le toggle
 * navbar OU depuis la palette de commandes — toute UI qui affiche
 * l'état du thème doit écouter `THEME_EVENT` pour se synchroniser.
 */
export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
  applyTheme(theme);
  window.dispatchEvent(
    new CustomEvent<Theme>(THEME_EVENT, { detail: theme })
  );
}
