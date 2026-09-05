import Link from "next/link";
import { ArrowLeft, Phone, Mail } from "lucide-react";

export const metadata = {
  title: "Lien remplacé - Nexus RCA",
};

// Migration 034/P1b point 5 : cette route est neutralisée. La référence
// séquentielle (PAY-LINK-YYYY-NNNNNN) était énumérable et ne pouvait pas
// rester le seul secret protégeant l'accès public à un paiement — voir
// docs/RLS_ETAT_REEL.md et 033_hotfix_securite.sql. Le nouveau flux public
// vit sur /payer/t/[token] (jeton non déductible).
//
// Volontairement, cette page ne consulte JAMAIS la base de données : un
// 200 partout, y compris pour une référence qui n'existe pas, empêche
// quiconque de déduire par essais successifs quelles références sont
// valides (un simple 404 différencié serait déjà une fuite d'information).
export default function PaymentReferencePage({
  params,
}: {
  params: { reference: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-nexus-blue-950 px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white p-8 text-center shadow-2xl sm:p-10">
        <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
          Ce lien a été remplacé
        </h1>
        <p className="mt-4 text-slate-600">
          Pour votre sécurité, ce mode de paiement n&apos;est plus utilisé.
          Contactez votre conseiller Nexus RCA en indiquant la référence
          ci-dessous : il vous transmettra un nouveau lien de paiement.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Référence
          </p>
          <p className="mt-1 font-mono text-lg font-bold text-nexus-blue-950">
            {params.reference}
          </p>
        </div>

        <div className="mt-6 space-y-2 text-sm text-slate-600">
          <p className="flex items-center justify-center gap-2">
            <Phone className="h-4 w-4 text-nexus-orange-500" />
            <a href="https://wa.me/23673269692" className="hover:text-nexus-orange-600">
              +236 73 26 96 92 (WhatsApp)
            </a>
          </p>
          <p className="flex items-center justify-center gap-2">
            <Mail className="h-4 w-4 text-nexus-orange-500" />
            <a href="mailto:contact@nexusrca.com" className="hover:text-nexus-orange-600">
              contact@nexusrca.com
            </a>
          </p>
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-nexus-blue-950"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour à l&apos;accueil Nexus RCA
        </Link>
      </div>
    </div>
  );
}
