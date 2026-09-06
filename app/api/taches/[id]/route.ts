// ============================================================================
// API ROUTE — PATCH /api/taches/:id
// Marque une tâche terminée / rouvre une tâche (table taches, A7).
// RLS garantit qu'un agent ne peut modifier que ses propres tâches
// assignées ; admin/super_admin peuvent tout modifier.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as { done?: boolean };
    const done = body.done !== false;

    const { error } = await supabase
      .from("taches")
      .update({
        status: done ? "terminee" : "a_faire",
        completed_at: done ? new Date().toISOString() : null,
      })
      .eq("id", params.id);

    if (error) {
      console.error("[TACHES_PATCH] error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[TACHES_PATCH] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
