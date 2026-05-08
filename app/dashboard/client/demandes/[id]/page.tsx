import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Hash,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { StatusBadge, UrgenceBadge } from "@/components/dashboard/StatCard";
import { DemandeDocumentsList } from "@/components/dashboard/DemandeDocumentsList";
import { formatDate, cn } from "@/lib/utils";
import { DOCUMENT_CATEGORIES } from "@/lib/demande-complete-form";

export const dynamic = "force-dynamic";

export default async function ClientDemandeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile([
    "client",
    "agent",
    "admin",
    "super_admin",
  ]);
  const supabase = createClient();

  const { data: demande, error } = await supabase
    .from("demandes")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !demande) {
    notFound();
  }

  // Le client ne peut voir QUE ses propres dossiers
  if (
    profile.role === "client" &&
    demande.client_id !== profile.id &&
    demande.email?.toLowerCase().trim() !== profile.email.toLowerCase().trim()
  ) {
    notFound();
  }

  // Récupérer les documents groupés par catégorie
  const { data: documents } = await supabase
    .from("demande_documents")
    .select("*")
    .eq("demande_id", params.id)
    .order("created_at", { ascending: false });

  const docsByCategorie: Record<string, typeof documents> = {};
  (documents || []).forEach((d) => {
    const cat = d.categorie || "documents_complementaires";
    if (!docsByCategorie[cat]) docsByCategorie[cat] = [];
    docsByCategorie[cat].push(d);
  });

  const reference =
    demande.reference || `NX-${demande.id.slice(0, 8).toUpperCase()}`;

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/client/demandes"
        label="Retour aux dossiers"
      />

      {/* En-tête dossier */}
      <header className="mb-8">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
              Dossier
            </p>
            <h1 className="mt-1 break-all font-mono text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
              {reference}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{demande.service}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={demande.statut} />
            <UrgenceBadge level={demande.urgence} />
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        {/* ─── Colonne principale (8/12) ─── */}
        <div className="space-y-6 lg:col-span-8">
          {/* Section 01 — Identification */}
          <SectionCard number="01" title="Identification du demandeur">
            <DataRow label="Nom complet" value={demande.nom_complet} />
            <DataRow label="Sexe" value={demande.sexe} />
            <DataRow
              label="Date de naissance"
              value={
                demande.date_naissance
                  ? new Date(demande.date_naissance).toLocaleDateString("fr-FR")
                  : null
              }
            />
            <DataRow label="Nationalité" value={demande.nationalite} />
            <DataRow label="Email" value={demande.email} />
            <DataRow label="Téléphone" value={demande.telephone} />
            <DataRow
              label="Adresse"
              value={
                [demande.adresse, demande.ville, demande.pays]
                  .filter(Boolean)
                  .join(", ") || null
              }
            />
            <DataRow
              label="Situation matrimoniale"
              value={demande.situation_matrimoniale}
            />
            <DataRow label="Profession" value={demande.profession} />
            {demande.employeur && (
              <DataRow label="Employeur" value={demande.employeur} />
            )}
            <DataRow label="Niveau d'études" value={demande.niveau_etudes} />
          </SectionCard>

          {/* Section 02 — Type de demande */}
          <SectionCard number="02" title="Type de demande">
            <DataRow label="Service" value={demande.service} />
            <DataRow
              label="Catégorie"
              value={demande.categorie_demande}
            />
            <DataRow label="Pays concerné" value={demande.pays_concerne} />
            <DataRow
              label="Type de procédure"
              value={demande.type_procedure}
            />
            <DataRow
              label="Date prévue"
              value={
                demande.date_souhaitee
                  ? new Date(demande.date_souhaitee).toLocaleDateString("fr-FR")
                  : null
              }
            />
            <DataRow
              label="Démarche déjà effectuée"
              value={demande.dossier_existant ? "Oui" : "Non"}
            />
            {demande.dossier_existant && demande.numero_dossier_existant && (
              <DataRow
                label="N° dossier précédent"
                value={demande.numero_dossier_existant}
              />
            )}
          </SectionCard>

          {/* Section 03 — Informations spécifiques */}
          {demande.details_service &&
            Object.keys(demande.details_service).length > 0 && (
              <SectionCard number="03" title="Informations spécifiques">
                <pre className="whitespace-pre-wrap break-words text-sm text-slate-700">
                  {JSON.stringify(demande.details_service, null, 2)
                    .replace(/[{},"]/g, "")
                    .replace(/_/g, " ")
                    .trim()}
                </pre>
              </SectionCard>
            )}

          {/* Section 04 — Documents */}
          <SectionCard number="04" title="Documents justificatifs">
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              Vous pouvez ajouter des documents complémentaires à tout moment.
              Notre équipe vous indiquera si certains documents sont
              nécessaires.
            </p>
            <div className="space-y-3">
              {DOCUMENT_CATEGORIES.map((cat) => {
                const docs = docsByCategorie[cat.value] || [];
                return (
                  <div
                    key={cat.value}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-nexus-blue-950">
                        {cat.label}
                      </p>
                      {docs.length > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />
                          {docs.length} fichier(s)
                        </span>
                      ) : (
                        <span className="text-[11px] italic text-slate-400">
                          Aucun fichier
                        </span>
                      )}
                    </div>
                    {docs.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {docs.map((d) => (
                          <li
                            key={d.id}
                            className="text-xs text-slate-600"
                          >
                            • {d.file_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4">
              <DemandeDocumentsList demandeId={demande.id} />
            </div>
          </SectionCard>

          {/* Section 05 — Informations complémentaires */}
          {demande.informations_complementaires && (
            <SectionCard number="05" title="Informations complémentaires">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {demande.informations_complementaires}
              </p>
            </SectionCard>
          )}
        </div>

        {/* ─── Sidebar (4/12) ─── */}
        <aside className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-24">
            {/* Statut */}
            <SidebarCard title="Statut du dossier" icon={ShieldCheck}>
              <StatusTracker statut={demande.statut} />
            </SidebarCard>

            {/* Référence */}
            <SidebarCard title="Référence" icon={Hash}>
              <p className="break-all font-mono text-sm font-bold text-nexus-blue-950">
                {reference}
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Soumis le {formatDate(demande.created_at)}
              </p>
            </SidebarCard>

            {/* Contact */}
            <SidebarCard title="Contact dossier" icon={Mail}>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nexus-orange-500" />
                  <span className="text-slate-700">{demande.nom_complet}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nexus-orange-500" />
                  <span className="text-slate-700">{demande.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nexus-orange-500" />
                  <span className="text-slate-700">{demande.telephone}</span>
                </div>
                {demande.ville && (
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-nexus-orange-500" />
                    <span className="text-slate-700">
                      {demande.ville}, {demande.pays}
                    </span>
                  </div>
                )}
              </div>
            </SidebarCard>

            {/* Aide */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Besoin d&rsquo;aide ?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Pour toute question sur votre dossier, contactez votre
                conseiller dédié sur WhatsApp en mentionnant votre référence.
              </p>
              <a
                href={`https://wa.me/23673269692?text=Référence%20${encodeURIComponent(reference)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-600"
              >
                Contacter sur WhatsApp
              </a>
            </div>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================

function SectionCard({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-baseline gap-3 border-b border-slate-100 pb-3">
        <span className="font-mono text-xs font-bold text-nexus-orange-600">
          {number}
        </span>
        <h2 className="font-display text-lg font-bold text-nexus-blue-950">
          {title}
        </h2>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function DataRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-3 border-b border-slate-50 py-1.5 last:border-0 last:pb-0">
      <span className="w-40 shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      <span className="flex-1 text-sm text-slate-800">{value}</span>
    </div>
  );
}

function SidebarCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-nexus-orange-500" />
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

function StatusTracker({ statut }: { statut: string }) {
  const phases = [
    { key: "nouveau", label: "Reçu" },
    { key: "en_cours", label: "En analyse" },
    { key: "incomplet", label: "Documents requis" },
    { key: "en_traitement", label: "En traitement" },
    { key: "complete", label: "Validé" },
  ];

  const currentIndex = phases.findIndex((p) => p.key === statut);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <ol className="space-y-2">
      {phases.map((phase, i) => {
        const state =
          i < safeIndex ? "done" : i === safeIndex ? "active" : "todo";
        return (
          <li key={phase.key} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2",
                state === "done"
                  ? "bg-nexus-orange-500 text-white ring-nexus-orange-200"
                  : state === "active"
                    ? "bg-nexus-blue-950 text-white ring-nexus-orange-300"
                    : "bg-slate-100 text-slate-400 ring-slate-200"
              )}
            >
              {state === "done" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <span className="text-[10px] font-bold">{i + 1}</span>
              )}
            </div>
            <span
              className={cn(
                "text-xs font-semibold",
                state === "todo" ? "text-slate-400" : "text-nexus-blue-950"
              )}
            >
              {phase.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
