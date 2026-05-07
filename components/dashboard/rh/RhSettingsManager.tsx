"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, AlertTriangle, CheckCircle2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RhSetting, RhSettingCategory } from "@/types";
import { RH_SETTING_CATEGORY_LABELS } from "@/types";

const CATEGORY_ORDER: RhSettingCategory[] = [
  "general",
  "cotisations",
  "paie",
  "contrat",
  "conges",
  "notifications",
];

const CATEGORY_ACCENT: Record<RhSettingCategory, string> = {
  general: "from-slate-500 to-slate-700",
  cotisations: "from-emerald-500 to-emerald-700",
  paie: "from-amber-500 to-amber-700",
  conges: "from-blue-500 to-blue-700",
  contrat: "from-purple-500 to-purple-700",
  notifications: "from-rose-500 to-rose-700",
};

export function RhSettingsManager() {
  const [settings, setSettings] = useState<RhSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [activeCat, setActiveCat] = useState<RhSettingCategory>("cotisations");

  // Local edits keyed by setting.key → { value_text?, value_number? }
  const [edits, setEdits] = useState<
    Record<string, { value_text?: string | null; value_number?: number | null }>
  >({});

  useEffect(() => {
    fetch("/api/rh/settings")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setSettings(json.settings as RhSetting[]);
        else setError(json.error || "Erreur");
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<RhSettingCategory, RhSetting[]>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const s of settings) {
      const list = map.get(s.category) ?? [];
      list.push(s);
      map.set(s.category, list);
    }
    return map;
  }, [settings]);

  const handleSave = async () => {
    if (Object.keys(edits).length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const updates = Object.entries(edits).map(([key, v]) => ({ key, ...v }));
      const res = await fetch("/api/rh/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      // Refresh
      const r = await fetch("/api/rh/settings");
      const j = await r.json();
      if (j.success) setSettings(j.settings);
      setEdits({});
      setSavedAt(new Date());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
        {error}
      </div>
    );
  }

  const dirty = Object.keys(edits).length > 0;

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200">
        {CATEGORY_ORDER.map((cat) => {
          const count = grouped.get(cat)?.length ?? 0;
          if (count === 0) return null;
          const active = activeCat === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCat(cat)}
              className={cn(
                "relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "text-nexus-blue-950"
                  : "text-slate-500 hover:text-nexus-blue-950"
              )}
            >
              <span
                className={cn(
                  "h-6 w-6 rounded-md bg-gradient-to-br text-white shadow-sm flex items-center justify-center text-[10px] font-bold",
                  CATEGORY_ACCENT[cat]
                )}
              >
                {count}
              </span>
              {RH_SETTING_CATEGORY_LABELS[cat]}
              {active && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-nexus-orange-400 to-nexus-orange-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Settings list */}
      <div className="space-y-3">
        {(grouped.get(activeCat) ?? []).map((s) => {
          const edit = edits[s.key];
          const isNumber = s.value_number !== null && s.value_text === null;
          const currentValue = isNumber
            ? edit?.value_number !== undefined
              ? edit.value_number
              : s.value_number
            : edit?.value_text !== undefined
              ? edit.value_text
              : s.value_text;

          return (
            <div
              key={s.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100/80"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-bold text-nexus-blue-950">
                    {s.label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{s.description}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                    {s.key}
                  </p>
                </div>

                <div className="shrink-0 sm:w-64">
                  {isNumber ? (
                    <input
                      type="number"
                      step="0.01"
                      value={currentValue ?? 0}
                      onChange={(e) =>
                        setEdits((prev) => ({
                          ...prev,
                          [s.key]: { value_number: Number(e.target.value) },
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold tabular-nums text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
                    />
                  ) : (
                    <input
                      type="text"
                      value={(currentValue as string) ?? ""}
                      onChange={(e) =>
                        setEdits((prev) => ({
                          ...prev,
                          [s.key]: { value_text: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-nexus-blue-950 shadow-sm focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {(grouped.get(activeCat) ?? []).length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            <Settings className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            Aucun paramètre dans cette catégorie.
          </div>
        )}
      </div>

      {/* Save bar (sticky) */}
      {dirty && (
        <div className="sticky bottom-4 mt-6 flex items-center justify-between rounded-2xl border border-nexus-orange-300 bg-white p-4 shadow-lg ring-1 ring-nexus-orange-200/60">
          <p className="text-sm font-semibold text-nexus-blue-950">
            {Object.keys(edits).length} modification(s) en attente
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEdits({})}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      )}

      {savedAt && !dirty && (
        <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Enregistré à {savedAt.toLocaleTimeString("fr-FR")}
        </div>
      )}
    </div>
  );
}
