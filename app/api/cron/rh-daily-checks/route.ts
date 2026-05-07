// ============================================================================
// CRON RH DAILY CHECKS — execute par Vercel cron tous les jours a 07:00 UTC
// ----------------------------------------------------------------------------
// 1. Anniversaires du jour → notif super_admin + employe
// 2. Fin de periode d essai approchant → notif super_admin
// 3. Fin de CDD approchant → notif super_admin
// 4. Onboarding incomplet > 30j → notif super_admin
// 5. Reviews avec auto-eval en attente → notif employe
// ============================================================================

import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  createRhNotification,
  createRhNotificationForSuperAdmins,
} from "@/lib/rh/notifications";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

function getAdmin() {
  return createSupabaseClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function isSameDayMonth(d1: Date, d2: Date): boolean {
  return d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

export async function GET(req: Request) {
  // Optional auth via Bearer CRON_SECRET (configure cote Vercel)
  if (CRON_SECRET) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { success: false, error: "Supabase credentials missing" },
      { status: 500 }
    );
  }

  const supabase = getAdmin();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Lecture settings : alert_days
  const { data: settings } = await supabase
    .from("rh_settings")
    .select("key, value_number")
    .in("key", [
      "rh_notifications_enabled",
      "birthday_notification_enabled",
      "contract_end_alert_days",
    ]);

  const settingsMap = new Map<string, number>(
    (settings ?? []).map((s) => [s.key as string, Number(s.value_number ?? 0)])
  );

  const enabled = settingsMap.get("rh_notifications_enabled") !== 0;
  if (!enabled) {
    return NextResponse.json({ success: true, skipped: "Notifications RH désactivées" });
  }

  const birthdayEnabled = settingsMap.get("birthday_notification_enabled") !== 0;
  const alertDays = settingsMap.get("contract_end_alert_days") ?? 30;

  const stats = {
    birthdays: 0,
    period_essai_alerts: 0,
    onboarding_late: 0,
    review_self_due: 0,
  };

  // ─── 1. ANNIVERSAIRES ─────────────────────────────────────────────────
  if (birthdayEnabled) {
    const { data: employees } = await supabase
      .from("employees")
      .select("id, nom_complet, date_naissance, profile_id")
      .eq("statut", "actif")
      .not("date_naissance", "is", null);

    for (const emp of employees ?? []) {
      if (!emp.date_naissance) continue;
      const birth = new Date(emp.date_naissance as string);
      if (isSameDayMonth(birth, today)) {
        // Notif super_admins
        await createRhNotificationForSuperAdmins({
          type: "rh_birthday",
          title: `🎉 Anniversaire : ${emp.nom_complet}`,
          message: `${emp.nom_complet} fête son anniversaire aujourd'hui.`,
          link: `/dashboard/super-admin/rh/employes/${emp.id}`,
        });
        // Notif employe (si profile_id)
        if (emp.profile_id) {
          await createRhNotification({
            userId: emp.profile_id as string,
            type: "rh_birthday",
            title: "Joyeux anniversaire 🎉",
            message: "Toute l'équipe Nexus RCA vous souhaite un excellent anniversaire !",
          });
        }
        stats.birthdays += 1;
      }
    }
  }

  // ─── 2. FIN DE PERIODE D ESSAI ────────────────────────────────────────
  // CDI : 90 jours depuis date_embauche
  // CDD/Stage : 30/15 jours
  const { data: empContracts } = await supabase
    .from("employees")
    .select("id, nom_complet, date_embauche, type_contrat")
    .eq("statut", "actif");

  for (const emp of empContracts ?? []) {
    if (!emp.date_embauche || !emp.type_contrat) continue;
    const embauche = new Date(emp.date_embauche as string);
    let essaiDays = 0;
    if (emp.type_contrat === "CDI") essaiDays = 90;
    else if (emp.type_contrat === "CDD") essaiDays = 30;
    else if (emp.type_contrat === "Stage") essaiDays = 15;
    else continue;

    const essaiEnd = new Date(embauche);
    essaiEnd.setDate(essaiEnd.getDate() + essaiDays);

    // Si essaiEnd est dans alertDays jours
    const diffDays = Math.floor(
      (essaiEnd.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (diffDays === alertDays || diffDays === 7 || diffDays === 0) {
      const dateLabel = essaiEnd.toLocaleDateString("fr-FR");
      await createRhNotificationForSuperAdmins({
        type: "rh_period_essai_end",
        title: `Fin de période d'essai : ${emp.nom_complet}`,
        message: `Période d'essai se termine le ${dateLabel} (${emp.type_contrat}). Bilan à programmer.`,
        link: `/dashboard/super-admin/rh/employes/${emp.id}`,
      });
      stats.period_essai_alerts += 1;
    }
  }

  // ─── 3. ONBOARDING INCOMPLET > 30j ────────────────────────────────────
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: lateOnboardings } = await supabase
    .from("employee_onboarding")
    .select("id, employee_id, completion_pct, started_at, employees(nom_complet)")
    .lt("completion_pct", 100)
    .lt("started_at", thirtyDaysAgo.toISOString());

  for (const ob of lateOnboardings ?? []) {
    const emp =
      (ob.employees as { nom_complet?: string } | { nom_complet?: string }[] | null) ?? null;
    const empSingle = Array.isArray(emp) ? emp[0] : emp;
    await createRhNotificationForSuperAdmins({
      type: "rh_onboarding_late",
      title: `Onboarding en retard : ${empSingle?.nom_complet ?? "—"}`,
      message: `Onboarding démarré il y a plus de 30 jours, encore à ${ob.completion_pct}%.`,
      link: `/dashboard/super-admin/rh/onboarding/${ob.employee_id}`,
    });
    stats.onboarding_late += 1;
  }

  // ─── 4. REVIEWS — auto-eval en attente ────────────────────────────────
  const { data: pendingReviews } = await supabase
    .from("performance_reviews")
    .select("id, employee_id, statut, employees(nom_complet, profile_id)")
    .eq("statut", "auto_eval");

  for (const r of pendingReviews ?? []) {
    const emp =
      (r.employees as
        | { nom_complet?: string; profile_id?: string | null }
        | { nom_complet?: string; profile_id?: string | null }[]
        | null) ?? null;
    const empSingle = Array.isArray(emp) ? emp[0] : emp;
    if (empSingle?.profile_id) {
      await createRhNotification({
        userId: empSingle.profile_id,
        type: "rh_review_self_due",
        title: "Auto-évaluation en attente",
        message: "Votre auto-évaluation annuelle attend votre saisie.",
        link: "/dashboard/agent/mes-rh/evaluations",
      });
      stats.review_self_due += 1;
    }
  }

  return NextResponse.json({ success: true, stats, executed_at: new Date().toISOString() });
}
