import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  PerformanceReview,
  SelfAssessment,
  ManagerAssessment,
  ReviewObjective,
} from "@/types";

// GET un review precis
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("performance_reviews")
    .select(
      "*, employees(id, nom_complet, poste, departement, email, type_contrat, date_embauche, telephone), review_periods(id, year, label, start_date, end_date, statut)"
    )
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: "Review introuvable" }, { status: 404 });
  }
  return NextResponse.json({ success: true, review: data });
}

interface PatchBody {
  statut?: PerformanceReview["statut"];
  self_assessment?: SelfAssessment;
  manager_assessment?: ManagerAssessment;
  objectives?: ReviewObjective[];
  formation_plan?: string;
  meeting_date?: string;
  meeting_notes?: string;
  notes_finales?: string;
  manager_id?: string;
}

// PATCH — admin/super_admin met a jour les champs.
// Si self_assessment fourni : marque self_assessment_submitted_at.
// Si manager_assessment fourni : marque manager_assessment_submitted_at.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (body.statut !== undefined) update.statut = body.statut;
  if (body.self_assessment !== undefined) {
    update.self_assessment = body.self_assessment;
    update.self_assessment_submitted_at = new Date().toISOString();
  }
  if (body.manager_assessment !== undefined) {
    update.manager_assessment = body.manager_assessment;
    update.manager_assessment_submitted_at = new Date().toISOString();
  }
  if (body.objectives !== undefined) update.objectives = body.objectives;
  if (body.formation_plan !== undefined) update.formation_plan = body.formation_plan;
  if (body.meeting_date !== undefined) update.meeting_date = body.meeting_date;
  if (body.meeting_notes !== undefined) update.meeting_notes = body.meeting_notes;
  if (body.notes_finales !== undefined) update.notes_finales = body.notes_finales;
  if (body.manager_id !== undefined) update.manager_id = body.manager_id;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ success: false, error: "Aucune modification" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("performance_reviews")
    .update(update)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    console.error("[RH_REVIEW_PATCH]", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, review: data });
}
