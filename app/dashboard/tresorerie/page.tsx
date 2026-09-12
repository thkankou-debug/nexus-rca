import { requireProfile } from "@/lib/auth";
import { getEffectiveNav } from "@/lib/admin-nav";
import { ModuleAdminShell } from "@/components/admin/ui/ModuleAdminShell";
import { StatCard } from "@/components/admin/ui/StatCard";
import { PaiementsChainList, type ChainPayment } from "@/components/finance/PaiementsChainList";
import {
  DepensesValidationList,
  SessionsValidationList,
  CommissionsValidationList,
  type PendingExpense,
  type PendingSession,
  type PendingCommission,
} from "@/components/finance/ValidationsTresorerie";
import { getFinanceAdminClient } from "@/lib/finance-server";

export const metadata = {
  title: "Trésorerie | Nexus RCA",
};

export const dynamic = "force-dynamic";

// ============================================================================
// DAF — TRÉSORERIE (§2.4). « Valide, ne saisit pas. » Fin de la chaîne §4.3 :
// paiements rapprochés → encaissés, dépenses, rapprochements de caisse
// soumis, commissions. Créances par ancienneté depuis les échéanciers (P6).
// Chiffres honnêtes (§I.6) : « Encaissements » = paiements VALIDÉS
// uniquement ; les ventes comptoir (quick_sales) sont affichées séparément
// (elles ne passent pas par la chaîne payments — leur contrôle est le
// rapprochement de session) ; « relances envoyées » de la maquette non
// affichées (aucun concept de relance dans le schéma — docs/DETTE.md).
// ============================================================================

