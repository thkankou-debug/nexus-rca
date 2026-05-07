"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Employee, Payslip, PayslipStatut } from "@/types";
import { formatFcfa, formatDateShort } from "./format";
import { PayslipStatusBadge, PAYSLIP_STATUS_LABELS } from "./PayslipStatusBadge";

interface PayslipsListViewProps {
  basePath: string;
}

type PayslipWithEmployee = Payslip & {
  employees?: Pick<Employee, "id" | "nom_complet" | "poste" | "departement" | "email"> | null;
};

const STATUT_KEYS: PayslipStatut[] = [
  "brouillon",
  "en_attente_validation",
  "validee",
];

export function PayslipsListView({ basePath }: PayslipsListViewProps) {
  const [payslips, setPayslips] = useState<PayslipWithEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatut, setFilterStatut] = useState<"all" | PayslipStatut>("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/rh/payslips")
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) {
          setPayslips(json.payslips as PayslipWithEmployee[]);
        } else {
          setError(json.error || "Erreur de chargement");
        }
      })
      .catch((e) => {
        console.error("[RH_PAYSLIPS_LIST] fetch", e);
        setError((e as Error).message);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (filterStatut === "all") return payslips;
    return payslips.filter((p) => p.statut === filterStatut);
  }, [payslips, filterStatut]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filtre statut en chips */}
        <div className="flex flex-wrap gap-2">
          <ChipBtn
            active={filterStatut === "all"}
            onClick={() => setFilterStatut("all")}
            label={`Toutes (${payslips.length})`}
          />
          {STATUT_KEYS.map((s) => {
            const count = payslips.filter((p) => p.statut === s).length;
            return (
              <ChipBtn
                key={s}
                active={filterStatut === s}
                onClick={() => setFilterStatut(s)}
                label={`${PAYSLIP_STATUS_LABELS[s]} (${count})`}
              />
            );
          })}
        </div>

        <Link
          href={`${basePath}/paie/nouvelle`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600"
        >
          <Plus className="h-4 w-4" />
          Nouvelle fiche
        </Link>
      </div>

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
          Aucune fiche de paie.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Employé</th>
                <th className="px-4 py-3">Période</th>
                <th className="px-4 py-3 text-right">Brut</th>
                <th className="px-4 py-3 text-right">Net</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-nexus-blue-950">
                    {p.reference}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-nexus-blue-950">
                      {p.employees?.nom_complet ?? "—"}
                    </p>
                    {p.employees?.poste && (
                      <p className="text-xs text-slate-500">
                        {p.employees.poste}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p>{p.mois_libelle}</p>
                    <p className="text-xs text-slate-400">
                      {formatDateShort(p.periode_debut)} →{" "}
                      {formatDateShort(p.periode_fin)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-slate-700">
                    {formatFcfa(p.salaire_brut)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-nexus-blue-950">
                    {formatFcfa(p.salaire_net)}
                  </td>
                  <td className="px-4 py-3">
                    <PayslipStatusBadge status={p.statut} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`${basePath}/paie/${p.id}`}
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
