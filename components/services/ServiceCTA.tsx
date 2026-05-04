import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/utils";

interface ServiceCTAProps {
  title?: string;
  subtitle?: string;
  /** Nouvelle prop (utilisée dans les pages services) */
  ctaLabel?: string;
  /** Ancienne prop — conservée pour compatibilité */
  buttonLabel?: string;
  /** Nouvelle prop (alternative) */
  ctaHref?: string;
  /** Ancienne prop — conservée pour compatibilité */
  buttonHref?: string;
  whatsappMessage?: string;
}

export function ServiceCTA({
  title = "Prêt à démarrer votre dossier ?",
  subtitle = "Parlez à notre équipe et lancez votre demande complète dès aujourd'hui.",
  ctaLabel,
  buttonLabel,
  ctaHref,
  buttonHref,
  whatsappMessage = "Bonjour Nexus RCA, je veux démarrer mon dossier.",
}: ServiceCTAProps) {
  const label = ctaLabel ?? buttonLabel ?? "Démarrer mon dossier";
  const href = ctaHref ?? buttonHref ?? "/demande/complet";

  return (
    <section className="bg-nexus-blue-950 py-16 text-white">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-elev-4 backdrop-blur sm:p-10">
          {/* Décor : mesh + grain pour donner du relief */}
          <div className="pointer-events-none absolute inset-0 bg-mesh-gradient opacity-40" />
          <div className="grain pointer-events-none absolute inset-0 opacity-15" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-display-md text-white sm:text-display-lg">
                {title}
              </h2>
              <p className="mt-3 text-body-lg text-slate-300">{subtitle}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={href}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-body-sm font-semibold text-white shadow-elev-3 transition hover:bg-brand-hover hover:shadow-glow-orange"
              >
                {label}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href={whatsappLink(whatsappMessage)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-body-sm font-semibold text-white transition hover:bg-white/10"
              >
                <MessageCircle className="h-5 w-5" />
                Parler sur WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
