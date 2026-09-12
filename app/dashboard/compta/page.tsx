import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { getEffectiveNav } from "@/lib/admin-nav";
import { ModuleAdminShell } from "@/components/admin/ui/ModuleAdminShell";
import { StatCard } from "@/components/admin/ui/StatCard";
import { PaiementsChainList, type ChainPayment } from "@/components/finance/PaiementsChainList";
import { getFinanceAdminClient } from "@/lib/finance-server";

export const metadata = {
  title: "Saisie du jour | Nexus RCA",
};

export const dynamic = "force-dynamic";

// ============================================================================
// COMPTABLE — SAISIE DU JOUR (§2.5). « Saisit, ne valide pas. Ne clôture pas
// la caisse, ne modifie pas une facture validée, ne supprime rien. »
// - Paiements et dépenses saisis aujourd'hui, en attente de validation
// - À rapprocher : paiements déclarés (chaîne §4.3, maillon comptable —
//   permission paiement.reconcile, jamais paiement.validate)
// - À saisir : paiements déclarés par les clients non rapprochés
// - Sessions de caisse en cours (lecture seule)
// Lectures service-role après garde requireProfile (RLS payments/expenses
// ne couvre pas uniformément le rôle comptable) — même patron que l'espace
// Accueil & Caisse.
// ============================================================================

