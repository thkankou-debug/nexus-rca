"use client";

// ============================================================================
// COMPOSANT — Modal d'assignation d'agent
// Liste les agents actifs (charge + spécialités) et permet d'en choisir un.
// ============================================================================

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Star, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIE_META } from "@/lib/demande-categories";
import type { CategorieDossierSlug } from "@/types";
import { cn } from "@/lib/utils";

interface AgentRow {
  id: string;
  nom: string;
  prenom: string | null;
  email: string;
  poste: string | null;
  specialites: string[] | null;
  charge: number;
}

export function AssignAgentModal({
  open,
  onClose,
  demandeId,
  reference,
  categorieSlug,
}: {
  open: boolean;
  onClose: () => void;
  demandeId: string;
  reference: string;
  categorieSlug: CategorieDossierSlug;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [agents, setAgents] = useState<AgentRow[] | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      // 1. Liste agents actifs
      const { data: agentsData } = await supabase
        .from("profiles")
        .select("id, nom, prenom, email, poste, specialites")
        .eq("role", "agent")
        .eq("actif", true);

      if (cancelled) return;

      // 2. Charge (dossiers actifs par agent)
      const { data: chargeRows } = await supabase
        .from("demandes")
        .select("agent_id")
        .in("statut", ["nouveau", "en_cours", "en_traitement"]);

      const chargeMap = new Map<string, number>();
      (chargeRows || []).forEach((r) => {
        const aid = (r as { agent_id: string | null }).agent_id;
        if (!aid) return;
        chargeMap.set(aid, (chargeMap.get(aid) || 0) + 1);
      });

      const rows: AgentRow[] = (agentsData || []).map((a) => {
        const aa = a as {
          id: string;
          nom: string;
          prenom: string | null;
          email: string;
          poste: string | null;
          specialites: string[] | null;
        };
        return {
          id: aa.id,
          nom: aa.nom,
          prenom: aa.prenom,
          email: aa.email,
          poste: aa.poste,
          specialites: aa.specialites,
          charge: chargeMap.get(aa.id) || 0,
        };
      });

      // Tri : spécialistes d'abord, puis par charge ascendante
      rows.sort((a, b) => {
        const aSpec = (a.specialites || []).includes(categorieSlug) ? 1 : 0;
        const bSpec = (b.specialites || []).includes(categorieSlug) ? 1 : 0;
        if (aSpec !== bSpec) return bSpec - aSpec;
        return a.charge - b.charge;
      });

      setAgents(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, supabase, categorieSlug]);

  const handleAssign = async (agentId: string) => {
    setAssigningId(agentId);
    try {
      const res = await fetch(`/api/demandes/${demandeId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: agentId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Assignation impossible");
      }
      toast.success("Agent assigné, emails envoyés");
      onClose();
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setAssigningId(null);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
              Assignation
            </p>
            <h2 className="font-display text-lg font-bold text-nexus-blue-950">
              Choisir un conseiller pour {reference}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {agents === null ? (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement de l&rsquo;équipe…
            </p>
          ) : agents.length === 0 ? (
            <p className="text-sm italic text-slate-500">
              Aucun agent actif disponible.
            </p>
          ) : (
            <ul className="space-y-2">
              {agents.map((a) => {
                const isSpec = (a.specialites || []).includes(categorieSlug);
                const fullName =
                  [a.prenom, a.nom].filter(Boolean).join(" ").trim() || a.email;
                const initials =
                  ((a.prenom?.[0] || "") + (a.nom?.[0] || "")).toUpperCase() ||
                  "NX";
                return (
                  <li
                    key={a.id}
                    className={cn(
                      "rounded-xl border p-4 transition",
                      isSpec
                        ? "border-nexus-orange-300 bg-nexus-orange-50/50"
                        : "border-slate-200 bg-white"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-sm font-bold text-white">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-nexus-blue-950">
                            {fullName}
                          </p>
                          {isSpec && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-nexus-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                              <Star className="h-2.5 w-2.5" />
                              Spécialiste
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {a.poste ? `${a.poste} · ` : ""}
                          {a.email}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                            Charge : {a.charge} dossier{a.charge > 1 ? "s" : ""}
                          </span>
                          {(a.specialites || []).map((s) => {
                            const meta =
                              CATEGORIE_META[s as keyof typeof CATEGORIE_META];
                            return (
                              <span
                                key={s}
                                className={cn(
                                  "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                                  meta?.iconBg || "bg-slate-100",
                                  meta?.iconColor || "text-slate-700"
                                )}
                              >
                                {meta?.shortLabel || s}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAssign(a.id)}
                        disabled={assigningId !== null}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-nexus-orange-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-nexus-orange-600 disabled:opacity-50"
                      >
                        {assigningId === a.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : null}
                        Assigner
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
