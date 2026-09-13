// ============================================================================
// API ROUTE — /api/rapports (L9 résiduel, 13/09/2026)
// ----------------------------------------------------------------------------
// Rapports financiers PDF À LA DEMANDE (jamais stockés — contrairement au
// mensuel archivé du cron, ces rapports sont générés et streamés) :
//   GET ?type=journalier[&date=YYYY-MM-DD]        (défaut : aujourd'hui Bangui)
//   GET ?type=mensuel[&annee=YYYY&mois=1..12]     (défaut : mois en cours)
//   GET ?type=annuel[&annee=YYYY]                 (défaut : année en cours)
//
// Réutilise l'agrégateur et le générateur du rapport mensuel (mêmes chiffres,
// même en-tête institutionnel, seules les bornes et le sous-titre changent).
// Rôles autorisés : super_admin, admin, daf, dg (§2.3/§2.4 Dashboard
// Administration — le DG consulte, le DAF exporte). Chaque génération est
// tracée dans audit_log.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  aggregateMonth,
  dayBoundsFor,
  getAdminSupabase,
  monthBoundsFor,
  yearBoundsFor,
  type MonthBounds,
} from "@/lib/monthly-report-data";
import { buildMonthlyReportPdf } from "@/lib/monthly-report-pdf";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const ROLES_AUTORISES = ["super_admin", "admin", "daf", "dg"] as const;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ANNEE_MIN = 2024;

/** Date du jour à Bangui (UTC+1, sans DST) au format YYYY-MM-DD. */
function todayBangui(): string {
  const bangui = new Date(Date.now() + 60 * 60 * 1000);
  return bangui.toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();
    if (
      !profile ||
      !ROLES_AUTORISES.includes(profile.role as (typeof ROLES_AUTORISES)[number])
    ) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const params = request.nextUrl.searchParams;
    const type = params.get("type") || "journalier";
    const nowBangui = todayBangui();
    const anneeCourante = Number(nowBangui.slice(0, 4));
    const anneeMax = anneeCourante + 1;

    let bounds: MonthBounds;
    let subtitle: string;
    let filename: string;

    if (type === "journalier") {
      const date = params.get("date") || nowBangui;
      if (!DATE_RE.test(date) || Number.isNaN(Date.parse(date))) {
        return NextResponse.json(
          { error: "date invalide (attendu : YYYY-MM-DD)" },
          { status: 400 }
        );
      }
      bounds = dayBoundsFor(date);
      subtitle = "Rapport journalier financier";
      filename = `rapport-journalier-${date}.pdf`;
    } else if (type === "mensuel") {
      const annee = Number(params.get("annee") || nowBangui.slice(0, 4));
      const mois = Number(params.get("mois") || nowBangui.slice(5, 7));
      if (
        !Number.isInteger(annee) || annee < ANNEE_MIN || annee > anneeMax ||
        !Number.isInteger(mois) || mois < 1 || mois > 12
      ) {
        return NextResponse.json(
          { error: "annee/mois invalides" },
          { status: 400 }
        );
      }
      bounds = monthBoundsFor(annee, mois);
      subtitle = "Rapport mensuel financier";
      filename = `rapport-mensuel-${annee}-${String(mois).padStart(2, "0")}.pdf`;
    } else if (type === "annuel") {
      const annee = Number(params.get("annee") || nowBangui.slice(0, 4));
      if (!Number.isInteger(annee) || annee < ANNEE_MIN || annee > anneeMax) {
        return NextResponse.json({ error: "annee invalide" }, { status: 400 });
      }
      bounds = yearBoundsFor(annee);
      subtitle = "Rapport annuel financier";
      filename = `rapport-annuel-${annee}.pdf`;
    } else {
      return NextResponse.json(
        { error: "type invalide (journalier | mensuel | annuel)" },
        { status: 400 }
      );
    }

    const admin = getAdminSupabase();
    const summary = await aggregateMonth(admin, bounds);
    const pdfBytes = await buildMonthlyReportPdf(summary, { subtitle });

    // Trace — génération de rapport = consultation financière sensible.
    await logAudit({
      userId: profile.id,
      userRole: profile.role,
      action: "finance.rapport.generate",
      entityType: "rapport",
      entityId: null,
      newValue: { type, periode: bounds.label, start: bounds.start, end: bounds.end },
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[RAPPORTS] erreur:", err);
    return NextResponse.json(
      { error: "Génération du rapport impossible" },
      { status: 500 }
    );
  }
}
