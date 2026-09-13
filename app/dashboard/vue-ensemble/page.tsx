import Link from "next/link";
import { DataTimestamp } from "@/components/admin/ui/DataTimestamp";
import { ArrowRight, CalendarDays, BellRing } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveNav } from "@/lib/admin-nav";
import { ModuleAdminShell } from "@/components/admin/ui/ModuleAdminShell";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import {
  VueEnsembleSuperviser,
  type SuperviserDossier,
} from "@/components/admin/VueEnsembleSuperviser";

export const metadata = {
  title: "Vue d'ensemble | Nexus RCA",
};

export const dynamic = "force-dynamic";

// ============================================================================
// VUE D'ENSEMBLE — supervision agence (maquette SUPER-ADMIN.png, §2.1/2.2 du
// document Dashboard Administration). Construite en DERNIER (Partie 5,
// étape 8) : chaque compteur pointe vers un module qui existe réellement
// (Dossiers unique L3, fiches dossier). Réservée super_admin/admin — c'est
// leur écran d'accueil (§1.2), les autres métiers ont le leur.
// Données réelles uniquement ; « Documents à vérifier » de la maquette
// n'est PAS affiché : aucun concept de validation de document n'existe dans
// le schéma (docs/DETTE.md A4 #2) — un zéro serait un faux zéro.
// « Échéances dépassées » est calculée sur demandes.deadline (réellement
// mesurable, affichée aussi dans l'onglet « En retard » du tableau).
// ============================================================================

// Buckets statut → étape (§2.1 « Répartition par étape »). Couvre les 21
// valeurs réelles de l'enum demande_status.
const ETAPES: { label: string; statuts: string[] }[] = [
  { label: "Réception", statuts: ["nouveau", "nouvelle_demande"] },
  { label: "Qualification", statuts: ["qualification", "etude_faisabilite"] },
  { label: "Documents", statuts: ["documents_demandes", "dossier_incomplet", "incomplet"] },
  {
    label: "Traitement",
    statuts: [
      "en_cours",
      "en_traitement",
      "traitement",
      "en_attente",
      "devis_envoye",
      "devis_accepte",
      "paiement_attente",
      "transmis_partenaire",
    ],
  },
  { label: "Décision", statuts: ["decision_recue"] },
  { label: "Clôture", statuts: ["termine", "complete", "refuse", "annule", "archive"] },
];

const STATUTS_TERMINAUX = ETAPES[5].statuts;
const STATUTS_ATTENTE_CLIENT = [
  "en_attente",
  "documents_demandes",
  "dossier_incomplet",
  "incomplet",
  "devis_envoye",
  "paiement_attente",
];
const STATUTS_EN_TRAITEMENT = [
  "en_cours",
  "en_traitement",
  "traitement",
  "qualification",
  "etude_faisabilite",
  "devis_accepte",
  "transmis_partenaire",
  "decision_recue",
];

