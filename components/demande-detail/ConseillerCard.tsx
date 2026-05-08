import Link from "next/link";
import { Calendar, Mail, MessageCircle, UserCircle } from "lucide-react";

/**
 * Card conseiller assigné — server component.
 */
export function ConseillerCard({
  agent,
  demandeRef,
}: {
  agent: {
    id: string;
    nom: string | null;
    prenom: string | null;
    email: string | null;
    telephone: string | null;
    poste: string | null;
    avatar_url: string | null;
  } | null;
  demandeRef: string;
}) {
  if (!agent) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <UserCircle className="h-3.5 w-3.5 text-nexus-orange-500" />
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Conseiller
          </p>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          Un conseiller vous sera bientôt assigné. Vous serez informé(e)
          dès qu&rsquo;il prendra en charge votre dossier.
        </p>
      </div>
    );
  }

  const fullName = [agent.prenom, agent.nom].filter(Boolean).join(" ").trim();
  const initials =
    ((agent.prenom?.[0] || "") + (agent.nom?.[0] || "")).toUpperCase() ||
    "NX";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-br from-nexus-blue-950 to-nexus-blue-800 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
          Conseiller dossier
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-base font-bold text-white shadow-md">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-white">{fullName}</p>
            {agent.poste && (
              <p className="mt-0.5 truncate text-xs text-slate-300">
                {agent.poste}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-2 p-4">
        {agent.email && (
          <a
            href={`mailto:${agent.email}?subject=${encodeURIComponent(`Dossier ${demandeRef}`)}`}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-nexus-orange-300 hover:bg-nexus-orange-50"
          >
            <Mail className="h-3.5 w-3.5 text-nexus-orange-500" />
            {agent.email}
          </a>
        )}
        <Link
          href={`/dashboard/client/rdv/nouveau?conseiller=${agent.id}`}
          className="flex items-center justify-center gap-2 rounded-lg bg-nexus-blue-950 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-nexus-blue-900"
        >
          <Calendar className="h-3.5 w-3.5" />
          Prendre rendez-vous
        </Link>
        <a
          href="#messages"
          className="flex items-center justify-center gap-2 rounded-lg border border-nexus-orange-300 bg-nexus-orange-50 px-3 py-2 text-xs font-semibold text-nexus-orange-700 transition hover:bg-nexus-orange-100"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Envoyer un message
        </a>
      </div>
    </div>
  );
}
