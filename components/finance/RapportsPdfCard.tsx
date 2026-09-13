"use client";

// ============================================================================
// RAPPORTS PDF — carte de téléchargement à la demande (L9 résiduel, 13/09/2026)
// Branchée sur Trésorerie (DAF) et Pilotage (DG). Appelle GET /api/rapports
// (journalier | mensuel | annuel) — le serveur agrège, génère et streame le
// PDF ; rien n'est stocké. Actions secondaires : style neutre, pas d'or (A1).
// ============================================================================

import { useState } from "react";
import { Download } from "lucide-react";

const inputClass =
  "rounded-sm border border-line bg-surface px-2.5 py-1.5 text-body-sm text-ink focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/25";
const buttonClass =
  "inline-flex items-center gap-1.5 rounded-sm border border-line bg-surface px-3 py-1.5 text-body-sm font-semibold text-ink transition-colors duration-150 hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-focus";

function todayLocal(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function RapportsPdfCard() {
  const aujourdHui = todayLocal();
  const anneeCourante = Number(aujourdHui.slice(0, 4));
  const moisCourant = aujourdHui.slice(0, 7); // YYYY-MM

  const [dateJour, setDateJour] = useState(aujourdHui);
  const [mois, setMois] = useState(moisCourant);
  const [annee, setAnnee] = useState(anneeCourante);

  const annees: number[] = [];
  for (let a = anneeCourante; a >= 2025; a--) annees.push(a);

  const ouvrir = (url: string) => {
    window.open(url, "_blank", "noopener");
  };

  return (
    <section className="rounded-sm border border-line bg-surface-elevated p-4">
      <h2 className="font-display text-title text-ink">Rapports PDF</h2>
      <p className="mt-1 text-caption text-ink-muted">
        Générés à la demande sur les données réelles — même contenu que le
        rapport mensuel archivé (revenus, dépenses, caisse, créances, agents).
      </p>

      <div className="mt-3 space-y-2.5">
        {/* Journalier */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-24 text-body-sm font-semibold text-ink">Journalier</span>
          <input
            type="date"
            value={dateJour}
            max={aujourdHui}
            onChange={(e) => setDateJour(e.target.value)}
            className={inputClass}
            aria-label="Date du rapport journalier"
          />
          <button
            type="button"
            className={buttonClass}
            onClick={() => ouvrir(`/api/rapports?type=journalier&date=${dateJour}`)}
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </button>
        </div>

        {/* Mensuel */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-24 text-body-sm font-semibold text-ink">Mensuel</span>
          <input
            type="month"
            value={mois}
            max={moisCourant}
            onChange={(e) => setMois(e.target.value)}
            className={inputClass}
            aria-label="Mois du rapport mensuel"
          />
          <button
            type="button"
            className={buttonClass}
            onClick={() => {
              const [a, m] = mois.split("-");
              ouvrir(`/api/rapports?type=mensuel&annee=${a}&mois=${Number(m)}`);
            }}
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </button>
        </div>

        {/* Annuel */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-24 text-body-sm font-semibold text-ink">Annuel</span>
          <select
            value={annee}
            onChange={(e) => setAnnee(Number(e.target.value))}
            className={inputClass}
            aria-label="Année du rapport annuel"
          >
            {annees.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={buttonClass}
            onClick={() => ouvrir(`/api/rapports?type=annuel&annee=${annee}`)}
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </button>
        </div>
      </div>
    </section>
  );
}
