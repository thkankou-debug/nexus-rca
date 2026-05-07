"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Employee, EmployeeStatut } from "@/types";
import { formatFcfa } from "./format";

interface EmployeesListViewProps {
  /** Préfixe des routes (ex: "/dashboard/super-admin/rh" ou "/dashboard/admin/rh") */
  basePath: string;
}

const STATUT_BADGE: Record<EmployeeStatut, string> = {
  actif: "bg-emerald-100 text-emerald-700",
  inactif: "bg-slate-100 text-slate-600",
  suspendu: "bg-amber-100 text-amber-800",
  parti: "bg-rose-100 text-rose-700",
};

const STATUT_LABEL: Record<EmployeeStatut, string> = {
  actif: "Actif",
  inactif: "Inactif",
  suspendu: "Suspendu",
  parti: "Parti",
};

export function EmployeesListView({ basePath }: EmployeesListViewProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterDepartement, setFilterDepartement] = useState<string>("all");
  const [filterStatut, setFilterStatut] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/rh/employees")
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) {
          setEmployees(json.employees as Employee[]);
        } else {
          setError(json.error || "Erreur de chargement");
        }
      })
      .catch((e) => {
        console.error("[RH_EMPLOYEES_LIST] fetch", e);
        setError((e as Error).message);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const departements = useMemo(() => {
    const set = new Set(employees.map((e) => e.departement).filter(Boolean));
    return Array.from(set).sort();
  }, [employees]);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      if (filterDepartement !== "all" && e.departement !== filterDepartement)
        return false;
      if (filterStatut !== "all" && e.statut !== filterStatut) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = [e.nom_complet, e.email, e.poste, e.departement]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [employees, filterDepartement, filterStatut, search]);

  return (
    <div>
      {/* Header avec actions */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher nom, email, poste…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
            />
          </div>
          <select
            value={filterDepartement}
            onChange={(e) => setFilterDepartement(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm"
          >
            <option value="all">Tous les départements</option>
            {departements.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm"
          >
            <option value="all">Tous les statuts</option>
            {(Object.keys(STATUT_LABEL) as EmployeeStatut[]).map((s) => (
              <option key={s} value={s}>
                {STATUT_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        <Link
          href={`${basePath}/employes/nouveau`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600"
        >
          <Plus className="h-4 w-4" />
          Nouvel employé
        </Link>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Aucun employé trouvé.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Poste</th>
                <th className="px-4 py-3">Département</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Salaire base</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-nexus-blue-950">
                      {e.nom_complet}
                    </p>
                    <p className="text-xs text-slate-500">{e.email}</p>
                  </td>
                  <td className="px-4 py-3 text-nexus-blue-950">{e.poste}</td>
                  <td className="px-4 py-3 text-slate-600">{e.departement}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        STATUT_BADGE[e.statut]
                      )}
                    >
                      {STATUT_LABEL[e.statut]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-nexus-blue-950">
                    {formatFcfa(e.salaire_base)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`${basePath}/employes/${e.id}`}
                      className="text-xs font-semibold text-nexus-orange-600 hover:underline"
                    >
                      Détail →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
