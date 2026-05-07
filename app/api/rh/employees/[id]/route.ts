import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import type { Employee } from "@/types";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 404 });
  }
  return NextResponse.json({ success: true, employee: data as Employee });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await requireProfile(["admin", "super_admin"]);

  let payload: Partial<Employee>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Whitelist des colonnes modifiables
  const updatable: Array<keyof Employee> = [
    "profile_id",
    "nom_complet",
    "email",
    "telephone",
    "adresse",
    "date_naissance",
    "numero_cni",
    "poste",
    "departement",
    "date_embauche",
    "type_contrat",
    "statut",
    "salaire_base",
    "frequence_paie",
    "notes_internes",
  ];

  const update: Record<string, unknown> = {};
  for (const key of updatable) {
    if (payload[key] !== undefined) {
      update[key] = payload[key];
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { success: false, error: "Aucune modification fournie" },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("employees")
    .update(update)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    console.error("[RH_EMPLOYEES_PATCH]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, employee: data as Employee });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await requireProfile(["super_admin"]);
  const supabase = createClient();
  const { error } = await supabase.from("employees").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
