"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Menu,
  X,
  ChevronDown,
  MessageCircle,
  FilePlus,
  ArrowRight,
  HelpCircle,
  Globe2,
  Handshake,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LocaleToggle } from "@/components/layout/LocaleToggle";
import { TopUtilityBar } from "@/components/layout/TopUtilityBar";
import { SERVICES } from "@/lib/services";
import { cn, whatsappLink } from "@/lib/utils";

interface NavLink {
  href: string;
  labelKey: string;
  hasDropdown?: boolean;
}

// Nav principale desktop/mobile réduite à l'essentiel (structure maquette) :
// Accueil (le logo suffit), Nexus IA et Rendez-vous restent fonctionnels
// mais via le footer (déjà en place, voir Footer.tsx) plutôt qu'en pill ici.
const NAV_LINKS_MAIN: NavLink[] = [
  { href: "/services", labelKey: "services", hasDropdown: true },
  { href: "/#methode", labelKey: "method" },
  { href: "/a-propos", labelKey: "about" },
];

const NAV_LINKS_END: NavLink[] = [{ href: "/contact", labelKey: "contact" }];

// Liens du menu complet (desktop + mobile), Ressources exclu : son dropdown
// est rendu à part (desktop hover-panel + accordéon mobile dédié).
const NAV_LINKS: NavLink[] = [...NAV_LINKS_MAIN, ...NAV_LINKS_END];

interface ResourceLink {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

const RESOURCE_LINKS: ResourceLink[] = [
  { href: "/faq", labelKey: "resources_faq", icon: HelpCircle },
  { href: "/pays-destinations", labelKey: "resources_pays", icon: Globe2 },
  { href: "/partenaires", labelKey: "resources_partenaires", icon: Handshake },
];

const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

interface NavbarProps {
  /** Affiche la bande localisation + FR|EN au-dessus du menu (home uniquement pour l'instant). */
  showTopBar?: boolean;
  /** Navbar blanche dès le chargement, plutôt que transparente jusqu'au scroll (home uniquement, structure maquette). */
  alwaysSolid?: boolean;
}

export function Navbar({ showTopBar = false, alwaysSolid = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("Navbar");
  // "solid" pilote tout le style desktop/mobile (fond blanc, textes sombres) :
  // vrai si on a scrollé OU si la page force une navbar blanche dès le départ.
  const solid = alwaysSolid || scrolled;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
    setResourcesOpen(false);
  }, [pathname]);

