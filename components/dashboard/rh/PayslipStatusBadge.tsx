import { cn } from "@/lib/utils";
import type { PayslipStatut } from "@/types";

const STATUS_STYLES: Record<PayslipStatut, string> = {
  brouillon:
    "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  en_attente_validation:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  validee:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};

const STATUS_LABELS: Record<PayslipStatut, string> = {
  brouillon: "Brouillon",
  en_attente_validation: "En attente validation",
  validee: "Validée",
};

export function PayslipStatusBadge({ status }: { status: PayslipStatut }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export { STATUS_LABELS as PAYSLIP_STATUS_LABELS };
