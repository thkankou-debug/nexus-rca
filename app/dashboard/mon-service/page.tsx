import Link from "next/link";
import { Users, CalendarDays, Inbox } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getEffectiveNav } from "@/lib/admin-nav";
import { ModuleAdminShell } from "@/components/admin/ui/ModuleAdminShell";
import { StatCard } from "@/components/admin/ui/StatCard";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { getFinanceAdminClient } from "@/lib/finance-server";
import { getServiceScope, STATUTS_TERMINAUX } from "@/lib/pilotage-server";
import { getCategorieFromService, isCategorieDossier } from "@/lib/demande-categories";

export const metadata = {
  title: "Mon service | Nexus RCA",
};

export const dynamic = "force-dynamic";

// ============================================================================
// RESPONSABLE DE SERVICE — MON SERVICE (§2.7). Périmètre limité au pôle du
// service du profil (voir lib/pilotage-server.ts : demandes.service_id est
// NULL partout, le pôle via categorie_dossier est le périmètre réellement
// mesurable ; service_id reste prioritaire quand il sera renseigné).
// Chiffres honnêtes : « taux de clôture dans les délais » et « délai moyen »
// NON affichés (aucun historique de transitions, deadline non renseignée —
// A6 #11). « En retard » = échéance de dossier dépassée quand elle existe.
// ============================================================================

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  } catch {
    return d;
  }
}

