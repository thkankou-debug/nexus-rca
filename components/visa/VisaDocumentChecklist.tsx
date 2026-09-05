"use client";

import { useState } from "react";
import { Check, FileText, Info } from "lucide-react";
import { TYPES_VISA_OPTIONS, type TypeVisa } from "@/lib/visa-form";
import { getDocuments } from "@/lib/visa-rules";
import { cn } from "@/lib/utils";

// ─── VisaDocumentChecklist ─────────────────────────────────────────────────
// Liste les documents par type de visa via tabs.
// 100 % client. Lit DOCUMENTS_PAR_TYPE de lib/visa-rules.ts.

const DEFAULT_TYPE: TypeVisa = "tourisme";

export function VisaDocumentChecklist() {
  const [activeType, setActiveType] = useState<TypeVisa>(DEFAULT_TYPE);

  // On exclut "autre" du tab list (placeholder uniquement)
  const tabs = TYPES_VISA_OPTIONS.filter((t) => t.value !== "autre");
  const documents = getDocuments(activeType);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-nexus-blue-950">
            Documents fréquents par type de visa
          </h3>
          <p className="text-xs text-slate-500">
            Liste indicative — le consulat peut exiger des pièces complémentaires
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setActiveType(t.value as TypeVisa)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
              activeType === t.value
                ? "bg-nexus-blue-950 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Liste documents */}
      <ul className="space-y-2.5">
        {documents.map((doc, i) => (
          <li
            key={i}
            className={cn(
              "flex items-start gap-3 rounded-xl border px-4 py-3",
              doc.required
                ? "border-slate-200 bg-slate-50"
                : "border-dashed border-slate-200 bg-white"
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                doc.required
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-500"
              )}
            >
              <Check className="h-3 w-3" />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm",
                  doc.required
                    ? "font-semibold text-nexus-blue-950"
                    : "text-slate-600"
                )}
              >
                {doc.label}
                {!doc.required && (
                  <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    optionnel
                  </span>
                )}
              </p>
              {doc.hint && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                  <Info className="h-3 w-3" />
                  {doc.hint}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs text-slate-500">
        Vous serez accompagné(e) sur l&apos;intégralité de la liste exacte requise par le
        consulat ciblé lors du cadrage Nexus.
      </p>
    </div>
  );
}
