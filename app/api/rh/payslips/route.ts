import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { buildMoisLibelle, buildPayslipReference, payslipReferencePrefix } from "@/lib/rh/reference";
import type { Payslip, PayslipLigne } from "@/types";

export async function GET(req: Request) {
  await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const url = new URL(req.url);
  const statut = url.searchParams.get("statut");
  const employeeId = url.searchParams.get("employee_id");

  let query = supabase
    .from("payslips")
    .select("*, employees(id, nom_complet, poste, departement, email)")
    .order("created_at", { ascending: false });

  if (statut) query = query.eq("statut", statut);
  if (employeeId) query = query.eq("employee_id", employeeId);

  const { data, error } = await query;
  if (error) {
    console.error("[RH_PAYSLIPS_GET]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, payslips: data });
}

interface CreatePayslipBody {
  employee_id: string;
  periode_debut: string;
  periode_fin: string;
  salaire_brut: number;
  salaire_net: number;
  details_lignes?: PayslipLigne[];
  notes_admin?: string;
}

export async function POST(req: Request) {
  const profile = await requireProfile(["admin", "super_admin"]);

  let body: CreatePayslipBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const required: Array<keyof CreatePayslipBody> = [
    "employee_id",
    "periode_debut",
    "periode_fin",
    "salaire_brut",
    "salaire_net",
  ];
  for (const key of required) {
    if (body[key] === undefined || body[key] === null || body[key] === "") {
      return NextResponse.json(
        { success: false, error: `Champ requis manquant : ${key}` },
        { status: 400 }
      );
    }
  }

  const supabase = createClient();

  // Génère une référence unique
  const prefix = payslipReferencePrefix(body.periode_debut);
  const { count } = await supabase
    .from("payslips")
    .select("id", { count: "exact", head: true })
    .like("reference", `${prefix}-%`);

  const reference = buildPayslipReference(body.periode_debut, (count ?? 0) + 1);
  const moisLibelle = buildMoisLibelle(body.periode_debut);

  const { data: payslip, error } = await supabase
    .from("payslips")
    .insert({
      employee_id: body.employee_id,
      reference,
      periode_debut: body.periode_debut,
      periode_fin: body.periode_fin,
      mois_libelle: moisLibelle,
      salaire_brut: body.salaire_brut,
      salaire_net: body.salaire_net,
      details_lignes: body.details_lignes ?? [],
      cotisations: {},
      statut: "brouillon",
      created_by: profile.id,
      notes_admin: body.notes_admin ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("[RH_PAYSLIPS_POST]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // Audit trail
  await supabase.from("payslip_validation_history").insert({
    payslip_id: (payslip as Payslip).id,
    action: "created",
    performed_by: profile.id,
  });

  return NextResponse.json({ success: true, payslip });
}
