import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

// GET — liste les notes d un employe (timeline append-only).
export async function GET(_: Request, { params }: { params: { id: string } }) {
  await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("employee_notes")
    .select("*, profiles(id, nom, prenom, email)")
    .eq("employee_id", params.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, notes: data });
}

// POST — ajoute une note (append-only, jamais d edit/delete).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const profile = await requireProfile(["admin", "super_admin"]);

  let body: { content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const content = (body.content ?? "").trim();
  if (!content) {
    return NextResponse.json(
      { success: false, error: "Le contenu de la note est obligatoire" },
      { status: 400 }
    );
  }
  if (content.length > 5000) {
    return NextResponse.json(
      { success: false, error: "Note trop longue (max 5000 caractères)" },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("employee_notes")
    .insert({
      employee_id: params.id,
      content,
      created_by: profile.id,
    })
    .select("*, profiles(id, nom, prenom, email)")
    .single();

  if (error) {
    console.error("[RH_NOTES_POST]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, note: data });
}
