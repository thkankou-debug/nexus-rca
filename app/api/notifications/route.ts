import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const LIMIT = 20;

// ─── GET /api/notifications ────────────────────────────────────────────────
// Retourne les 20 dernières notifications du user courant + le compte
// d'éléments non lus.
export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const [listRes, countRes] = await Promise.all([
      supabase
        .from("notifications")
        .select("id, type, title, message, link, read_at, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(LIMIT),
      supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("read_at", null),
    ]);

    if (listRes.error) {
      console.error("[NOTIF GET] list error:", listRes.error.message);
      return NextResponse.json({ error: listRes.error.message }, { status: 500 });
    }

    return NextResponse.json({
      notifications: listRes.data || [],
      unread_count: countRes.count ?? 0,
    });
  } catch (err) {
    console.error("[NOTIF GET] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── PATCH /api/notifications ──────────────────────────────────────────────
// Marque toutes les notifications du user courant comme lues.
export async function PATCH() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (error) {
      console.error("[NOTIF PATCH] error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[NOTIF PATCH] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
