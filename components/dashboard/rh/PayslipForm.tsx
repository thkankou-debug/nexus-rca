"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Loader2, Save, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Employee, Payslip, PayslipLigne } from "@/types";

interface PayslipFormProps {
  /** Si fourni → mode édition (PATCH brouillon uniquement) */
  payslip?: Payslip & { employees?: Pick<Employee, "id" | "nom_complet" | "poste" | "departement" | "email"> };
  /** Pré-sélectionne un employé (utilisé depuis la fiche employé) */
  defaultEmployeeId?: string;
  onSuccess: (p: Payslip) => void;
  submitLabel?: string;
}

// Type d'une ligne complémentaire (UI uniquement — l'objet sérialisé est un PayslipLigne)
type LigneType = "prime" | "indemnite" | "heures_supp" | "avance" | "deduction" | "autre";

const LIGNE_TYPE_LABELS: Record<LigneType, string> = {
  prime: "Prime",
  indemnite: "Indemnité",
  heures_supp: "Heures supp.",
  avance: "Avance",
  deduction: "Déduction",
  autre: "Autre",
};

const LIGNE_TYPES: LigneType[] = [
  "prime",
  "indemnite",
  "heures_supp",
  "avance",
  "deduction",
  "autre",
];

function lastDayOfMonth(dateISO: string): string {
  if (!dateISO) return "";
  const d = new Date(dateISO);
  if (Number.isNaN(d.getTime())) return "";
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  // ISO yyyy-mm-dd
  const yyyy = last.getFullYear();
  const mm = String(last.getMonth() + 1).padStart(2, "0");
  const dd = String(last.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatFcfaInline(amount: number): string {
  if (!Number.isFinite(amount)) return "0 FCFA";
  const intPart = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${intPart} FCFA`;
}

export function PayslipForm({
  payslip,
  defaultEmployeeId,
  onSuccess,
  submitLabel,
}: PayslipFormProps) {
  const isEdit = Boolean(payslip);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState<string>(
    payslip?.employee_id ?? defaultEmployeeId ?? ""
  );
  const [periodeDebut, setPeriodeDebut] = useState<string>(
    payslip?.periode_debut ?? ""
  );
  const [periodeFin, setPeriodeFin] = useState<string>(
    payslip?.periode_fin ?? ""
  );

  // Salaire de base (récupéré depuis l'employé sélectionné, modifiable)
  const [salaireBase, setSalaireBase] = useState<string>("");

  const [notesAdmin, setNotesAdmin] = useState<string>(
    payslip?.notes_admin ?? ""
  );

  // Lignes complémentaires (Phase C.2)
  const [lignes, setLignes] = useState<PayslipLigne[]>(
    Array.isArray(payslip?.details_lignes) ? (payslip!.details_lignes as PayslipLigne[]) : []
  );

  // Cotisations (Phase C.1)
  const [cnssPct, setCnssPct] = useState<string>(
    payslip?.cotisations && typeof payslip.cotisations.cnss === "number"
      ? "" // si fourni en montant absolu : recalc impossible → laisser default 3
      : "3"
  );
  const [irppFcfa, setIrppFcfa] = useState<string>(
    payslip?.cotisations && typeof payslip.cotisations.irpp === "number"
      ? String(payslip.cotisations.irpp)
      : "0"
  );
  const [itsFcfa, setItsFcfa] = useState<string>(
    payslip?.cotisations && typeof payslip.cotisations.its === "number"
      ? String(payslip.cotisations.its)
      : "0"
  );

  // En mode édition, on tente de retrouver le salaire de base initial
  useEffect(() => {
    if (!isEdit) return;
    if (!payslip) return;
    // base = brut - somme(lignes positives) - somme(lignes négatives) (donc base = brut - somme(lignes))
    const sum = (Array.isArray(payslip.details_lignes) ? payslip.details_lignes : []).reduce(
      (acc: number, l: PayslipLigne) => acc + (Number(l.montant) || 0),
      0
    );
    const base = Number(payslip.salaire_brut) - sum;
    setSalaireBase(String(Math.max(0, base)));
    // Si la cotisation cnss est en montant absolu, on remet 0 % pour éviter double-compte
    if (
      payslip.cotisations &&
      typeof payslip.cotisations.cnss === "number" &&
      Number(payslip.salaire_brut) > 0
    ) {
      const pct = (payslip.cotisations.cnss / Number(payslip.salaire_brut)) * 100;
      setCnssPct(pct ? String(Math.round(pct * 100) / 100) : "0");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charge la liste d'employés actifs (pour création)
  useEffect(() => {
    let cancelled = false;
    if (isEdit) return;
    setLoadingEmployees(true);
    fetch("/api/rh/employees")
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) {
          const list = (json.employees as Employee[]).filter(
            (e) => e.statut === "actif"
          );
          setEmployees(list);
        }
      })
      .catch((e) => console.error("[RH_PAYSLIP_FORM] fetch employees", e))
      .finally(() => {
        if (!cancelled) setLoadingEmployees(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isEdit]);

  // Auto-fill periodeFin = dernier jour du mois quand periodeDebut change
  useEffect(() => {
    if (!periodeDebut) return;
    if (periodeFin) return;
    const last = lastDayOfMonth(periodeDebut);
    if (last) setPeriodeFin(last);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodeDebut]);

  // Pré-remplit le salaire de base à partir de l'employé sélectionné (si vide)
  useEffect(() => {
    if (isEdit) return;
    if (!employeeId) return;
    if (salaireBase) return;
    const emp = employees.find((e) => e.id === employeeId);
    if (emp) {
      setSalaireBase(String(emp.salaire_base));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, employees]);

  const employeeLabel = useMemo(() => {
    if (payslip?.employees) {
      return `${payslip.employees.nom_complet} · ${payslip.employees.poste}`;
    }
    return null;
  }, [payslip]);

  // ─── Auto-calculs (Phase C) ──────────────────────────────────────────────
  const baseNum = Number(salaireBase) || 0;
  const sommeLignes = useMemo(
    () => lignes.reduce((acc, l) => acc + (Number(l.montant) || 0), 0),
    [lignes]
  );
  const salaireBrut = Math.max(0, baseNum + sommeLignes);

  const cnssMontant = Math.max(
    0,
    Math.round((salaireBrut * (Number(cnssPct) || 0)) / 100)
  );
  const irppMontant = Math.max(0, Number(irppFcfa) || 0);
  const itsMontant = Math.max(0, Number(itsFcfa) || 0);
  const totalCotisations = cnssMontant + irppMontant + itsMontant;
  const salaireNet = Math.max(0, salaireBrut - totalCotisations);

  // ─── Lignes handlers ─────────────────────────────────────────────────────
  const addLigne = () => {
    setLignes((prev) => [
      ...prev,
      { type: "prime", label: "", montant: 0 },
    ]);
  };

  const updateLigne = (index: number, patch: Partial<PayslipLigne>) => {
    setLignes((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const removeLigne = (index: number) => {
    setLignes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!isEdit && !employeeId) {
      setError("Veuillez choisir un employé");
      return;
    }
    if (!Number.isFinite(salaireBrut) || salaireBrut < 0) {
      setError("Salaire brut invalide");
      return;
    }
    if (!Number.isFinite(salaireNet) || salaireNet < 0) {
      setError("Salaire net invalide");
      return;
    }

    // Sanitize lignes
    const cleanLignes: PayslipLigne[] = lignes
      .filter((l) => l.label.trim() !== "" || Number(l.montant) !== 0)
      .map((l) => ({
        type: l.type,
        label: l.label.trim() || LIGNE_TYPE_LABELS[(l.type as LigneType) ?? "autre"] || "Ligne",
        montant: Number(l.montant) || 0,
      }));

    const cotisationsPayload = {
      cnss: cnssMontant,
      irpp: irppMontant,
      its: itsMontant,
    };

    setSubmitting(true);
    try {
      let res: Response;
      if (isEdit) {
        res = await fetch(`/api/rh/payslips/${payslip!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            salaire_brut: salaireBrut,
            salaire_net: salaireNet,
            details_lignes: cleanLignes,
            cotisations: cotisationsPayload,
            notes_admin: notesAdmin.trim() || null,
          }),
        });
      } else {
        res = await fetch("/api/rh/payslips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employee_id: employeeId,
            periode_debut: periodeDebut,
            periode_fin: periodeFin,
            salaire_brut: salaireBrut,
            salaire_net: salaireNet,
            details_lignes: cleanLignes,
            cotisations: cotisationsPayload,
            notes_admin: notesAdmin.trim() || undefined,
          }),
        });
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      onSuccess(json.payslip as Payslip);
    } catch (err) {
      console.error("[RH_PAYSLIP_FORM] submit", err);
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100/80"
    >
      <div>
        <h3 className="font-display text-lg font-bold text-nexus-blue-950">
          {isEdit ? "Modifier la fiche de paie" : "Nouvelle fiche de paie"}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          La fiche est créée en brouillon. Elle pourra ensuite être soumise pour
          validation.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Employé *
          </span>
          {isEdit ? (
            <input
              type="text"
              value={employeeLabel ?? "—"}
              disabled
              className={cn(inputClass, "cursor-not-allowed bg-slate-50 text-slate-500")}
            />
          ) : (
            <select
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={loadingEmployees}
              className={inputClass}
            >
              <option value="">— Choisir un employé actif —</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom_complet} · {e.poste}
                </option>
              ))}
            </select>
          )}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Période — début *
          </span>
          <input
            type="date"
            required
            value={periodeDebut}
            onChange={(e) => setPeriodeDebut(e.target.value)}
            disabled={isEdit}
            className={cn(
              inputClass,
              isEdit && "cursor-not-allowed bg-slate-50 text-slate-500"
            )}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Période — fin *
          </span>
          <input
            type="date"
            required
            value={periodeFin}
            onChange={(e) => setPeriodeFin(e.target.value)}
            disabled={isEdit}
            className={cn(
              inputClass,
              isEdit && "cursor-not-allowed bg-slate-50 text-slate-500"
            )}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Salaire de base (FCFA) *
          </span>
          <input
            type="number"
            required
            min={0}
            step={1}
            value={salaireBase}
            onChange={(e) => setSalaireBase(e.target.value)}
            className={inputClass}
          />
          <span className="mt-1 block text-[11px] text-slate-500">
            Pré-rempli depuis la fiche employé. Modifiable au besoin.
          </span>
        </label>
      </div>

      {/* ─── Section Lignes complémentaires ───────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50/40 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-nexus-orange-600">
              Phase C · Rémunération
            </p>
            <h4 className="font-display text-base font-bold text-nexus-blue-950">
              Lignes complémentaires
            </h4>
            <p className="mt-0.5 text-xs text-slate-500">
              Primes, indemnités, heures supp., avances, déductions… Montant
              négatif autorisé pour les déductions.
            </p>
          </div>
          <button
            type="button"
            onClick={addLigne}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-nexus-blue-950 shadow-sm transition hover:border-nexus-orange-300 hover:bg-nexus-orange-50/40"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter une ligne
          </button>
        </div>

        {lignes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-center text-xs text-slate-500">
            Aucune ligne complémentaire.
          </p>
        ) : (
          <ul className="space-y-2">
            {lignes.map((ligne, idx) => (
              <li
                key={idx}
                className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-[140px_1fr_140px_36px]"
              >
                <select
                  value={ligne.type}
                  onChange={(e) =>
                    updateLigne(idx, { type: e.target.value as LigneType })
                  }
                  className={cn(inputClass, "py-2")}
                >
                  {LIGNE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {LIGNE_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Ex: Prime fin de mois"
                  value={ligne.label}
                  onChange={(e) => updateLigne(idx, { label: e.target.value })}
                  className={cn(inputClass, "py-2")}
                />
                <input
                  type="number"
                  step={1}
                  placeholder="Montant FCFA"
                  value={ligne.montant}
                  onChange={(e) =>
                    updateLigne(idx, { montant: Number(e.target.value) || 0 })
                  }
                  className={cn(inputClass, "py-2")}
                />
                <button
                  type="button"
                  onClick={() => removeLigne(idx)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-700 shadow-sm transition hover:bg-rose-50"
                  aria-label="Supprimer la ligne"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ─── Section Cotisations ──────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50/40 p-5">
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-nexus-orange-600">
            Phase C · Cotisations RCA
          </p>
          <h4 className="font-display text-base font-bold text-nexus-blue-950">
            Cotisations
          </h4>
          <p className="mt-0.5 text-xs text-slate-500">
            CNSS en pourcentage du brut. IRPP et ITS en montant fixe FCFA.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
              CNSS salarié (%)
            </span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={cnssPct}
              onChange={(e) => setCnssPct(e.target.value)}
              className={inputClass}
            />
            <span className="mt-1 block text-[11px] text-slate-500">
              = {formatFcfaInline(cnssMontant)}
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
              IRPP (FCFA)
            </span>
            <input
              type="number"
              min={0}
              step={1}
              value={irppFcfa}
              onChange={(e) => setIrppFcfa(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
              ITS (FCFA)
            </span>
            <input
              type="number"
              min={0}
              step={1}
              value={itsFcfa}
              onChange={(e) => setItsFcfa(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Total cotisations :{" "}
          <span className="font-mono font-semibold text-nexus-blue-950">
            -{formatFcfaInline(totalCotisations)}
          </span>
        </p>
      </section>

      {/* ─── Notes admin ──────────────────────────────────────────────── */}
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-slate-700">
          Notes admin (optionnel)
        </span>
        <textarea
          rows={3}
          value={notesAdmin}
          onChange={(e) => setNotesAdmin(e.target.value)}
          className={inputClass}
          placeholder="Bonus, primes, contexte particulier…"
        />
      </label>

      {/* ─── Récap auto-calc ──────────────────────────────────────────── */}
      <section className="rounded-2xl border border-nexus-blue-950 bg-gradient-to-br from-nexus-blue-950 to-nexus-blue-900 p-5 text-white shadow-md">
        <p className="text-[10px] font-bold uppercase tracking-wider text-nexus-orange-300">
          Auto-calcul
        </p>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-300">
              Salaire brut
            </p>
            <p className="font-display text-3xl font-bold">
              {formatFcfaInline(salaireBrut)}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Base + lignes complémentaires
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-300">
              Net à payer
            </p>
            <p className="font-display text-3xl font-bold text-nexus-orange-300">
              {formatFcfaInline(salaireNet)}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Brut - cotisations
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-nexus-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {submitting
            ? "Enregistrement…"
            : (submitLabel ?? (isEdit ? "Enregistrer" : "Créer le brouillon"))}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-nexus-blue-950 shadow-sm transition focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200";
