import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

// GET — lecture parametres RH (super-admin/admin)
export async function GET(req: Request) {
  await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const url = new URL(req.url);
  const category = url.searchParams.get("category");

  let query = supabase.from("rh_settings").select("*").order("category").order("label");
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, settings: data });
}

interface PatchBody {
  updates: Array<{
    key: string;
    value_text?: string | null;
    value_number?: number | null;
    value_json?: unknown;
  }>;
}

// PATCH — bulk update des parametres RH (super_admin)
export async function PATCH(req: Request) {
  const profile = await requireProfile(["super_admin"]);

  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.updates) || body.updates.length === 0) {
    return NextResponse.json({ success: false, error: "updates[] requis" }, { status: 400 });
  }

  const supabase = createClient();
  const now = new Date().toISOString();
  const errors: string[] = [];

  for (const u of body.updates) {
    const update: Record<string, unknown> = {
      updated_by: profile.id,
      updated_at: now,
    };
    if (u.value_text !== undefined) update.value_text = u.value_text;
    if (u.value_number !== undefined) update.value_number = u.value_number;
    if (u.value_json !== undefined) update.value_json = u.value_json;

    const { error } = await supabase.from("rh_settings").update(update).eq("key", u.key);
    if (error) errors.push(`${u.key}: ${error.message}`);
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { success: false, error: `Erreurs : ${errors.join(", ")}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, updated: body.updates.length });
}
