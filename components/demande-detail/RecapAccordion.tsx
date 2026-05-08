import { ChevronDown } from "lucide-react";
import type { Demande } from "@/types";

/**
 * Accordéon récap 6 sections du formulaire — lecture seule.
 * Server component avec <details>/<summary> natif.
 */
export function RecapAccordion({ demande }: { demande: Demande & Record<string, unknown> }) {
  const formatDate = (s?: string | null) => {
    if (!s) return "—";
    try {
      return new Date(s).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return s;
    }
  };

  const detailsService = (demande.details_service as Record<string, unknown>) || {};

  return (
    <div className="space-y-2">
      <RecapSection title="Section 01 — Identification du demandeur" defaultOpen>
        <Row label="Nom complet" value={demande.nom_complet} />
        <Row label="Sexe" value={(demande as { sexe?: string }).sexe || null} />
        <Row label="Date de naissance" value={formatDate((demande as { date_naissance?: string }).date_naissance)} />
        <Row label="Nationalité" value={(demande as { nationalite?: string }).nationalite || null} />
        <Row label="Email" value={demande.email} />
        <Row label="Téléphone" value={demande.telephone} />
        <Row
          label="Adresse"
          value={[
            (demande as { adresse?: string }).adresse,
            demande.ville,
            demande.pays,
          ]
            .filter(Boolean)
            .join(", ") || null}
        />
        <Row label="Situation matrimoniale" value={(demande as { situation_matrimoniale?: string }).situation_matrimoniale || null} />
        <Row label="Profession" value={(demande as { profession?: string }).profession || null} />
        <Row label="Employeur" value={(demande as { employeur?: string }).employeur || null} />
        <Row label="Niveau d'études" value={(demande as { niveau_etudes?: string }).niveau_etudes || null} />
        <Row label="Langue préférée" value={demande.langue_preferee} />
      </RecapSection>

      <RecapSection title="Section 02 — Type de demande">
        <Row label="Service" value={demande.service} />
        <Row label="Catégorie" value={(demande as { categorie_demande?: string }).categorie_demande || null} />
        <Row label="Pays concerné" value={demande.pays_concerne} />
        <Row label="Type de procédure" value={(demande as { type_procedure?: string }).type_procedure || null} />
        <Row label="Date prévue" value={formatDate(demande.date_souhaitee)} />
        <Row
          label="Démarche déjà effectuée"
          value={(demande as { dossier_existant?: boolean }).dossier_existant ? "Oui" : "Non"}
        />
        {(demande as { numero_dossier_existant?: string }).numero_dossier_existant && (
          <Row label="N° dossier précédent" value={(demande as { numero_dossier_existant?: string }).numero_dossier_existant!} />
        )}
      </RecapSection>

      {Object.keys(detailsService).length > 0 && (
        <RecapSection title="Section 03 — Informations spécifiques">
          {Object.entries(detailsService).map(([key, value]) => (
            <Row
              key={key}
              label={key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              value={String(value || "")}
            />
          ))}
        </RecapSection>
      )}

      <RecapSection title="Section 04 — Documents">
        <p className="text-sm text-slate-600">
          Voir la section <strong>Documents</strong> ci-contre pour la liste
          détaillée et l&rsquo;ajout de fichiers complémentaires.
        </p>
      </RecapSection>

      {(demande as { informations_complementaires?: string }).informations_complementaires && (
        <RecapSection title="Section 05 — Informations complémentaires">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {(demande as { informations_complementaires?: string }).informations_complementaires}
          </p>
        </RecapSection>
      )}

      <RecapSection title="Section 06 — Validation">
        <Row
          label="Exactitude certifiée"
          value={demande.consentement_examen ? "✓ Oui" : "Non"}
        />
        <Row
          label="Traitement autorisé"
          value={demande.consentement_documents ? "✓ Oui" : "Non"}
        />
        <Row
          label="Acceptation contact"
          value={demande.consentement_recontact ? "✓ Oui" : "Non"}
        />
      </RecapSection>
    </div>
  );
}

function RecapSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50">
        <span className="font-display text-sm font-bold text-nexus-blue-950">
          {title}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-1.5 border-t border-slate-100 px-4 py-3">
        {children}
      </div>
    </details>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-3 border-b border-slate-50 py-1.5 last:border-0 last:pb-0">
      <span className="w-44 shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      <span className="flex-1 text-sm text-slate-800">{value}</span>
    </div>
  );
}
