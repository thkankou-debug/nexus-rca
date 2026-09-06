"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, ListTodo, Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { cn, formatDate } from "@/lib/utils";

interface Tache {
  id: string;
  titre: string;
  status: string;
  priority: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  assigned_to: string;
  created_by: string;
}

const PRIORITY_LABEL: Record<string, string> = {
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
  urgente: "Urgente",
};

const PRIORITY_COLOR: Record<string, string> = {
  basse: "bg-slate-100 text-slate-600",
  normale: "bg-blue-100 text-blue-700",
  haute: "bg-rose-100 text-rose-700",
  urgente: "bg-red-100 text-red-700",
};

export function DossierTachesTab({ demandeId }: { demandeId: string }) {
  const [taches, setTaches] = useState<Tache[] | null>(null);
  const [titre, setTitre] = useState("");
  const [priority, setPriority] = useState("normale");
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/demandes/${demandeId}/taches`);
        if (!res.ok) throw new Error("Erreur de chargement");
        const data = (await res.json()) as { taches: Tache[] };
        if (!cancelled) setTaches(data.taches || []);
      } catch (err) {
        console.error("[TACHES_TAB] fetch error:", err);
        if (!cancelled) setTaches([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [demandeId]);

  const create = async () => {
    const trimmed = titre.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/demandes/${demandeId}/taches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titre: trimmed, priority, due_date: dueDate || null }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        tache?: Tache;
        error?: string;
      };
      if (!res.ok || !json.success || !json.tache) {
        throw new Error(json.error || "Erreur serveur");
      }
      setTaches((prev) => [json.tache as Tache, ...(prev || [])]);
      setTitre("");
      setDueDate("");
      setPriority("normale");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Création impossible");
    } finally {
      setCreating(false);
    }
  };

  const toggle = async (t: Tache) => {
    const done = t.status !== "terminee";
    setTogglingId(t.id);
    try {
      const res = await fetch(`/api/taches/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      setTaches((prev) =>
        (prev || []).map((x) =>
          x.id === t.id
            ? { ...x, status: done ? "terminee" : "a_faire", completed_at: done ? new Date().toISOString() : null }
            : x
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Mise à jour impossible");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Nouvelle tâche…"
            className="min-w-[180px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-nexus-blue-950 focus:border-nexus-orange-400 focus:outline-none focus:ring-1 focus:ring-nexus-orange-300"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-700 focus:outline-none"
          >
            <option value="basse">Basse</option>
            <option value="normale">Normale</option>
            <option value="haute">Haute</option>
            <option value="urgente">Urgente</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-2 text-xs text-slate-700 focus:outline-none"
          />
          <button
            type="button"
            onClick={create}
            disabled={creating || !titre.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-nexus-orange-500 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Ajouter
          </button>
        </div>
      </div>

      {taches === null ? (
        <div className="flex items-center gap-2 p-6 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement…
        </div>
      ) : taches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <ListTodo className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-3 text-sm text-slate-500">Aucune tâche pour ce dossier.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {taches.map((t) => {
            const done = t.status === "terminee";
            return (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggle(t)}
                  disabled={togglingId === t.id}
                  className="shrink-0 text-slate-400 hover:text-emerald-600 disabled:opacity-50"
                >
                  {togglingId === t.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-semibold", done ? "text-slate-400 line-through" : "text-nexus-blue-950")}>
                    {t.titre}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t.due_date ? `Échéance ${formatDate(t.due_date)}` : "Sans échéance"}
                  </p>
                </div>
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", PRIORITY_COLOR[t.priority] || PRIORITY_COLOR.normale)}>
                  {PRIORITY_LABEL[t.priority] || t.priority}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
