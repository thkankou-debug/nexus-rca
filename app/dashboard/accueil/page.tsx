import Link from "next/link";
import { UserPlus, FolderPlus, ShoppingCart, CalendarDays, Compass } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { AccueilShell } from "@/components/accueil/AccueilShell";
import { OuvrirCaisseCard } from "@/components/accueil/OuvrirCaisseCard";
import { FileAccueil } from "@/components/accueil/FileAccueil";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { getAccueilAdminClient, getOwnSessionSnapshot } from "@/lib/accueil-server";

export const metadata = {
  title: "Poste de réception | Nexus RCA",
};

export const dynamic = "force-dynamic";

function formatMoney(n: number): string {
  return `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
}

// Poste de réception — écran d'accueil du métier Accueil & caisse (maquette
// ACCEUIL .png). Réception des clients, ouverture des dossiers et
// encaissements. Données réelles uniquement : chaque bloc lit les tables
// existantes (caisse_sessions, quick_sales, demandes, appointments).
export default async function PosteReceptionPage() {
  const profile = await requireProfile(["accueil_caisse", "admin", "super_admin"]);
  const admin = getAccueilAdminClient();
  const includeTest = Boolean(profile.is_test);

  const today = new Date().toISOString().split("T")[0];

  const [session, aOrienterRes, rdvRes, visitesRes] = await Promise.all([
    getOwnSessionSnapshot(profile.id),
    admin
      .from("demandes")
      .select("id, reference, nom_complet, service, statut, created_at, client_record_id")
      .is("agent_id", null)
      .in("statut", ["nouveau", "nouvelle_demande", "qualification"])
      .eq("is_test", includeTest)
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("appointments")
      .select("id, reference, client_nom, service_type, rdv_heure, statut")
      .eq("rdv_date", today)
      .eq("is_test", includeTest)
      .order("rdv_heure", { ascending: true })
      .limit(10),
    admin
      .from("reception_visits")
      .select("id, visitor_name, motif, status, arrived_at, client_record_id")
      .in("status", ["en_attente", "en_charge"])
      .eq("is_test", includeTest)
      .order("arrived_at", { ascending: true })
      .limit(30),
  ]);

  const aOrienter = aOrienterRes.data || [];
  const rdvJour = rdvRes.data || [];
  const visites = (visitesRes.data || []) as {
    id: string;
    visitor_name: string;
    motif: string;
    status: string;
    arrived_at: string;
    client_record_id: string | null;
  }[];

  const actions = [
    {
      href: "/dashboard/accueil/clients",
      icon: UserPlus,
      label: "Accueillir un client",
      hint: "Rechercher avant de créer — barrière anti-doublon",
    },
    {
      href: "/dashboard/accueil/clients",
      icon: FolderPlus,
      label: "Ouvrir un dossier",
      hint: "Depuis la fiche du client, puis orientation",
    },
    {
      href: "/dashboard/accueil/encaissement",
      icon: ShoppingCart,
      label: "Encaisser un paiement",
      hint: session?.status === "ouverte" ? "Encaissement libre actif" : "Ouvrez d'abord votre caisse",
    },
  ];

  return (
    <AccueilShell
      profile={profile}
      breadcrumb={[{ label: "Agence" }, { label: "Réception" }]}
      title="Accueil & caisse"
      description="Réception des clients, ouverture des dossiers et encaissements."
    >
      <div className="space-y-6">
        <OuvrirCaisseCard sessionStatus={session?.status ?? null} />

        <div className="grid gap-3 sm:grid-cols-3">
          {actions.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="flex items-center gap-3 rounded-sm border border-line bg-surface-elevated px-4 py-3 transition-colors hover:border-line-strong"
            >
              <a.icon className="h-5 w-5 text-ink-muted" aria-hidden />
              <span>
                <span className="block text-body-sm font-semibold text-ink">{a.label}</span>
                <span className="block text-caption text-ink-muted">{a.hint}</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {/* File d'accueil (§7.3) : arrivées physiques du jour */}
            <FileAccueil visits={visites} />

            {/* À orienter : dossiers sans agent, statuts d'entrée */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-title text-ink">Dossiers à orienter</h2>
                <span className="text-caption text-ink-muted">
                  {aOrienter.length} sans agent
                </span>
              </div>
              {aOrienter.length === 0 ? (
                <EmptyState
                  icon={Compass}
                  title="Rien à orienter"
                  description="Les nouveaux dossiers sans agent apparaîtront ici."
                  className="mt-3 border-0 bg-transparent py-6"
                />
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-line text-caption font-semibold uppercase tracking-wide text-ink-muted">
                        <th className="py-2 pr-3">Référence</th>
                        <th className="py-2 pr-3">Client</th>
                        <th className="py-2 pr-3">Service</th>
                        <th className="py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {aOrienter.map((d) => (
                        <tr key={d.id}>
                          <td className="py-2.5 pr-3 font-mono text-caption text-ink-muted">
                            {d.reference || "—"}
                          </td>
                          <td className="py-2.5 pr-3 text-body-sm font-medium text-ink">
                            {d.nom_complet}
                          </td>
                          <td className="py-2.5 pr-3 text-body-sm text-ink-muted">{d.service}</td>
                          <td className="py-2.5">
                            {d.client_record_id ? (
                              <Link
                                href={`/dashboard/accueil/clients/${d.client_record_id}`}
                                className="text-body-sm font-semibold text-ink underline-offset-2 hover:underline"
                              >
                                Prendre en charge
                              </Link>
                            ) : (
                              <span className="text-caption text-ink-subtle">
                                Fiche client non rattachée
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Rendez-vous du jour */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-title text-ink">Rendez-vous à l&rsquo;accueil</h2>
                <span className="text-caption text-ink-muted">Aujourd&rsquo;hui</span>
              </div>
              {rdvJour.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="Aucun rendez-vous aujourd'hui"
                  className="mt-3 border-0 bg-transparent py-6"
                />
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {rdvJour.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                      <div>
                        <p className="text-body-sm font-medium text-ink">{r.client_nom}</p>
                        <p className="text-caption text-ink-muted">
                          {[r.rdv_heure, r.service_type, r.reference].filter(Boolean).join(" · ")}
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
          </div>

          {/* Contrôle de session */}
          <section className="h-fit rounded-sm border border-line bg-surface-elevated p-4">
            <h2 className="font-display text-title text-ink">Contrôle de session</h2>
            {session ? (
              <dl className="mt-3 space-y-2.5">
                {[
                  { label: "Fonds d'ouverture", value: session.opening_balance },
                  { label: "Espèces encaissées", value: session.especes_encaissees },
                  { label: "Paiements électroniques", value: session.paiements_electroniques },
                  { label: "Espèces théoriques", value: session.especes_theoriques },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <dt className="text-body-sm text-ink-muted">{row.label}</dt>
                    <dd className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                      {formatMoney(row.value)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-3 text-body-sm text-ink-muted">
                Aucune session en cours — les compteurs s&rsquo;afficheront à l&rsquo;ouverture de
                la caisse.
              </p>
            )}
            <p className="mt-4 border-t border-line pt-3 text-caption text-ink-muted">
              Les paiements électroniques sont suivis séparément des espèces.
            </p>
            <Link
              href="/dashboard/accueil/session"
              className="mt-3 inline-flex w-full items-center justify-center rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong"
            >
              Préparer le rapprochement
            </Link>
          </section>
        </div>
      </div>
    </AccueilShell>
  );
}
