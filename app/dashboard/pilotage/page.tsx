import Link from "next/link";
import { DataTimestamp } from "@/components/admin/ui/DataTimestamp";
import { requireProfile } from "@/lib/auth";
import { getEffectiveNav } from "@/lib/admin-nav";
import { ModuleAdminShell } from "@/components/admin/ui/ModuleAdminShell";
import { StatCard } from "@/components/admin/ui/StatCard";
import { getFinanceAdminClient } from "@/lib/finance-server";
import { STATUTS_TERMINAUX } from "@/lib/pilotage-server";
import { getCategorieFromService, CATEGORIE_META, type CategorieDossier, isCategorieDossier } from "@/lib/demande-categories";

export const metadata = {
  title: "Pilotage | Nexus RCA",
};

export const dynamic = "force-dynamic";

// ============================================================================
// DG — PILOTAGE (§2.3). « Aucune saisie opérationnelle, uniquement lecture,
// validation et rapports. » Chiffres honnêtes (§I.6) :
// - « Encaissé » = paiements VALIDÉS (chaîne §4.3) + ventes comptoir,
//   affichés séparément — même convention que la Trésorerie.
// - « Dossiers clos ce mois » = statut terminal ET updated_at dans le mois :
//   approximation étiquetée (demande_status_history est vide — A6 #11).
// - Délais moyens et « taux de clôture dans les délais » NON affichés :
//   aucun historique de transitions, deadline non renseignée (A6 #11).
// - « À valider » en lecture : le DG consulte, les validations opération-
//   nelles vivent chez le DAF (Trésorerie) et au module RH.
// ============================================================================

