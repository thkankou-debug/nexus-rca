"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Download, FileText, Image as ImageIcon, File, Loader2, Paperclip } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatFileSize } from "@/lib/demande-form";
import type { DemandeDocument } from "@/types";

function iconFor(mime: string) {
  if (mime.startsWith("image/")) return ImageIcon;
  if (mime === "application/pdf") return FileText;
  return File;
}

export function DemandeDocumentsList({
  demandeId,
  showTitle = true,
}: {
  demandeId: string;
  showTitle?: boolean;
}) {
  const supabase = createClient();
  const [docs, setDocs] = useState<DemandeDocument[] | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("demande_documents")
        .select("*")
        .eq("demande_id", demandeId)
        .order("created_at", { ascending: true });
      if (!cancelled) setDocs((data || []) as DemandeDocument[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [demandeId, supabase]);

  const handleDownload = async (doc: DemandeDocument) => {
    setDownloadingId(doc.id);
    try {
      const { data, error } = await supabase.storage
        .from("demande-documents")
        .createSignedUrl(doc.storage_path, 60);
      if (error || !data?.signedUrl) throw error || new Error("Pas d'URL");
      window.open(data.signedUrl, "_blank", "noopener");
    } catch (err) {
      console.error(err);
      toast.error("Impossible de récupérer le fichier");
    } finally {
      setDownloadingId(null);
    }
  };

  if (docs === null) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Chargement des documents...
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic">Aucun document joint.</p>
    );
  }

  return (
    <div>
      {showTitle && (
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Paperclip className="h-3.5 w-3.5" />
          Documents joints ({docs.length})
        </p>
      )}
      <ul className="space-y-2">
        {docs.map((d) => {
          const Icon = iconFor(d.mime_type);
          const downloading = downloadingId === d.id;
          return (
            <li
              key={d.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-nexus-blue-50 text-nexus-blue-700">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-nexus-blue-950">
                  {d.file_name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(d.file_size_bytes)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDownload(d)}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-nexus-blue-900 transition hover:bg-nexus-blue-50 disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                Télécharger
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
