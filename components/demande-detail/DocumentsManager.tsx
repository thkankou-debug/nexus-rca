"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Download,
  File,
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DOCUMENT_CATEGORIES } from "@/lib/demande-complete-form";
import { cn } from "@/lib/utils";

type Doc = {
  id: string;
  storage_path: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  categorie: string | null;
  created_at: string;
  uploaded_by_role: "client" | "agence" | null;
};

type DocRequest = {
  id: string;
  type_document: string;
  description: string | null;
  statut: "en_attente" | "fourni" | "annule";
  created_at: string;
  fulfilled_at: string | null;
};

function iconFor(mime: string) {
  if (mime.startsWith("image/")) return ImageIcon;
  if (mime === "application/pdf") return FileText;
  return File;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function DocumentsManager({
  demandeId,
  canDelete,
}: {
  demandeId: string;
  canDelete: boolean;
}) {
  const supabase = createClient();
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [requests, setRequests] = useState<DocRequest[] | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const refresh = async () => {
    const [{ data: docsData }, { data: reqsData }] = await Promise.all([
      supabase
        .from("demande_documents")
        .select("id, storage_path, file_name, file_size_bytes, mime_type, categorie, created_at, uploaded_by_role")
        .eq("demande_id", demandeId)
        .order("created_at", { ascending: false }),
      supabase
        .from("demande_documents_requests")
        .select("id, type_document, description, statut, created_at, fulfilled_at")
        .eq("demande_id", demandeId)
        .order("created_at", { ascending: false }),
    ]);
    setDocs((docsData || []) as Doc[]);
    setRequests((reqsData || []) as DocRequest[]);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demandeId]);

  const handleDownload = async (d: Doc) => {
    setDownloadingId(d.id);
    try {
      const { data, error } = await supabase.storage
        .from("demande-documents")
        .createSignedUrl(d.storage_path, 60);
      if (error || !data?.signedUrl) throw error || new Error("URL indisponible");
      window.open(data.signedUrl, "_blank", "noopener");
    } catch {
      toast.error("Téléchargement impossible");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (d: Doc) => {
    if (!confirm(`Supprimer "${d.file_name}" ?`)) return;
    setDeletingId(d.id);
    try {
      const res = await fetch(
        `/api/demandes/${demandeId}/documents?doc_id=${d.id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Suppression impossible");
      }
      toast.success("Document supprimé");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Suppression impossible");
    } finally {
      setDeletingId(null);
    }
  };

  // Documents officiels (délivrés par l'agence) séparés des pièces fournies
  // par le client — P9 Lot 3. Un document sans uploaded_by_role (ancien,
  // avant la migration 071) est traité comme "client", comportement
  // identique à avant ce lot.
  const officiels = (docs || []).filter((d) => d.uploaded_by_role === "agence");
  const fournis = (docs || []).filter((d) => d.uploaded_by_role !== "agence");

  // Group docs by categorie (uniquement les pièces fournies par le client)
  const docsByCategorie = new Map<string, Doc[]>();
  fournis.forEach((d) => {
    const cat = d.categorie || "documents_complementaires";
    const list = docsByCategorie.get(cat) || [];
    list.push(d);
    docsByCategorie.set(cat, list);
  });

  return (
    <div className="space-y-4">
      {/* === Documents officiels délivrés par l'agence (P9 Lot 3) === */}
      {officiels.length > 0 && (
        <div className="rounded-2xl border-2 border-nexus-blue-200 bg-nexus-blue-50/40 p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-nexus-blue-700" />
            <h3 className="font-display text-sm font-bold text-nexus-blue-950">
              Documents officiels de Nexus RCA
            </h3>
          </div>
          <ul className="space-y-1.5">
            {officiels.map((d) => {
              const Icon = iconFor(d.mime_type);
              return (
                <li
                  key={d.id}
                  className="flex items-center gap-3 rounded-md border border-nexus-blue-100 bg-white px-3 py-2"
                >
                  <Icon className="h-4 w-4 shrink-0 text-nexus-blue-700" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-nexus-blue-950">
                      {d.file_name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatSize(d.file_size_bytes)} ·{" "}
                      {new Date(d.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload(d)}
                    disabled={downloadingId === d.id}
                    className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    aria-label="Télécharger"
                  >
                    {downloadingId === d.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                  </button>
                  {/* Pas de suppression ici : un document officiel ne se
                      supprime pas depuis le portail client. */}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* === D2 — Documents demandés par le conseiller === */}
      {requests && requests.length > 0 && (
        <div className="rounded-2xl border-2 border-nexus-orange-300 bg-nexus-orange-50/40 p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-nexus-orange-600" />
            <h3 className="font-display text-sm font-bold text-nexus-orange-900">
              Documents demandés par votre conseiller
            </h3>
          </div>
          <ul className="space-y-2">
            {requests
              .filter((r) => r.statut !== "annule")
              .map((r) => (
                <li
                  key={r.id}
                  className="rounded-lg border border-nexus-orange-200 bg-white p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-nexus-orange-100 text-nexus-orange-700">
                      {r.statut === "fourni" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-nexus-blue-950">
                        {r.type_document}
                      </p>
                      {r.description && (
                        <p className="mt-1 text-xs text-slate-700">{r.description}</p>
                      )}
                      <p className="mt-1 text-[10px] text-slate-500">
                        Demandé le{" "}
                        {new Date(r.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    {r.statut === "fourni" ? (
                      <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                        ✓ Fourni
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="shrink-0 rounded-md bg-nexus-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-nexus-orange-600"
                      >
                        Téléverser
                      </button>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}

      {requests !== null && requests.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs italic text-slate-500">
          Aucun document complémentaire requis pour le moment.
        </div>
      )}

      {/* === D1 — Documents fournis par catégorie (le client) === */}
      {fournis.length > 0 && (
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Mes documents
        </p>
      )}
      <div className="space-y-3">
        {DOCUMENT_CATEGORIES.map((cat) => {
          const list = docsByCategorie.get(cat.value) || [];
          if (list.length === 0) return null;
          return (
            <div
              key={cat.value}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-bold text-nexus-blue-950">{cat.label}</p>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700">
                  {list.length} fichier(s)
                </span>
              </div>
              <ul className="space-y-1.5">
                {list.map((d) => {
                  const Icon = iconFor(d.mime_type);
                  return (
                    <li
                      key={d.id}
                      className="flex items-center gap-3 rounded-md border border-slate-100 bg-white px-3 py-2"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-nexus-blue-700" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-nexus-blue-950">
                          {d.file_name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {formatSize(d.file_size_bytes)} ·{" "}
                          {new Date(d.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownload(d)}
                        disabled={downloadingId === d.id}
                        className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        aria-label="Télécharger"
                      >
                        {downloadingId === d.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                      </button>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(d)}
                          disabled={deletingId === d.id}
                          className="rounded-md border border-red-200 bg-white p-1.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          aria-label="Supprimer"
                        >
                          {deletingId === d.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* === D3 — Bouton ajouter === */}
      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-nexus-orange-300 bg-nexus-orange-50 px-4 py-3 text-sm font-bold text-nexus-orange-700 transition hover:bg-nexus-orange-100"
      >
        <Plus className="h-4 w-4" />
        Ajouter un document
      </button>

      {/* === Modal upload === */}
      {showAddModal && (
        <UploadModal
          demandeId={demandeId}
          onClose={() => setShowAddModal(false)}
          onUploaded={refresh}
        />
      )}
    </div>
  );
}

// ============================================================================
// MODAL UPLOAD
// ============================================================================
function UploadModal({
  demandeId,
  onClose,
  onUploaded,
}: {
  demandeId: string;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [categorie, setCategorie] = useState<string>("documents_complementaires");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Sélectionnez un fichier");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 10 Mo)");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("categorie", categorie);
      const res = await fetch(`/api/demandes/${demandeId}/documents`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload impossible");
      }
      toast.success("Document ajouté");
      onUploaded();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-nexus-blue-950">
            Ajouter un document
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Catégorie *
            </label>
            <select
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-nexus-orange-400 focus:outline-none"
            >
              {DOCUMENT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Fichier *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-nexus-blue-950 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-nexus-blue-900"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              PDF, JPG, PNG, DOC. Max 10 Mo.
            </p>
            {file && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-green-700">
                <Check className="h-3 w-3" />
                {file.name} ({formatSize(file.size)})
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !file}
              className="inline-flex items-center gap-1.5 rounded-lg bg-nexus-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-nexus-orange-600 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Téléverser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
