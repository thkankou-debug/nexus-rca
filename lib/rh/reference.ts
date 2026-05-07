// Génère une référence type PAIE-2026-MAI-001
// On utilise le mois de la période + un compteur basé sur les fiches existantes
// dans le même mois.

const MOIS_LABELS = [
  "JAN",
  "FEV",
  "MAR",
  "AVR",
  "MAI",
  "JUN",
  "JUL",
  "AOU",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export function payslipReferencePrefix(periodeDebut: string): string {
  const d = new Date(periodeDebut);
  const year = d.getFullYear();
  const monthLabel = MOIS_LABELS[d.getMonth()] ?? "XXX";
  return `PAIE-${year}-${monthLabel}`;
}

export function buildPayslipReference(
  periodeDebut: string,
  sequence: number
): string {
  const prefix = payslipReferencePrefix(periodeDebut);
  return `${prefix}-${String(sequence).padStart(3, "0")}`;
}

const FRENCH_MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export function buildMoisLibelle(periodeDebut: string): string {
  const d = new Date(periodeDebut);
  return `${FRENCH_MONTHS[d.getMonth()] ?? ""} ${d.getFullYear()}`.trim();
}
