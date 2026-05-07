"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Loader2,
  Library,
  Download,
  Trash2,
  FileText,
  ScrollText,
  BookOpen,
  ClipboardList,
  Scale,
  Paperclip,
  X,
  Eye,
  Users,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  COMPANY_DOCUMENT_TYPE_LABELS,
  type CompanyDocument,
  type CompanyDocumentType,
  type CompanyDocumentVisibility,
} from "@/types";
import { FileUploader } from "./FileUploader";
import { formatDateShort } from "./format";

interface CompanyDocumentsManagerProps {
  canManage: boolean;
}

const TYPE_KEYS: CompanyDocumentType[] = [
  "reglement_interieur",
  "charte",
  "convention_collective",
  "guide",
  "proces_verbal",
  "autre",
];

const TYPE_STYLES: Record<
  CompanyDocumentType,
  { icon: LucideIcon; tone: string }
> = {
  reglement_interieur: {
    icon: Scale,
    tone: "bg-nexus-blue-100 text-nexus-blue-800",
  },
  charte: {
    icon: ScrollText,
    tone: "bg-nexus-orange-100 text-nexus-orange-700",
  },
  convention_collective: {
    icon: ClipboardList,
    tone: "bg-purple-100 text-purple-700",
  },
  guide: {
    icon: BookOpen,
    tone: "bg-emerald-100 text-emerald-700",
  },
  proces_verbal: {
    icon: FileText,
    tone: "bg-slate-100 text-slate-700",
  },
  autre: {
    icon: Paperclip,
    tone: "bg-slate-100 text-slate-700",
  },
};

const VISIBILITY_LABEL: Record<CompanyDocumentVisibility, string> = {
  tous: "Tous employés",
  staff: "Staff seulement",
  super_admin: "Super-admin",
};

const VISIBILITY_ICON: Record<CompanyDocumentVisibility, LucideIcon> = {
  tous: Users,
  staff: Eye,
  super_admin: ShieldCheck,
};

