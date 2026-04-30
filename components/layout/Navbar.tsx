"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  MessageCircle,
  FilePlus,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { SERVICES } from "@/lib/services";
import { cn, whatsappLink } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/services", label: "Services", hasDropdown: true },
  { href: "/services/nexus-ia", label: "Nexus IA 🤖" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
  { href: "/rendez-vous", label: "Rendez-vous" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-lg shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <Logo variant={scrolled ? "dark" : "light"} />

        {/* Desktop nav — liens principaux */}
        <ul className="hidden items-center gap-0.5 lg:flex xl:gap-1">
          {NAV_LINKS.map((link) => (
            <li
              key={link.href}
              className="relative"
              onMouseEnter={() => link.hasDropdown && setServicesOpen(true)}
              onMouseLeave={() => link.hasDropdown && setServicesOpen(false)}
            >
              <Link
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors xl:px-4",
                  scrolled
                    ? "text-nexus-blue-900 hover:bg-nexus-blue-50"
                    : "text-white hover:bg-white/10"
                )}
              >
                {link.label}
                {link.hasDropdown && <ChevronDown className="h-3.5 w-3.5" />}
              </Link>

              {link.hasDropdown && servicesOpen && (
                <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2">
                  <div className="w-[520px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                    <div className="mb-3 border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
                      Nos services
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {SERVICES.map((s) => {
                        const Icon = s.icon;
                        return (
                          <Link
                            key={s.id}
                            href={`/services/${s.slug}`}
                            className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-nexus-blue-50"
                          >
                            <div
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                                s.accent === "orange"
                                  ? "bg-nexus-orange-100 text-nexus-orange-600"
                                  : "bg-nexus-blue-100 text-nexus-blue-700"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-nexus-blue-900 group-hover:text-nexus-orange-600">
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
        </ul>

        {/* Desktop nav — actions a droite */}
        <div className="hidden items-center gap-1 lg:flex xl:gap-2">
          {/* NOUVEAU : NEXUS CONNECT - lien premium avec accent orange */}
          <Link
            href="/nexus-connect"
            className={cn(
              "group inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold transition-all xl:px-4",
              scrolled
                ? "bg-gradient-to-r from-nexus-blue-950 to-nexus-blue-800 text-white hover:shadow-lg hover:shadow-nexus-blue-900/30"
                : "border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20"
            )}
          >
            <Sparkles className="h-4 w-4 text-nexus-orange-400" />
            NEXUS CONNECT
          </Link>

          <Link
            href="/login"
            className={cn(
              "whitespace-nowrap px-3 py-2 text-sm font-semibold transition-colors",
              scrolled
                ? "text-nexus-blue-900 hover:text-nexus-orange-600"
                : "text-white hover:text-nexus-orange-300"
            )}
          >
            Connexion
          </Link>

          <Link
            href="/demande/complet"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-nexus-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 transition hover:bg-nexus-orange-600"
          >
            <FilePlus className="h-4 w-4" />
            Ouvrir un dossier
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className={cn(
            "rounded-lg p-2 lg:hidden",
            scrolled ? "text-nexus-blue-900" : "text-white"
          )}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-4 py-3 text-base font-semibold text-nexus-blue-900 hover:bg-nexus-blue-50"
              >
                {link.label}
              </Link>
            ))}

            {/* NOUVEAU : NEXUS CONNECT mobile - bandeau premium */}
            <Link
              href="/nexus-connect"
              className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-nexus-blue-950 to-nexus-blue-800 px-4 py-3 text-white shadow-lg"
            >
              <Sparkles className="h-5 w-5 text-nexus-orange-400" />
              <div className="flex-1">
                <div className="text-sm font-bold">NEXUS CONNECT</div>
                <div className="text-xs text-slate-300">Mon espace personnel</div>
              </div>
            </Link>

            <div className="my-2 border-t border-slate-200" />

            <details className="rounded-lg">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-nexus-blue-700">
                Tous les services
              </summary>
              <div className="space-y-1 pl-3">
                {SERVICES.map((s) => (
                  <Link
                    key={s.id}
                    href={`/services/${s.slug}`}
                    className="block rounded-lg px-4 py-2 text-sm text-slate-700 hover:bg-nexus-blue-50"
                  >
                    {s.title}
                  </Link>
                ))}
              </div>
            </details>

            <div className="flex flex-col gap-2 pt-3">
              <Link
                href="/demande/complet"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-nexus-orange-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-nexus-orange-600"
              >
                <FilePlus className="h-4 w-4" />
                Ouvrir un dossier
              </Link>

              <Button href="/login" variant="ghost" size="sm">
                Connexion
              </Button>

              <Button
                href={whatsappLink("Bonjour Nexus, j'aimerais un renseignement.")}
                external
                size="sm"
                variant="secondary"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
