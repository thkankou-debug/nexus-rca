"use client";

// ============================================================================
// COMPOSANT — Liste agents + édition spécialités (super_admin only)
// Multi-select des 9 catégories par agent.
// ============================================================================

import { useState } from "react";
import toast from "react-hot-toast";
import { Briefcase, Loader2, Save, Star } from "lucide-react";
import { CATEGORIE_META, listCategoriesMeta } from "@/lib/demande-categories";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  nom: string;
  prenom: string | null;
  email: string;
  poste: string | null;
  specialites: string[] | null;
}

const ALL_META = listCategoriesMeta();

export function AgentSpecialitesEditor({ initialAgents }: { initialAgents: Agent[] }) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftSpecs, setDraftSpecs] = useState<string[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  const startEdit = (agent: Agent) => {
    setEditingId(agent.id);
    setDraftSpecs([...(agent.specialites || [])]);
  };

  const toggleSpec = (slug: string) => {
    setDraftSpecs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const save = async (agentId: string) => {
    setSavingId(agentId);
    try {
      const res = await fetch(`/api/agents/${agentId}/specialites`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialites: draftSpecs }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur");
      }
      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId ? { ...a, specialites: data.specialites as string[] } : a
        )
      );
      setEditingId(null);
      toast.success("Spécialités mises à jour");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <ul className="space-y-3">
      {agents.length === 0 && (
        <li className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          Aucun agent actif.
        </li>
      )}

      {agents.map((a) => {
        const isEditing = editingId === a.id;
        const fullName =
          [a.prenom, a.nom].filter(Boolean).join(" ").trim() || a.email;
        const initials =
          ((a.prenom?.[0] || "") + (a.nom?.[0] || "")).toUpperCase() || "NX";
        const currentSpecs = a.specialites || [];

        return (
          <li
            key={a.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-sm font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold text-nexus-blue-950">
                  {fullName}
                </p>
                <p className="text-xs text-slate-500">
                  {a.email}
                  {a.poste ? ` · ${a.poste}` : ""}
                </p>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => startEdit(a)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-nexus-blue-950 hover:bg-slate-50"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  Modifier les spécialités
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="mt-3">
                {currentSpecs.length === 0 ? (
                  <p className="text-xs italic text-slate-500">
                    Aucune spécialité configurée — l&rsquo;agent recevra les dossiers via le round-robin général.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {currentSpecs.map((s) => {
                      const meta =
                        CATEGORIE_META[s as keyof typeof CATEGORIE_META];
                      if (!meta) return null;
                      const Icon = meta.icon;
                      return (
                        <span
                          key={s}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold",
                            meta.iconBg,
                            meta.iconColor
                          )}
                        >
                          <Icon className="h-3 w-3" />
                          {meta.shortLabel}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Sélectionnez ses catégories de spécialité
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {ALL_META.map((meta) => {
                    const checked = draftSpecs.includes(meta.slug);
                    const Icon = meta.icon;
                    return (
                      <button
                        key={meta.slug}
                        type="button"
                        onClick={() => toggleSpec(meta.slug)}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border p-2.5 text-left transition",
                          checked
                            ? "border-nexus-orange-400 bg-nexus-orange-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                            meta.iconBg
                          )}
                        >
                          <Icon className={cn("h-4 w-4", meta.iconColor)} />
                        </span>
                        <span className="min-w-0 flex-1 text-xs font-semibold text-nexus-blue-950">
                          {meta.shortLabel}
                        </span>
                        {checked && (
                          <Star className="h-3.5 w-3.5 shrink-0 text-nexus-orange-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => save(a.id)}
                    disabled={savingId === a.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-nexus-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-nexus-orange-600 disabled:opacity-50"
                  >
                    {savingId === a.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Enregistrer
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
