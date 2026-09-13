// ============================================================================
// API ROUTE — GET/POST /api/demandes/:id/taches
// Tâches liées à un dossier (table taches, A7). Réservé staff.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const VALID_PRIORITY = ["basse", "normale", "haute", "urgente"] as const;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function requireStaff() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();
  const role = (profile as { role?: string } | null)?.role || "";
  if (role !== "agent" && role !== "admin" && role !== "super_admin") return null;
  return { userId: user.id, role };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const actor = await requireStaff();
  if (!actor) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("taches")
    .select(
      "id, titre, status, priority, due_date, completed_at, created_at, assigned_to, created_by"
    )
    .eq("demande_id", params.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[TACHES_GET] error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ taches: data || [] });
}

interface PostBody {
  titre?: string;
  priority?: string;
  due_date?: string | null;
  assigned_to?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const actor = await requireStaff();
  if (!actor) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as PostBody;
  const titre = (body.titre || "").trim();
  if (!titre) {
    return NextResponse.json({ error: "Titre requis" }, { status: 400 });
  }
  const priority = VALID_PRIORITY.includes(body.priority as (typeof VALID_PRIORITY)[number])
    ? body.priority
    : "normale";

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("taches")
    .insert({
      titre,
      demande_id: params.id,
      assigned_to: body.assigned_to || actor.userId,
      created_by: actor.userId,
      status: "a_faire",
      priority,
      due_date: body.due_date || null,
    })
    .select("id, titre, status, priority, due_date, completed_at, created_at, assigned_to, created_by")
    .single();

  if (error || !data) {
    console.error("[TACHES_POST] error:", error?.message);
    return NextResponse.json({ error: error?.message || "Erreur" }, { status: 500 });
  }

  return NextResponse.json({ success: true, tache: data });
}