function formatMoney(n: number): string {
  return `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
}

const MOIS_LABELS = ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];

export default async function PilotagePage() {
  const profile = await requireProfile(["dg", "super_admin"]);
  const admin = getFinanceAdminClient();
  const includeTest = Boolean(profile.is_test);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const stale = new Date(now.getTime() - 15 * 86400000).toISOString();
  const todayDate = now.toISOString().split("T")[0];

  const [demandesRes, paymentsRes, ventesRes, depensesRes, echeancesRes, devisRes, depensesAttenteRes, congesRes, instructionsRes, commissionsRes, agentsRes, effectiveNav] =
    await Promise.all([
      admin
        .from("demandes")
        .select("id, reference, nom_complet, service, statut, categorie_dossier, agent_id, deadline, created_at, updated_at")
        .eq("is_test", includeTest),
      admin
        .from("payments")
        .select("montant_recu, service, date_paiement")
        .eq("status", "validated")
        .gte("date_paiement", yearAgo.toISOString())
        .eq("is_test", includeTest),
      // Caisse ouverte G3 : recettes comptoir = prestations uniquement.
      admin
        .from("quick_sales")
        .select("montant_total, created_at")
        .eq("nature", "prestation")
        .eq("is_test", includeTest)
        .gte("created_at", monthStart.toISOString()),
      admin
        .from("expenses")
        .select("montant")
        .eq("statut", "valide")
        .gte("created_at", monthStart.toISOString())
        .eq("is_test", includeTest),
      admin.from("echeanciers").select("amount, due_date").neq("status", "paye"),
      admin.from("devis").select("id, amount", { count: "exact" }).eq("status", "envoye"),
      admin
        .from("expenses")
        .select("id, montant", { count: "exact" })
        .eq("statut", "en_attente")
        .eq("is_test", includeTest),
      admin.from("leave_requests").select("id", { count: "exact", head: true }).eq("statut", "en_attente"),
      admin
        .from("instructions")
        .select("id, due_date")
        .eq("author_id", profile.id)
        .eq("status", "envoyee"),
      admin.from("commissions").select("id", { count: "exact", head: true }).eq("status", "calculee"),
      admin
        .from("profiles")
        .select("id, nom, prenom")
        .eq("role", "agent")
        .eq("actif", true)
        .eq("is_test", includeTest),
      getEffectiveNav(),
    ]);

  const demandes = (demandesRes.data || []) as {
    id: string;
    reference: string | null;
    nom_complet: string;
    service: string;
    statut: string;
    categorie_dossier: string | null;
    agent_id: string | null;
    deadline: string | null;
    created_at: string;
    updated_at: string;
  }[];
  const payments = (paymentsRes.data || []) as { montant_recu: number; service: string; date_paiement: string }[];

  // ── Situation du mois ──
  const isTerminal = (s: string) => STATUTS_TERMINAUX.includes(s);
  const entres = demandes.filter((d) => new Date(d.created_at) >= monthStart).length;
  const closMois = demandes.filter((d) => isTerminal(d.statut) && new Date(d.updated_at) >= monthStart).length;
  const enCours = demandes.filter((d) => !isTerminal(d.statut)).length;
  const encMois = payments
    .filter((p) => new Date(p.date_paiement) >= monthStart)
    .reduce((s, p) => s + Number(p.montant_recu), 0);
  const ventesMois = ((ventesRes.data || []) as { montant_total: number }[]).reduce(
    (s, v) => s + Number(v.montant_total),
    0
  );
  const resteAEncaisser = ((echeancesRes.data || []) as { amount: number }[]).reduce(
    (s, e) => s + Number(e.amount),
    0
  );
  const depMois = ((depensesRes.data || []) as { montant: number }[]).reduce((s, d) => s + Number(d.montant), 0);
  const soldeNet = encMois + ventesMois - depMois;

  // ── Évolution 12 mois (dossiers créés / encaissé validé) ──
  const evolution: { label: string; dossiers: number; encaisse: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    evolution.push({
      label: `${MOIS_LABELS[start.getMonth()]} ${String(start.getFullYear()).slice(2)}`,
      dossiers: demandes.filter((d) => {
        const c = new Date(d.created_at);
        return c >= start && c < end;
      }).length,
      encaisse: payments
        .filter((p) => {
          const c = new Date(p.date_paiement);
          return c >= start && c < end;
        })
        .reduce((s, p) => s + Number(p.montant_recu), 0),
    });
  }
  const maxDossiers = Math.max(1, ...evolution.map((e) => e.dossiers));

  // ── Par pôle (catégorie de dossier) ──
  const cats = new Map<CategorieDossier, { actifs: number; total: number; clos: number; refuses: number; revenu: number }>();
  const catOf = (v: string | null, service: string): CategorieDossier =>
    v && isCategorieDossier(v) ? v : getCategorieFromService(service);
  for (const d of demandes) {
    const c = catOf(d.categorie_dossier, d.service);
    const e = cats.get(c) || { actifs: 0, total: 0, clos: 0, refuses: 0, revenu: 0 };
    e.total++;
    if (!isTerminal(d.statut)) e.actifs++;
    if (d.statut === "termine" || d.statut === "complete") e.clos++;
    if (d.statut === "refuse") e.refuses++;
    cats.set(c, e);
  }
  for (const p of payments.filter((p) => new Date(p.date_paiement) >= monthStart)) {
    const c = getCategorieFromService(p.service);
    const e = cats.get(c) || { actifs: 0, total: 0, clos: 0, refuses: 0, revenu: 0 };
    e.revenu += Number(p.montant_recu);
    cats.set(c, e);
  }
  const parPole = Array.from(cats.entries()).sort((a, b) => b[1].total - a[1].total);

  // ── Par agent : charge / clos ──
  const agents = (agentsRes.data || []) as { id: string; nom: string; prenom: string | null }[];
  const parAgent = agents
    .map((a) => ({
      nom: [a.prenom, a.nom].filter(Boolean).join(" "),
      charge: demandes.filter((d) => d.agent_id === a.id && !isTerminal(d.statut)).length,
      clos: demandes.filter((d) => d.agent_id === a.id && (d.statut === "termine" || d.statut === "complete")).length,
    }))
    .sort((a, b) => b.charge - a.charge);

  // ── Ce qui bloque ──
  const sansMouvement = demandes
    .filter((d) => !isTerminal(d.statut) && d.updated_at < stale)
    .sort((a, b) => a.updated_at.localeCompare(b.updated_at))
    .slice(0, 8);
  const horsDelai = demandes.filter((d) => !isTerminal(d.statut) && d.deadline && d.deadline < todayDate).length;
  const echeancesRetard = ((echeancesRes.data || []) as { amount: number; due_date: string }[]).filter(
    (e) => e.due_date < todayDate
  );

  // ── À valider (lecture) ──
  const devisEnvoyes = devisRes.count ?? 0;
  const devisTotal = ((devisRes.data || []) as { amount: number }[]).reduce((s, d) => s + Number(d.amount), 0);
  const depensesAttente = depensesAttenteRes.count ?? 0;
  const depensesAttenteTotal = ((depensesAttenteRes.data || []) as { montant: number }[]).reduce(
    (s, d) => s + Number(d.montant),
    0
  );
  const congesAttente = congesRes.count ?? 0;
  const commissionsCalculees = commissionsRes.count ?? 0;
  const instructionsOuvertes = (instructionsRes.data || []) as { id: string; due_date: string | null }[];
  const instructionsEnRetard = instructionsOuvertes.filter((i) => i.due_date && i.due_date < todayDate).length;

  return (
    <ModuleAdminShell
      profile={profile}
      effectiveNav={effectiveNav}
      breadcrumb={[{ label: "Pilotage" }, { label: "Direction générale" }]}
      title="Pilotage"
      description="Lecture, validation et rapports — aucune saisie opérationnelle."
    >
      {/* R19 : instant de référence commun compteurs/listes */}
      <div className="mb-4"><DataTimestamp /></div>
      <div className="space-y-6">
        {/* Situation du mois */}
        <section>
          <h2 className="font-display text-title text-ink">Situation du mois</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Dossiers entrés" value={entres} />
            <StatCard label="Dossiers clos" value={closMois} />
            <StatCard label="Dossiers en cours" value={enCours} />
            <StatCard label="Encaissé (validé)" value={formatMoney(encMois)} />
            <StatCard label="Ventes comptoir" value={formatMoney(ventesMois)} />
            <StatCard label="Reste à encaisser" value={formatMoney(resteAEncaisser)} />
            <StatCard label="Dépenses validées" value={formatMoney(depMois)} />
            <StatCard label="Solde net" value={formatMoney(soldeNet)} />
          </div>
          <p className="mt-2 text-caption text-ink-muted">
            « Clos » = statut terminal atteint ce mois (approximation par date de dernière mise à
            jour). Solde net = encaissé validé + ventes comptoir − dépenses validées. Reste à
            encaisser = échéances de factures impayées.
          </p>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {/* Évolution 12 mois */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">Évolution sur 12 mois</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-line text-caption font-semibold uppercase tracking-wide text-ink-muted">
                      <th className="py-2 pr-3">Mois</th>
                      <th className="py-2 pr-3">Dossiers entrés</th>
                      <th className="py-2">Encaissé (validé)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {evolution.map((e) => (
                      <tr key={e.label}>
                        <td className="py-1.5 pr-3 text-body-sm text-ink-muted">{e.label}</td>
                        <td className="py-1.5 pr-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 rounded-sm bg-brand-subtle"
                              style={{ width: `${(e.dossiers / maxDossiers) * 120}px` }}
                              aria-hidden
                            />
                            <span className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                              {e.dossiers}
                            </span>
                          </div>
                        </td>
                        <td className="py-1.5 text-body-sm text-ink [font-variant-numeric:tabular-nums]">
                          {e.encaisse > 0 ? formatMoney(e.encaisse) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-caption text-ink-muted">
                L&rsquo;encaissé validé ne couvre que les paiements passés par la chaîne de
                validation (récente) — l&rsquo;historique antérieur est hors chaîne.
              </p>
            </section>

            {/* Par pôle */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">Par pôle</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-line text-caption font-semibold uppercase tracking-wide text-ink-muted">
                      <th className="py-2 pr-3">Pôle</th>
                      <th className="py-2 pr-3">En cours</th>
                      <th className="py-2 pr-3">Total</th>
                      <th className="py-2 pr-3">Taux de succès</th>
                      <th className="py-2">Revenu du mois</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {parPole.map(([cat, e]) => {
                      const denom = e.clos + e.refuses;
                      return (
                        <tr key={cat}>
                          <td className="py-2 pr-3 text-body-sm font-medium text-ink">
                            {CATEGORIE_META[cat].label}
                          </td>
                          <td className="py-2 pr-3 text-body-sm text-ink [font-variant-numeric:tabular-nums]">
                            {e.actifs}
                          </td>
                          <td className="py-2 pr-3 text-body-sm text-ink-muted [font-variant-numeric:tabular-nums]">
                            {e.total}
                          </td>
                          <td className="py-2 pr-3 text-body-sm text-ink [font-variant-numeric:tabular-nums]">
                            {denom > 0 ? `${Math.round((e.clos / denom) * 100)} %` : "—"}
                          </td>
                          <td className="py-2 text-body-sm text-ink [font-variant-numeric:tabular-nums]">
                            {e.revenu > 0 ? formatMoney(e.revenu) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-caption text-ink-muted">
                Délai moyen non affiché : aucun historique de transitions n&rsquo;est encore
                journalisé (chiffre non mesurable, pas un zéro).
              </p>
            </section>

            {/* Par agent */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">Par agent</h2>
              {parAgent.length === 0 ? (
                <p className="mt-3 text-body-sm text-ink-muted">Aucun agent actif.</p>
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {parAgent.map((a) => (
                    <li key={a.nom} className="flex items-center justify-between py-2">
                      <span className="text-body-sm font-medium text-ink">{a.nom}</span>
                      <span className="text-body-sm text-ink-muted [font-variant-numeric:tabular-nums]">
                        {a.charge} en charge · {a.clos} clos
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="space-y-6">
            {/* Ce qui bloque */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">Ce qui bloque</h2>
              <dl className="mt-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <dt className="text-body-sm text-ink-muted">Hors délai (échéance dossier dépassée)</dt>
                  <dd className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">{horsDelai}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-body-sm text-ink-muted">Paiements en retard (échéances)</dt>
                  <dd className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                    {echeancesRetard.length} · {formatMoney(echeancesRetard.reduce((s, e) => s + Number(e.amount), 0))}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-body-sm text-ink-muted">Sans mouvement depuis 15 jours</dt>
                  <dd className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                    {sansMouvement.length}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-body-sm text-ink-muted">
                    <Link href="/dashboard/instructions" className="underline-offset-2 hover:underline">
                      Mes instructions non exécutées
                    </Link>
                  </dt>
                  <dd className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                    {instructionsOuvertes.length}
                    {instructionsEnRetard > 0 && (
                      <span className="text-status-failure"> · {instructionsEnRetard} en retard</span>
                    )}
                  </dd>
                </div>
              </dl>
              {sansMouvement.length > 0 && (
                <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
                  {sansMouvement.map((d) => (
                    <li key={d.id}>
                      <Link
                        href={`/dashboard/dossiers/${d.id}`}
                        className="block rounded-sm px-2 py-1 hover:bg-surface-sunken"
                      >
                        <span className="block text-body-sm text-ink">
                          {d.reference || "—"} · {d.nom_complet}
                        </span>
                        <span className="block text-caption text-ink-muted">
                          {d.statut} · dernier mouvement{" "}
                          {new Date(d.updated_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* À valider — lecture */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">À valider dans l&rsquo;agence</h2>
              <dl className="mt-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <dt className="text-body-sm text-ink-muted">Devis envoyés en attente</dt>
                  <dd className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                    {devisEnvoyes}
                    {devisTotal > 0 && ` · ${formatMoney(devisTotal)}`}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-body-sm text-ink-muted">Dépenses en attente</dt>
                  <dd className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                    {depensesAttente}
                    {depensesAttenteTotal > 0 && ` · ${formatMoney(depensesAttenteTotal)}`}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-body-sm text-ink-muted">Congés en attente</dt>
                  <dd className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">{congesAttente}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-body-sm text-ink-muted">Commissions calculées</dt>
                  <dd className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                    {commissionsCalculees}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 border-t border-line pt-3 text-caption text-ink-muted">
                Le DG consulte — les validations opérationnelles se font en Trésorerie (DAF) et au
                module RH. Aucun seuil de devis « à valider par le DG » n&rsquo;est encore
                paramétré.
              </p>
            </section>
          </div>
        </div>
      </div>
    </ModuleAdminShell>
  );
}
