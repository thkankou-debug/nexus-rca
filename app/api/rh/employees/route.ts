import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import type { Employee } from "@/types";

export async function GET() {
  await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[RH_EMPLOYEES_GET]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, employees: data as Employee[] });
}

export async function POST(req: Request) {
  await requireProfile(["admin", "super_admin"]);

  let payload: Partial<Employee>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const required = [
    "nom_complet",
    "email",
    "poste",
    "departement",
    "date_embauche",
    "salaire_base",
  ] as const;

  for (const key of required) {
    if (!payload[key] && payload[key] !== 0) {
      return NextResponse.json(
        { success: false, error: `Champ requis manquant : ${key}` },
        { status: 400 }
      );
    }
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("employees")
    .insert({
      profile_id: payload.profile_id ?? null,
      nom_complet: payload.nom_complet,
      email: payload.email,
      telephone: payload.telephone ?? null,
      adresse: payload.adresse ?? null,
      date_naissance: payload.date_naissance ?? null,
      numero_cni: payload.numero_cni ?? null,
      poste: payload.poste,
      departement: payload.departement,
      date_embauche: payload.date_embauche,
      type_contrat: payload.type_contrat ?? null,
      statut: payload.statut ?? "actif",
      salaire_base: payload.salaire_base,
      frequence_paie: payload.frequence_paie ?? "mensuel",
      notes_internes: payload.notes_internes ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("[RH_EMPLOYEES_POST]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, employee: data as Employee });
}
