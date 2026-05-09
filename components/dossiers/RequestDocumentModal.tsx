"use client";

// ============================================================================
// COMPOSANT — Modal "Demander un document au client"
// Multi-select de types prédéfinis + champ libre, contexte global, envoi
// 1 email récap au client.
// ============================================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FileQuestion, Loader2, Plus, Send, Trash2, X } from "lucide-react";
import { DOCUMENT_CATEGORIES } from "@/lib/demande-complete-form";
import { cn } from "@/lib/utils";

interface DocItem {
  id: string;
  type_document: string;
  description: string;
}

const PREDEFINED_TYPES = DOCUMENT_CATEGORIES.map((c) => c.label);

export function RequestDocumentModal({
  open,
  onClose,
  demandeId,
}: {
  open: boolean;
  onClose: () => void;
  demandeId: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState<DocItem[]>([
    { id: crypto.randomUUID(), type_document: PREDEFINED_TYPES[0] || "", description: "" },
  ]);
  const [sending, setSending] = useState(false);
  const [, startTransition] = useTransition();

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type_document: PREDEFINED_TYPES[0] || "", description: "" },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
  };

  const updateItem = (id: string, patch: Partial<DocItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const handleSubmit = async () => {
    const docs = items
      .map((i) => ({
        type_document: i.type_document.trim(),
        description: i.description.trim() || null,
      }))
      .filter((i) => i.type_document.length > 0);

    if (docs.length === 0) {
      toast.error("Au moins un type de document requis");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`/api/demandes/${demandeId}/documents-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents: docs }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Envoi impossible");
      }
      toast.success(`${docs.length} demande${docs.length > 1 ? "s" : ""} envoyée${docs.length > 1 ? "s" : ""}`);
      onClose();
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-nexus-orange-100 text-nexus-orange-700">
              <FileQuestion className="h-4 w-4" />
            </span>
            <h2 className="font-display text-lg font-bold text-nexus-blue-950">
              Demander des documents au client
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {items.map((item, i) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Document {i + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  list={`types-${item.id}`}
                  value={item.type_document}
                  onChange={(e) => updateItem(item.id, { type_document: e.target.value })}
                  placeholder="Type de document"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-400 focus:outline-none"
                />
                <datalist id={`types-${item.id}`}>
                  {PREDEFINED_TYPES.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
                <textarea
                  value={item.description}
                  onChange={(e) =>
                    updateItem(item.id, { description: e.target.value.slice(0, 1000) })
                  }
                  placeholder="Précisions / contexte (optionnel)"
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-400 focus:outline-none"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 transition hover:border-nexus-orange-300 hover:text-nexus-orange-700"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter un autre document
          </button>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-nexus-orange-600 disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Envoyer la demande
          </button>
        </div>
      </div>
    </div>
  );
}
