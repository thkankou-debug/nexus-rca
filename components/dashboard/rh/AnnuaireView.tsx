"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Mail, Phone, Calendar, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Employee } from "@/types";
import { formatDateShort } from "./format";

interface AnnuaireViewProps {
  employees: Employee[];
  basePath: string;
}

// Couleurs par département (rotation déterministe)
const DEPT_TONES = [
  "bg-nexus-blue-100 text-nexus-blue-800 ring-nexus-blue-200",
  "bg-nexus-orange-100 text-nexus-orange-700 ring-nexus-orange-200",
  "bg-emerald-100 text-emerald-800 ring-emerald-200",
  "bg-purple-100 text-purple-800 ring-purple-200",
  "bg-amber-100 text-amber-800 ring-amber-200",
  "bg-rose-100 text-rose-800 ring-rose-200",
  "bg-sky-100 text-sky-800 ring-sky-200",
];

function deptTone(dept: string): string {
  let h = 0;
  for (let i = 0; i < dept.length; i++) {
    h = (h * 31 + dept.charCodeAt(i)) >>> 0;
  }
  return DEPT_TONES[h % DEPT_TONES.length];
}

function initials(nomComplet: string): string {
  const parts = nomComplet.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ancienneteLabel(dateEmbauche: string | null): string {
  if (!dateEmbauche) return "—";
  const d = new Date(dateEmbauche);
  if (Number.isNaN(d.getTime())) return "—";
  const years = (Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (years < 1) {
    const months = Math.max(1, Math.round(years * 12));
    return `${months} mois`;
  }
  return `${years.toFixed(1)} an${years >= 2 ? "s" : ""}`;
}

export function AnnuaireView({ employees, basePath }: AnnuaireViewProps) {
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState<string>("all");

  const departements = useMemo(() => {
    const set = new Set(employees.map((e) => e.departement).filter(Boolean));
    return Array.from(set).sort();
  }, [employees]);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      if (filterDept !== "all" && e.departement !== filterDept) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = [
          e.nom_complet,
          e.email,
          e.poste,
          e.departement,
          e.telephone ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [employees, search, filterDept]);

  return (
    <div>
      {/* Filtres */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher nom, poste, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <ChipBtn
            active={filterDept === "all"}
            onClick={() => setFilterDept("all")}
            label={`Tous (${employees.length})`}
          />
          {departements.map((d) => {
            const count = employees.filter((e) => e.departement === d).length;
            return (
              <ChipBtn
                key={d}
                active={filterDept === d}
                onClick={() => setFilterDept(d)}
                label={`${d} (${count})`}
              />
            );
          })}
        </div>
      </div>

      {/* Grid cards */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-100/80">
          Aucun collaborateur trouvé.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => {
            const tone = deptTone(e.departement || "—");
            return (
              <article
                key={e.id}
                className="group relative flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 transition hover:-translate-y-0.5 hover:border-nexus-orange-200 hover:shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-blue-900 text-base font-bold text-white shadow-sm">
                    {initials(e.nom_complet)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-bold text-nexus-blue-950">
                      {e.nom_complet}
                    </p>
                    <p className="truncate text-xs text-slate-500">{e.poste}</p>
                    {e.departement && (
                      <span
                        className={cn(
                          "mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
                          tone
                        )}
                      >
                        {e.departement}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  <a
                    href={`mailto:${e.email}`}
                    className="flex items-center gap-2 truncate transition hover:text-nexus-orange-600"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{e.email}</span>
                  </a>
                  {e.telephone && (
                    <a
                      href={`tel:${e.telephone}`}
                      className="flex items-center gap-2 transition hover:text-nexus-orange-600"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>{e.telephone}</span>
                    </a>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>
                      Depuis {formatDateShort(e.date_embauche)}{" "}
                      <span className="text-slate-400">
                        · {ancienneteLabel(e.date_embauche)}
                      </span>
                    </span>
                  </div>
                </div>

                <Link
                  href={`${basePath}/employes/${e.id}`}
                  className="mt-4 inline-flex items-center gap-1 self-start text-xs font-semibold text-nexus-orange-600 hover:underline"
                >
                  Voir fiche <ArrowUpRight className="h-3 w-3" />
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChipBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        active
          ? "border-nexus-blue-950 bg-nexus-blue-950 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-nexus-orange-300 hover:text-nexus-orange-700"
      )}
    >
      {label}
    </button>
  );
}
