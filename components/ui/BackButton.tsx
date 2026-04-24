"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  /** Si fourni, le bouton redirige vers ce chemin au lieu d'utiliser l'historique */
  href?: string;
  /** Texte du bouton (defaut : "Retour") */
  label?: string;
  /** Texte du lien de secours si aucun historique */
  fallbackLabel?: string;
  /** Chemin de secours si l'utilisateur arrive directement (pas d'historique) */
  fallbackHref?: string;
}

export function BackButton({
  href,
  label = "Retour",
  fallbackHref = "/dashboard",
}: BackButtonProps) {
  const router = useRouter();

  // Si un href est fourni explicitement, on utilise un Link simple
  if (href) {
    return (
      <Link
        href={href}
        className="group mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-nexus-orange-300 hover:bg-nexus-orange-50 hover:text-nexus-orange-700 sm:px-5 sm:py-2.5"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        {label}
      </Link>
    );
  }

  // Sinon : bouton intelligent qui tente router.back(), fallback sur fallbackHref
  const handleClick = () => {
    // Verifie s'il y a un historique de navigation dans cette session
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-nexus-orange-300 hover:bg-nexus-orange-50 hover:text-nexus-orange-700 sm:px-5 sm:py-2.5"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      {label}
    </button>
  );
}
