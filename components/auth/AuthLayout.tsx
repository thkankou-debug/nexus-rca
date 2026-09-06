import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

// ─── AuthLayout — Premium tech ──────────────────────────────────────────────
// Split-screen partagé : login + register + accept-invite.
// Mobile : single column. Desktop (lg+) : 2 cols (5/12 navy + 7/12 form).
// Direction : Stripe + Arc — dot grid subtil, glows agrandis, micro-anims.
// ────────────────────────────────────────────────────────────────────────────

const DOT_GRID_STYLE: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

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
        {/* ─── Panneau gauche — navy Premium tech ─────────────────────── */}
        <aside className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 px-6 py-10 text-white lg:col-span-5 lg:px-12 lg:py-16">
          {/* Dot grid pattern (Stripe-like) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.5]"
            style={DOT_GRID_STYLE}
          />
          {/* Blobs glow agrandis */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/12 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-20 h-[24rem] w-[24rem] rounded-full bg-nexus-blue-500/15 blur-[100px]"
          />

          <div className="relative flex h-full flex-col">
            {/* Logo */}
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-white transition-opacity duration-300 hover:opacity-90"
            >
              <Logo variant="light" />
            </Link>

            {/* Bloc central */}
            <div className="my-12 lg:my-auto lg:py-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md transition-all duration-300 hover:border-nexus-orange-500/40 hover:bg-white/10">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
                </span>
                {leftEyebrow}
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold leading-[1.1] tracking-tight text-white sm:text-3xl lg:text-4xl">
                {leftTitle}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300/95 sm:text-base">
                {leftDescription}
              </p>

              {/* Value props (3 max recommandé) — micro-hover */}
              <ul className="mt-10 space-y-3">
                {valueProps.map((vp, i) => {
                  const Icon = vp.icon;
                  return (
                    <li
                      key={i}
                      className="group/vp -mx-2 flex items-start gap-4 rounded-2xl px-2 py-2.5 transition-all duration-300 hover:bg-white/5"
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-nexus-orange-300 backdrop-blur-md transition-all duration-300 ease-out group-hover/vp:bg-white/15 group-hover/vp:text-nexus-orange-200">
                        <Icon className="h-4 w-4 transition-transform duration-300 ease-out group-hover/vp:scale-110" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white">
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
              Bureau Nexus RCA · Bangui · Croisement Marabena
            </p>
          </div>
        </aside>

        {/* ─── Panneau droit — form Premium tech ──────────────────────── */}
        <section className="relative flex items-center justify-center px-6 py-10 lg:col-span-7 lg:px-12 lg:py-16">
          {/* Subtle glow accent qui suit le form */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute right-1/4 top-1/3 h-72 w-72 rounded-full bg-nexus-orange-500/4 blur-[100px]" />
          </div>

          <div className="relative w-full max-w-md">
            {/* Header form */}
            <div className="mb-8">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                {formEyebrow}
              </span>
              <h1 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-3xl">
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
                  className="font-bold text-nexus-orange-600 transition-colors duration-200 hover:text-nexus-orange-700"
                >
                  {footerLink.cta}
                </Link>
              </p>
              <Link
                href="/"
                className="group mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors duration-200 hover:text-nexus-blue-950"
              >
                <ArrowLeft className="h-3 w-3 transition-transform duration-300 ease-out group-hover:-translate-x-0.5" />
                Retour au site
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
