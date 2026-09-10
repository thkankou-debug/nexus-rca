"use client";

// ============================================================================
// COMPOSANT — Notes internes (admin/super_admin sur tous les dossiers ;
// agent sur ses propres dossiers — L3 Étape 2b, migration 075)
// Append-only : on n'édite pas, on n'efface pas. Jamais visible par le
// client (RLS DB + check côté UI).
// ============================================================================

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Lock, Send, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";

interface Note {
  id: string;
  author_name: string;
  author_role: string;
  content: string;
  created_at: string;
}

const MAX = 2000;

export function StaffNotes({
  demandeId,
  role,
}: {
  demandeId: string;
  role: UserRole;
}) {
  const supabase = createClient();
  const allowed = role === "admin" || role === "super_admin" || role === "agent";
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("demande_notes")
        .select("id, author_name, author_role, content, created_at")
        .eq("demande_id", demandeId)
        .order("created_at", { ascending: false });
      if (!cancelled) setNotes((data || []) as Note[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [demandeId, supabase, allowed]);

  if (!allowed) return null;

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      const res = await fetch(`/api/demandes/${demandeId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur");
      }
      setContent("");
      // Re-fetch
      const { data: refreshed } = await supabase
        .from("demande_notes")
        .select("id, author_name, author_role, content, created_at")
        .eq("demande_id", demandeId)
        .order("created_at", { ascending: false });
      setNotes((refreshed || []) as Note[]);
      toast.success("Note ajoutée");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSending(false);
    }
  };

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return s;
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-300 bg-slate-50 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-3">
        <ShieldCheck className="h-3.5 w-3.5 text-slate-600" />
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">
          Notes internes
        </p>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
          <Lock className="h-2.5 w-2.5" />
          Non visible par le client
        </span>
      </div>

      <div className="space-y-2 p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX))}
          rows={2}
          placeholder="Note interne pour l'équipe (jamais visible du client)…"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-nexus-blue-950 focus:border-nexus-blue-700 focus:outline-none focus:ring-1 focus:ring-nexus-blue-700/30"
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            {content.length} / {MAX}
          </span>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !content.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-nexus-blue-950 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-nexus-blue-900 disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Ajouter
          </button>
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-200 bg-white p-4">
        {notes === null ? (
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Chargement…
          </p>
        ) : notes.length === 0 ? (
          <p className="text-center text-xs italic text-slate-400">
            Aucune note interne pour le moment.
          </p>
        ) : (
          notes.map((n) => (
            <article
              key={n.id}
              className="rounded-lg border border-slate-200 bg-slate-50/60 p-3"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded bg-nexus-blue-950 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  {n.author_role.replace("_", " ")}
                </span>
                <p className="text-xs font-semibold text-nexus-blue-950">
                  {n.author_name}
                </p>
                <p className="ml-auto text-[10px] text-slate-500">
                  {formatDate(n.created_at)}
                </p>
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-700">
                {n.content}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
