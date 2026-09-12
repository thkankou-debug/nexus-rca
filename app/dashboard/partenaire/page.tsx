import Image from "next/image";
import { requireProfile } from "@/lib/auth";
import {
  PartenaireEspace,
  type SharedDossier,
  type PartnerReturn,
} from "@/components/partenaire/PartenaireEspace";
import { getFinanceAdminClient } from "@/lib/finance-server";

export const metadata = {
  title: "Espace partenaire | Nexus RCA",
};

export const dynamic = "force-dynamic";

// ============================================================================
// ESPACE PARTENAIRE (§5.10) — navigation simplifiée (§4.1) : pas le shell
// d'administration complet, un en-tête avec le logo et la liste des dossiers
// partagés. Lectures via service-role APRÈS garde de rôle : `demandes` n'a
// aucune policy de lecture partenaire — le périmètre est reconstruit ici
// (partages explicites uniquement) avec des champs limités : jamais
// notes_internes, jamais la finance, jamais les autres dossiers (SEC-03).
// ============================================================================

export default async function PartenairePage() {
  const profile = await requireProfile(["partenaire", "super_admin"]);
  const admin = getFinanceAdminClient();

  const { data: shares } = await admin
    .from("dossier_partages")
    .select("created_at, demandes(id, reference, service, statut, nom_complet, created_at)")
    .eq("partenaire_id", profile.id)
    .order("created_at", { ascending: false });

  const dossiers: SharedDossier[] = ((shares || []) as unknown as {
    created_at: string;
    demandes: {
      id: string;
      reference: string | null;
      service: string;
      statut: string;
      nom_complet: string;
      created_at: string;
    } | null;
  }[])
    .filter((s) => s.demandes)
    .map((s) => ({ ...s.demandes!, shared_at: s.created_at }));

  const { data: retours } = await admin
    .from("partner_returns")
    .select("id, demande_id, type, content, created_at")
    .eq("partenaire_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="min-h-screen bg-surface-sunken">
      <header className="border-b border-sidebar-line bg-sidebar">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Image src="/icones/icon-96.png" alt="Nexus RCA" width={38} height={38} className="rounded-sm" priority />
            <div>
              <p className="font-display text-base font-bold leading-tight tracking-wide text-sidebar-ink">
                NEXUS <span className="text-brand">RCA</span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-ink-subtle">
                Espace partenaire
              </p>
            </div>
          </div>
          <p className="text-body-sm text-sidebar-ink-muted">
            {[profile.prenom, profile.nom].filter(Boolean).join(" ") || profile.email}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-display-sm text-ink">Dossiers partagés</h1>
        <p className="mt-1.5 text-body text-ink-muted">
          Uniquement les éléments expressément partagés par NEXUS RCA. Vos retours sont transmis
          au responsable du dossier — ils ne modifient jamais le dossier eux-mêmes.
        </p>
        <div className="mt-6">
          <PartenaireEspace
            dossiers={dossiers}
            retours={(retours || []) as PartnerReturn[]}
          />
        </div>
      </main>
    </div>
  );
}
