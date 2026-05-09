// ============================================================================
// COMPOSANT — Vue détail staff complète d'un dossier
// Réutilise les composants existants de /components/demande-detail/* et y ajoute
// la couche staff (bandeau actions, notes internes, historique enrichi).
// Server-component-friendly : on n'enroule pas le tout dans un client component
// inutilement, sauf pour les sous-blocs qui ont besoin d'interactivité.
// ============================================================================

import { Download, FileText, Hash, MessageCircle } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import { StatusBadge, UrgenceBadge } from "@/components/dashboard/StatCard";
import { Timeline } from "@/components/demande-detail/Timeline";
import { ConseillerCard } from "@/components/demande-detail/ConseillerCard";
import { DocumentsManager } from "@/components/demande-detail/DocumentsManager";
import { MessagesList } from "@/components/demande-detail/MessagesList";
import { RecapAccordion } from "@/components/demande-detail/RecapAccordion";
import { DossierStaffActions } from "./DossierStaffActions";
import { StaffNotes } from "./StaffNotes";
import { StaffHistoryTimeline } from "./StaffHistoryTimeline";
import { CATEGORIE_META } from "@/lib/demande-categories";
import { formatDate } from "@/lib/utils";
import type {
  CategorieDossierSlug,
  Demande,
  DemandeStatus,
  UrgenceLevel,
  UserRole,
} from "@/types";

interface StaffDossierDetailProps {
  demande: Demande;
  currentUserId: string;
  role: UserRole;
  /** Catégorie validée (déjà passée par isCategorieDossier en amont) */
  categorieSlug: CategorieDossierSlug;
  /** Préfixe URL pour le retour vers la liste */
  backHref: string;
  /** Données conseiller assigné (déjà chargées côté serveur) */
  agentInfo: {
    id: string;
    nom: string | null;
    prenom: string | null;
    email: string | null;
    telephone: string | null;
    poste: string | null;
    avatar_url: string | null;
  } | null;
  /** History déjà chargé pour la Timeline */
  history: Array<{ step: number; created_at: string }>;
}

export function StaffDossierDetail({
  demande,
  currentUserId,
  role,
  categorieSlug,
  backHref,
  agentInfo,
  history,
}: StaffDossierDetailProps) {
  const meta = CATEGORIE_META[categorieSlug];
  const reference = demande.reference || `NX-${demande.id.slice(0, 8).toUpperCase()}`;

  return (
    <>
      <BackButton fallbackHref={backHref} label="Retour aux dossiers" />

      <header className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 p-6 shadow-lg sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-400">
              <Hash className="h-3 w-3" />
              {meta.label}
            </div>
            <h1 className="mt-3 break-all font-mono text-2xl font-bold text-white sm:text-3xl">
              {reference}
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              <span className="font-bold text-white">{demande.service}</span>
              {demande.categorie_demande && ` · ${demande.categorie_demande}`}
              {demande.pays_concerne && ` · ${demande.pays_concerne}`}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {demande.nom_complet} · {demande.email} · soumis le{" "}
              {formatDate(demande.created_at)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={demande.statut as DemandeStatus} />
            <UrgenceBadge level={demande.urgence as UrgenceLevel} />
            <a
              href={`/api/demandes/${demande.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              <Download className="h-3.5 w-3.5" />
              PDF dossier
            </a>
          </div>
        </div>
      </header>

      {/* Bandeau staff — interactif (modals + sélecteur étape) */}
      <DossierStaffActions
        demandeId={demande.id}
        reference={reference}
        currentStep={demande.current_step ?? 1}
        currentStepLabel={demande.current_step_label}
        categorieSlug={categorieSlug}
        role={role}
      />

      {/* Timeline (réutilise composant client existant) */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
            Avancement
          </p>
          <h2 className="font-display text-lg font-bold text-nexus-blue-950">
            Étape {demande.current_step ?? 1}/6 — {demande.current_step_label || "Dossier reçu"}
          </h2>
        </div>
        <Timeline
          service={demande.service}
          currentStep={demande.current_step ?? 1}
          statut={demande.statut}
          history={history}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Colonne gauche */}
        <div className="space-y-6 lg:col-span-8">
          <section>
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-nexus-orange-500" />
              <h2 className="font-display text-lg font-bold text-nexus-blue-950">
                Documents
              </h2>
            </div>
            <DocumentsManager demandeId={demande.id} canDelete={true} />
          </section>

          <section id="messages">
            <div className="mb-3 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-nexus-orange-500" />
              <h2 className="font-display text-lg font-bold text-nexus-blue-950">
                Messages
              </h2>
            </div>
            <MessagesList demandeId={demande.id} currentUserId={currentUserId} />
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-nexus-orange-500" />
              <h2 className="font-display text-lg font-bold text-nexus-blue-950">
                Récapitulatif du dossier
              </h2>
            </div>
            <RecapAccordion demande={demande as never} />
          </section>
        </div>

        {/* Colonne droite */}
        <aside className="space-y-4 lg:col-span-4">
          <ConseillerCard agent={agentInfo} demandeRef={reference} />
          <StaffHistoryTimeline demandeId={demande.id} />
          <StaffNotes demandeId={demande.id} role={role} />
        </aside>
      </div>
    </>
  );
}
