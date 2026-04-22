import { Calendar, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { formatDate, whatsappLink } from "@/lib/utils";
import type { RendezVous } from "@/types";

export const dynamic = "force-dynamic";

export default async function ClientRdvPage() {
  const profile = await requireProfile(["client", "agent", "admin", "super_admin"]);
  const supabase = createClient();

  const { data: rdv } = await supabase
    .from("rendez_vous")
    .select("*")
    .eq("client_id", profile.id)
    .order("date_rdv", { ascending: false });

  const list = (rdv || []) as RendezVous[];

  return (
    <DashboardShell profile={profile}>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
          Mes rendez-vous
        </h1>
        <p className="mt-1 text-slate-600">
          Consultations, entretiens, signatures.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-600">Aucun rendez-vous planifié.</p>
          <p className="mt-2 text-sm text-slate-500">
            Pour prendre RDV, contactez un conseiller.
          </p>
          <a
            href={whatsappLink("Bonjour, j'aimerais prendre un rendez-vous.")}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-green-600"
          >
            <MessageCircle className="h-4 w-4" />
            Demander un RDV
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-nexus-blue-950">{r.sujet}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatDate(r.date_rdv)} · {r.duree_minutes} min
                  </p>
                  {r.notes && (
                    <p className="mt-2 text-sm text-slate-500">{r.notes}</p>
                  )}
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  {r.statut}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
