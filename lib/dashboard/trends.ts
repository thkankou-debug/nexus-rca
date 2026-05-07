// ============================================================================
// DASHBOARD TRENDS — helpers SQL réels (rolling 7-day window)
// ----------------------------------------------------------------------------
// Approche : on récupère les rows brutes des 7 derniers jours via Supabase,
// et on les bucket par jour côté JS. Plus simple qu'un RPC pour low-volume.
// Cohérent avec la timezone serveur (les dates sont normalisées à minuit local).
// ============================================================================

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Date ISO du jour (minuit local) il y a N jours.
 * Utilisé comme borne inférieure des queries 7 jours.
 */
export function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/**
 * Bucketise une liste de rows par jour sur une fenêtre glissante.
 * Retourne un tableau de longueur `days`, du plus ancien au plus récent.
 *
 * @param rows       Liste d'objets contenant un champ date.
 * @param dateField  Nom du champ contenant la date (ISO string).
 * @param valueField Si fourni, somme la valeur par jour ; sinon compte les rows.
 * @param days       Nombre de buckets (défaut 7).
 */
export function bucketByDay<T extends Record<string, unknown>>(
  rows: T[],
  dateField: keyof T,
  valueField?: keyof T,
  days = 7
): number[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets: number[] = new Array(days).fill(0);

  for (const row of rows) {
    const raw = row[dateField] as unknown;
    if (typeof raw !== "string") continue;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) continue;
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - d.getTime()) / ONE_DAY_MS);
    if (diffDays < 0 || diffDays >= days) continue;
    // index : oldest first (diffDays = days-1) → newest last (diffDays = 0)
    const idx = days - 1 - diffDays;
    if (valueField !== undefined) {
      const v = Number(row[valueField] as unknown) || 0;
      buckets[idx] += v;
    } else {
      buckets[idx] += 1;
    }
  }
  return buckets;
}

/**
 * Calcule le delta % entre le premier et le dernier point d'une série.
 * Retourne 0 si la série est trop courte ou si le premier point est nul.
 */
export function trendDelta(series: number[]): number {
  if (series.length < 2) return 0;
  const first = series[0];
  const last = series[series.length - 1];
  if (first === 0) return last > 0 ? 100 : 0;
  return ((last - first) / first) * 100;
}

/**
 * Combine deux séries point par point (somme).
 * Utile pour : encaissements totaux = paiements + ventes caisse.
 */
export function sumSeries(a: number[], b: number[]): number[] {
  const len = Math.max(a.length, b.length);
  const out: number[] = [];
  for (let i = 0; i < len; i++) {
    out.push((a[i] ?? 0) + (b[i] ?? 0));
  }
  return out;
}

/**
 * Cumule une série (running total).
 * Utile pour : encaissé cumulé du mois jour par jour.
 */
export function cumulativeSeries(series: number[]): number[] {
  const out: number[] = [];
  let acc = 0;
  for (const v of series) {
    acc += v;
    out.push(acc);
  }
  return out;
}
