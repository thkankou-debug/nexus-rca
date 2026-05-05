// ============================================================================
// NOTIFICATIONS — helper SERVER-SIDE UNIQUEMENT
// ----------------------------------------------------------------------------
// Insère dans la table `notifications` via la SERVICE_ROLE_KEY pour pouvoir
// écrire au nom d'un autre utilisateur (bypass RLS).
//
// Ne JAMAIS importer ce fichier dans un Client Component — la SERVICE_ROLE_KEY
// ne doit pas fuiter côté navigateur.
// ============================================================================

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@/types";

export type NotificationType =
  | "rdv_new"
  | "demande_assigned"
  | "payment_declared"
  | "demande_urgent"
  | "info";

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdminClient() {
  if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "[NOTIFICATIONS] NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquante"
    );
  }
  return createSupabaseClient(
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/**
 * Crée une notification pour un utilisateur.
 * Non bloquant : log et avale l'erreur (la création de notification ne doit
 * jamais faire échouer l'action métier qui l'a déclenchée).
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string | null,
  link: string | null
): Promise<void> {
  try {
    const admin = getAdminClient();
    const { error } = await admin.from("notifications").insert({
      user_id: userId,
      type,
      title,
      message,
      link,
    });
    if (error) {
      console.error("[NOTIFICATIONS] insert error:", error.message);
    } else {
      console.log(`[NOTIFICATIONS] ✅ ${type} → user ${userId}`);
    }
  } catch (err) {
    console.error("[NOTIFICATIONS] EXCEPTION:", err);
  }
}

/**
 * Crée la même notification pour tous les utilisateurs d'un ou plusieurs rôles.
 * Utile pour les events qui doivent prévenir tout le staff (ex: payment_declared
 * → tous les admin + super_admin).
 */
export async function createNotificationsForRoles(
  roles: UserRole[],
  type: NotificationType,
  title: string,
  message: string | null,
  link: string | null
): Promise<void> {
  try {
    const admin = getAdminClient();
    const { data: profiles, error: fetchErr } = await admin
      .from("profiles")
      .select("id")
      .in("role", roles);
    if (fetchErr) {
      console.error("[NOTIFICATIONS] roles fetch error:", fetchErr.message);
      return;
    }
    if (!profiles || profiles.length === 0) {
      console.log(`[NOTIFICATIONS] no profiles for roles=${roles.join(",")}`);
      return;
    }
    const rows = profiles.map((p) => ({
      user_id: p.id as string,
      type,
      title,
      message,
      link,
    }));
    const { error } = await admin.from("notifications").insert(rows);
    if (error) {
      console.error("[NOTIFICATIONS] bulk insert error:", error.message);
    } else {
      console.log(
        `[NOTIFICATIONS] ✅ ${type} → ${rows.length} user(s) (roles=${roles.join(",")})`
      );
    }
  } catch (err) {
    console.error("[NOTIFICATIONS] EXCEPTION (bulk):", err);
  }
}
