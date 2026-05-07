import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { AssuranceStatusTracker } from "@/components/services/AssuranceStatusTracker";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CreditCard,
  Download,
  FileSignature,
  FilePlus,
  Hash,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import {
  COVERAGE_LABELS,
  STATUS_LABELS,
  URGENCY_LABELS,
  type CoverageType,
  type InsuranceQuote,
  type Urgency,
  type QuoteStatus,
} from "@/lib/insurance/types";
import { whatsappLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

function formatRange(min: number | null, max: number | null): string {
  if (min === null || max === null) return "Sur étude";
  const f = (n: number) => n.toLocaleString("fr-FR").replace(/ /g, " ");
  return `${f(min)} € — ${f(max)} €`;
}

async function fetchQuote(reference: string): Promise<InsuranceQuote | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("[INSURANCE_QUOTE_PAGE] Supabase env vars manquantes");
    return null;
  }
  const admin = createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin
    .from("insurance_quotes")
    .select("*")
    .eq("reference", reference)
    .single();

  if (error || !data) return null;
  return data as InsuranceQuote;
}

export default async function AssuranceQuoteConfirmationPage({
  params,
}: {
  params: { reference: string };
}) {
  const quote = await fetchQuote(params.reference);

  if (!quote) {
    notFound();
  }

  const coverageList = (quote.coverage_types as CoverageType[])
    .map((c) => COVERAGE_LABELS[c])
    .join(" · ");

  return (
    <>
      <Navbar />
      <main>
        {/* ─── HERO de confirmation premium ──────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 pt-24 pb-20 text-white sm:pt-28 lg:pt-32 lg:pb-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/20 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 h-[36rem] w-[36rem] rounded-full bg-nexus-blue-500/25 blur-[120px]"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <Link
              href="/services/assurance"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/65 backdrop-blur-md transition-all duration-200 hover:border-white/25 hover:text-white"
            >
              <ArrowLeft className="h-3 w-3" />
              Retour à la page Assurance
            </Link>

            <div className="mt-10 text-center">
              {/* Badge confirmation */}
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300 backdrop-blur-md">
                <Check className="h-3 w-3" />
                Devis enregistré
              </span>

              {/* Référence très visible */}
              <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">
                <Hash className="mr-1 inline h-3 w-3" />
                Votre référence dossier
              </p>
              <h1 className="mt-3 break-all font-mono text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                  {quote.reference}
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Bonjour <strong className="text-white">{quote.full_name}</strong>,
                votre dossier de courtage est ouvert dans notre cabinet. Vous
                recevrez un email de confirmation immédiat avec ce
                récapitulatif.
              </p>
            </div>

            {/* Status tracker horizontal */}
            <div className="mt-14 rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-8">
              <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                Suivi du dossier — statut actuel : {STATUS_LABELS[quote.status as QuoteStatus]}
              </p>
              <div className="mt-8">
                <AssuranceStatusTracker
                  current={quote.status as QuoteStatus}
                  orientation="horizontal"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Récap dossier ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-16 text-white sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.4]"
            style={DOT_GRID_DARK}
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
              {/* ─── Détails dossier ─── */}
              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                    Récapitulatif du dossier
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
                    Voici ce que nous avons enregistré.
                  </h2>

                  <div className="mt-8 space-y-5">
                    <DetailRow
                      icon={Mail}
                      label="Contact"
                      value={
                        <>
                          <p>{quote.email}</p>
                          <p className="mt-1 text-sm text-slate-400">{quote.whatsapp}</p>
                          {quote.country_residence && (
                            <p className="mt-1 text-xs text-slate-500">
                              Résidence : {quote.country_residence}
                            </p>
                          )}
                        </>
                      }
                    />

                    <DetailRow
                      icon={MapPin}
                      label="Destination"
                      value={<p>{quote.destination}</p>}
                    />

                    {quote.date_depart && quote.date_retour && (
                      <DetailRow
                        icon={Calendar}
                        label="Période"
                        value={
                          <>
                            <p>
                              {quote.date_depart} → {quote.date_retour}
                            </p>
                            {quote.duration_days && (
                              <p className="mt-1 text-xs text-slate-500">
                                Durée : {quote.duration_days} jours
                              </p>
                            )}
                          </>
                        }
                      />
                    )}

                    <DetailRow
                      icon={Users}
                      label="Voyageurs"
                      value={
                        <>
                          <p>
                            {quote.num_travelers}{" "}
                            {quote.num_travelers > 1 ? "personnes" : "personne"}
                          </p>
                          {quote.traveler_ages.length > 0 && (
                            <p className="mt-1 text-xs text-slate-500">
                              Âges : {quote.traveler_ages.join(", ")} ans
                            </p>
                          )}
                        </>
                      }
                    />

                    <DetailRow
                      icon={ShieldCheck}
                      label="Couvertures sélectionnées"
                      value={<p>{coverageList}</p>}
                    />

                    {quote.visa_certificate_required && (
                      <DetailRow
                        icon={FileSignature}
                        label="Attestation visa"
                        value={
                          <p className="text-emerald-300">
                            Demandée — sera incluse au devis
                          </p>
                        }
                      />
                    )}

                    <DetailRow
                      icon={Sparkles}
                      label="Niveau d'urgence"
                      value={
                        <p>{URGENCY_LABELS[quote.urgency as Urgency].split(" — ")[0]}</p>
                      }
                    />

                    {quote.comments && (
                      <DetailRow
                        icon={FilePlus}
                        label="Commentaires"
                        value={
                          <p className="whitespace-pre-line text-sm text-slate-300">
                            {quote.comments}
                          </p>
                        }
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* ─── Estimation + actions ─── */}
              <aside className="lg:col-span-5">
                <div className="space-y-5 lg:sticky lg:top-24">
                  {/* Estimation */}
                  <div className="rounded-3xl border border-nexus-orange-400/30 bg-gradient-to-br from-nexus-orange-500/10 via-white/[0.04] to-white/[0.02] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.20)] sm:p-7">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-nexus-orange-300" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                        Estimation indicative
                      </p>
                    </div>
                    <p className="mt-3 break-words font-display text-3xl font-bold text-white sm:text-4xl">
                      {formatRange(quote.estimate_min, quote.estimate_max)}
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-slate-300">
                      Fourchette indicative basée sur les paramètres saisis.
                      Le tarif définitif est établi après étude par notre
                      cabinet et présenté dans le devis détaillé.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">
                      Actions disponibles
                    </p>
                    <div className="mt-4 space-y-3">
                      <a
                        href={whatsappLink(
                          `Bonjour Nexus, je suis ${quote.full_name}. Je souhaite échanger sur mon dossier assurance ${quote.reference}.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="flex w-full items-center justify-between gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200 backdrop-blur-md transition-all hover:bg-emerald-500/15"
                      >
                        <span className="inline-flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp avec votre référence
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                      <a
                        href={`mailto:contact@nexusrca.com?subject=Dossier%20${encodeURIComponent(quote.reference)}`}
                        className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/85 backdrop-blur-md transition-all hover:bg-white/[0.07]"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          contact@nexusrca.com
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                      <a
                        href="tel:+23673269692"
                        className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/85 backdrop-blur-md transition-all hover:bg-white/[0.07]"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          +236 73 26 96 92
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Possibilités futures */}
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 ring-1 ring-white/5 backdrop-blur-xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">
                      À venir prochainement
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-semibold text-white/65">
                      <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2">
                        <Download className="h-3 w-3 text-nexus-orange-300" />
                        PDF du devis
                      </span>
                      <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2">
                        <CreditCard className="h-3 w-3 text-nexus-orange-300" />
                        Paiement en ligne
                      </span>
                      <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2">
                        <FileSignature className="h-3 w-3 text-nexus-orange-300" />
                        Signature électronique
                      </span>
                      <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2">
                        <FilePlus className="h-3 w-3 text-nexus-orange-300" />
                        Upload documents
                      </span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            {/* Trust footer */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.18em] text-white/55">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-nexus-orange-300" />
                URL personnelle confidentielle
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-nexus-orange-300" />
                Cabinet de courtage Nexus RCA
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-nexus-orange-300" />
                Bangui, République Centrafricaine
              </span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

// ─── Sous-composant : ligne détail ──────────────────────────────────────────
function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-white/10 pb-5 last:border-0 last:pb-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500/30 to-nexus-orange-700/20 ring-1 ring-nexus-orange-400/30">
        <Icon className="h-4 w-4 text-nexus-orange-300" />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
          {label}
        </p>
        <div className="mt-1.5 text-sm font-semibold text-white">{value}</div>
      </div>
    </div>
  );
}
