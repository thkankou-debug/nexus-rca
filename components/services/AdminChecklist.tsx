"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ClipboardCheck,
  FileText,
  FileSignature,
  GraduationCap,
  Languages,
  Camera,
  BookOpen,
  Wallet,
  ShieldCheck,
} from "lucide-react";

type DocStatus = "ready" | "todo" | "translate";

interface DocItem {
  id: string;
  label: string;
  icon: typeof FileText;
  status: DocStatus;
}

const INITIAL_DOCS: DocItem[] = [
  { id: "cv", label: "CV format canadien", icon: FileSignature, status: "todo" },
  { id: "lettre", label: "Lettre de motivation", icon: FileText, status: "todo" },
  { id: "diplome", label: "Diplôme(s)", icon: GraduationCap, status: "ready" },
  { id: "releve", label: "Relevé de notes", icon: BookOpen, status: "ready" },
  { id: "recommandation", label: "Lettre de recommandation", icon: FileSignature, status: "todo" },
  { id: "photo", label: "Photo d'identité", icon: Camera, status: "ready" },
  { id: "passeport", label: "Passeport (copie)", icon: ShieldCheck, status: "translate" },
  { id: "finance", label: "Justificatif financier", icon: Wallet, status: "todo" },
];

const STATUS_LABELS: Record<DocStatus, { label: string; classes: string; dot: string }> = {
  ready: {
    label: "Disponible",
    classes: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  todo: {
    label: "À préparer",
    classes: "border-nexus-orange-400/30 bg-nexus-orange-500/10 text-nexus-orange-300",
    dot: "bg-nexus-orange-400",
  },
  translate: {
    label: "À traduire",
    classes: "border-sky-400/30 bg-sky-500/10 text-sky-300",
    dot: "bg-sky-400",
  },
};

export function AdminChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const readyCount = useMemo(
    () => INITIAL_DOCS.filter((d) => checked[d.id]).length,
    [checked],
  );
  const total = INITIAL_DOCS.length;
  const progress = (readyCount / total) * 100;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/10 via-white/[0.04] to-white/[0.02] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.30)] sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-nexus-orange-500/20 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-nexus-blue-500/20 blur-[100px]"
      />

      <div className="relative">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 rounded-2xl bg-nexus-orange-500/40 blur-md"
              />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)] ring-1 ring-white/10">
                <ClipboardCheck className="h-5 w-5" />
              </div>
            </div>
            <div>
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Checklist documents
              </span>
              <p className="font-display text-base font-bold leading-tight text-white sm:text-lg">
                Préparez votre dossier complet
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 ring-1 ring-white/5 backdrop-blur">
            <span className="font-display text-2xl font-bold tabular-nums text-white sm:text-3xl">
              {readyCount}
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
              / {total} prêts
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 shadow-[0_0_12px_rgba(255,102,0,0.6)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Liste */}
        <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {INITIAL_DOCS.map((doc) => {
            const Icon = doc.icon;
            const isChecked = !!checked[doc.id];
            const statusInfo = STATUS_LABELS[doc.status];

            return (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => toggle(doc.id)}
                  aria-pressed={isChecked}
                  className={`group/item relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border p-3.5 text-left ring-1 backdrop-blur transition-all duration-300 ease-out hover:-translate-y-0.5 ${
                    isChecked
                      ? "border-nexus-orange-400/50 bg-nexus-orange-500/10 ring-nexus-orange-400/20"
                      : "border-white/10 bg-white/[0.03] ring-white/5 hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
                >
                  {/* Checkbox */}
                  <span
                    className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${
                      isChecked
                        ? "border-nexus-orange-400 bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 shadow-[0_6px_16px_-6px_rgba(255,102,0,0.6)]"
                        : "border-white/20 bg-white/[0.04]"
                    }`}
                  >
                    <Check
                      className={`h-3.5 w-3.5 text-white transition-all duration-200 ${
                        isChecked ? "scale-100 opacity-100" : "scale-50 opacity-0"
                      }`}
                      strokeWidth={3.5}
                    />
                  </span>

                  {/* Icon */}
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors duration-300 ${
                      isChecked ? "text-nexus-orange-300" : "text-white/50"
                    }`}
                  />

                  {/* Label */}
                  <span
                    className={`flex-1 truncate font-display text-sm font-bold leading-tight transition-all duration-300 ${
                      isChecked ? "text-white" : "text-white/85"
                    }`}
                  >
                    {doc.label}
                  </span>

                  {/* Statut badge */}
                  <span
                    className={`hidden shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] backdrop-blur sm:inline-flex ${statusInfo.classes}`}
                  >
                    <span
                      className={`h-1 w-1 rounded-full ${statusInfo.dot}`}
                    />
                    {statusInfo.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Légende statuts (mobile) */}
        <div className="mt-5 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60 sm:hidden">
          {(["ready", "todo", "translate"] as DocStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_LABELS[s].dot}`} />
              {STATUS_LABELS[s].label}
            </span>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 ring-1 ring-white/5 backdrop-blur">
          <Languages className="mt-0.5 h-4 w-4 shrink-0 text-nexus-orange-300" />
          <p className="text-xs leading-relaxed text-slate-300">
            Liste indicative — Nexus adapte la checklist à votre dossier
            précis (visa, études, immigration). Cochez les éléments déjà en
            votre possession.
          </p>
        </div>
      </div>
    </div>
  );
}
