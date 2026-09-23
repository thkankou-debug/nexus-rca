import Link from "next/link";
import type { EncaissementGroup } from "@/lib/encaissements-par-service";

function money(amount: number, devise: string) {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${devise}`;
}

export function EncaissementsDonut({
  groups,
  periode,
  error,
}: {
  groups: EncaissementGroup[];
  periode: string;
  error?: string | null;
}) {
  return (
    <section className="rounded-2xl border border-[#eceef6] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#1c2033]">Répartition des encaissements par service</h2>
          <p className="mt-1 text-sm text-[#8b93a7]">
            {periode} · montant reçu des paiements et ventes de caisse. Hors devis, hors factures sans encaissement.
          </p>
        </div>
        <Link href="/dashboard/super-admin/finances" className="shrink-0 text-sm font-semibold text-[#7c5cfc]">
          Voir tout
        </Link>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-[#1c2033]">{error}</p>
      ) : groups.length === 0 ? (
        <p className="mt-6 text-sm text-[#8b93a7]">Aucun encaissement sur cette période.</p>
      ) : (
        <div className="mt-5 space-y-8">
          {groups.map((group) => (
            <Donut key={group.devise} group={group} />
          ))}
        </div>
      )}
    </section>
  );
}

function Donut({ group }: { group: EncaissementGroup }) {
  const radius = 42;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center">
      <div className="relative mx-auto h-44 w-44 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#f1f2f7" strokeWidth="14" />
          {group.slices.map((slice) => {
            const length = (slice.percent / 100) * circ;
            const dash = `${length} ${circ - length}`;
            const node = (
              <circle
                key={slice.label}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth="14"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return node;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs text-[#8b93a7]">Encaissé</span>
          <span className="text-sm font-bold text-[#1c2033]">{money(group.total, group.devise)}</span>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2">
        {group.slices.map((slice) => (
          <li key={slice.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
              <span className="truncate text-[#1c2033]">{slice.label}</span>
            </span>
            <span className="shrink-0 text-[#1c2033]">
              {money(slice.amount, group.devise)}
              <span className="ml-2 text-[#8b93a7]">{slice.percent.toLocaleString("fr-FR")} %</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