  // Verrouille le scroll body quand menu mobile ouvert
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {showTopBar && <TopUtilityBar />}
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
          showTopBar && "sm:top-9",
          solid
            ? "border-b border-slate-200/80 bg-white/80 shadow-[0_8px_24px_-12px_rgba(12,28,64,0.12)] backdrop-blur-xl"
            : "bg-transparent"
        )}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 lg:px-8">
          <Logo variant={solid ? "dark" : "light"} />

          {/* Desktop nav — liens principaux */}
          <ul className="hidden items-center gap-0.5 lg:flex xl:gap-1">
            {NAV_LINKS_MAIN.map((link) => (
              <li
                key={link.href}
                className="relative"
                onMouseEnter={() => link.hasDropdown && setServicesOpen(true)}
                onMouseLeave={() => link.hasDropdown && setServicesOpen(false)}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold transition-colors xl:px-4",
                    solid
                      ? "text-slate-700 hover:bg-slate-100 hover:text-nexus-blue-950"
                      : "text-white hover:bg-white/10"
                  )}
                >
                  {t(link.labelKey)}
                  {link.hasDropdown && <ChevronDown className="h-3.5 w-3.5" />}
                </Link>

                {link.hasDropdown && servicesOpen && (
                  <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2">
                    <div className="w-[520px] rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_24px_60px_-22px_rgba(12,28,64,0.30)]">
                      <div className="mb-3 border-b border-slate-200 pb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-blue-700">
                        {t("services_dropdown_eyebrow")}
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {SERVICES.map((s) => {
                          const Icon = s.icon;
                          return (
                            <Link
                              key={s.id}
                              href={`/services/${s.slug}`}
                              className="group flex items-start gap-3 rounded-2xl p-2.5 transition-all duration-300 hover:bg-slate-50"
                            >
                              <div
                                className={cn(
                                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105",
                                  s.accent === "orange"
                                    ? "bg-brand-subtle text-nexus-blue-900 dark:bg-brand-subtle dark:text-brand"
                                    : "bg-nexus-blue-100 text-nexus-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                                )}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-nexus-blue-950 group-hover:text-nexus-blue-700">
                                  {s.title}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}

            {/* Ressources — dropdown dédié (FAQ, Pays & destinations, Partenaires) */}
            <li
              className="relative"
              onMouseEnter={() => setResourcesOpen(true)}
              onMouseLeave={() => setResourcesOpen(false)}
            >
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold transition-colors xl:px-4",
                  solid
                    ? "text-slate-700 hover:bg-slate-100 hover:text-nexus-blue-950"
                    : "text-white hover:bg-white/10"
                )}
              >
                {t("resources")}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {resourcesOpen && (
                <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2">
                  <div className="w-64 rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_24px_60px_-22px_rgba(12,28,64,0.30)]">
                    {RESOURCE_LINKS.map((r) => {
                      const Icon = r.icon;
                      return (
                        <Link
                          key={r.href}
                          href={r.href}
                          className="group flex items-center gap-3 rounded-2xl p-2.5 transition-all duration-300 hover:bg-slate-50"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-nexus-blue-100 text-nexus-blue-700 transition-transform duration-300 group-hover:scale-105">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="text-sm font-bold text-nexus-blue-950 group-hover:text-nexus-blue-700">
                            {t(r.labelKey)}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </li>

            {NAV_LINKS_END.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold transition-colors xl:px-4",
                    solid
                      ? "text-slate-700 hover:bg-slate-100 hover:text-nexus-blue-950"
                      : "text-white hover:bg-white/10"
                  )}
                >
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop nav — actions à droite : Espace client + un seul CTA */}
          <div className="hidden items-center gap-1 lg:flex xl:gap-3">
            {!showTopBar && (
              <>
                <LocaleToggle variant={solid ? "ink" : "light"} compact />
                <ThemeToggle variant={solid ? "ink" : "light"} />
              </>
            )}

            <Link
              href="/nexus-connect"
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold transition-colors duration-200",
                solid
                  ? "text-slate-700 hover:text-nexus-blue-700"
                  : "text-white hover:text-brand"
              )}
            >
              <UserRound className="h-4 w-4" />
              {t("client_area")}
            </Link>

            <Link
              href="/demande/complet"
              className="group/cta relative inline-flex items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full bg-brand px-4 py-2 text-sm font-bold text-on-brand shadow-[0_8px_24px_-8px_rgba(201,162,39,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-[0_12px_30px_-8px_rgba(201,162,39,0.6)]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
              />
              <FilePlus className="h-4 w-4" />
              {t("open_dossier")}
            </Link>
          </div>

          {/* Mobile actions — logo + hamburger uniquement (langue/thème dans le panneau, sinon la barre déborde sur petit écran) */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className={cn(
                "relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300",
                solid
                  ? "border-slate-200 bg-white text-nexus-blue-950 shadow-sm hover:border-nexus-blue-300/60 hover:shadow-[0_8px_20px_-8px_rgba(2,7,31,0.25)]"
                  : "border-white/20 bg-white/10 text-white backdrop-blur-md hover:border-white/40 hover:bg-white/15"
              )}
              aria-label={mobileOpen ? t("close_menu") : t("open_menu")}
              aria-expanded={mobileOpen}
            >
              <span className="relative h-4 w-5">
                <span
                  className={cn(
                    "absolute left-0 top-0 h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-out",
                    mobileOpen
                      ? "translate-y-1.5 rotate-45"
                      : "translate-y-0 rotate-0"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-1.5 h-0.5 rounded-full bg-current transition-all duration-300 ease-out",
                    mobileOpen ? "w-0 opacity-0" : "w-full opacity-100"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-3 h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-out",
                    mobileOpen
                      ? "-translate-y-1.5 -rotate-45"
                      : "translate-y-0 rotate-0"
                  )}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* ─── Mobile menu Premium tech (full-screen panel navy + dot grid) ─ */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label={t("close_menu")}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-nexus-blue-950/60 backdrop-blur-sm lg:hidden"
            style={{ animation: "fadeIn 0.25s ease-out" }}
          />

          {/* Panel */}
          <div
            className="fixed inset-x-0 top-0 z-40 max-h-[100dvh] overflow-y-auto bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 pb-8 pt-20 text-white shadow-[0_24px_60px_-15px_rgba(12,28,64,0.45)] lg:hidden"
            style={{ animation: "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            {/* Dot grid subtle */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.5]"
              style={DOT_GRID_DARK}
            />
            {/* Glows */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-brand/15 blur-[100px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-20 bottom-20 h-72 w-72 rounded-full bg-nexus-blue-500/15 blur-[100px]"
            />

            <div className="relative mx-auto max-w-md space-y-5 px-5">
              {/* Eyebrow + langue/thème (déplacés ici depuis la barre du haut) */}
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-brand backdrop-blur-md">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
                  </span>
                  {t("menu")}
                </span>
                <div className="flex items-center gap-2">
                  <LocaleToggle variant="light" compact />
                  <ThemeToggle variant="light" />
                </div>
              </div>

              {/* NEXUS CONNECT highlight card */}
              <Link
                href="/nexus-connect"
                className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-brand/40 bg-gradient-to-br from-brand/15 via-brand/10 to-transparent p-4 shadow-[0_12px_30px_-12px_rgba(201,162,39,0.40)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/60"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/20 blur-2xl"
                />
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-hover text-on-brand shadow-[0_8px_20px_-8px_rgba(201,162,39,0.5)]">
                  <UserRound className="h-5 w-5" />
                </div>
                <div className="relative flex-1 min-w-0">
                  <p className="font-display text-sm font-bold text-white">
                    {t("client_area")}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-300">
                    {t("mobile_my_space")}
                  </p>
                </div>
                <ArrowRight className="relative h-4 w-4 shrink-0 text-brand transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>

              {/* Liens nav principaux */}
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "group flex items-center justify-between rounded-2xl px-4 py-3 text-base font-bold transition-all duration-200",
                          active
                            ? "bg-white/10 text-white"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <span>{t(link.labelKey)}</span>
                        <ArrowRight
                          className={cn(
                            "h-4 w-4 shrink-0 transition-all duration-300",
                            active
                              ? "text-brand opacity-100"
                              : "opacity-0 group-hover:translate-x-0.5 group-hover:opacity-50"
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Section services collapse */}
              <details className="group/srv overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-bold text-white">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                    {t("all_services")}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-300 group-open/srv:rotate-180" />
                </summary>
                <div className="border-t border-white/10 p-2">
                  <div className="grid grid-cols-1 gap-1">
                    {SERVICES.map((s) => {
                      const Icon = s.icon;
                      return (
                        <Link
                          key={s.id}
                          href={`/services/${s.slug}`}
                          className="group/svc flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-white/5"
                        >
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-white/10",
                              s.accent === "orange"
                                ? "bg-brand/15 text-brand"
                                : "bg-nexus-blue-500/15 text-nexus-blue-300"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="flex-1 text-sm font-bold text-slate-200 group-hover/svc:text-white">
                            {s.title}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-500 transition-transform duration-300 group-hover/svc:translate-x-0.5 group-hover/svc:text-brand" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </details>

              {/* Section ressources collapse */}
              <details className="group/res overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-bold text-white">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                    {t("resources")}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-300 group-open/res:rotate-180" />
                </summary>
                <div className="border-t border-white/10 p-2">
                  <div className="grid grid-cols-1 gap-1">
                    {RESOURCE_LINKS.map((r) => {
                      const Icon = r.icon;
                      return (
                        <Link
                          key={r.href}
                          href={r.href}
                          className="group/svc flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-white/5"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-nexus-blue-500/15 text-nexus-blue-300 ring-1 ring-white/10">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="flex-1 text-sm font-bold text-slate-200 group-hover/svc:text-white">
                            {t(r.labelKey)}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-500 transition-transform duration-300 group-hover/svc:translate-x-0.5 group-hover/svc:text-brand" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </details>

              {/* CTA primary */}
              <div className="space-y-2 pt-2">
                <Link
                  href="/demande/complet"
                  className="group/cta relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-brand px-5 py-3.5 text-sm font-bold text-on-brand shadow-[0_12px_30px_-10px_rgba(201,162,39,0.6)] transition-all duration-300 ease-out hover:bg-brand-hover"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                  />
                  <FilePlus className="h-4 w-4" />
                  {t("open_dossier")}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
                </Link>

                <a
                  href={whatsappLink(
                    "Bonjour Nexus, j'aimerais un renseignement."
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300 backdrop-blur-md transition-all duration-300 hover:border-emerald-400/50 hover:bg-emerald-500/15"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t("whatsapp")}
                </a>
              </div>

              {/* Footer info */}
              <p className="pt-4 text-center text-[10px] uppercase tracking-[0.18em] text-slate-500">
                {t("office")}
              </p>
            </div>
          </div>

          {/* Animations CSS */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideDown {
              from { transform: translateY(-100%); opacity: 0.5; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </>
      )}
    </>
  );
}
