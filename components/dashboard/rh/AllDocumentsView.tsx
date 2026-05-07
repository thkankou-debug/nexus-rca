"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, FileText, Download, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Employee, HrDocument, HrDocumentType } from "@/types";
import { HR_DOCUMENT_SUBCATEGORIES } from "@/types";
import { HrDocumentTypeBadge, HR_DOCUMENT_TYPE_LABELS } from "./HrDocumentTypeBadge";
import { formatDateShort } from "./format";

interface AllDocumentsViewProps {
  basePath: string;
}

type DocWithEmployee = HrDocument & {
  employees?: Pick<Employee, "id" | "nom_complet" | "poste"> | null;
};

const TYPE_KEYS: HrDocumentType[] = ["contrat", "diplome", "piece_identite", "autre"];

export function AllDocumentsView({ basePath }: AllDocumentsViewProps) {
  const [documents, setDocuments] = useState<DocWithEmployee[]>([]);
  const [employees, setEmployees] = useState<Map<string, Employee>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | HrDocumentType>("all");
  const [filterSubcategory, setFilterSubcategory] = useState<"all" | string>("all");
  const [search, setSearch] = useState("");

  // Reset subcategory quand on change de type
  useEffect(() => {
    setFilterSubcategory("all");
  }, [filterType]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch("/api/rh/documents").then((r) => r.json()),
      fetch("/api/rh/employees").then((r) => r.json()),
    ])
      .then(([docs, emps]) => {
        if (cancelled) return;
        if (!docs.success) throw new Error(docs.error || "Erreur documents");
        if (!emps.success) throw new Error(emps.error || "Erreur employés");
        const empMap = new Map<string, Employee>();
        (emps.employees as Employee[]).forEach((e) => empMap.set(e.id, e));
        setEmployees(empMap);
        // Enrichit les documents avec l'objet employé
        const enriched = (docs.documents as HrDocument[]).map((d) => ({
          ...d,
          employees: empMap.get(d.employee_id)
            ? {
                id: empMap.get(d.employee_id)!.id,
                nom_complet: empMap.get(d.employee_id)!.nom_complet,
                poste: empMap.get(d.employee_id)!.poste,
              }
            : null,
        }));
        setDocuments(enriched);
      })
      .catch((e) => {
        console.error("[RH_ALL_DOCS] fetch", e);
        setError((e as Error).message);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      if (filterType !== "all" && d.type !== filterType) return false;
      if (filterSubcategory !== "all" && d.subcategory !== filterSubcategory) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const hay = [
          d.nom,
          d.description ?? "",
          d.subcategory ?? "",
          d.employees?.nom_complet ?? "",
          d.employees?.poste ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [documents, filterType, filterSubcategory, search]);

  // Sub-categories disponibles pour le type sélectionné (intersect type-doc + presence in current data)
  const availableSubcategories = useMemo(() => {
    if (filterType === "all") return [];
    const declared = HR_DOCUMENT_SUBCATEGORIES[filterType] ?? [];
    const presentInDocs = new Set<string>();
    documents.forEach((d) => {
      if (d.type === filterType && d.subcategory) {
        presentInDocs.add(d.subcategory);
      }
    });
    // On affiche : déclarées ∪ présentes (pour couvrir "autre" en libre)
    const set = new Set<string>([...declared, ...presentInDocs]);
    return Array.from(set);
  }, [filterType, documents]);

  const subcategoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    documents.forEach((d) => {
      if (filterType !== "all" && d.type !== filterType) return;
      if (d.subcategory) {
        counts.set(d.subcategory, (counts.get(d.subcategory) ?? 0) + 1);
      }
    });
    return counts;
  }, [filterType, documents]);

  const handleDownload = async (docId: string) => {
    try {
      const r = await fetch(`/api/rh/documents/${docId}/url`);
      const json = await r.json();
      if (!json.success || !json.url) {
        alert(json.error || "Erreur lors de la génération du lien");
        return;
      }
      window.open(json.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error("[RH_ALL_DOCS] download", e);
      alert("Erreur de téléchargement");
    }
  };

  const counts = useMemo(() => {
    const byType: Record<HrDocumentType | "all", number> = {
      all: documents.length,
      contrat: 0,
      diplome: 0,
      piece_identite: 0,
      autre: 0,
    };
    documents.forEach((d) => {
      byType[d.type] = (byType[d.type] ?? 0) + 1;
    });
    return byType;
  }, [documents]);

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <ChipBtn
            active={filterType === "all"}
            onClick={() => setFilterType("all")}
            label={`Tous (${counts.all})`}
          />
          {TYPE_KEYS.map((t) => (
            <ChipBtn
              key={t}
              active={filterType === t}
              onClick={() => setFilterType(t)}
              label={`${HR_DOCUMENT_TYPE_LABELS[t]} (${counts[t]})`}
            />
          ))}
        </div>

        <input
          type="text"
          placeholder="Rechercher document, employé…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200 sm:w-72"
        />
      </div>

      {/* Sub-categories (visible quand un type est sélectionné) */}
      {filterType !== "all" && availableSubcategories.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Sous-catégorie :
          </span>
          <ChipBtn
            active={filterSubcategory === "all"}
            onClick={() => setFilterSubcategory("all")}
            label="Toutes"
          />
          {availableSubcategories.map((s) => (
            <ChipBtn
              key={s}
              active={filterSubcategory === s}
              onClick={() => setFilterSubcategory(s)}
              label={
                subcategoryCounts.get(s) !== undefined
                  ? `${s} (${subcategoryCounts.get(s)})`
                  : s
              }
            />
          ))}
        </div>
      )}

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
          <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          Aucun document trouvé.
          <p className="mt-2 text-xs text-slate-400">
            Les documents s&apos;ajoutent depuis la fiche d&apos;un employé,
            onglet Documents.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Employé</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1">
                      <HrDocumentTypeBadge type={d.type} />
                      {d.subcategory && (
                        <span className="text-[10px] font-semibold text-slate-500">
                          {d.subcategory}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-nexus-blue-950">{d.nom}</p>
                    {d.description && (
                      <p className="text-xs text-slate-500">{d.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {d.employees ? (
                      <Link
                        href={`${basePath}/employes/${d.employee_id}`}
                        className="group inline-flex items-center gap-1 text-nexus-blue-950 hover:text-nexus-orange-600"
                      >
                        <span className="font-semibold">
                          {d.employees.nom_complet}
                        </span>
                        <ExternalLink className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                      </Link>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                    {d.employees?.poste && (
                      <p className="text-xs text-slate-500">{d.employees.poste}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {formatDateShort(d.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownload(d.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-nexus-blue-950 shadow-sm transition hover:border-nexus-orange-300 hover:bg-nexus-orange-50/40"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Télécharger
                    </button>
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
