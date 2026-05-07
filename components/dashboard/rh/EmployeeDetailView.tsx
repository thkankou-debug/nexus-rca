"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  FileText,
  Wallet,
  StickyNote,
  Trash2,
  Plus,
  Loader2,
  Download,
  AlertTriangle,
  MessageSquarePlus,
  FileSignature,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Employee,
  EmployeeNote,
  HrDocument,
  HrDocumentType,
  Payslip,
} from "@/types";
import { HR_DOCUMENT_SUBCATEGORIES } from "@/types";
import { EmployeeForm } from "./EmployeeForm";
import { FileUploader } from "./FileUploader";
import { HrDocumentTypeBadge, HR_DOCUMENT_TYPE_LABELS } from "./HrDocumentTypeBadge";
import { PayslipStatusBadge } from "./PayslipStatusBadge";
import { formatFcfa, formatDateShort, formatDateTimeShort } from "./format";

interface EmployeeDetailViewProps {
  employeeId: string;
  basePath: string;
  canSeeNotes: boolean;
  canDelete: boolean;
}

type TabKey = "infos" | "documents" | "paie" | "notes";

export function EmployeeDetailView({
  employeeId,
  basePath,
  canSeeNotes,
  canDelete,
}: EmployeeDetailViewProps) {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("infos");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/rh/employees/${employeeId}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) setEmployee(json.employee as Employee);
        else setError(json.error || "Introuvable");
      })
      .catch((e) => {
        console.error("[RH_EMPLOYEE_DETAIL] fetch", e);
        setError((e as Error).message);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  const handleDelete = async () => {
    if (!employee) return;
    if (
      !confirm(
        `Supprimer définitivement ${employee.nom_complet} ? Cette action est irréversible.`
      )
    )
      return;
    try {
      const res = await fetch(`/api/rh/employees/${employee.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      router.push(`${basePath}/employes`);
    } catch (e) {
      console.error("[RH_EMPLOYEE_DETAIL] delete", e);
      alert((e as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
      </div>
    );
  }
  if (error || !employee) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
        {error ?? "Employé introuvable."}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-lg font-bold text-white shadow-md">
              {(employee.nom_complet[0] ?? "?").toUpperCase()}
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-nexus-blue-950">
                {employee.nom_complet}
              </h2>
              <p className="text-sm text-slate-600">
                {employee.poste} · {employee.departement}
              </p>
              <p className="text-xs text-slate-500">{employee.email}</p>
            </div>
          </div>

          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          )}
        </div>

        {/* Mini-stats */}
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <MiniStat label="Salaire de base" value={formatFcfa(employee.salaire_base)} />
          <MiniStat label="Type de contrat" value={employee.type_contrat ?? "—"} />
          <MiniStat
            label="Date d'embauche"
            value={formatDateShort(employee.date_embauche)}
          />
          <MiniStat
            label="Statut"
            value={employee.statut.charAt(0).toUpperCase() + employee.statut.slice(1)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200">
        <Tab active={tab === "infos"} onClick={() => setTab("infos")} icon={Briefcase}>
          Infos
        </Tab>
        <Tab active={tab === "documents"} onClick={() => setTab("documents")} icon={FileText}>
          Documents RH
        </Tab>
        <Tab active={tab === "paie"} onClick={() => setTab("paie")} icon={Wallet}>
          Fiches de paie
        </Tab>
        {canSeeNotes && (
          <Tab active={tab === "notes"} onClick={() => setTab("notes")} icon={StickyNote}>
            Notes internes
          </Tab>
        )}
      </div>

      {/* Tab content */}
      {tab === "infos" && (
        <EmployeeForm
          employee={employee}
          canSeeNotes={canSeeNotes}
          onSuccess={(e) => setEmployee(e)}
          submitLabel="Enregistrer les modifications"
        />
      )}
      {tab === "documents" && (
        <DocumentsTab employeeId={employee.id} />
      )}
      {tab === "paie" && (
        <PayslipsTab employeeId={employee.id} basePath={basePath} />
      )}
      {tab === "notes" && canSeeNotes && (
        <NotesTab employee={employee} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sous-composants
// ─────────────────────────────────────────────────────────────────────────────

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 truncate font-semibold text-nexus-blue-950">{value}</p>
    </div>
  );
}

function Tab({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition",
        active
          ? "border-nexus-orange-500 text-nexus-blue-950"
          : "border-transparent text-slate-500 hover:text-nexus-blue-950"
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

// ─── Documents Tab ─────────────────────────────────────────────────────────

const DOC_TYPES: HrDocumentType[] = ["contrat", "diplome", "piece_identite", "autre"];

function DocumentsTab({ employeeId }: { employeeId: string }) {
  const [docs, setDocs] = useState<HrDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<HrDocumentType>("contrat");
  const [uploadSubcategory, setUploadSubcategory] = useState<string>("");
  const [uploadSubcategoryFree, setUploadSubcategoryFree] = useState<string>("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  // Reset sub-category quand type change
  useEffect(() => {
    setUploadSubcategory("");
    setUploadSubcategoryFree("");
  }, [uploadType]);

  const subOptions = HR_DOCUMENT_SUBCATEGORIES[uploadType] ?? [];

  const refresh = () => {
    setLoading(true);
    fetch(`/api/rh/documents?employee_id=${employeeId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setDocs(json.documents as HrDocument[]);
        else setError(json.error || "Erreur");
      })
      .catch((e) => {
        console.error("[RH_DOC_TAB] fetch", e);
        setError((e as Error).message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", uploadFile);
      fd.append("employee_id", employeeId);
      fd.append("type", uploadType);
      const sub =
        uploadType === "autre"
          ? uploadSubcategoryFree.trim() || uploadSubcategory.trim()
          : uploadSubcategory.trim();
      if (sub) {
        fd.append("subcategory", sub);
      }
      if (uploadDescription.trim()) {
        fd.append("description", uploadDescription.trim());
      }
      const res = await fetch("/api/rh/documents", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      setUploadFile(null);
      setUploadDescription("");
      setUploadSubcategory("");
      setUploadSubcategoryFree("");
      refresh();
    } catch (e) {
      console.error("[RH_DOC_TAB] upload", e);
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: HrDocument) => {
    try {
      const res = await fetch(`/api/rh/documents/${doc.id}/url`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      window.open(json.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error("[RH_DOC_TAB] download", e);
      alert((e as Error).message);
    }
  };

  const handleDelete = async (doc: HrDocument) => {
    if (!confirm(`Supprimer le document "${doc.nom}" ?`)) return;
    try {
      const res = await fetch(`/api/rh/documents/${doc.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      refresh();
    } catch (e) {
      console.error("[RH_DOC_TAB] delete", e);
      alert((e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Génération auto contrat */}
      <ContractGenerator employeeId={employeeId} onGenerated={refresh} />

      {/* Upload */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-display text-base font-bold text-nexus-blue-950">
          Ajouter un document
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          PDF, JPG, PNG ou WebP — 10 Mo max.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <FileUploader onSelect={(f) => setUploadFile(f)} />

          <div className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Type de document
              </span>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value as HrDocumentType)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm"
              >
                {DOC_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {HR_DOCUMENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Sous-catégorie (optionnel)
              </span>
              <select
                value={uploadSubcategory}
                onChange={(e) => setUploadSubcategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm"
              >
                <option value="">— Aucune —</option>
                {subOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {uploadType === "autre" && (
                <input
                  type="text"
                  value={uploadSubcategoryFree}
                  onChange={(e) => setUploadSubcategoryFree(e.target.value)}
                  placeholder="Ou saisir une sous-catégorie libre"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm"
                />
              )}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Description (optionnel)
              </span>
              <input
                type="text"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Ex: contrat signé du 15/03/2024"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm"
              />
            </label>

            <button
              type="button"
              onClick={handleUpload}
              disabled={!uploadFile || uploading}
              className="inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Téléverser
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Liste */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <h3 className="font-display text-base font-bold text-nexus-blue-950">
            Documents existants ({docs.length})
          </h3>
        </div>
        {loading ? (
          <div className="flex items-center gap-3 p-6 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
          </div>
        ) : docs.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Aucun document pour cet employé.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {docs.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center gap-3 p-4 hover:bg-slate-50/60"
              >
                <HrDocumentTypeBadge type={doc.type} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-nexus-blue-950">
                      {doc.nom}
                    </p>
                    {doc.subcategory && (
                      <span className="text-[10px] font-semibold text-slate-500">
                        · {doc.subcategory}
                      </span>
                    )}
                  </div>
                  {doc.description && (
                    <p className="truncate text-xs text-slate-500">
                      {doc.description}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400">
                    Ajouté {formatDateTimeShort(doc.created_at)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-nexus-blue-950 shadow-sm hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" /> Télécharger
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(doc)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Payslips Tab ──────────────────────────────────────────────────────────

function PayslipsTab({
  employeeId,
  basePath,
}: {
  employeeId: string;
  basePath: string;
}) {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/rh/payslips?employee_id=${employeeId}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) setPayslips(json.payslips as Payslip[]);
        else setError(json.error || "Erreur");
      })
      .catch((e) => {
        console.error("[RH_PAYSLIPS_TAB] fetch", e);
        setError((e as Error).message);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href={`${basePath}/paie/nouvelle?employee_id=${employeeId}`}
          className="inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600"
        >
          <Plus className="h-4 w-4" />
          Nouvelle fiche pour cet employé
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : payslips.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Aucune fiche de paie pour cet employé.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Période</th>
                <th className="px-4 py-3 text-right">Net</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {payslips.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">
                    {p.reference}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.mois_libelle}</td>
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

// ─── Notes Tab (super-admin/admin) ─────────────────────────────────────────

type NoteWithAuthor = EmployeeNote & {
  profiles?: { id: string; nom: string; prenom: string | null; email: string } | null;
};

function relativeDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / (1000 * 60));
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD === 1) return "hier";
  if (diffD < 7) return `il y a ${diffD} jours`;
  return formatDateTimeShort(iso);
}

function authorInitials(p: NoteWithAuthor["profiles"]): string {
  if (!p) return "?";
  const a = (p.prenom?.[0] ?? "").toUpperCase();
  const b = (p.nom?.[0] ?? "").toUpperCase();
  return (a + b) || (p.email[0] ?? "?").toUpperCase();
}

function authorLabel(p: NoteWithAuthor["profiles"]): string {
  if (!p) return "Auteur inconnu";
  const full = `${p.prenom ?? ""} ${p.nom ?? ""}`.trim();
  return full || p.email;
}

function NotesTab({ employee }: { employee: Employee }) {
  const [notes, setNotes] = useState<NoteWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    setLoading(true);
    fetch(`/api/rh/employees/${employee.id}/notes`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setNotes(json.notes as NoteWithAuthor[]);
        else setError(json.error || "Erreur");
      })
      .catch((e) => {
        console.error("[RH_NOTES_TAB] fetch", e);
        setError((e as Error).message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee.id]);

  const submitNote = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/rh/employees/${employee.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      setContent("");
      setAdding(false);
      refresh();
    } catch (e) {
      console.error("[RH_NOTES_TAB] save", e);
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Note legacy en lecture seule */}
      {employee.notes_internes && employee.notes_internes.trim() !== "" && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Note historique (ancienne)
          </p>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
            {employee.notes_internes}
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            Lecture seule. Utilisez la timeline ci-dessous pour ajouter de
            nouvelles notes.
          </p>
        </div>
      )}

      {/* Header + bouton ajouter */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100/80">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-bold text-nexus-blue-950">
              Notes internes
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Append-only. Chaque entrée est horodatée et signée par son auteur.
              Aucune modification ni suppression possible.
            </p>
          </div>
          {!adding && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Ajouter une note
            </button>
          )}
        </div>

        {adding && (
          <div className="mt-4 space-y-3">
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Écrire une note… (max 5000 caractères)"
              maxLength={5000}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
            />
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setContent("");
                }}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={submitNote}
                disabled={saving || content.trim() === ""}
                className="inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Enregistrer
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          <StickyNote className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          Aucune note pour le moment.
        </div>
      ) : (
        <ol className="relative space-y-4 border-l-2 border-slate-200 pl-6">
          {notes.map((note) => (
            <li key={note.id} className="relative">
              {/* Dot */}
              <span className="absolute -left-[31px] top-3 flex h-4 w-4 items-center justify-center">
                <span className="h-2.5 w-2.5 rounded-full bg-nexus-orange-500 ring-4 ring-white" />
              </span>

              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
                <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-[11px] font-bold text-white">
                      {authorInitials(note.profiles ?? null)}
                    </span>
                    <span className="text-sm font-semibold text-nexus-blue-950">
                      {authorLabel(note.profiles ?? null)}
                    </span>
                  </div>
                  <time
                    dateTime={note.created_at}
                    className="text-xs text-slate-500"
                    title={formatDateTimeShort(note.created_at)}
                  >
                    {relativeDate(note.created_at)}
                  </time>
                </header>
                <p className="whitespace-pre-line text-sm text-slate-700">
                  {note.content}
                </p>
              </article>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ─── Contract Generator ────────────────────────────────────────────────────
// Génère un PDF de contrat de travail (CDI/CDD/Stage/Freelance) à partir
// des données employé et l'upload automatiquement comme document type=contrat.

type ContractType = "CDI" | "CDD" | "Stage" | "Freelance";

const CONTRACT_TYPE_INFO: Record<
  ContractType,
  { label: string; description: string; periodEssai: string }
> = {
  CDI: {
    label: "CDI",
    description: "Contrat à durée indéterminée",
    periodEssai: "3 mois renouvelables",
  },
  CDD: {
    label: "CDD",
    description: "Contrat à durée déterminée — date de fin requise",
    periodEssai: "1 mois",
  },
  Stage: {
    label: "Stage",
    description: "Convention de stage",
    periodEssai: "15 jours",
  },
  Freelance: {
    label: "Freelance",
    description: "Contrat de prestation indépendante",
    periodEssai: "Sans période d'essai",
  },
};

function ContractGenerator({
  employeeId,
  onGenerated,
}: {
  employeeId: string;
  onGenerated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ContractType>("CDI");
  const [cddEndDate, setCddEndDate] = useState("");
  const [lieu, setLieu] = useState("Bangui, Republique Centrafricaine");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    if (type === "CDD" && !cddEndDate) {
      setError("Date de fin requise pour un CDD");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch(`/api/rh/employees/${employeeId}/generate-contract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_type: type,
          cdd_end_date: type === "CDD" ? cddEndDate : undefined,
          lieu_travail: lieu,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur génération");
      setOpen(false);
      setCddEndDate("");
      onGenerated();
    } catch (e) {
      console.error("[RH_CONTRACT_GEN]", e);
      setError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  if (!open) {
    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-nexus-orange-300 bg-gradient-to-br from-nexus-orange-50/60 via-white to-white p-6 shadow-sm">
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/15 blur-2xl" />
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-md">
              <FileSignature className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
                Génération automatique
              </p>
              <h3 className="mt-1 font-display text-base font-bold text-nexus-blue-950 sm:text-lg">
                Générer un contrat de travail
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                CDI · CDD · Stage · Freelance — PDF Nexus RCA pré-rempli avec
                toutes les données de l'employé.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600"
          >
            <Sparkles className="h-4 w-4" />
            Générer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-nexus-orange-300 bg-white p-6 shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-md">
          <FileSignature className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-nexus-blue-950 sm:text-lg">
            Générer un contrat de travail
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Le PDF sera créé et automatiquement archivé dans les documents.
          </p>
        </div>
      </div>

      {/* Type cards */}
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(CONTRACT_TYPE_INFO) as ContractType[]).map((t) => {
          const info = CONTRACT_TYPE_INFO[t];
          const active = type === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "rounded-xl border p-3 text-left transition",
                active
                  ? "border-nexus-orange-400 bg-nexus-orange-50/60 ring-2 ring-nexus-orange-200"
                  : "border-slate-200 bg-white hover:border-nexus-orange-300"
              )}
            >
              <p className="font-display text-base font-bold text-nexus-blue-950">
                {info.label}
              </p>
              <p className="mt-1 text-[11px] text-slate-600">{info.description}</p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Essai : {info.periodEssai}
              </p>
            </button>
          );
        })}
      </div>

      {/* CDD end date */}
      {type === "CDD" && (
        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Date de fin du contrat *
          </span>
          <input
            type="date"
            value={cddEndDate}
            onChange={(e) => setCddEndDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm sm:w-64"
          />
        </label>
      )}

      {/* Lieu */}
      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-semibold text-slate-700">
          Lieu de travail
        </span>
        <input
          type="text"
          value={lieu}
          onChange={(e) => setLieu(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm"
        />
      </label>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-5 flex flex-col items-stretch gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {generating ? "Génération…" : "Générer le PDF"}
        </button>
      </div>
    </div>
  );
}
