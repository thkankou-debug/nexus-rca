import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import type { LeaveRequest } from "@/types";

// Super-admin / admin refuse une demande. Note obligatoire.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  let body: { note?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* */
  }

  if (!body.note || body.note.trim().length < 5) {
    return NextResponse.json(
      { success: false, error: "Note de refus obligatoire (min 5 caractères)" },
      { status: 400 }
    );
  }

  const { data: existing, error: fetchErr } = await supabase
    .from("leave_requests")
    .select("statut")
    .eq("id", params.id)
    .single();

  if (fetchErr || !existing) {
    return NextResponse.json({ success: false, error: "Demande introuvable" }, { status: 404 });
  }
  if ((existing as LeaveRequest).statut !== "en_attente") {
    return NextResponse.json(
      { success: false, error: `Statut actuel : ${(existing as LeaveRequest).statut}` },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("leave_requests")
    .update({
      statut: "refuse",
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
      review_notes: body.note,
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    console.error("[RH_LEAVES_REJECT]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, request: data });
}
