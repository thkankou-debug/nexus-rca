"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Save,
  Globe,
  Languages,
  Check,
  AlertTriangle,
  Trash2,
  Download,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export type LangCode = "fr" | "en" | "sg" | "ar";

export interface Language {
  code: LangCode;
  label: string;
  native_label: string;
  flag: string; // emoji
  enabled: boolean;
  is_default: boolean;
  completion: number; // % of keys translated
}

export interface TranslationKey {
  id: string;
  namespace: string; // ex: "navbar", "dashboard", "emails"
  key: string; // ex: "cta.contact"
  values: Partial<Record<LangCode, string>>;
}

interface Props {
  initialLanguages: Language[];
  initialKeys: TranslationKey[];
}

export function I18nClient({ initialLanguages, initialKeys }: Props) {
  const [languages, setLanguages] = useState<Language[]>(initialLanguages);
  const [keys, setKeys] = useState<TranslationKey[]>(initialKeys);
  const [search, setSearch] = useState("");
  const [activeNamespace, setActiveNamespace] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Record<LangCode, string>>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const enabledLangs = languages.filter((l) => l.enabled);

  const namespaces = useMemo(() => {
    const set = new Set(keys.map((k) => k.namespace));
    return ["all", ...Array.from(set).sort()];
  }, [keys]);

  const filteredKeys = useMemo(() => {
    const q = search.trim().toLowerCase();
    return keys.filter((k) => {
      if (activeNamespace !== "all" && k.namespace !== activeNamespace) return false;
      if (!q) return true;
      if (k.key.toLowerCase().includes(q)) return true;
      if (k.namespace.toLowerCase().includes(q)) return true;
      return Object.values(k.values).some((v) =>
        (v ?? "").toLowerCase().includes(q)
      );
    });
  }, [keys, search, activeNamespace]);

  function toggleLanguage(code: LangCode) {
    setLanguages((prev) =>
      prev.map((l) =>
        l.code === code
          ? { ...l, enabled: l.is_default ? true : !l.enabled }
          : l
      )
    );
    setHasChanges(true);
  }

  function setDefault(code: LangCode) {
    setLanguages((prev) =>
      prev.map((l) => ({
        ...l,
        is_default: l.code === code,
        enabled: l.code === code ? true : l.enabled,
      }))
    );
    setHasChanges(true);
  }

  function startEdit(k: TranslationKey) {
    setEditingId(k.id);
    setEditValues({ ...k.values });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValues({});
  }

  function saveEdit() {
    if (!editingId) return;
    setKeys((prev) =>
      prev.map((k) =>
        k.id === editingId ? { ...k, values: { ...editValues } } : k
      )
    );
    setEditingId(null);
    setEditValues({});
    setHasChanges(true);
    toast.success("Traduction mise à jour");
  }

  function deleteKey(id: string) {
    if (!confirm("Supprimer définitivement cette clé ?")) return;
    setKeys((prev) => prev.filter((k) => k.id !== id));
    setHasChanges(true);
    toast.success("Clé supprimée");
  }

  function handleSaveAll() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setHasChanges(false);
      toast.success("Configuration i18n enregistrée");
    }, 700);
  }

  function handleExport() {
    const data = JSON.stringify(
      {
        languages: languages.filter((l) => l.enabled),
        translations: keys,
      },
      null,
      2
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexus-i18n-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export JSON téléchargé");
  }

  function handleImport() {
    toast("Import JSON — bientôt disponible", { icon: "📥" });
  }

  return (
    <div className="space-y-6">
      {/* ─── Sticky save bar ─────────────────────────────────────── */}
      {hasChanges && (
        <div className="sticky top-4 z-20 flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 shadow-md">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            Modifications non enregistrées
          </div>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-nexus-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Save className="h-4 w-4" />
            {saving ? "Enregistrement…" : "Enregistrer la configuration"}
          </button>
        </div>
      )}

      {/* ─── Section langues ─────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-nexus-blue-950">
              Langues disponibles
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Activez les langues et définissez la langue par défaut.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className={cn(
                "rounded-xl border-2 p-4 transition-colors",
                lang.is_default
                  ? "border-nexus-orange-500 bg-nexus-orange-50/50"
                  : lang.enabled
                  ? "border-emerald-200 bg-white"
                  : "border-slate-200 bg-slate-50/50"
              )}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <p className="font-display font-semibold text-nexus-blue-950">
                        {lang.label}
                      </p>
                      <p className="text-xs text-slate-500">{lang.native_label}</p>
                    </div>
                  </div>
                </div>
                {lang.is_default && (
                  <span className="rounded-full bg-nexus-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    Défaut
                  </span>
                )}
              </div>

              <div className="mb-3">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Couverture</span>
                  <span className="font-semibold text-nexus-blue-950">
                    {lang.completion}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={cn(
                      "h-full transition-all",
                      lang.completion >= 90
                        ? "bg-emerald-500"
                        : lang.completion >= 50
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    )}
                    style={{ width: `${lang.completion}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleLanguage(lang.code)}
                  disabled={lang.is_default}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    lang.enabled
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300",
                    lang.is_default && "cursor-not-allowed opacity-60"
                  )}
                >
                  {lang.enabled ? (
                    <span className="inline-flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Activée
                    </span>
                  ) : (
                    "Désactivée"
                  )}
                </button>
                {!lang.is_default && lang.enabled && (
                  <button
                    type="button"
                    onClick={() => setDefault(lang.code)}
                    className="rounded-lg bg-nexus-blue-950 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-nexus-blue-900"
                    title="Définir comme langue par défaut"
                  >
                    Défaut
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Section traductions ─────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white">
                <Languages className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-nexus-blue-950">
                  Clés de traduction
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {keys.length} clé{keys.length > 1 ? "s" : ""} ·{" "}
                  {enabledLangs.length} langue{enabledLangs.length > 1 ? "s" : ""} active
                  {enabledLangs.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleImport}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Upload className="h-3.5 w-3.5" />
                Importer
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                Exporter JSON
              </button>
              <button
                type="button"
                onClick={() => toast("Création de clé — bientôt disponible", { icon: "✨" })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-nexus-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-nexus-orange-600"
              >
                <Plus className="h-3.5 w-3.5" />
                Nouvelle clé
              </button>
            </div>
          </div>

          {/* Filtres */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par clé, namespace ou valeur…"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-nexus-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-nexus-orange-100"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {namespaces.map((ns) => (
                <button
                  key={ns}
                  type="button"
                  onClick={() => setActiveNamespace(ns)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    activeNamespace === ns
                      ? "bg-nexus-blue-950 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {ns === "all" ? "Tout" : ns}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Liste */}
        {filteredKeys.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">
            Aucune clé ne correspond à vos critères.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredKeys.map((k) => {
              const isEditing = editingId === k.id;
              const missingLangs = enabledLangs.filter(
                (l) => !k.values[l.code] || k.values[l.code]?.trim() === ""
              );
              return (
                <div key={k.id} className="px-6 py-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                        {k.namespace}
                      </span>
                      <code className="font-mono text-sm font-semibold text-nexus-blue-950">
                        {k.key}
                      </code>
                      {missingLangs.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-700">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          {missingLangs.length} manquant
                          {missingLangs.length > 1 ? "es" : "e"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                          >
                            Annuler
                          </button>
                          <button
                            type="button"
                            onClick={saveEdit}
                            className="rounded-md bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-600"
                          >
                            Valider
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(k)}
                            className="rounded-md px-2 py-1 text-xs font-medium text-nexus-blue-700 hover:bg-blue-50"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteKey(k.id)}
                            className="rounded-md p-1 text-rose-500 hover:bg-rose-50"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {enabledLangs.map((lang) => {
                      const val = isEditing
                        ? editValues[lang.code] ?? ""
                        : k.values[lang.code] ?? "";
                      const missing = !val || val.trim() === "";
                      return (
                        <div
                          key={lang.code}
                          className={cn(
                            "rounded-lg border p-2.5",
                            missing
                              ? "border-rose-200 bg-rose-50/40"
                              : "border-slate-200 bg-slate-50/40"
                          )}
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                              <span className="text-base leading-none">{lang.flag}</span>
                              {lang.label}
                              {lang.is_default && (
                                <span className="ml-1 rounded bg-nexus-orange-100 px-1 py-0 text-[9px] font-bold uppercase text-nexus-orange-700">
                                  défaut
                                </span>
                              )}
                            </span>
                            {missing && !isEditing && (
                              <span className="text-[10px] font-medium text-rose-600">
                                Manquant
                              </span>
                            )}
                          </div>
                          {isEditing ? (
                            <textarea
                              value={val}
                              onChange={(e) =>
                                setEditValues((prev) => ({
                                  ...prev,
                                  [lang.code]: e.target.value,
                                }))
                              }
                              rows={2}
                              className="w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-100"
                              placeholder={`Traduction en ${lang.label.toLowerCase()}…`}
                            />
                          ) : (
                            <p
                              className={cn(
                                "text-sm",
                                missing ? "italic text-rose-400" : "text-slate-800"
                              )}
                            >
                              {missing ? "— non traduit —" : val}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── Note technique ───────────────────────────────────────── */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <strong>Note technique :</strong> données mockées. L&apos;intégration{" "}
        <code className="rounded bg-amber-100 px-1 py-0.5 font-mono">next-intl</code>{" "}
        + table <code className="rounded bg-amber-100 px-1 py-0.5 font-mono">i18n_translations</code>{" "}
        + colonne <code className="rounded bg-amber-100 px-1 py-0.5 font-mono">profiles.langue_preferee</code>{" "}
        seront ajoutées en Phase 7. Le switcher de langue Navbar/Dashboard
        sera branché à ce backoffice.
      </div>
    </div>
  );
}