export function CompanyDocumentsManager({
  canManage,
}: CompanyDocumentsManagerProps) {
  const [docs, setDocs] = useState<CompanyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | CompanyDocumentType>(
    "all"
  );
  const [showForm, setShowForm] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/rh/company-documents");
      const json = await r.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      setDocs(json.documents as CompanyDocument[]);
    } catch (e) {
      console.error("[RH_COMPANY_DOCS_LIST]", e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const counts = useMemo(() => {
    const acc: Record<CompanyDocumentType | "all", number> = {
      all: docs.length,
      reglement_interieur: 0,
      charte: 0,
      convention_collective: 0,
      guide: 0,
      proces_verbal: 0,
      autre: 0,
    };
    docs.forEach((d) => {
      acc[d.type] = (acc[d.type] ?? 0) + 1;
    });
    return acc;
  }, [docs]);

  const filtered = useMemo(() => {
    if (filterType === "all") return docs;
    return docs.filter((d) => d.type === filterType);
  }, [docs, filterType]);

  const handleDownload = async (id: string) => {
    try {
      const r = await fetch(`/api/rh/company-documents/${id}/url`);
      const json = await r.json();
      if (!json.success || !json.url) {
        alert(json.error || "Erreur lors du téléchargement");
        return;
      }
      window.open(json.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error("[RH_COMPANY_DOCS_DL]", e);
      alert("Erreur de téléchargement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce document ? Cette action est irréversible.")) {
      return;
    }
    try {
      const r = await fetch(`/api/rh/company-documents/${id}`, {
        method: "DELETE",
      });
      const json = await r.json();
      if (!json.success) {
        alert(json.error || "Erreur de suppression");
        return;
      }
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      console.error("[RH_COMPANY_DOCS_DEL]", e);
      alert("Erreur de suppression");
    }
  };

  return (
    <div>
      {/* Header actions */}
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
              label={`${COMPANY_DOCUMENT_TYPE_LABELS[t]} (${counts[t] ?? 0})`}
            />
          ))}
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600"
          >
            <Plus className="h-4 w-4" />
            Uploader un document
          </button>
        )}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm ring-1 ring-slate-100/80">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm ring-1 ring-slate-100/80">
          <Library className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          <p className="text-sm font-semibold text-nexus-blue-950">
            Aucun document
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Téléversez le premier document officiel de l&apos;entreprise.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => {
            const style = TYPE_STYLES[d.type] ?? TYPE_STYLES.autre;
            const Icon = style.icon;
            const VIcon = VISIBILITY_ICON[d.visible_to];
            return (
              <div
                key={d.id}
                className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 transition hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center"
              >
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                    style.tone
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <p className="font-display text-base font-bold text-nexus-blue-950">
                      {d.name}
                    </p>
                    {d.version && (
                      <span className="font-mono text-xs font-semibold text-slate-500">
                        {d.version}
                      </span>
                    )}
                  </div>
                  {d.description && (
                    <p className="mt-1 text-xs text-slate-600">
                      {d.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                      {COMPANY_DOCUMENT_TYPE_LABELS[d.type]}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                      <VIcon className="h-3 w-3" />
                      {VISIBILITY_LABEL[d.visible_to]}
                    </span>
                    <span>{formatDateShort(d.created_at)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(d.id)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-nexus-blue-950 shadow-sm transition hover:border-nexus-orange-300 hover:bg-nexus-orange-50/40"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Télécharger
                  </button>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleDelete(d.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50"
                      aria-label="Supprimer le document"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal upload */}
      {showForm && canManage && (
        <UploadModal
          onClose={() => setShowForm(false)}
          onSuccess={(doc) => {
            setDocs((prev) => [doc, ...prev]);
            setShowForm(false);
          }}
        />
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

function UploadModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (d: CompanyDocument) => void;
}) {
  const [type, setType] = useState<CompanyDocumentType>("reglement_interieur");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("");
  const [visibleTo, setVisibleTo] = useState<CompanyDocumentVisibility>("staff");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (!file) {
      setErr("Sélectionnez un fichier");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("type", type);
      if (name) fd.set("name", name);
      if (description) fd.set("description", description);
      if (version) fd.set("version", version);
      fd.set("visible_to", visibleTo);

      const r = await fetch("/api/rh/company-documents", {
        method: "POST",
        body: fd,
      });
      const json = await r.json();
      if (!json.success) {
        setErr(json.error || "Erreur lors du téléversement");
        setSubmitting(false);
        return;
      }
      onSuccess(json.document as CompanyDocument);
    } catch (e) {
      setErr((e as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="font-display text-lg font-bold text-nexus-blue-950">
            Uploader un document
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-nexus-blue-950">
              Type de document
            </label>
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as CompanyDocumentType)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
            >
              {TYPE_KEYS.map((t) => (
                <option key={t} value={t}>
                  {COMPANY_DOCUMENT_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-nexus-blue-950">
              Nom
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Règlement intérieur 2026"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-nexus-blue-950">
              Description (optionnelle)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-nexus-blue-950">
                Version (optionnelle)
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v2.1"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-nexus-blue-950">
                Visibilité
              </label>
              <select
                value={visibleTo}
                onChange={(e) =>
                  setVisibleTo(e.target.value as CompanyDocumentVisibility)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
              >
                <option value="tous">Tous les employés</option>
                <option value="staff">Staff seulement</option>
                <option value="super_admin">Super-admin uniquement</option>
              </select>
            </div>
          </div>

          <FileUploader
            label="Fichier"
            hint="PDF, JPG, PNG, WebP, DOCX, XLSX · max 20 Mo"
            accept="application/pdf,image/jpeg,image/png,image/webp,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            maxSizeMb={20}
            onSelect={(f) => setFile(f)}
          />

          {err && (
            <p className="text-xs font-semibold text-rose-600">{err}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting || !file}
            className="inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Téléversement…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Téléverser
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
