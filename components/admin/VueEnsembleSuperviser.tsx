"use client";

// ============================================================================
// DOSSIERS À SUPERVISER — bloc central de la Vue d'ensemble (maquette
// SUPER-ADMIN.png, §2.1) : onglets À affecter / Prioritaires / En retard /
// Tous, recherche, filtres Service / Statut / Agent, colonne Échéance,
// action « Examiner » vers la fiche du module Dossiers unique, pagination.
// « Prioritaire » = urgence critique OU traitement_prioritaire — même
// définition que lib/dossiers-server.ts, pas une nouvelle règle.
// ============================================================================

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Inbox, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SuperviserDossier {
  id: string;
  reference: string | null;
  nom_complet: string;
  service: string;
  statut: string;
  urgence: string | null;
  traitement_prioritaire: boolean;
  deadline: string | null;
  agent_id: string | null;
  agent_nom: string | null;
}

type TabKey = "a_affecter" | "prioritaires" | "en_retard" | "tous";

const TABS: { key: TabKey; label: string }[] = [
  { key: "a_affecter", label: "À affecter" },
  { key: "prioritaires", label: "Prioritaires" },
  { key: "en_retard", label: "En retard" },
  { key: "tous", label: "Tous" },
];

const PAGE_SIZE = 8;

const inputClass =
  "rounded-sm border border-line bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-focus";

function isPrioritaire(d: SuperviserDossier): boolean {
  return d.urgence === "critique" || d.traitement_prioritaire;
}

function isEnRetard(d: SuperviserDossier, today: string): boolean {
  return Boolean(d.deadline && d.deadline < today);
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

export function VueEnsembleSuperviser({ dossiers }: { dossiers: SuperviserDossier[] }) {
  const [tab, setTab] = useState<TabKey>("a_affecter");
  const [query, setQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [page, setPage] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  const services = useMemo(
    () => Array.from(new Set(dossiers.map((d) => d.service))).sort(),
    [dossiers]
  );
  const statuts = useMemo(
    () => Array.from(new Set(dossiers.map((d) => d.statut))).sort(),
    [dossiers]
  );
  const agents = useMemo(() => {
    const byId = new Map<string, string>();
    for (const d of dossiers) {
      if (d.agent_id && d.agent_nom) byId.set(d.agent_id, d.agent_nom);
    }
    return Array.from(byId.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [dossiers]);

  const counts: Record<TabKey, number> = useMemo(
    () => ({
      a_affecter: dossiers.filter((d) => !d.agent_id).length,
      prioritaires: dossiers.filter(isPrioritaire).length,
      en_retard: dossiers.filter((d) => isEnRetard(d, today)).length,
      tous: dossiers.length,
    }),
    [dossiers, today]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dossiers.filter((d) => {
      if (tab === "a_affecter" && d.agent_id) return false;
      if (tab === "prioritaires" && !isPrioritaire(d)) return false;
      if (tab === "en_retard" && !isEnRetard(d, today)) return false;
      if (serviceFilter && d.service !== serviceFilter) return false;
      if (statutFilter && d.statut !== statutFilter) return false;
      if (agentFilter && d.agent_id !== agentFilter) return false;
      if (
        q &&
        !(d.nom_complet.toLowerCase().includes(q) || (d.reference || "").toLowerCase().includes(q))
      )
        return false;
      return true;
    });
  }, [dossiers, tab, query, serviceFilter, statutFilter, agentFilter, today]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  function resetPage() {
    setPage(0);
  }

  return (
    <section className="rounded-sm border border-line bg-surface-elevated p-4">
      <h2 className="font-display text-title text-ink">Dossiers à superviser</h2>

      {/* Onglets */}
      <div className="mt-3 flex flex-wrap gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              resetPage();
            }}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-body-sm font-semibold transition-colors",
              tab === t.key
                ? "border-brand text-ink"
                : "border-transparent text-ink-muted hover:text-ink"
            )}
          >
            {t.label}
            <span className="ml-1.5 text-caption text-ink-subtle [font-variant-numeric:tabular-nums]">
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Recherche + filtres */}
      <div className="mt-3 flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              resetPage();
            }}
            placeholder="Rechercher un dossier, un client…"
            className={cn(inputClass, "w-full pl-9")}
          />
        </div>
        <select
          value={serviceFilter}
          onChange={(e) => {
            setServiceFilter(e.target.value);
            resetPage();
          }}
          className={inputClass}
          aria-label="Filtrer par service"
        >
          <option value="">Service</option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={statutFilter}
          onChange={(e) => {
            setStatutFilter(e.target.value);
            resetPage();
          }}
          className={inputClass}
          aria-label="Filtrer par statut"
        >
          <option value="">Statut</option>
          {statuts.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={agentFilter}
          onChange={(e) => {
            setAgentFilter(e.target.value);
            resetPage();
          }}
          className={inputClass}
          aria-label="Filtrer par agent"
        >
          <option value="">Agent</option>
          {agents.map(([id, nom]) => (
            <option key={id} value={id}>
              {nom}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {pageRows.length === 0 ? (
        <div className="mt-4 rounded-sm border border-dashed border-line px-4 py-10 text-center">
          <Inbox className="mx-auto h-6 w-6 text-ink-subtle" aria-hidden />
          <p className="mt-2 text-body-sm text-ink-muted">
            Aucun dossier ne correspond à cet onglet et ces filtres.
          </p>
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line text-caption font-semibold uppercase tracking-wide text-ink-muted">
                <th className="py-2 pr-3">Référence</th>
                <th className="py-2 pr-3">Client</th>
                <th className="py-2 pr-3">Service</th>
                <th className="py-2 pr-3">Agent</th>
                <th className="py-2 pr-3">Statut</th>
                <th className="py-2 pr-3">Échéance</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pageRows.map((d) => (
                <tr key={d.id}>
                  <td className="py-2.5 pr-3 font-mono text-caption text-ink-muted">
                    {d.reference || "—"}
                  </td>
                  <td className="py-2.5 pr-3 text-body-sm font-medium text-ink">{d.nom_complet}</td>
                  <td className="py-2.5 pr-3 text-body-sm text-ink-muted">{d.service}</td>
                  <td className="py-2.5 pr-3 text-body-sm text-ink-muted">
                    {d.agent_nom || "À affecter"}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className="rounded-sm border border-line px-2 py-0.5 text-caption font-semibold text-ink-muted">
                      {d.statut}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "py-2.5 pr-3 text-body-sm",
                      isEnRetard(d, today) ? "font-semibold text-status-failure" : "text-ink-muted"
                    )}
                  >
                    {formatDate(d.deadline)}
                  </td>
                  <td className="py-2.5">
                    <Link
                      href={`/dashboard/dossiers/${d.id}`}
                      className="rounded-sm border border-line px-3 py-1 text-caption font-semibold text-ink hover:border-line-strong"
                    >
                      Examiner
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <p className="text-caption text-ink-muted">
          {filtered.length} dossier{filtered.length > 1 ? "s" : ""}
          {pageCount > 1 && ` · page ${safePage + 1}/${pageCount}`}
        </p>
        {pageCount > 1 && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPage(Math.max(0, safePage - 1))}
              disabled={safePage === 0}
              className="rounded-sm border border-line p-1.5 text-ink-muted hover:border-line-strong disabled:opacity-40"
              aria-label="Page précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage(Math.min(pageCount - 1, safePage + 1))}
              disabled={safePage >= pageCount - 1}
              className="rounded-sm border border-line p-1.5 text-ink-muted hover:border-line-strong disabled:opacity-40"
              aria-label="Page suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
