"use client";

// ============================================================================
// COMPOSANT — Historique enrichi du dossier (staff)
// Fusionne 3 sources :
//   - demande_status_history (changements d'étape, assignations)
//   - demande_documents_requests (docs demandés / fournis)
//   - demande_documents (uploads par dates)
// Tri chronologique inversé (récent en haut).
// ============================================================================

import { useEffect, useState } from "react";
import {
  ArrowRightCircle,
  CheckCircle2,
  Clock,
  FileQuestion,
  Loader2,
  Upload,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface HistoryEvent {
  id: string;
  kind: "status" | "doc_request" | "doc_upload";
  date: string;
  title: string;
  subtitle?: string | null;
  author?: string | null;
}

export function StaffHistoryTimeline({ demandeId }: { demandeId: string }) {
  const supabase = createClient();
  const [events, setEvents] = useState<HistoryEvent[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: statusRows }, { data: reqRows }, { data: docRows }] =
        await Promise.all([
          supabase
            .from("demande_status_history")
            .select("id, step, step_label, notes, created_at, changed_by, profiles:profiles!demande_status_history_changed_by_fkey(nom, prenom)")
            .eq("demande_id", demandeId)
            .order("created_at", { ascending: false }),
          supabase
            .from("demande_documents_requests")
            .select("id, type_document, statut, created_at, fulfilled_at")
            .eq("demande_id", demandeId)
            .order("created_at", { ascending: false }),
          supabase
            .from("demande_documents")
            .select("id, file_name, categorie, created_at, uploaded_by")
            .eq("demande_id", demandeId)
            .order("created_at", { ascending: false }),
        ]);

      if (cancelled) return;

      const merged: HistoryEvent[] = [];

      (statusRows || []).forEach((r) => {
        const rr = r as {
          id: string;
          step: number;
          step_label: string;
          notes: string | null;
          created_at: string;
          profiles: { nom?: string | null; prenom?: string | null } | { nom?: string | null; prenom?: string | null }[] | null;
        };
        const profile = Array.isArray(rr.profiles) ? rr.profiles[0] : rr.profiles;
        const author = profile
          ? [profile.prenom, profile.nom].filter(Boolean).join(" ").trim() || null
          : null;
        merged.push({
          id: `s-${rr.id}`,
          kind: "status",
          date: rr.created_at,
          title: `Étape ${rr.step}/6 — ${rr.step_label}`,
          subtitle: rr.notes,
          author,
        });
      });

      (reqRows || []).forEach((r) => {
        const rr = r as {
          id: string;
          type_document: string;
          statut: string;
          created_at: string;
          fulfilled_at: string | null;
        };
        merged.push({
          id: `r-${rr.id}-created`,
          kind: "doc_request",
          date: rr.created_at,
          title: `Document demandé : ${rr.type_document}`,
          subtitle: rr.statut === "fourni" ? "Fourni par le client" : "En attente",
        });
        if (rr.statut === "fourni" && rr.fulfilled_at) {
          merged.push({
            id: `r-${rr.id}-fulfilled`,
            kind: "doc_upload",
            date: rr.fulfilled_at,
            title: `Document fourni : ${rr.type_document}`,
            subtitle: null,
          });
        }
      });

      (docRows || []).forEach((r) => {
        const rr = r as {
          id: string;
          file_name: string;
          categorie: string | null;
          created_at: string;
        };
        merged.push({
          id: `d-${rr.id}`,
          kind: "doc_upload",
          date: rr.created_at,
          title: `Upload : ${rr.file_name}`,
          subtitle: rr.categorie,
        });
      });

      // Tri DESC par date
      merged.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setEvents(merged);
    })();

    return () => {
      cancelled = true;
    };
  }, [demandeId, supabase]);

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return s;
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 p-4">
        <Clock className="h-3.5 w-3.5 text-nexus-orange-500" />
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Historique du dossier
        </p>
      </div>

      <div className="p-4">
        {events === null ? (
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Chargement…
          </p>
        ) : events.length === 0 ? (
          <p className="text-center text-xs italic text-slate-400">
            Aucune action enregistrée pour le moment.
          </p>
        ) : (
          <ol className="space-y-3">
            {events.map((e) => {
              const Icon =
                e.kind === "status"
                  ? ArrowRightCircle
                  : e.kind === "doc_request"
                    ? FileQuestion
                    : e.kind === "doc_upload"
                      ? Upload
                      : CheckCircle2;
              const accent =
                e.kind === "status"
                  ? "text-nexus-orange-600 bg-nexus-orange-50"
                  : e.kind === "doc_request"
                    ? "text-amber-700 bg-amber-50"
                    : "text-emerald-700 bg-emerald-50";
              return (
                <li key={e.id} className="flex gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      accent
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-nexus-blue-950">
                      {e.title}
                    </p>
                    {e.subtitle && (
                      <p className="text-xs text-slate-600">{e.subtitle}</p>
                    )}
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {formatDate(e.date)}
                      {e.author ? ` · ${e.author}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