export default async function MonServicePage() {
  const profile = await requireProfile(["chef_service", "super_admin"]);
  const admin = getFinanceAdminClient();
  const includeTest = Boolean(profile.is_test);

  const scope = await getServiceScope(profile);
  const effectiveNav = await getEffectiveNav();

  if (!scope) {
    return (
      <ModuleAdminShell
        profile={profile}
        effectiveNav={effectiveNav}
        breadcrumb={[{ label: "Pilotage" }, { label: "Mon service" }]}
        title="Mon service"
        description="Supervision du service rattaché à votre profil."
      >
        <EmptyState
          icon={Users}
          title="Aucun service rattaché à votre profil"
          description="Un administrateur doit renseigner votre service (profil → service) pour activer cet écran."
        />
      </ModuleAdminShell>
    );
  }

  const todayDate = new Date().toISOString().split("T")[0];

  const [demandesRes, agentsRes, rdvRes, absencesRes] = await Promise.all([
    admin
      .from("demandes")
      .select(
        "id, reference, nom_complet, service, statut, categorie_dossier, service_id, agent_id, deadline, created_at, updated_at"
      )
      .eq("is_test", includeTest),
    admin
      .from("profiles")
      .select("id, nom, prenom, availability_status")
      .eq("role", "agent")
      .eq("actif", true)
      .eq("service_id", scope.serviceId)
      .eq("is_test", includeTest)
      .order("nom", { ascending: true }),
    admin
      .from("appointments")
      .select("id, client_nom, service_type, rdv_heure, statut, agent_id")
      .eq("rdv_date", todayDate)
      .eq("is_test", includeTest)
      .order("rdv_heure", { ascending: true }),
    admin
      .from("leave_requests")
      .select("id, employee_id, start_date, end_date, statut")
      .lte("start_date", todayDate)
      .gte("end_date", todayDate)
      .in("statut", ["approuve", "approuvee", "validee"]),
  ]);

  // Périmètre : service_id (prioritaire, aucun dossier ne le porte encore)
  // OU catégorie du pôle.
  const inScope = (d: { service_id: string | null; categorie_dossier: string | null; service: string }) => {
    if (d.service_id) return d.service_id === scope.serviceId;
    const cat =
      d.categorie_dossier && isCategorieDossier(d.categorie_dossier)
        ? d.categorie_dossier
        : getCategorieFromService(d.service);
    return (scope.dossierCategories as string[]).includes(cat);
  };

  const all = ((demandesRes.data || []) as {
    id: string;
    reference: string | null;
    nom_complet: string;
    service: string;
    statut: string;
    categorie_dossier: string | null;
    service_id: string | null;
    agent_id: string | null;
    deadline: string | null;
    created_at: string;
    updated_at: string;
  }[]).filter(inScope);

  const isTerminal = (s: string) => STATUTS_TERMINAUX.includes(s);
  const actifs = all.filter((d) => !isTerminal(d.statut));
  const nonAssignes = actifs.filter((d) => !d.agent_id);
  const horsDelai = actifs.filter((d) => d.deadline && d.deadline < todayDate);

  const agents = (agentsRes.data || []) as {
    id: string;
    nom: string;
    prenom: string | null;
    availability_status: string | null;
  }[];
  const agentIds = new Set(agents.map((a) => a.id));
  const absences = ((absencesRes.data || []) as { employee_id: string }[]).filter((a) =>
    agentIds.has(a.employee_id)
  );
  const absentIds = new Set(absences.map((a) => a.employee_id));

  const rdvJour = ((rdvRes.data || []) as {
    id: string;
    client_nom: string;
    service_type: string;
    rdv_heure: string;
    statut: string;
    agent_id: string | null;
  }[]).filter((r) => r.agent_id && agentIds.has(r.agent_id));

  // Performance : volume par prestation (libellé service saisi)
  const parPrestation = new Map<string, number>();
  for (const d of all) parPrestation.set(d.service, (parPrestation.get(d.service) || 0) + 1);
  const prestations = Array.from(parPrestation.entries()).sort((a, b) => b[1] - a[1]);
  const clos = all.filter((d) => d.statut === "termine" || d.statut === "complete").length;
  const refuses = all.filter((d) => d.statut === "refuse").length;
  const tauxSucces = clos + refuses > 0 ? Math.round((clos / (clos + refuses)) * 100) : null;

  return (
    <ModuleAdminShell
      profile={profile}
      effectiveNav={effectiveNav}
      breadcrumb={[{ label: "Pilotage" }, { label: "Mon service" }]}
      title={scope.serviceNom}
      description={`Pôle ${scope.categorie} — supervision du service, arbitrage et performance.`}
    >
      <div className="space-y-6">
        {/* Mon service aujourd'hui */}
        <section>
          <h2 className="font-display text-title text-ink">Mon service aujourd&rsquo;hui</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Nouvelles demandes non assignées" value={nonAssignes.length} />
            <StatCard label="Dossiers en cours" value={actifs.length} />
            <StatCard label="Hors délai" value={horsDelai.length} />
            <StatCard label="Rendez-vous du jour" value={rdvJour.length} />
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {/* À arbitrer : non assignés */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-title text-ink">À arbitrer</h2>
                <span className="text-caption text-ink-muted">
                  {nonAssignes.length} sans agent · {horsDelai.length} hors délai
                </span>
              </div>
              {nonAssignes.length === 0 && horsDelai.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="Rien à arbitrer"
                  description="Les dossiers du pôle sans agent ou hors délai apparaîtront ici."
                  className="mt-3 border-0 bg-transparent py-6"
                />
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {[...nonAssignes, ...horsDelai.filter((d) => d.agent_id)].slice(0, 10).map((d) => (
                    <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                      <div>
                        <p className="text-body-sm font-medium text-ink">
                          {d.nom_complet}
                          <span className="font-normal text-ink-muted"> · {d.service}</span>
                        </p>
                        <p className="text-caption text-ink-muted">
                          {[
                            d.reference,
                            d.statut,
                            !d.agent_id ? "sans agent" : null,
                            d.deadline && d.deadline < todayDate ? `échéance ${formatDate(d.deadline)} dépassée` : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/dossiers/${d.id}`}
                        className="rounded-sm border border-line px-3 py-1 text-caption font-semibold text-ink hover:border-line-strong"
                      >
                        Examiner
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Mes agents */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">Mes agents</h2>
              {agents.length === 0 ? (
                <p className="mt-3 text-body-sm text-ink-muted">
                  Aucun agent rattaché à ce service (profil → service).
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {agents.map((a) => {
                    const charge = actifs.filter((d) => d.agent_id === a.id).length;
                    const enRetard = horsDelai.filter((d) => d.agent_id === a.id).length;
                    return (
                      <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                        <div>
                          <p className="text-body-sm font-medium text-ink">
                            {[a.prenom, a.nom].filter(Boolean).join(" ")}
                          </p>
                          <p className="text-caption text-ink-muted">
                            {[
                              a.availability_status || null,
                              absentIds.has(a.id) ? "absent aujourd'hui" : null,
                            ]
                              .filter(Boolean)
                              .join(" · ") || "disponibilité non renseignée"}
                          </p>
                        </div>
                        <span className="text-body-sm text-ink-muted [font-variant-numeric:tabular-nums]">
                          {charge} en charge
                          {enRetard > 0 && ` · ${enRetard} hors délai`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <div className="space-y-6">
            {/* RDV du jour */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">Rendez-vous du jour</h2>
              {rdvJour.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="Aucun rendez-vous aujourd'hui"
                  description="Rendez-vous des agents du service."
                  className="mt-2 border-0 bg-transparent py-5"
                />
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {rdvJour.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2 py-2">
                      <div>
                        <p className="text-body-sm font-medium text-ink">{r.client_nom}</p>
                        <p className="text-caption text-ink-muted">
                          {r.rdv_heure} · {r.service_type}
                        </p>
                      </div>
                      <span className="rounded-sm border border-line px-2 py-0.5 text-caption font-semibold text-ink-muted">
                        {r.statut}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Performance du service */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">Performance du service</h2>
              <dl className="mt-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <dt className="text-body-sm text-ink-muted">Dossiers clos (total)</dt>
                  <dd className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">{clos}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-body-sm text-ink-muted">Taux de succès</dt>
                  <dd className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                    {tauxSucces !== null ? `${tauxSucces} %` : "—"}
                  </dd>
                </div>
              </dl>
              {prestations.length > 0 && (
                <>
                  <p className="mt-4 border-t border-line pt-3 text-caption font-semibold uppercase tracking-wide text-ink-muted">
                    Volume par prestation
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {prestations.slice(0, 8).map(([label, count]) => (
                      <li key={label} className="flex items-center justify-between">
                        <span className="text-body-sm text-ink">{label}</span>
                        <span className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                          {count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p className="mt-3 border-t border-line pt-3 text-caption text-ink-muted">
                Délai moyen et taux de clôture dans les délais non affichés : aucun historique de
                transitions n&rsquo;est encore journalisé.
              </p>
            </section>
          </div>
        </div>
      </div>
    </ModuleAdminShell>
  );
}
