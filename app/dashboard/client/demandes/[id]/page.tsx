import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Hash,
  Plus,
  Receipt,
  Wallet,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import { StatusBadge, UrgenceBadge } from "@/components/dashboard/StatCard";
import type { DemandeStatus, UrgenceLevel } from "@/types";
import { Timeline } from "@/components/demande-detail/Timeline";
import { ConseillerCard } from "@/components/demande-detail/ConseillerCard";
import { RecapAccordion } from "@/components/demande-detail/RecapAccordion";
import { MessagesList } from "@/components/demande-detail/MessagesList";
import { DocumentsManager } from "@/components/demande-detail/DocumentsManager";
import { getCurrentStepLabel } from "@/lib/demande-status";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function formatMoney(amount: number, currency = "XAF"): string {
  const intPart = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${intPart} ${currency}`;
}

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

  const d = demande as Record<string, unknown>;
  const reference =
    (d.reference as string) ||
    `NX-${(d.id as string).slice(0, 8).toUpperCase()}`;
  const currentStep = (d.current_step as number) || 1;
  const stepLabel = getCurrentStepLabel(
    (d.service as string) || "",
    currentStep
  );

  // Conseiller assigné
  const agentId = d.agent_id as string | undefined;
  let agentInfo: {
    id: string;
    nom: string | null;
    prenom: string | null;
    email: string | null;
    telephone: string | null;
    poste: string | null;
    avatar_url: string | null;
  } | null = null;
  if (agentId) {
    const { data: agentData } = await supabase
      .from("profiles")
      .select("id, nom, prenom, email, telephone, poste, avatar_url")
      .eq("id", agentId)
      .single();
    agentInfo = agentData as typeof agentInfo;
  }

  // History
  const { data: history } = await supabase
    .from("demande_status_history")
    .select("step, step_label, created_at")
    .eq("demande_id", params.id)
    .order("created_at", { ascending: true });

  // Paiements liés au dossier (par référence ou email)
  const userEmail = (profile.email || "").toLowerCase().trim();
  const { data: paiements } = await supabase
    .from("payments")
    .select("id, reference, service, montant_total, montant_recu, devise, date_paiement")
    .eq("client_email", userEmail)
    .order("date_paiement", { ascending: false })
    .limit(10);

  // Liens de paiement en attente
  const { data: paymentLinks } = await supabase
    .from("payment_links")
    .select("reference, service, montant, devise, statut, expires_at")
    .eq("client_email", userEmail)
    .in("statut", ["en_attente", "declare"])
    .limit(5);

  const totalPaye = (paiements || []).reduce(
    (s, p) => s + Number(p.montant_recu || 0),
    0
  );
  const totalDu = (paiements || []).reduce(
    (s, p) => s + Number(p.montant_total || 0),
    0
  );
  const totalRestant = Math.max(0, totalDu - totalPaye);

  const canDelete = profile.role === "client";

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/client/demandes"
        label="Retour aux dossiers"
      />

      {/* === HEADER PREMIUM === */}
      <header className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 p-6 shadow-lg sm:p-8">
        <div className="relative">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-nexus-orange-500/20 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-400">
                <Hash className="h-3 w-3" />
                Dossier
              </div>
              <h1 className="mt-3 break-all font-mono text-2xl font-bold text-white sm:text-3xl">
                {reference}
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                <span className="font-bold text-white">{d.service as string}</span>
                {(d.categorie_demande as string) &&
                  ` · ${d.categorie_demande as string}`}
                {(d.pays_concerne as string) &&
                  ` · ${d.pays_concerne as string}`}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Soumis le {formatDate(d.created_at as string)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={d.statut as DemandeStatus} />
              <UrgenceBadge level={d.urgence as UrgenceLevel} />
              <a
                href={`/api/demandes/${params.id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                <Download className="h-3.5 w-3.5" />
                PDF
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* === TIMELINE === */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
              Etat du dossier
            </p>
            <h2 className="font-display text-lg font-bold text-nexus-blue-950">
              Etape {currentStep}/6 — {stepLabel}
            </h2>
          </div>
        </div>
        <Timeline
          service={(d.service as string) || ""}
          currentStep={currentStep}
          statut={(d.statut as string) || "nouveau"}
          history={(history || []).map((h) => ({
            step: (h as { step: number }).step,
            created_at: (h as { created_at: string }).created_at,
          }))}
        />
      </section>

      {/* === GRID PRINCIPALE === */}
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Colonne gauche — Documents + Messages + Récap */}
        <div className="space-y-6 lg:col-span-8">
          {/* Documents */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-nexus-orange-500" />
              <h2 className="font-display text-lg font-bold text-nexus-blue-950">
                Documents
              </h2>
            </div>
            <DocumentsManager demandeId={params.id} canDelete={canDelete} />
          </section>

          {/* Messages */}
          <section>
            <MessagesList demandeId={params.id} currentUserId={profile.id} />
          </section>

          {/* Récap */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-nexus-orange-500" />
              <h2 className="font-display text-lg font-bold text-nexus-blue-950">
                Récapitulatif du dossier
              </h2>
            </div>
            <RecapAccordion demande={demande as never} />
          </section>
        </div>

        {/* Colonne droite — Sidebar */}
        <aside className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-24">
            {/* Conseiller */}
            <ConseillerCard agent={agentInfo} demandeRef={reference} />

            {/* Paiements */}
            {((paiements && paiements.length > 0) ||
              (paymentLinks && paymentLinks.length > 0)) && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 p-4">
                  <Wallet className="h-3.5 w-3.5 text-nexus-orange-500" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Paiements
                  </p>
                </div>
                <div className="space-y-2 p-4">
                  {totalDu > 0 && (
                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 text-xs">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Payé
                        </p>
                        <p className="mt-0.5 font-display text-sm font-bold text-green-600">
                          {formatMoney(totalPaye)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Restant
                        </p>
                        <p
                          className={`mt-0.5 font-display text-sm font-bold ${totalRestant > 0 ? "text-nexus-orange-600" : "text-green-600"}`}
                        >
                          {formatMoney(totalRestant)}
                        </p>
                      </div>
                    </div>
                  )}

                  {(paymentLinks || []).map((pl) => {
                    const link = pl as Record<string, unknown>;
                    return (
                      <Link
                        key={link.reference as string}
                        href={`/payer/${link.reference as string}`}
                        className="flex items-center gap-2 rounded-lg border border-nexus-orange-200 bg-nexus-orange-50 p-3 text-xs transition hover:bg-nexus-orange-100"
                      >
                        <Receipt className="h-3.5 w-3.5 shrink-0 text-nexus-orange-600" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-nexus-orange-900">
                            {(link.service as string) || "Lien de paiement"}
                          </p>
                          <p className="text-[10px] text-nexus-orange-700">
                            {formatMoney(
                              Number(link.montant || 0),
                              (link.devise as string) || "XAF"
                            )}{" "}
                            · {link.statut as string}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold text-nexus-orange-700">
                          Payer →
                        </span>
                      </Link>
                    );
                  })}

                  {(paiements || []).slice(0, 3).map((p) => {
                    const pp = p as Record<string, unknown>;
                    return (
                      <div
                        key={pp.id as string}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-nexus-blue-950">
                            {(pp.service as string) || "Paiement"}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {formatDate(pp.date_paiement as string)} ·{" "}
                            {formatMoney(
                              Number(pp.montant_recu || 0),
                              (pp.devise as string) || "XAF"
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  <Link
                    href="/dashboard/client/paiements"
                    className="block rounded-lg border border-slate-200 px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-600 transition hover:bg-slate-50"
                  >
                    Voir tous les paiements →
                  </Link>
                </div>
              </div>
            )}

            {/* Actions rapides */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 p-4">
                <Plus className="h-3.5 w-3.5 text-nexus-orange-500" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Actions
                </p>
              </div>
              <div className="space-y-2 p-4">
                <Link
                  href="/dashboard/client/rdv/nouveau"
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-nexus-orange-300 hover:bg-nexus-orange-50"
                >
                  <Calendar className="h-3.5 w-3.5 text-nexus-orange-500" />
                  Prendre un rendez-vous
                </Link>
                <Link
                  href="/demande/complet"
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-nexus-orange-300 hover:bg-nexus-orange-50"
                >
                  <Plus className="h-3.5 w-3.5 text-nexus-orange-500" />
                  Nouvelle demande
                </Link>
                <a
                  href={`https://wa.me/23673269692?text=${encodeURIComponent(`Bonjour, je vous contacte au sujet de mon dossier ${reference}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                >
                  <Clock className="h-3.5 w-3.5" />
                  WhatsApp Nexus
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
