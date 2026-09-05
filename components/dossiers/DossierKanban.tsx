import Link from "next/link";
import { User, Zap } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatCard";
import type { Demande } from "@/types";
import { cn } from "@/lib/utils";

// A5 : vue Kanban sur la machine à états (P3). Colonnes = les 11 états
// actifs (nouvelle_demande → decision_recue) ; les 4 états terminaux
// (termine/refuse/annule/archive) sont regroupés dans une colonne
// "Terminés" — 15 colonnes distinctes sur 16 dossiers réels aurait produit
// des colonnes presque toutes vides, moins lisible qu'utile.
const ACTIVE_COLUMNS: { statut: string; label: string }[] = [
  { statut: "nouvelle_demande", label: "Nouvelle demande" },
  { statut: "qualification", label: "Qualification" },
  { statut: "documents_demandes", label: "Documents demandés" },
  { statut: "dossier_incomplet", label: "Dossier incomplet" },
  { statut: "etude_faisabilite", label: "Étude de faisabilité" },
  { statut: "devis_envoye", label: "Devis envoyé" },
  { statut: "devis_accepte", label: "Devis accepté" },
  { statut: "paiement_attente", label: "Paiement en attente" },
  { statut: "traitement", label: "Traitement" },
  { statut: "transmis_partenaire", label: "Transmis partenaire" },
  { statut: "decision_recue", label: "Décision reçue" },
];
const TERMINAL_STATUTS = ["termine", "refuse", "annule", "archive", "complete"];

interface AgentLite {
  id: string;
  nom: string;
  prenom: string | null;
}

export function DossierKanban({
  demandes,
  agentMap,
  baseDetailHref,
}: {
  demandes: Demande[];
  agentMap: Map<string, AgentLite>;
  baseDetailHref: string;
}) {
  const columns = [
    ...ACTIVE_COLUMNS,
    { statut: "__terminal__", label: "Terminés" },
  ].map((col) => ({
    ...col,
    rows:
      col.statut === "__terminal__"
        ? demandes.filter((d) => TERMINAL_STATUTS.includes(d.statut))
        : demandes.filter((d) => d.statut === col.statut),
  }));

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3" style={{ minWidth: `${columns.length * 260}px` }}>
        {columns.map((col) => (
          <div key={col.statut} className="w-64 shrink-0 rounded-2xl bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{col.label}</p>
              <span className="rounded-full bg-slate-200 px-1.5 text-[11px] tabular-nums text-slate-600">
                {col.rows.length}
              </span>
            </div>
            <div className="space-y-2">
              {col.rows.map((d) => {
                const agent = d.agent_id ? agentMap.get(d.agent_id) : null;
                const ref = d.reference || `NX-${d.id.slice(0, 8).toUpperCase()}`;
                return (
                  <Link
                    key={d.id}
                    href={`${baseDetailHref}/${d.id}`}
                    className={cn(
                      "block rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-nexus-orange-300",
                      !d.agent_id && "border-l-4 border-l-nexus-orange-500"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-nexus-orange-700">{ref}</span>
                      {d.traitement_prioritaire && <Zap className="h-3 w-3 text-rose-500" />}
                    </div>
                    <p className="mt-1 truncate text-xs font-semibold text-nexus-blue-950">{d.nom_complet}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      {col.statut === "__terminal__" && <StatusBadge status={d.statut} />}
                      {agent ? (
                        <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-500">
                          <User className="h-2.5 w-2.5" />
                          {[agent.prenom, agent.nom].filter(Boolean).join(" ")}
                        </span>
                      ) : (
                        <span className="ml-auto text-[10px] font-bold text-nexus-orange-600">Non assigné</span>
                      )}
                    </div>
                  </Link>
                );
              })}
              {col.rows.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 p-3 text-center text-[11px] text-slate-400">
                  Aucun dossier
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
