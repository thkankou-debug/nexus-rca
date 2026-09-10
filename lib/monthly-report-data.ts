// ============================================================================
// MONTHLY REPORT — Agrégation server-side des KPI Nexus
// ----------------------------------------------------------------------------
// Reproduit la logique de components/dashboard/MonthlyReportGenerator.tsx
// (loadMonthData) côté serveur, à partir d'un client Supabase admin.
//
// Tables lues : payments, quick_sales, expenses, transferts, profiles
// Toutes les requêtes sont scopées par mois (UTC).
// ============================================================================

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getAdminSupabase() {
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "[MONTHLY_REPORT] NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquante"
    );
  }
  return createSupabaseClient(
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export interface MonthBounds {
  year: number;
  month: number; // 1..12
  start: string; // ISO
  end: string; // ISO (inclusive last second)
  label: string; // "Mai 2026"
}

const FR_MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export function monthBoundsFor(year: number, month: number): MonthBounds {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return {
    year,
    month,
    start: start.toISOString(),
    end: end.toISOString(),
    label: `${FR_MONTHS[month - 1]} ${year}`,
  };
}

export function previousMonthBounds(now: Date = new Date()): MonthBounds {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth(); // 0..11 → mois précédent en 1-based
  // Si on est en janvier (m=0), le mois précédent = décembre de l'année passée.
  const targetMonth = m === 0 ? 12 : m;
  const targetYear = m === 0 ? y - 1 : y;
  return monthBoundsFor(targetYear, targetMonth);
}

// ─── Types KPI ──────────────────────────────────────────────────────────────
export interface DeviseAgg {
  devise: string;
  total: number;
  count: number;
}
export interface PaiementAgg extends DeviseAgg {
  restant: number;
}
export interface TransfertAgg extends DeviseAgg {
  frais: number;
}
export interface AgentAgg {
  id: string;
  nom: string;
  paiements_xaf: number;
  caisse_xaf: number;
  total_xaf: number;
  rdv_termines: number;
}
export interface PartielRow {
  reference: string | null;
  client_nom: string | null;
  service: string | null;
  devise: string;
  montant_total: number;
  montant_recu: number;
  montant_restant: number;
}
export interface MonthSummary {
  bounds: MonthBounds;
  paiements: PaiementAgg[];
  caisse: DeviseAgg[];
  depenses: DeviseAgg[];
  depensesEnAttente: DeviseAgg[];
  transferts: TransfertAgg[];
  partiels: PartielRow[];
  topAgents: AgentAgg[];
  rdvCount: number;
  rdvTermines: number;
  // Totaux XAF agrégés (pour le résumé email + index)
  totals: {
    revenus_xaf: number;
    paiements_count: number;
    nouvelles_demandes: number;
    dossiers_clotures: number;
    nouveaux_clients: number;
  };
}

type SupabaseLike = ReturnType<typeof getAdminSupabase>;

function aggregateByDevise<T>(
  rows: T[],
  amountFn: (r: T) => number,
  deviseFn: (r: T) => string = (r) =>
    ((r as unknown as { devise?: string }).devise as string) || "XAF"
): DeviseAgg[] {
  const map: Record<string, DeviseAgg> = {};
  for (const r of rows) {
    const d = deviseFn(r);
    if (!map[d]) map[d] = { devise: d, total: 0, count: 0 };
    map[d].total += amountFn(r);
    map[d].count += 1;
  }
  return Object.values(map);
}

export async function aggregateMonth(
  supabase: SupabaseLike,
  bounds: MonthBounds
): Promise<MonthSummary> {
  const { start, end } = bounds;

  // Toutes les requêtes en parallèle.
  //
  // Filtre is_test appliqué en `.eq("is_test", false)` inline ici (pas via
  // excludeTestRows()) : ce fichier passe `supabase: SupabaseLike` (alias
  // ReturnType<typeof getAdminSupabase>) à travers Promise.all — router cette
  // valeur précise par la fonction générique excludeTestRows() fait exploser
  // l'instanciation de type de TypeScript (TS2589), reproductible même avec
  // un generique très permissif. Même filtre, même colonne, exception locale
  // documentée plutôt qu'un `any` qui aurait cassé le typage de tout le fichier.
  const [
    paiementsRes,
    caisseRes,
    depensesValideesRes,
    depensesAttenteRes,
    transfertsRes,
    partielsRes,
    profilesRes,
    demandesRes,
    demandesCloseRes,
    clientsRes,
    rdvCountRes,
    rdvTerminesRes,
    rdvAgentRes,
    paymentsAgentRes,
    caisseAgentRes,
  ] = await Promise.all([
    supabase
      .from("payments")
      .select("montant_recu, montant_total, devise, agent_id")
      .eq("is_test", false)
      .gte("date_paiement", start)
      .lte("date_paiement", end),
    supabase
      .from("quick_sales")
      .select("montant_total, devise, type_service, agent_id")
      .gte("date_paiement", start)
      .lte("date_paiement", end),
    supabase
      .from("expenses")
      .select("montant, devise")
      .eq("statut", "valide")
      .eq("is_test", false)
      .gte("date_depense", start)
      .lte("date_depense", end),
    supabase
      .from("expenses")
      .select("montant, devise")
      .eq("statut", "en_attente")
      .eq("is_test", false)
      .gte("date_depense", start)
      .lte("date_depense", end),
    supabase
      .from("transferts")
      .select("montant_envoye, frais_transfert, devise")
      .eq("statut", "effectue")
      .gte("created_at", start)
      .lte("created_at", end),
    // Créances toutes périodes confondues (snapshot du mois)
    supabase
      .from("payments")
      .select("reference, client_nom, service, montant_total, montant_recu, devise")
      .eq("status", "partial")
      .eq("is_test", false)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("profiles").select("id, nom, prenom").eq("is_test", false),
    supabase
      .from("demandes")
      .select("id", { count: "exact", head: true })
      .eq("is_test", false)
      .gte("created_at", start)
      .lte("created_at", end),
    supabase
      .from("demandes")
      .select("id", { count: "exact", head: true })
      .in("statut", ["complete", "termine"])
      .eq("is_test", false)
      .gte("updated_at", start)
      .lte("updated_at", end),
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("is_test", false)
      .gte("created_at", start)
      .lte("created_at", end),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("is_test", false)
      .gte("created_at", start)
      .lte("created_at", end),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("statut", "termine")
      .eq("is_test", false)
      .gte("created_at", start)
      .lte("created_at", end),
    // Pour le top agents (RDV terminés / agent)
    supabase
      .from("appointments")
      .select("agent_id")
      .eq("statut", "termine")
      .eq("is_test", false)
      .gte("created_at", start)
      .lte("created_at", end),
    // Paiements / agent (XAF only pour le top)
    supabase
      .from("payments")
      .select("created_by, montant_recu, devise")
      .eq("is_test", false)
      .gte("date_paiement", start)
      .lte("date_paiement", end),
    // Caisse / agent (XAF only pour le top)
    supabase
      .from("quick_sales")
      .select("agent_id, montant_total, devise")
      .gte("date_paiement", start)
      .lte("date_paiement", end),
  ]);

  type PaymentRow = { montant_recu: number | null; montant_total: number | null; devise: string | null; agent_id: string | null };
  type CaisseRow = { montant_total: number | null; devise: string | null; type_service: string | null; agent_id: string | null };
  type ExpenseRow = { montant: number | null; devise: string | null };
  type TransfertRow = { montant_envoye: number | null; frais_transfert: number | null; devise: string | null };
  type PartielSelected = {
    reference: string | null;
    client_nom: string | null;
    service: string | null;
    montant_total: number | null;
    montant_recu: number | null;
    devise: string | null;
  };
  type ProfileRow = { id: string; nom: string | null; prenom: string | null };
  type AgentScoped<T> = T & { agent_id?: string | null; created_by?: string | null };

  const paiementsRows = (paiementsRes.data || []) as PaymentRow[];
  const caisseRows = (caisseRes.data || []) as CaisseRow[];
  const depensesRows = (depensesValideesRes.data || []) as ExpenseRow[];
  const depensesAttRows = (depensesAttenteRes.data || []) as ExpenseRow[];
  const transfertsRows = (transfertsRes.data || []) as TransfertRow[];
  const partielsRows = (partielsRes.data || []) as PartielSelected[];
  const profiles = (profilesRes.data || []) as ProfileRow[];
  const rdvAgentRows = (rdvAgentRes.data || []) as AgentScoped<{ id?: string }>[];
  const paymentsAgentRows = (paymentsAgentRes.data || []) as AgentScoped<{ montant_recu: number | null; devise: string | null }>[];
  const caisseAgentRows = (caisseAgentRes.data || []) as AgentScoped<{ montant_total: number | null; devise: string | null }>[];

  // ── Paiements par devise (avec restant) ───────────────────────────────
  const paiementsByDevise: Record<string, PaiementAgg> = {};
  for (const p of paiementsRows) {
    const d = p.devise || "XAF";
    if (!paiementsByDevise[d]) {
      paiementsByDevise[d] = { devise: d, total: 0, count: 0, restant: 0 };
    }
    paiementsByDevise[d].total += Number(p.montant_recu || 0);
    paiementsByDevise[d].count += 1;
    paiementsByDevise[d].restant +=
      Number(p.montant_total || 0) - Number(p.montant_recu || 0);
  }
  const paiements: PaiementAgg[] = Object.values(paiementsByDevise).map((p) => ({
    ...p,
    restant: Math.max(0, p.restant),
  }));

  // ── Caisse / dépenses ────────────────────────────────────────────────
  const caisse = aggregateByDevise(caisseRows, (c) => Number(c.montant_total || 0));
  const depenses = aggregateByDevise(depensesRows, (d) => Number(d.montant || 0));
  const depensesEnAttente = aggregateByDevise(depensesAttRows, (d) =>
    Number(d.montant || 0)
  );

  // ── Transferts (avec frais) ──────────────────────────────────────────
  const transfertsByDevise: Record<string, TransfertAgg> = {};
  for (const t of transfertsRows) {
    const d = t.devise || "XAF";
    if (!transfertsByDevise[d]) {
      transfertsByDevise[d] = { devise: d, total: 0, count: 0, frais: 0 };
    }
    transfertsByDevise[d].total += Number(t.montant_envoye || 0);
    transfertsByDevise[d].frais += Number(t.frais_transfert || 0);
    transfertsByDevise[d].count += 1;
  }
  const transferts = Object.values(transfertsByDevise);

  // ── Partiels (créances ouvertes) ─────────────────────────────────────
  const partiels: PartielRow[] = partielsRows.map((p) => {
    const total = Number(p.montant_total || 0);
    const recu = Number(p.montant_recu || 0);
    return {
      reference: p.reference,
      client_nom: p.client_nom,
      service: p.service,
      devise: p.devise || "XAF",
      montant_total: total,
      montant_recu: recu,
      montant_restant: Math.max(0, total - recu),
    };
  });

  // ── Top agents (XAF only, paiements + caisse + RDV terminés) ─────────
  const profilesById = new Map(profiles.map((p) => [p.id, p]));
  const agentMap = new Map<string, AgentAgg>();
  const ensureAgent = (id: string): AgentAgg => {
    let cur = agentMap.get(id);
    if (!cur) {
      const prof = profilesById.get(id);
      const name = prof
        ? [prof.prenom, prof.nom].filter(Boolean).join(" ") || "Agent"
        : "Agent inconnu";
      cur = {
        id,
        nom: name,
        paiements_xaf: 0,
        caisse_xaf: 0,
        total_xaf: 0,
        rdv_termines: 0,
      };
      agentMap.set(id, cur);
    }
    return cur;
  };

  for (const p of paymentsAgentRows) {
    const id = p.created_by || null;
    if (!id) continue;
    if ((p.devise || "XAF") !== "XAF") continue;
    const a = ensureAgent(id);
    a.paiements_xaf += Number(p.montant_recu || 0);
  }
  for (const c of caisseAgentRows) {
    const id = c.agent_id || null;
    if (!id) continue;
    if ((c.devise || "XAF") !== "XAF") continue;
    const a = ensureAgent(id);
    a.caisse_xaf += Number(c.montant_total || 0);
  }
  for (const r of rdvAgentRows) {
    const id = r.agent_id || null;
    if (!id) continue;
    const a = ensureAgent(id);
    a.rdv_termines += 1;
  }
  for (const a of agentMap.values()) {
    a.total_xaf = a.paiements_xaf + a.caisse_xaf;
  }
  const topAgents = Array.from(agentMap.values())
    .sort((x, y) => y.total_xaf - x.total_xaf)
    .slice(0, 10);

  // ── Totaux récapitulatifs (XAF only pour l'email + l'index) ──────────
  const revenusXAF =
    (paiementsByDevise["XAF"]?.total || 0) +
    (caisse.find((c) => c.devise === "XAF")?.total || 0);
  const paiementsCount = paiementsRows.length;

  return {
    bounds,
    paiements,
    caisse,
    depenses,
    depensesEnAttente,
    transferts,
    partiels,
    topAgents,
    rdvCount: rdvCountRes.count ?? 0,
    rdvTermines: rdvTerminesRes.count ?? 0,
    totals: {
      revenus_xaf: revenusXAF,
      paiements_count: paiementsCount,
      nouvelles_demandes: demandesRes.count ?? 0,
      dossiers_clotures: demandesCloseRes.count ?? 0,
      nouveaux_clients: clientsRes.count ?? 0,
    },
  };
}
