export type MoneyRow = {
  label: string;
  amount: number;
  devise: string;
};

export type EncaissementSlice = {
  label: string;
  amount: number;
  percent: number;
  color: string;
};

export type EncaissementGroup = {
  devise: string;
  total: number;
  slices: EncaissementSlice[];
};

const CAISSE_LABELS: Record<string, string> = {
  photocopie: "Photocopie",
  impression: "Impression",
  scan: "Scan",
  numerisation: "Numérisation",
  plastification: "Plastification",
  saisie_document: "Saisie de document",
  assistance_formulaire: "Assistance formulaire",
  photo_identite: "Photo d'identité",
  autre: "Autre",
};

export function caisseServiceLabel(code: string | null | undefined): string {
  if (!code) return "Caisse";
  return CAISSE_LABELS[code] || code;
}

const DOSSIER_LABELS: Record<string, string> = {
  visa: "Visa",
  etudes_bourses: "Études & Bourses",
  billets_hotels: "Billets & Hôtels",
  assurances: "Assurances",
  financement_incubateur: "Financement & Incubateur",
  digitalisation: "Digitalisation",
  recouvrement: "Recouvrement",
  transferts: "Transferts d'argent",
};

export function isGenericService(value: string | null | undefined): boolean {
  const normalized = (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return normalized === "" || normalized === "autre" || normalized === "autres" || normalized === "non precise";
}

/** Libellé réel : service saisi, sinon service du dossier, sinon sa catégorie, sinon une description courte. */
export function paymentSliceLabel(input: {
  service: string | null;
  description?: string | null;
  dossierService?: string | null;
  categorie?: string | null;
}): string {
  const service = input.service?.trim() || "";
  if (service && !isGenericService(service)) return service;
  const dossierService = input.dossierService?.trim() || "";
  if (dossierService && !isGenericService(dossierService)) return dossierService;
  const categorie = input.categorie?.trim() || "";
  if (categorie && DOSSIER_LABELS[categorie]) return DOSSIER_LABELS[categorie];
  const description = input.description?.trim() || "";
  if (description && description.length <= 48) return description;
  return service || "Non précisé";
}

const COLORS = ["#7c5cfc", "#22c55e", "#3b82f6", "#f97316", "#14b8a6", "#eab308", "#ec4899", "#94a3b8"];

function toPercents(amounts: number[], total: number): number[] {
  if (total === 0) return amounts.map(() => 0);
  const tenths = amounts.map((amount) => (amount / total) * 1000);
  const floors = tenths.map((value) => Math.floor(value));
  let leftover = 1000 - floors.reduce((sum, value) => sum + value, 0);
  const order = tenths
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac);
  const out = [...floors];
  if (leftover < 0) {
    while (leftover < 0) {
      const index = out.indexOf(Math.max(...out));
      out[index] -= 1;
      leftover += 1;
    }
  } else {
    for (let i = 0; i < leftover; i += 1) out[order[i % order.length].index] += 1;
  }
  return out.map((value) => value / 10);
}

export function buildEncaissementGroups(rows: MoneyRow[]): EncaissementGroup[] {
  const byDevise = new Map<string, Map<string, number>>();
  for (const row of rows) {
    const amount = Number(row.amount);
    if (!Number.isFinite(amount) || amount <= 0) continue;
    const devise = row.devise || "XAF";
    const label = row.label.trim() || "Non précisé";
    const labels = byDevise.get(devise) ?? new Map<string, number>();
    labels.set(label, (labels.get(label) ?? 0) + amount);
    byDevise.set(devise, labels);
  }

  return Array.from(byDevise.entries())
    .map(([devise, labels]) => {
      const entries = Array.from(labels.entries())
        .map(([label, amount]) => ({ label, amount }))
        .sort((a, b) => b.amount - a.amount);
      const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
      const percents = toPercents(entries.map((entry) => entry.amount), total);
      const slices = entries.map((entry, index) => ({
        label: entry.label,
        amount: entry.amount,
        percent: percents[index],
        color: COLORS[index % COLORS.length],
      }));
      return { devise, total, slices };
    })
    .sort((a, b) => b.total - a.total);
}
