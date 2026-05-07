import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

// GET — liste des profiles role=agent OU admin OU super_admin disponibles pour
// être liés à un employé (i.e. pas déjà liés à un autre employé, sauf si on
// passe ?include=<currentProfileId> pour le mode édition).
export async function GET(req: Request) {
  await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const url = new URL(req.url);
  const include = url.searchParams.get("include");

  // 1. Tous les profiles non-client
  const { data: profiles, error: profilesErr } = await supabase
    .from("profiles")
    .select("id, nom, prenom, email, role")
    .in("role", ["agent", "admin", "super_admin"])
    .order("nom", { ascending: true });

  if (profilesErr) {
    return NextResponse.json({ success: false, error: profilesErr.message }, { status: 500 });
  }

  // 2. Profiles déjà liés à un employee
  const { data: linked } = await supabase
    .from("employees")
    .select("profile_id")
    .not("profile_id", "is", null);

  const linkedSet = new Set((linked ?? []).map((r) => r.profile_id as string));

  const available = (profiles ?? []).filter((p) => {
    if (include && p.id === include) return true; // mode édition
    return !linkedSet.has(p.id);
  });

  return NextResponse.json({ success: true, profiles: available });
}