function formatMoney(n: number): string {
  return `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
}

export default async function ComptaSaisieDuJourPage() {
  const profile = await requireProfile(["comptable", "daf", "admin", "super_admin"]);
  const admin = getFinanceAdminClient();
  const includeTest = Boolean(profile.is_test);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayIso = todayStart.toISOString();

  const [aRapprocherRes, saisisJourRes, depensesJourRes, liensDeclaresRes, sessionsRes, ventesJourRes, effectiveNav] =
    await Promise.all([
      // Déclarés : non validés, non terminaux, non rapprochés, non legacy.
      admin
        .from("payments")
        .select("id, reference, client_nom, service, montant_recu, devise, method, date_paiement, metadata")
        .is("reconciled_at", null)
        .not("status", "in", "(validated,refunded,voided)")
        .eq("is_test", includeTest)
        .order("date_paiement", { ascending: false })
        .limit(50),
      admin
        .from("payments")
        .select("montant_recu")
        .gte("created_at", todayIso)
        .eq("is_test", includeTest),
      admin
        .from("expenses")
        .select("id, reference, employee_nom, motif, montant, statut, categorie")
        .gte("created_at", todayIso)
        .eq("is_test", includeTest)
        .order("created_at", { ascending: false }),
      admin
        .from("payment_links")
        .select("id, reference, client_nom, service, montant, devise, paid_declared_at")
        .eq("statut", "paiement_declare")
        .eq("is_test", includeTest)
        .order("paid_declared_at", { ascending: false })
        .limit(20),
      admin
        .from("caisse_sessions")
        .select("id, status, opened_at, opening_balance, profiles(nom, prenom)")
        .in("status", ["ouverte", "a_cloturer"])
        .order("opened_at", { ascending: false }),
      // Caisse ouverte G6 : ventes comptoir du jour (suivi comptable).
      admin
        .from("quick_sales")
        .select("montant_total, nature")
        .gte("created_at", todayIso)
        .eq("is_test", includeTest),
      getEffectiveNav(),
    ]);

  const ventesJour = (ventesJourRes.data || []) as { montant_total: number; nature: string }[];
  const ventesPrestations = ventesJour.filter((v) => v.nature === "prestation");
  const totalVentesJour = ventesPrestations.reduce((s, v) => s + Number(v.montant_total), 0);
  const cautionsJour = ventesJour
    .filter((v) => v.nature === "caution")
    .reduce((s, v) => s + Number(v.montant_total), 0);

  // Les paiements legacy (metadata.legacy) sont hors chaîne : jamais listés
  // à rapprocher (la route les refuse aussi côté serveur).
  const aRapprocher = ((aRapprocherRes.data || []) as (ChainPayment & {
    metadata: { legacy?: boolean } | null;
  })[]).filter((p) => !p.metadata?.legacy);

  const saisisJour = (saisisJourRes.data || []) as { montant_recu: number }[];
  const totalSaisiJour = saisisJour.reduce((s, p) => s + Number(p.montant_recu), 0);
  const depensesJour = (depensesJourRes.data || []) as {
    id: string;
    reference: string | null;
    employee_nom: string;
    motif: string;
    montant: number;
    statut: string;
    categorie: string;
  }[];
  const liensDeclares = (liensDeclaresRes.data || []) as {
    id: string;
    reference: string;
    client_nom: string;
    service: string;
    montant: number;
    devise: string;
    paid_declared_at: string | null;
  }[];
  const sessions = (sessionsRes.data || []) as unknown as {
    id: string;
    status: string;
    opened_at: string;
    opening_balance: number;
    profiles: { nom: string; prenom: string | null } | null;
  }[];

  return (
    <ModuleAdminShell
      profile={profile}
      effectiveNav={effectiveNav}
      breadcrumb={[{ label: "Finances" }, { label: "Saisie du jour" }]}
      title="Saisie du jour"
      description="Le comptable saisit et rapproche — la validation appartient au DAF."
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Paiements saisis aujourd'hui" value={saisisJour.length} />
          <StatCard label="Montant saisi aujourd'hui" value={formatMoney(totalSaisiJour)} />
          <StatCard label="Dépenses saisies aujourd'hui" value={depensesJour.length} />
          <StatCard
            label="Ventes comptoir aujourd'hui"
            value={`${ventesPrestations.length} · ${formatMoney(totalVentesJour)}`}
          />
          <StatCard label="Cautions reçues aujourd'hui" value={formatMoney(cautionsJour)} />
        </div>
        <p className="text-caption text-ink-muted">
          Les cautions sont dans le tiroir mais ne sont jamais des recettes (addendum Caisse
          ouverte).
        </p>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {/* À rapprocher */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-title text-ink">Paiements à rapprocher</h2>
                <span className="text-caption text-ink-muted">
                  {aRapprocher.length} déclaré{aRapprocher.length > 1 ? "s" : ""}
                </span>
              </div>
              <PaiementsChainList
                payments={aRapprocher.map(({ metadata: _m, ...p }) => p)}
                mode="reconcile"
                emptyText="Aucun paiement déclaré en attente de rapprochement."
              />
              <p className="mt-3 border-t border-line pt-3 text-caption text-ink-muted">
                Rapprocher = vérifier la pièce et transmettre au DAF. Seul le DAF valide
                l&rsquo;encaissement.
              </p>
            </section>

            {/* À saisir : déclarations clients */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">
                Déclarations clients à traiter
              </h2>
              {liensDeclares.length === 0 ? (
                <p className="mt-3 text-body-sm text-ink-muted">
                  Aucun paiement déclaré par un client en attente de vérification.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {liensDeclares.map((l) => (
                    <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                      <div>
                        <p className="text-body-sm font-medium text-ink">
                          {l.client_nom}
                          <span className="font-normal text-ink-muted"> · {l.service}</span>
                        </p>
                        <p className="text-caption text-ink-muted">{l.reference}</p>
                      </div>
                      <span className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                        {Math.round(Number(l.montant)).toLocaleString("fr-FR")}{" "}
                        {l.devise === "XAF" ? "FCFA" : l.devise}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 border-t border-line pt-3 text-caption text-ink-muted">
                La vérification des liens de paiement se fait dans l&rsquo;écran Paiements en
                attente (super admin) — liste informative ici.
              </p>
            </section>

            {/* Dépenses saisies aujourd'hui */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">Dépenses saisies aujourd&rsquo;hui</h2>
              {depensesJour.length === 0 ? (
                <p className="mt-3 text-body-sm text-ink-muted">Aucune dépense saisie aujourd&rsquo;hui.</p>
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {depensesJour.map((d) => (
                    <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                      <div>
                        <p className="text-body-sm font-medium text-ink">
                          {d.motif}
                          <span className="font-normal text-ink-muted"> · {d.employee_nom}</span>
                        </p>
                        <p className="text-caption text-ink-muted">
                          {[d.reference, d.categorie].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                          {formatMoney(Number(d.montant))}
                        </span>
                        <span className="rounded-sm border border-line px-2 py-0.5 text-caption font-semibold text-ink-muted">
                          {d.statut === "en_attente" ? "En attente" : d.statut === "valide" ? "Validée" : "Rejetée"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Sessions de caisse en cours */}
          <section className="h-fit rounded-sm border border-line bg-surface-elevated p-4">
            <h2 className="font-display text-title text-ink">Sessions de caisse en cours</h2>
            {sessions.length === 0 ? (
              <p className="mt-3 text-body-sm text-ink-muted">Aucune session ouverte ou en attente.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {sessions.map((s) => (
                  <li key={s.id} className="py-2.5">
                    <p className="text-body-sm font-medium text-ink">
                      {s.profiles ? [s.profiles.prenom, s.profiles.nom].filter(Boolean).join(" ") : "—"}
                    </p>
                    <p className="text-caption text-ink-muted">
                      {s.status === "ouverte" ? "Ouverte" : "Rapprochement soumis"} · fonds initial{" "}
                      {formatMoney(Number(s.opening_balance))}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 border-t border-line pt-3 text-caption text-ink-muted">
              Le comptable ne clôture pas la caisse — la clôture appartient au DAF.
            </p>
            {profile.role !== "comptable" && (
              <Link
                href="/dashboard/tresorerie"
                className="mt-3 inline-flex w-full items-center justify-center rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong"
              >
                Voir la Trésorerie
              </Link>
            )}
          </section>
        </div>
      </div>
    </ModuleAdminShell>
  );
}
