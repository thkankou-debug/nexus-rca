import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const VALID_STATUS = ["nouveau", "lu", "repondu", "archive"] as const;
type Status = (typeof VALID_STATUS)[number];

interface PatchBody {
  status?: Status;
  notes_internes?: string | null;
  client_record_id?: string | null;
}

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = (profile as { role?: string } | null)?.role;
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as PatchBody;

    const update: Record<string, unknown> = {};
    if (body.status) {
      if (!VALID_STATUS.includes(body.status)) {
        return NextResponse.json(
          { error: "Statut invalide" },
          { status: 400 }
        );
      }
      update.status = body.status;
      if (body.status === "lu" || body.status === "repondu") {
        update.processed_at = new Date().toISOString();
        update.processed_by = user.id;
      }
    }
    if (typeof body.notes_internes !== "undefined") {
      update.notes_internes = body.notes_internes || null;
    }
    if (typeof body.client_record_id !== "undefined") {
      update.client_record_id = body.client_record_id || null;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "Aucun champ à mettre à jour" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("contacts")
      .update(update)
      .eq("id", params.id);

    if (error) {
      console.error("[CONTACTS_PATCH] error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[CONTACTS_PATCH] EXCEPTION:", err);
    const msg = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