function formatDateTime(d: string): string {
  try {
    return new Date(d).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

export default async function VueEnsemblePage() {
  const profile = await requireProfile(["super_admin", "admin"]);
  const supabase = createClient();
  const includeTest = Boolean(profile.is_test);

  const today = new Date().toISOString().split("T")[0];

  const [demandesRes, superviserRes, rdvRes, activiteRes, paiementsRes, effectiveNav] =
    await Promise.all([
      supabase.from("demandes").select("statut, agent_id, deadline").eq("is_test", includeTest),
      supabase
        .from("demandes")
        .select(
          "id, reference, nom_complet, service, statut, urgence, traitement_prioritaire, deadline, agent_id, profiles:agent_id(nom, prenom)"
        )
        .not("statut", "in", `(${STATUTS_TERMINAUX.join(",")})`)
        .eq("is_test", includeTest)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("appointments")
        .select("id, client_nom, service_type, rdv_heure, statut")
        .eq("rdv_date", today)
        .eq("is_test", includeTest)
        .order("rdv_heure", { ascending: true })
        .limit(8),
      supabase
        .from("demandes")
        .select("id, reference, nom_complet, statut, updated_at")
        .eq("is_test", includeTest)
        .order("updated_at", { ascending: false })
        .limit(5),
      supabase
        .from("payment_links")
        .select("id", { count: "exact", head: true })
        .eq("statut", "paiement_declare")
        .eq("is_test", includeTest),
      getEffectiveNav(),
    ]);

  const demandes = (demandesRes.data || []) as {
    statut: string;
    agent_id: string | null;
    deadline: string | null;
  }[];
  const rdvJour = rdvRes.data || [];
  const activite = activiteRes.data || [];
  const paiementsAExaminer = paiementsRes.count ?? 0;

  const superviser: SuperviserDossier[] = ((superviserRes.data || []) as unknown as {
    id: string;
    reference: string | null;
    nom_complet: string;
    service: string;
    statut: string;
    urgence: string | null;
    traitement_prioritaire: boolean | null;
    deadline: string | null;
    agent_id: string | null;
    profiles: { nom: string; prenom: string | null } | null;
  }[]).map((d) => ({
    id: d.id,
    reference: d.reference,
    nom_complet: d.nom_complet,
    service: d.service,
    statut: d.statut,
    urgence: d.urgence,
    traitement_prioritaire: Boolean(d.traitement_prioritaire),
    deadline: d.deadline,
    agent_id: d.agent_id,
    agent_nom: d.profiles ? [d.profiles.prenom, d.profiles.nom].filter(Boolean).join(" ") : null,
  }));

  const nbAAffecter = demandes.filter(
    (d) => !d.agent_id && !STATUTS_TERMINAUX.includes(d.statut)
  ).length;
  const nbAttenteClient = demandes.filter((d) => STATUTS_ATTENTE_CLIENT.includes(d.statut)).length;
  const nbEnTraitement = demandes.filter((d) => STATUTS_EN_TRAITEMENT.includes(d.statut)).length;
  const nbEcheancesDepassees = demandes.filter(
    (d) => d.deadline && d.deadline < today && !STATUTS_TERMINAUX.includes(d.statut)
  ).length;

  const repartition = ETAPES.map((e) => ({
    label: e.label,
    count: demandes.filter((d) => e.statuts.includes(d.statut)).length,
  }));

  const aTraiter = [
    { label: "À affecter", value: nbAAffecter },
    { label: "En attente du client", value: nbAttenteClient },
    { label: "En traitement", value: nbEnTraitement },
  ];

  return (
    <ModuleAdminShell
      profile={profile}
      effectiveNav={effectiveNav}
      breadcrumb={[{ label: "Pilotage" }, { label: "Vue d'ensemble" }]}
      title="Vue d'ensemble"
      description="Pilotage de l'agence et supervision des opérations."
    >
      {/* R19 : instant de référence commun compteurs/listes */}
      <div className="mb-4"><DataTimestamp /></div>
      <div className="space-y-6">
        {/* À traiter (maquette : 3 colonnes, chacune ouvre la liste) */}
        <section className="rounded-sm border border-line bg-surface-elevated p-4">
          <h2 className="font-display text-title text-ink">À traiter</h2>
          <div className="mt-3 grid gap-4 divide-line sm:grid-cols-3 sm:divide-x">
            {aTraiter.map((c, i) => (
              <div key={c.label} className={i > 0 ? "sm:pl-4" : undefined}>
                <p className="text-body-sm text-ink-muted">{c.label}</p>
                <p className="mt-1 inline-block border-b-2 border-brand pb-0.5 font-display text-display-sm text-ink [font-variant-numeric:tabular-nums]">
                  {c.value}
                </p>
                <Link
                  href="/dashboard/dossiers"
                  className="mt-2 flex items-center gap-1 text-body-sm font-semibold text-ink underline-offset-2 hover:underline"
                >
                  Voir les dossiers
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {/* Dossiers à superviser : onglets, recherche, filtres, échéance */}
            <VueEnsembleSuperviser dossiers={superviser} />

            {/* Répartition par étape */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">Répartition par étape</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {repartition.map((e) => (
                  <div key={e.label} className="rounded-sm border border-line bg-surface p-3 text-center">
                    <p className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                      {e.label}
                    </p>
                    <p className="mt-1 font-display text-display-sm text-ink [font-variant-numeric:tabular-nums]">
                      {e.count}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            {/* Aujourd'hui */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">Aujourd&rsquo;hui</h2>
              <p className="mt-2 text-caption font-semibold uppercase tracking-wide text-ink-muted">
                Rendez-vous de l&rsquo;agence
              </p>
              {rdvJour.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="Aucun rendez-vous aujourd'hui"
                  className="mt-2 border-0 bg-transparent py-5"
                />
              ) : (
                <ul className="mt-2 divide-y divide-line">
                  {rdvJour.map((r) => {
                    const row = r as {
                      id: string;
                      client_nom: string;
                      service_type: string;
                      rdv_heure: string;
                      statut: string;
                    };
                    return (
                      <li key={row.id} className="flex items-center justify-between gap-2 py-2">
                        <div>
                          <p className="text-body-sm font-medium text-ink">{row.client_nom}</p>
                          <p className="text-caption text-ink-muted">
                            {row.rdv_heure} · {row.service_type}
                          </p>
                        </div>
                        <span className="rounded-sm border border-line px-2 py-0.5 text-caption font-semibold text-ink-muted">
                          {row.statut}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}

              <p className="mt-4 border-t border-line pt-3 text-caption font-semibold uppercase tracking-wide text-ink-muted">
                Activité récente
              </p>
              <ul className="mt-2 space-y-2">
                {activite.map((a) => {
                  const row = a as {
                    id: string;
                    reference: string | null;
                    nom_complet: string;
                    statut: string;
                    updated_at: string;
                  };
                  return (
                    <li key={row.id}>
                      <Link
                        href={`/dashboard/dossiers/${row.id}`}
                        className="block rounded-sm px-2 py-1.5 hover:bg-surface-sunken"
                      >
                        <span className="block text-body-sm text-ink">
                          {row.reference || "—"} · {row.nom_complet}
                        </span>
                        <span className="block text-caption text-ink-muted">
                          {row.statut} · {formatDateTime(row.updated_at)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Alertes et validations */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="flex items-center gap-2 font-display text-title text-ink">
                <BellRing className="h-4 w-4 text-ink-muted" aria-hidden />
                Alertes et validations
              </h2>
              <dl className="mt-3 space-y-2.5">
                {[
                  { label: "Paiements à examiner", value: paiementsAExaminer },
                  { label: "Dossiers sans agent", value: nbAAffecter },
                  { label: "Échéances dépassées", value: nbEcheancesDepassees },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <dt className="text-body-sm text-ink-muted">{row.label}</dt>
                    <dd className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
              {profile.role === "super_admin" && (
                <Link
                  href="/dashboard/super-admin/paiements/en-attente"
                  className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong"
                >
                  Consulter les validations
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              )}
            </section>
          </div>
        </div>

        {/* Pied de page (maquette) : accès directs réels, super_admin seul */}
        {profile.role === "super_admin" && (
          <p className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-body-sm">
            <Link
              href="/dashboard/super-admin/rh/employes"
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Gérer les accès
            </Link>
            <Link
              href="/dashboard/super-admin/audit-log"
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Consulter le journal d&rsquo;audit
            </Link>
          </p>
        )}
      </div>
    </ModuleAdminShell>
  );
}
