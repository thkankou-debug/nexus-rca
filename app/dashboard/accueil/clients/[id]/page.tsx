import Link from "next/link";
import { notFound } from "next/navigation";
import { FolderOpen, FileText, CreditCard } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { AccueilShell } from "@/components/accueil/AccueilShell";
import { OrientDossierForm } from "@/components/accueil/OrientDossierForm";
import { getAccueilAdminClient } from "@/lib/accueil-server";

export const metadata = {
  title: "Fiche client | Accueil & caisse | Nexus RCA",
};

export const dynamic = "force-dynamic";

function formatMoney(n: number): string {
  return `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
}

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

// Fiche client de réception (maquette POS ECRAN (3).png) — vue RESTREINTE de
// la fiche 360° (§3.4) : coordonnées, dossiers avec agent et statut,
// documents reçus à l'accueil (état "Reçu", jamais "Validé" — la réception
// collecte, le service compétent valide), situation des paiements, ouverture
// et orientation d'un dossier, accès direct au POS.
// Ce que la réception NE voit PAS : notes internes (clients.notes et
// demandes.notes_internes jamais sélectionnées ici), marge, finance de
// l'agence.
export default async function FicheClientReceptionPage({ params }: { params: { id: string } }) {
  const profile = await requireProfile(["accueil_caisse", "admin", "super_admin"]);
  const admin = getAccueilAdminClient();

  const { data: client } = await admin
    .from("clients")
    .select("id, reference, type, nom, prenom, raison_sociale, email, telephone, ville, profile_id")
    .eq("id", params.id)
    .single();
  if (!client) notFound();

  const c = client as {
    id: string;
    reference: string | null;
    type: string;
    nom: string;
    prenom: string | null;
    raison_sociale: string | null;
    email: string | null;
    telephone: string | null;
    ville: string | null;
    profile_id: string | null;
  };
  const displayName =
    c.type === "particulier" ? [c.prenom, c.nom].filter(Boolean).join(" ") || c.nom : c.raison_sociale || c.nom;

  const [dossiersRes, servicesRes, agentsRes, facturesRes, paymentsRes, passagesRes] = await Promise.all([
    admin
      .from("demandes")
      .select("id, reference, service, statut, created_at, profiles:agent_id(nom, prenom)")
      .eq("client_record_id", c.id)
      .order("created_at", { ascending: false })
      .limit(30),
    admin
      .from("services")
      .select("id, nom")
      .eq("status", "actif")
      .order("ordre_affichage", { ascending: true }),
    admin
      .from("profiles")
      .select("id, nom, prenom")
      .eq("role", "agent")
      .eq("actif", true)
      .eq("is_test", Boolean(profile.is_test))
      .order("nom", { ascending: true }),
    admin
      .from("factures")
      .select("amount, status")
      .eq("client_record_id", c.id)
      .in("status", ["validee", "payee"]),
    c.profile_id
      ? admin
          .from("payments")
          .select("montant_recu, status")
          .eq("client_id", c.profile_id)
          .not("status", "in", "(failed,voided,annule)")
      : Promise.resolve({ data: [] as { montant_recu: number | null }[] }),
    admin
      .from("quick_sales")
      .select("id, reference, description, montant_total, mode_paiement, created_at")
      .eq("client_record_id", c.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const dossiers = (dossiersRes.data || []) as unknown as {
    id: string;
    reference: string | null;
    service: string;
    statut: string;
    created_at: string;
    profiles: { nom: string; prenom: string | null } | null;
  }[];

  const dossierIds = dossiers.map((d) => d.id);
  const { data: documents } = dossierIds.length
    ? await admin
        .from("demande_documents")
        .select("id, demande_id, file_name, categorie, created_at")
        .in("demande_id", dossierIds)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  const facture = (facturesRes.data || []).reduce((s, f) => s + Number((f as { amount: number }).amount), 0);
  const regle =
    ((paymentsRes.data || []) as { montant_recu: number | null }[]).reduce(
      (s, p) => s + Number(p.montant_recu || 0),
      0
    ) +
    ((passagesRes.data || []) as { montant_total: number }[]).reduce((s, q) => s + Number(q.montant_total), 0);
  const reste = Math.max(0, facture - regle);
  const passages = (passagesRes.data || []) as {
    id: string;
    reference: string | null;
    description: string | null;
    montant_total: number;
    mode_paiement: string;
    created_at: string;
  }[];

  const dossierRefByid = new Map(dossiers.map((d) => [d.id, d.reference || "—"]));

  return (
    <AccueilShell
      profile={profile}
      breadcrumb={[
        { label: "Accueil & caisse", href: "/dashboard/accueil" },
        { label: "Clients", href: "/dashboard/accueil/clients" },
        { label: "Fiche client" },
      ]}
      title={displayName}
      description="Une identité, des dossiers liés et un historique de réception."
    >
      <div className="space-y-6">
        {/* Coordonnées */}
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-line bg-surface-elevated p-4">
          <dl className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Téléphone", value: c.telephone },
              { label: "E-mail", value: c.email },
              { label: "Référence", value: c.reference },
              { label: "Ville", value: c.ville },
            ].map((row) => (
              <div key={row.label}>
                <dt className="text-caption font-semibold uppercase tracking-wide text-ink-muted">
                  {row.label}
                </dt>
                <dd className="mt-0.5 text-body-sm font-medium text-ink">{row.value || "—"}</dd>
              </div>
            ))}
          </dl>
          <Link
            href="/dashboard/accueil/clients"
            className="rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong"
          >
            Rechercher un client
          </Link>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {/* Dossiers du client */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">Dossiers du client</h2>
              {dossiers.length === 0 ? (
                <div className="mt-3 rounded-sm border border-dashed border-line px-4 py-8 text-center">
                  <FolderOpen className="mx-auto h-6 w-6 text-ink-subtle" aria-hidden />
                  <p className="mt-2 text-body-sm text-ink-muted">
                    Aucun dossier — ouvrez-en un depuis le panneau de droite.
                  </p>
                </div>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-line text-caption font-semibold uppercase tracking-wide text-ink-muted">
                        <th className="py-2 pr-3">Référence</th>
                        <th className="py-2 pr-3">Service</th>
                        <th className="py-2 pr-3">Agent chargé</th>
                        <th className="py-2">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {dossiers.map((d) => (
                        <tr key={d.id}>
                          <td className="py-2.5 pr-3 font-mono text-caption text-ink-muted">
                            {d.reference || "—"}
                          </td>
                          <td className="py-2.5 pr-3 text-body-sm font-medium text-ink">{d.service}</td>
                          <td className="py-2.5 pr-3 text-body-sm text-ink-muted">
                            {d.profiles
                              ? [d.profiles.prenom, d.profiles.nom].filter(Boolean).join(" ")
                              : "À affecter"}
                          </td>
                          <td className="py-2.5">
                            <span className="rounded-sm border border-line px-2 py-0.5 text-caption font-semibold text-ink-muted">
                              {d.statut}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Documents reçus à l'accueil */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">Documents reçus à l&rsquo;accueil</h2>
              {(documents || []).length === 0 ? (
                <div className="mt-3 rounded-sm border border-dashed border-line px-4 py-8 text-center">
                  <FileText className="mx-auto h-6 w-6 text-ink-subtle" aria-hidden />
                  <p className="mt-2 text-body-sm text-ink-muted">
                    Aucun document reçu pour les dossiers de ce client.
                  </p>
                </div>
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {(documents || []).map((doc) => {
                    const row = doc as {
                      id: string;
                      demande_id: string;
                      file_name: string;
                      categorie: string | null;
                      created_at: string;
                    };
                    return (
                      <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                        <div>
                          <p className="text-body-sm font-medium text-ink">{row.file_name}</p>
                          <p className="text-caption text-ink-muted">
                            {[
                              `Dossier ${dossierRefByid.get(row.demande_id) || "—"}`,
                              row.categorie,
                              formatDate(row.created_at),
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <span className="rounded-sm border border-line px-2 py-0.5 text-caption font-semibold text-ink-muted">
                          Reçu
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="mt-3 border-t border-line pt-3 text-caption text-ink-muted">
                La réception collecte les pièces ; le service compétent les valide.
              </p>
            </section>

            {/* Historique de réception : passages en caisse */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">Historique de réception</h2>
              {passages.length === 0 ? (
                <p className="mt-3 text-body-sm text-ink-muted">
                  Accueil, orientation et encaissements seront tracés ici.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {passages.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                      <div>
                        <p className="text-body-sm font-medium text-ink">
                          {p.description || "Encaissement comptoir"}
                        </p>
                        <p className="text-caption text-ink-muted">
                          {[p.reference, p.mode_paiement, formatDate(p.created_at)].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <span className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                        {formatMoney(Number(p.montant_total))}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="space-y-6">
            {/* Ouvrir et orienter un dossier */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">Ouvrir et orienter un dossier</h2>
              <div className="mt-3">
                <OrientDossierForm
                  clientRecordId={c.id}
                  services={(servicesRes.data || []) as { id: string; nom: string }[]}
                  agents={(agentsRes.data || []) as { id: string; nom: string; prenom: string | null }[]}
                />
              </div>
            </section>

            {/* Situation des paiements */}
            <section className="rounded-sm border border-line bg-surface-elevated p-4">
              <h2 className="font-display text-title text-ink">Situation des paiements</h2>
              <dl className="mt-3 space-y-2.5">
                {[
                  { label: "Facturé", value: facture },
                  { label: "Réglé", value: regle },
                  { label: "Reste à régler", value: reste },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <dt className="text-body-sm text-ink-muted">{row.label}</dt>
                    <dd className="text-body-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">
                      {formatMoney(row.value)}
                    </dd>
                  </div>
                ))}
              </dl>
              <Link
                href="/dashboard/accueil/pos"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-line px-4 py-2 text-body-sm font-semibold text-ink hover:border-line-strong"
              >
                <CreditCard className="h-4 w-4" />
                Ouvrir dans le POS
              </Link>
              <p className="mt-3 text-caption text-ink-muted">
                Montants issus des factures validées et des paiements confirmés.
              </p>
            </section>
          </div>
        </div>

        <p className="rounded-sm border border-line bg-surface-elevated px-4 py-3 text-center text-caption text-ink-muted">
          Vue de réception · Accès limité aux informations nécessaires.
        </p>
      </div>
    </AccueilShell>
  );
}
