"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Employee, Payslip } from "@/types";

interface PayslipFormProps {
  /** Si fourni → mode édition (PATCH brouillon uniquement) */
  payslip?: Payslip & { employees?: Pick<Employee, "id" | "nom_complet" | "poste" | "departement" | "email"> };
  /** Pré-sélectionne un employé (utilisé depuis la fiche employé) */
  defaultEmployeeId?: string;
  onSuccess: (p: Payslip) => void;
  submitLabel?: string;
}

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
  const [salaireBrut, setSalaireBrut] = useState<string>(
    payslip ? String(payslip.salaire_brut) : ""
  );
  const [salaireNet, setSalaireNet] = useState<string>(
    payslip ? String(payslip.salaire_net) : ""
  );
  const [notesAdmin, setNotesAdmin] = useState<string>(
    payslip?.notes_admin ?? ""
  );

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

  // Pré-remplit le salaire brut à partir de l'employé sélectionné (si vide)
  useEffect(() => {
    if (isEdit) return;
    if (!employeeId) return;
    if (salaireBrut) return;
    const emp = employees.find((e) => e.id === employeeId);
    if (emp) {
      setSalaireBrut(String(emp.salaire_base));
      setSalaireNet(String(emp.salaire_base));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, employees]);

  const employeeLabel = useMemo(() => {
    if (payslip?.employees) {
      return `${payslip.employees.nom_complet} · ${payslip.employees.poste}`;
    }
    return null;
  }, [payslip]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!isEdit && !employeeId) {
      setError("Veuillez choisir un employé");
      return;
    }
    const brut = Number(salaireBrut);
    const net = Number(salaireNet);
    if (!Number.isFinite(brut) || brut < 0 || !Number.isFinite(net) || net < 0) {
      setError("Montants invalides");
      return;
    }

    setSubmitting(true);
    try {
      let res: Response;
      if (isEdit) {
        res = await fetch(`/api/rh/payslips/${payslip!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            salaire_brut: brut,
            salaire_net: net,
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
            salaire_brut: brut,
            salaire_net: net,
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
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
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

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Salaire brut (FCFA) *
          </span>
          <input
            type="number"
            required
            min={0}
            step={1}
            value={salaireBrut}
            onChange={(e) => setSalaireBrut(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
            Salaire net (FCFA) *
          </span>
          <input
            type="number"
            required
            min={0}
            step={1}
            value={salaireNet}
            onChange={(e) => setSalaireNet(e.target.value)}
            className={inputClass}
          />
          <span className="mt-1 block text-[11px] text-slate-500">
            Par défaut, identique au brut. Les cotisations seront ajoutées en
            phase ultérieure.
          </span>
        </label>

        <label className="block sm:col-span-2">
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
      </div>

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
