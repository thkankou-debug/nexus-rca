import { CalendarCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface DossierAppointment {
  id: string;
  reference: string | null;
  rdv_date: string;
  rdv_heure: string;
  statut: string;
  service_type: string | null;
}

// A5 : appointments n'a AUCUNE colonne demande_id (verifie sur le schema
// reel) — le lien le plus proche disponible est client_id. Correspondance
// approchee, assumee et affichee comme telle (« du meme client »), pas un
// lien dossier garanti.
export function DossierRendezVousTab({ appointments }: { appointments: DossierAppointment[] }) {
  if (appointments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <CalendarCheck className="mx-auto h-6 w-6 text-slate-400" />
        <p className="mt-3 text-sm text-slate-500">Aucun rendez-vous pour ce client.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs text-slate-500">
        Rendez-vous du même client (aucun lien direct au dossier n&apos;existe dans le schéma —
        <code className="mx-1 font-mono">appointments</code> ne référence pas{" "}
        <code className="font-mono">demandes</code>).
      </p>
      <ul className="space-y-2">
        {appointments.map((a) => (
          <li key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-nexus-orange-700">
                {a.reference ?? a.id.slice(0, 8)}
              </span>
              <span className="text-sm font-bold text-nexus-blue-950">
                {formatDate(a.rdv_date)} · {a.rdv_heure}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {a.service_type ?? "Service non précisé"} · {a.statut}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
