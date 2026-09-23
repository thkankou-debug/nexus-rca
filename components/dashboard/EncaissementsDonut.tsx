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
  const radius = 38;
  const stroke = 16;
  const angles = visibleAngles(group.slices.map((slice) => slice.percent));
  const gap = group.slices.length > 1 ? 12 : 0;
  let cursor = -90;

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center">
      <div className="relative mx-auto h-48 w-48 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#f3f1fb" strokeWidth={stroke} />
          {group.slices.map((slice, index) => {
            const sweep = angles[index];
            const pad = sweep > gap + 2 ? gap : 0;
            const start = cursor + pad / 2;
            const end = cursor + sweep - pad / 2;
            cursor += sweep;
            return (
              <path
                key={slice.label}
                d={arcPath(60, 60, radius, start, end)}
                fill="none"
                stroke={slice.color}
                strokeWidth={stroke}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <span className="text-xs text-[#8b93a7]">Encaissé</span>
          <span className="text-sm font-bold leading-tight text-[#1c2033]">{money(group.total, group.devise)}</span>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2.5">
        {group.slices.map((slice) => (
          <li key={slice.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
              <span className="truncate text-[#1c2033]">{slice.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-[#1c2033]">
              {money(slice.amount, group.devise)}
              <span className="ml-2 text-[#8b93a7]">{slice.percent.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function visibleAngles(percents: number[]): number[] {
  const count = percents.length;
  if (count === 0) return [];
  if (count === 1) return [360];
  const min = Math.min(28, 360 / count);
  const raw = percents.map((percent) => (percent / 100) * 360);
  const deficit = raw.reduce((sum, angle) => sum + (angle < min ? min - angle : 0), 0);
  const large = raw.reduce((sum, angle) => sum + (angle >= min ? angle : 0), 0);
  if (large <= 0) return raw.map(() => 360 / count);
  return raw.map((angle) => (angle < min ? min : angle - deficit * (angle / large)));
}

function arcPath(cx: number, cy: number, radius: number, startDeg: number, endDeg: number) {
  const point = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
  };
  const [x1, y1] = point(startDeg);
  const [x2, y2] = point(Math.min(endDeg, startDeg + 359.2));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
}
