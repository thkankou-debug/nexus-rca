import Link from "next/link";
import { ShieldCheck, ExternalLink, AlertCircle, Inbox } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { BackButton } from "@/components/ui/BackButton";
import {
  COVERAGE_LABELS,
  STATUS_LABELS,
  URGENCY_LABELS,
  type CoverageType,
  type InsuranceQuote,
  type QuoteStatus,
  type Urgency,
} from "@/lib/insurance/types";

export const metadata = {
  title: "Devis assurance | Agent — Nexus RCA",
};

export const dynamic = "force-dynamic";

const STATUS_TONES: Record<QuoteStatus, string> = {
  recu: "bg-blue-100 text-blue-700 border-blue-200",
  analyse: "bg-amber-100 text-amber-700 border-amber-200",
  validation_agent: "bg-violet-100 text-violet-700 border-violet-200",
  devis_pret: "bg-emerald-100 text-emerald-700 border-emerald-200",
  envoye: "bg-slate-100 text-slate-700 border-slate-200",
  archive: "bg-slate-50 text-slate-500 border-slate-200",
};

const URGENCY_TONES: Record<Urgency, string> = {
  normal: "bg-slate-100 text-slate-700",
  urgent: "bg-amber-100 text-amber-700",
  tres_urgent: "bg-rose-100 text-rose-700",
};

function formatRange(min: number | null, max: number | null): string {
  if (min === null || max === null) return "Sur étude";
  const f = (n: number) => n.toLocaleString("fr-FR").replace(/ /g, " ");
  return `${f(min)} — ${f(max)} €`;
}

export default async function AgentAssurancePage() {
  const profile = await requireProfile(["agent", "admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("insurance_quotes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[agent/assurance] error:", error.message);
  }

  const rows = (data || []) as InsuranceQuote[];

  // Stats rapides
  const stats = {
    total: rows.length,
    recu: rows.filter((r) => r.status === "recu").length,
    analyse: rows.filter((r) => r.status === "analyse").length,
    pret: rows.filter((r) => r.status === "devis_pret" || r.status === "envoye")
      .length,
  };

  return (
    <DashboardShell profile={profile}>
      <BackButton
        fallbackHref="/dashboard/agent"
        label="Retour au tableau de bord"
      />

      <header className="mb-8 flex flex-wrap items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-sm">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
            Pipeline assurance
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Devis assurance
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Demandes de devis courtage — voyage, Schengen, santé internationale,
            études, business.
          </p>
        </div>
      </header>

      {/* KPI cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total devis" value={stats.total} />
        <KpiCard label="À traiter (reçus)" value={stats.recu} highlight />
        <KpiCard label="En analyse" value={stats.analyse} />
        <KpiCard label="Prêts / envoyés" value={stats.pret} />
      </div>

      {/* Liste */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Inbox className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 font-display text-lg font-bold text-nexus-blue-950">
            Aucun devis pour l&apos;instant
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Les nouvelles demandes de devis assurance apparaîtront ici dès leur
            soumission via{" "}
            <Link
              href="/services/assurance/devis"
              className="font-semibold text-nexus-orange-600 underline-offset-4 hover:underline"
            >
              /services/assurance/devis
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <Th>Référence</Th>
                  <Th>Client</Th>
                  <Th>Destination</Th>
                  <Th>Couvertures</Th>
                  <Th>Estimation</Th>
                  <Th>Urgence</Th>
                  <Th>Statut</Th>
                  <Th>Reçu le</Th>
                  <Th>—</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/60">
                    <Td>
                      <span className="font-mono text-xs font-bold text-nexus-blue-950">
                        {q.reference}
                      </span>
                    </Td>
                    <Td>
                      <div>
                        <p className="font-semibold text-nexus-blue-950">
                          {q.full_name}
                        </p>
                        <p className="text-xs text-slate-500">{q.email}</p>
                        <p className="text-xs text-slate-500">{q.whatsapp}</p>
                      </div>
                    </Td>
                    <Td>
                      <p className="font-semibold text-nexus-blue-950">
                        {q.destination}
                      </p>
                      {q.duration_days && (
                        <p className="text-xs text-slate-500">
                          {q.duration_days} j ·{" "}
                          {q.num_travelers > 1
                            ? `${q.num_travelers} voyageurs`
                            : "1 voyageur"}
                        </p>
                      )}
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {(q.coverage_types as CoverageType[]).map((c) => (
                          <span
                            key={c}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                          >
                            {COVERAGE_LABELS[c]}
                          </span>
                        ))}
                      </div>
                      {q.visa_certificate_required && (
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                          + attestation visa
                        </p>
                      )}
                    </Td>
                    <Td>
                      <p className="font-semibold text-nexus-blue-950">
                        {formatRange(q.estimate_min, q.estimate_max)}
                      </p>
                    </Td>
                    <Td>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${URGENCY_TONES[q.urgency as Urgency]}`}
                      >
                        {q.urgency === "tres_urgent" && (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {URGENCY_LABELS[q.urgency as Urgency].split(" — ")[0]}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${STATUS_TONES[q.status as QuoteStatus]}`}
                      >
                        {STATUS_LABELS[q.status as QuoteStatus]}
                      </span>
                    </Td>
                    <Td>
                      <span className="whitespace-nowrap text-xs text-slate-500">
                        {new Date(q.created_at).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </Td>
                    <Td>
                      <Link
                        href={`/services/assurance/devis/${q.reference}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-nexus-blue-950 transition-all hover:border-nexus-orange-400 hover:text-nexus-orange-600"
                      >
                        Voir
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function KpiCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        highlight
          ? "border-nexus-orange-300 bg-gradient-to-br from-nexus-orange-50 to-white"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold text-nexus-blue-950">
        {value}
      </p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top text-sm">{children}</td>;
}
