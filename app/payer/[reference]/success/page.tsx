import Link from "next/link";
import { CheckCircle2, ArrowLeft, Sparkles } from "lucide-react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Paiement réussi · Nexus RCA",
  description: "Votre paiement Stripe a été validé.",
};

const DOT_GRID_LIGHT: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(12,28,64,0.05) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

interface PaymentLinkRow {
  reference: string;
  service: string;
  client_nom: string;
  client_email: string;
  montant: number;
  devise: string;
  statut: string;
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function formatMoney(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

export default async function PaymentSuccessPage({
  params,
}: {
  params: { reference: string };
}) {
  const admin = getAdminClient();
  const { data } = await admin
    .from("payment_links")
    .select("reference, service, client_nom, client_email, montant, devise, statut")
    .eq("reference", params.reference)
    .single();

  const link = data as PaymentLinkRow | null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 px-4 py-10 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={DOT_GRID_LIGHT}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-emerald-400/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-nexus-blue-500/15 blur-[120px]"
      />

      <div className="relative mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_-25px_rgba(16,185,129,0.30)]">
          {/* Hero succès */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-10 text-center text-white">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, rgba(255,255,255,0.18) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/15 blur-[80px]"
            />
            <div className="relative">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
              <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Paiement validé ✅
              </h1>
              <p className="mt-3 text-base text-white/95 sm:text-lg">
                Votre transaction Stripe a été confirmée avec succès.
              </p>
            </div>
          </div>

          {/* Détails */}
          {link ? (
            <div className="space-y-4 p-7 sm:p-9">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 ring-1 ring-slate-100/80">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Référence
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-nexus-blue-950">
                  {link.reference}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 ring-1 ring-slate-100/80">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Service
                  </p>
                  <p className="mt-1 font-bold text-nexus-blue-950">
                    {link.service}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 ring-1 ring-slate-100/80">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Montant payé
                  </p>
                  <p className="mt-1 font-display text-lg font-bold text-emerald-700">
                    {formatMoney(link.montant, link.devise)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                  <Sparkles className="h-4 w-4" />
                  Que se passe-t-il maintenant ?
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-emerald-900">
                  <li>1. Votre paiement est instantanément validé.</li>
                  <li>
                    2. Confirmation par email envoyée à{" "}
                    <strong>{link.client_email}</strong>.
                  </li>
                  <li>
                    3. Notre équipe va traiter votre demande dans les meilleurs
                    délais.
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="text-sm text-slate-700">
                  💡 Conservez la référence{" "}
                  <strong className="font-mono text-nexus-orange-600">
                    {link.reference}
                  </strong>{" "}
                  pour toute question.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-7 sm:p-9">
              <p className="text-sm text-slate-600">
                Votre paiement a été reçu. Nous vous envoyons une confirmation
                par email sous peu.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-slate-200 bg-slate-50 px-7 py-5 text-center sm:px-9">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 transition-colors hover:text-nexus-blue-950"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour à l&apos;accueil Nexus RCA
            </Link>
            <p className="mt-3 text-[11px] text-slate-400">
              Nexus RCA · Bangui · contact@nexusrca.com · +236 73 26 96 92
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
