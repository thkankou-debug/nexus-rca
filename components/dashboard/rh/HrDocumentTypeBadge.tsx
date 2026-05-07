import { FileText, GraduationCap, IdCard, Paperclip, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HrDocumentType } from "@/types";

const STYLES: Record<HrDocumentType, { className: string; icon: LucideIcon; label: string }> = {
  contrat: {
    className: "bg-nexus-blue-100 text-nexus-blue-800 dark:bg-nexus-blue-900/40 dark:text-nexus-blue-200",
    icon: FileText,
    label: "Contrat",
  },
  diplome: {
    className: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
    icon: GraduationCap,
    label: "Diplôme",
  },
  piece_identite: {
    className: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    icon: IdCard,
    label: "Pièce d'identité",
  },
  autre: {
    className: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
    icon: Paperclip,
    label: "Autre",
  },
};

export function HrDocumentTypeBadge({ type }: { type: HrDocumentType }) {
  const style = STYLES[type] ?? STYLES.autre;
  const Icon = style.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        style.className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {style.label}
    </span>
  );
}

export const HR_DOCUMENT_TYPE_LABELS: Record<HrDocumentType, string> = {
  contrat: "Contrat",
  diplome: "Diplôme",
  piece_identite: "Pièce d'identité",
  autre: "Autre",
};
