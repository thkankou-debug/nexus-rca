import type { LucideIcon } from "lucide-react";

function formatMoney(amount: number, currency: string): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

export function RevenusParServiceCard({
  rows,
  icon: Icon,
}: {
  rows: Array<{ service: string; total: number; devise: string; nbPaiements: number }>;
  icon: LucideIcon;
}) {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-nexus-orange-600" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">
          Revenus par service
        </h2>
      </div>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          Aucun paiement enregistré pour le moment.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {rows.map((r) => (
            <li
              key={`${r.service}-${r.devise}`}
              className="flex items-center justify-between gap-3 py-2 text-sm"
            >
              <span className="font-medium text-nexus-blue-950">{r.service}</span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {r.nbPaiements} paiement{r.nbPaiements > 1 ? "s" : ""}
                </span>
                <span className="font-semibold text-nexus-blue-950">
                  {formatMoney(r.total, r.devise)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
