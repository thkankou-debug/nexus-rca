// ============================================================================
// RH NOTIFICATIONS — helpers internes pour creer des notifications RH
// ----------------------------------------------------------------------------
// Pattern best-effort silent : ne fait jamais echouer l action metier qui
// declenche la notif. Utilise SUPABASE_SERVICE_ROLE_KEY pour bypass RLS
// (cote serveur uniquement).
// ============================================================================

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("[RH_NOTIF] Missing Supabase credentials");
  }
  return createSupabaseClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type RhNotifType =
  | "rh_birthday"
  | "rh_period_essai_end"
  | "rh_contract_end"
  | "rh_onboarding_late"
  | "rh_leave_request"
  | "rh_leave_approved"
  | "rh_leave_rejected"
  | "rh_payslip_validated"
  | "rh_review_self_due"
  | "rh_review_manager_due"
  | "rh_general";

export async function createRhNotification(opts: {
  userId: string;
  type: RhNotifType;
  title: string;
  message: string;
  link?: string;
}): Promise<void> {
  try {
    const supabase = getAdminClient();
    const { error } = await supabase.from("notifications").insert({
      user_id: opts.userId,
      type: opts.type,
      title: opts.title,
      message: opts.message,
      link: opts.link ?? null,
      category: "rh",
    });
    if (error) {
      console.error("[RH_NOTIF] insert error:", error.message);
    }
  } catch (e) {
    console.error("[RH_NOTIF] exception:", e);
  }
}

export async function createRhNotificationForSuperAdmins(opts: {
  type: RhNotifType;
  title: string;
  message: string;
  link?: string;
}): Promise<void> {
  try {
    const supabase = getAdminClient();
    const { data: admins } = await supabase
      .from("profiles")
      .select("id")
      .in("role", ["super_admin", "admin"]);
    if (!admins || admins.length === 0) return;
    const rows = admins.map((a) => ({
      user_id: a.id,
      type: opts.type,
      title: opts.title,
      message: opts.message,
      link: opts.link ?? null,
      category: "rh",
    }));
    const { error } = await supabase.from("notifications").insert(rows);
    if (error) {
      console.error("[RH_NOTIF_BULK] insert error:", error.message);
    }
  } catch (e) {
    console.error("[RH_NOTIF_BULK] exception:", e);
  }
}
