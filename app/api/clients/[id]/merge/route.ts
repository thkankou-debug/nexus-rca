// ============================================================================
// API ROUTE — POST /api/clients/:id/merge
// Réservé admin/super_admin. Fusionne une fiche client doublon (duplicateId)
// dans la fiche courante (survivante) : réassigne les données liées, marque
// le doublon (merged_into_id), ne supprime jamais rien. Tracé dans audit_log.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

interface MergeBody {
  duplicateId?: string;
}

export async function POST(
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

    const { data: actor } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    const actorRole = (actor as { role?: string } | null)?.role || "";
    if (actorRole !== "admin" && actorRole !== "super_admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as MergeBody;
    const survivorId = params.id;
    const duplicateId = body.duplicateId;

    if (!duplicateId || duplicateId === survivorId) {
      return NextResponse.json(
        { error: "duplicateId invalide" },
        { status: 400 }
      );
    }

    const admin = getAdminClient();

    const { data: survivor } = await admin
      .from("clients")
      .select("id, merged_into_id")
      .eq("id", survivorId)
      .single();
    const { data: duplicate } = await admin
      .from("clients")
      .select("*")
      .eq("id", duplicateId)
      .single();

    if (!survivor || !duplicate) {
      return NextResponse.json(
        { error: "Fiche introuvable" },
        { status: 404 }
      );
    }
    if (
      (survivor as { merged_into_id: string | null }).merged_into_id ||
      (duplicate as { merged_into_id: string | null }).merged_into_id
    ) {
      return NextResponse.json(
        { error: "Une des deux fiches est déjà fusionnée" },
        { status: 409 }
      );
    }

    await admin
      .from("demandes")
      .update({ client_record_id: survivorId })
      .eq("client_record_id", duplicateId);
    await admin
      .from("payments")
      .update({ client_record_id: survivorId })
      .eq("client_record_id", duplicateId);
    await admin
      .from("contacts")
      .update({ client_record_id: survivorId })
      .eq("client_record_id", duplicateId);
    await admin
      .from("appointment_requests")
      .update({ client_record_id: survivorId })
      .eq("client_record_id", duplicateId);

    const { error: mergeError } = await admin
      .from("clients")
      .update({ merged_into_id: survivorId })
      .eq("id", duplicateId);

    if (mergeError) {
      console.error("[CLIENTS_MERGE] error:", mergeError.message);
      return NextResponse.json({ error: mergeError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: actorRole,
      action: "client_merge",
      entityType: "clients",
      entityId: survivorId,
      oldValue: duplicate,
      newValue: { merged_into_id: survivorId, duplicate_id: duplicateId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[CLIENTS_MERGE] EXCEPTION:", err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
