import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

// ─── AuthLayout ─────────────────────────────────────────────────────────────
// Layout split-screen partagé pour login + register + accept-invite.
// Mobile : single column (hero compact navy en haut, form en bas).
// Desktop (lg+) : 2 colonnes — navy gauche (5/12) + form blanc droite (7/12).
// ────────────────────────────────────────────────────────────────────────────

export interface ValueProp {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface Props {
  /** Eyebrow + titre + accroche du panneau gauche */
  leftEyebrow: string;
  leftTitle: string;
  leftDescription: string;
  valueProps: ValueProp[];
  /** Header du panneau droit (form) */
  formEyebrow: string;
  formTitle: string;
  formSubtitle?: string;
  /** Le formulaire React */
  children: React.ReactNode;
  /** Lien footer (ex: "Pas encore de compte ? Créer un compte") */
  footerLink: { label: string; href: string; cta: string };
}

export function AuthLayout({
  leftEyebrow,
  leftTitle,
  leftDescription,
  valueProps,
  formEyebrow,
  formTitle,
  formSubtitle,
  children,
  footerLink,
}: Props) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-12">
        {/* ─── Panneau gauche — navy ─────────────────────────────────── */}
        <aside className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 px-6 py-10 text-white lg:col-span-5 lg:px-12 lg:py-16">
          {/* Blob orange ultra discret */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-nexus-orange-500/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-nexus-blue-700/15 blur-3xl"
          />

          <div className="relative flex h-full flex-col">
            {/* Logo */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white transition-opacity hover:opacity-80"
            >
              <Logo variant="light" />
            </Link>

            {/* Bloc central */}
            <div className="my-12 lg:my-auto lg:py-12">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                {leftEyebrow}
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                {leftTitle}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300/90 sm:text-base">
                {leftDescription}
              </p>

              {/* Value props (3 max recommandé) */}
              <ul className="mt-10 space-y-5">
                {valueProps.map((vp, i) => {
                  const Icon = vp.icon;
                  return (
                    <li key={i} className="flex items-start gap-4">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-nexus-orange-300 backdrop-blur">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white">
                          {vp.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                          {vp.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Trust signal bas */}
            <p className="hidden text-[11px] uppercase tracking-[0.18em] text-slate-500 lg:block">
              Bureau Nexus RCA · Bangui · Relais Sica
            </p>
          </div>
        </aside>

        {/* ─── Panneau droit — form ──────────────────────────────────── */}
        <section className="flex items-center justify-center px-6 py-10 lg:col-span-7 lg:px-12 lg:py-16">
          <div className="w-full max-w-md">
            {/* Header form */}
            <div className="mb-8">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-600">
                {formEyebrow}
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-nexus-blue-950 sm:text-3xl">
                {formTitle}
              </h1>
              {formSubtitle && (
                <p className="mt-2 text-sm text-slate-600">{formSubtitle}</p>
              )}
            </div>

            {/* Form slot */}
            {children}

            {/* Trust signal sous form */}
            <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Lock className="h-3 w-3" />
              Connexion sécurisée · Données chiffrées
            </p>

            {/* Footer link */}
            <div className="mt-8 border-t border-slate-200 pt-6 text-center">
              <p className="text-sm text-slate-600">
                {footerLink.label}{" "}
                <Link
                  href={footerLink.href}
                  className="font-semibold text-nexus-orange-600 transition-colors hover:text-nexus-orange-700"
                >
                  {footerLink.cta}
                </Link>
              </p>
              <Link
                href="/"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-nexus-blue-950"
              >
                <ArrowLeft className="h-3 w-3" />
                Retour au site
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