function formatMoney(n: number): string {
  return `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
}

const AGING_BUCKETS = [
  { label: "0-30 j", min: 1, max: 30 },
  { label: "30-60 j", min: 31, max: 60 },
  { label: "60-90 j", min: 61, max: 90 },
  { label: "+90 j", min: 91, max: Infinity },
] as const;

export default async function TresoreriePage() {
  const profile = await requireProfile(["daf", "admin", "super_admin"]);
  const admin = getFinanceAdminClient();
  const includeTest = Boolean(profile.is_test);

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayDate = now.toISOString().split("T")[0];

  const [
    encaissesMoisRes,
    aValiderRes,
    ventesMoisRes,
    depensesMoisRes,
    depensesAttenteRes,
    sessionsRes,
    commissionsRes,
    echeanciersRes,
    effectiveNav,
  ] = await Promise.all([
    // Encaissés (status=validated) du mois — ventilations service/mode/agent.
    admin
      .from("payments")
      .select("montant_recu, devise, service, method, agent_id, date_paiement, profiles:agent_id(nom, prenom)")
      .eq("status", "validated")
      .gte("date_paiement", monthStart.toISOString())
      .eq("is_test", includeTest),
    admin
      .from("payments")
      .select("id, reference, client_nom, service, montant_recu, devise, method, date_paiement, metadata")
      .not("reconciled_at", "is", null)
      .not("status", "in", "(validated,refunded,voided)")
      .eq("is_test", includeTest)
      .order("date_paiement", { ascending: false })
      .limit(50),
    // Caisse ouverte G3 : recettes comptoir = prestations uniquement (les
    // cautions et leurs remboursements ne sont jamais des recettes).
    admin
      .from("quick_sales")
      .select("montant_total, created_at")
      .eq("nature", "prestation")
      .eq("is_test", includeTest)
      .gte("created_at", monthStart.toISOString()),
    admin
      .from("expenses")
      .select("montant, categorie, created_at")
      .eq("statut", "valide")
      .gte("created_at", monthStart.toISOString())
      .eq("is_test", includeTest),
    admin
      .from("expenses")
      .select("id, reference, employee_nom, categorie, motif, montant, date_depense, preuve_path")
      .eq("statut", "en_attente")
      .eq("is_test", includeTest)
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("caisse_sessions")
      .select("id, status, opened_at, expected_balance, actual_balance, discrepancy, profiles(nom, prenom)")
      .order("opened_at", { ascending: false })
      .limit(60),
    admin
      .from("commissions")
      .select("id, amount, created_at, profiles:agent_id(nom, prenom)")
      .eq("status", "calculee")
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("echeanciers")
      .select("id, amount, due_date, status, factures(reference, client_record_id, clients(nom, prenom, raison_sociale, type))")
      .neq("status", "paye")
      .order("due_date", { ascending: true })
      .limit(200),
    getEffectiveNav(),
  ]);

  // ── Encaissements / décaissements / position nette ──
  const encaissesMois = (encaissesMoisRes.data || []) as unknown as {
    montant_recu: number;
    devise: string;
    service: string;
    method: string | null;
    date_paiement: string;
    profiles: { nom: string; prenom: string | null } | null;
  }[];
  const sumIn = (rows: { montant_recu: number }[]) =>
    rows.reduce((s, p) => s + Number(p.montant_recu), 0);
  const encMois = sumIn(encaissesMois);
  const encSemaine = sumIn(encaissesMois.filter((p) => new Date(p.date_paiement) >= weekStart));
  const encJour = sumIn(encaissesMois.filter((p) => new Date(p.date_paiement) >= todayStart));

  const ventesMois = ((ventesMoisRes.data || []) as { montant_total: number }[]).reduce(
    (s, v) => s + Number(v.montant_total),
    0
  );
  const depensesMoisRows = (depensesMoisRes.data || []) as { montant: number; categorie: string }[];
  const depMois = depensesMoisRows.reduce((s, d) => s + Number(d.montant), 0);
  const positionNette = encMois + ventesMois - depMois;

  const groupSum = <T,>(rows: T[], key: (r: T) => string, val: (r: T) => number) => {
    const map = new Map<string, number>();
    for (const r of rows) map.set(key(r), (map.get(key(r)) || 0) + val(r));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  };
  const parService = groupSum(encaissesMois, (p) => p.service, (p) => Number(p.montant_recu));
  const parMode = groupSum(encaissesMois, (p) => p.method || "—", (p) => Number(p.montant_recu));
  const parAgent = groupSum(
    encaissesMois,
    (p) => (p.profiles ? [p.profiles.prenom, p.profiles.nom].filter(Boolean).join(" ") : "Sans agent"),
    (p) => Number(p.montant_recu)
  );
  const parCategorie = groupSum(depensesMoisRows, (d) => d.categorie, (d) => Number(d.montant));

  // ── À valider ──
  const aValider = ((aValiderRes.data || []) as (ChainPayment & { metadata: { legacy?: boolean } | null })[])
    .filter((p) => !p.metadata?.legacy)
    .map(({ metadata: _m, ...p }) => p);

  const depensesAttente = (depensesAttenteRes.data || []) as PendingExpense[];

  const sessionsAll = (sessionsRes.data || []) as unknown as {
    id: string;
    status: string;
    opened_at: string;
    expected_balance: number | null;
    actual_balance: number | null;
    discrepancy: number | null;
    profiles: { nom: string; prenom: string | null } | null;
  }[];
  const sessionsACloturer: PendingSession[] = sessionsAll
    .filter((s) => s.status === "a_cloturer")
    .map((s) => ({
      id: s.id,
      agent_nom: s.profiles ? [s.profiles.prenom, s.profiles.nom].filter(Boolean).join(" ") : "—",
      opened_at: s.opened_at,
      expected_balance: s.expected_balance,
      actual_balance: s.actual_balance,
      discrepancy: s.discrepancy,
    }));
  const nbOuvertes = sessionsAll.filter((s) => s.status === "ouverte").length;
  const nbCloturees = sessionsAll.filter((s) => s.status === "cloturee").length;
  const ecartsNonNuls = sessionsAll.filter(
    (s) => s.status === "cloturee" && s.discrepancy !== null && Math.abs(Number(s.discrepancy)) > 0
  ).length;

  const commissions: PendingCommission[] = ((commissionsRes.data || []) as unknown as {
    id: string;
    amount: number;
    created_at: string;
    profiles: { nom: string; prenom: string | null } | null;
  }[]).map((c) => ({
    id: c.id,
    agent_nom: c.profiles ? [c.profiles.prenom, c.profiles.nom].filter(Boolean).join(" ") : "—",
    amount: Number(c.amount),
    period_label: new Date(c.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
  }));

  // ── Créances par ancienneté ──
  const echeances = ((echeanciersRes.data || []) as unknown as {
    id: string;
    amount: number;
    due_date: string;
    status: string;
    factures: {
      reference: string | null;
      client_record_id: string | null;
      clients: { nom: string; prenom: string | null; raison_sociale: string | null; type: string } | null;
    } | null;
  }[]);
  const overdue = echeances.filter((e) => e.due_date < todayDate);
  const aEchoir = echeances.filter((e) => e.due_date >= todayDate);
  const ageDays = (d: string) => Math.floor((todayStart.getTime() - new Date(d).getTime()) / 86400000);
  const buckets = AGING_BUCKETS.map((b) => ({
    label: b.label,
    total: overdue
      .filter((e) => ageDays(e.due_date) >= b.min && ageDays(e.due_date) <= b.max)
      .reduce((s, e) => s + Number(e.amount), 0),
  }));
  const clientName = (e: (typeof echeances)[number]) => {
    const c = e.factures?.clients;
    if (!c) return "Client inconnu";
    return c.type === "particulier"
      ? [c.prenom, c.nom].filter(Boolean).join(" ") || c.nom
      : c.raison_sociale || c.nom;
  };
  const resteDuParClient = groupSum(echeances, clientName, (e) => Number(e.amount)).slice(0, 8);

  return (
    <ModuleAdminShell
      profile={profile}
      effectiveNav={effectiveNav}
      breadcrumb={[{ label: "Finances" }, { label: "Trésorerie" }]}
      title="Trésorerie"
      description="Le DAF valide, il ne saisit pas — fin de la chaîne de validation."
    >
      <div className="space-y-6">
        {/* Position du mois */}
        <section>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Encaissé ce mois (validé)" value={formatMoney(encMois)} />
            <StatCard label="Ventes comptoir ce mois" value={formatMoney(ventesMois)} />
            <StatCard label="Décaissements ce mois" value={formatMoney(depMois)} />
            <StatCard label="Position nette du mois" value={formatMoney(positionNette)} />
          </div>
          <p className="mt-2 text-caption text-ink-muted">
            Encaissé aujourd&rsquo;hui : {formatMoney(encJour)} · 7 derniers jours :{" "}
            {formatMoney(encSemaine)} · Position nette = encaissé validé + ventes comptoir −
            dépenses validées.
          </p>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {/* À valider — paiements */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-title text-ink">Paiements à valider</h2>
                <span className="text-caption text-ink-muted">
                  {aValider.length} rapproché{aValider.length > 1 ? "s" : ""} par le comptable
                </span>
              </div>
              <PaiementsChainList
                payments={aValider}
                mode="validate"
                emptyText="Aucun paiement rapproché en attente de validation."
              />
            </section>

            {/* À valider — dépenses */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-title text-ink">Dépenses à valider</h2>
                <span className="text-caption text-ink-muted">{depensesAttente.length} en attente</span>
              </div>
              <DepensesValidationList expenses={depensesAttente} />
            </section>

            {/* À valider — rapprochements de caisse */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-title text-ink">Rapprochements de caisse soumis</h2>
                <span className="text-caption text-ink-muted">
                  {sessionsACloturer.length} à clôturer · {nbOuvertes} ouverte{nbOuvertes > 1 ? "s" : ""} ·{" "}
                  {nbCloturees} clôturée{nbCloturees > 1 ? "s" : ""}
                  {ecartsNonNuls > 0 && ` · ${ecartsNonNuls} avec écart`}
                </span>
              </div>
              <SessionsValidationList sessions={sessionsACloturer} />
            </section>

            {/* À valider — commissions */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-title text-ink">Commissions à valider</h2>
                <span className="text-caption text-ink-muted">{commissions.length} calculée{commissions.length > 1 ? "s" : ""}</span>
              </div>
              <CommissionsValidationList commissions={commissions} />
            </section>
          </div>

          <div className="space-y-6">
            {/* Créances par ancienneté */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">Créances par ancienneté</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {buckets.map((b) => (
                  <div key={b.label} className="rounded-sm border border-line bg-surface p-3 text-center">
                    <p className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                      {b.label}
                    </p>
                    <p className="mt-1 text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                      {formatMoney(b.total)}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-caption text-ink-muted">
                Échéances impayées en retard · à échoir :{" "}
                {formatMoney(aEchoir.reduce((s, e) => s + Number(e.amount), 0))}
              </p>
              {resteDuParClient.length > 0 && (
                <>
                  <p className="mt-4 border-t border-line pt-3 text-caption font-semibold uppercase tracking-wide text-ink-muted">
                    Reste dû par client
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {resteDuParClient.map(([nom, total]) => (
                      <li key={nom} className="flex items-center justify-between">
                        <span className="text-body-sm text-ink">{nom}</span>
                        <span className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                          {formatMoney(total)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            {/* Revenus ventilés */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">Revenus du mois (validés)</h2>
              {encaissesMois.length === 0 ? (
                <p className="mt-3 text-body-sm text-ink-muted">
                  Aucun paiement validé ce mois — les ventilations s&rsquo;afficheront dès le
                  premier encaissement validé.
                </p>
              ) : (
                <>
                  {[
                    { titre: "Par service", rows: parService },
                    { titre: "Par mode de paiement", rows: parMode },
                    { titre: "Par agent", rows: parAgent },
                  ].map((bloc) => (
                    <div key={bloc.titre} className="mt-3 first:mt-3">
                      <p className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                        {bloc.titre}
                      </p>
                      <ul className="mt-1.5 space-y-1">
                        {bloc.rows.slice(0, 6).map(([label, total]) => (
                          <li key={label} className="flex items-center justify-between">
                            <span className="text-body-sm text-ink">{label}</span>
                            <span className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                              {formatMoney(total)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </>
              )}
            </section>

            {/* Dépenses par catégorie */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">Dépenses du mois par catégorie</h2>
              {parCategorie.length === 0 ? (
                <p className="mt-3 text-body-sm text-ink-muted">Aucune dépense validée ce mois.</p>
              ) : (
                <ul className="mt-3 space-y-1.5">
                  {parCategorie.map(([cat, total]) => (
                    <li key={cat} className="flex items-center justify-between">
                      <span className="text-body-sm text-ink">{cat}</span>
                      <span className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                        {formatMoney(total)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </ModuleAdminShell>
  );
}
