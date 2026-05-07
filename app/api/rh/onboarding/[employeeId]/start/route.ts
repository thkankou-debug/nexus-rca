import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import type { Employee, OnboardingTaskTemplate } from "@/types";

interface StartBody {
  template_id: string;
}

// POST — initialise un onboarding pour un employe a partir d un template.
// Genere les tasks avec due_date = date_embauche + days_offset.
export async function POST(req: Request, { params }: { params: { employeeId: string } }) {
  const profile = await requireProfile(["admin", "super_admin"]);

  let body: StartBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.template_id) {
    return NextResponse.json({ success: false, error: "template_id requis" }, { status: 400 });
  }

  const supabase = createClient();

  // 1. Fetch employee + template
  const [empRes, templateRes, existingRes] = await Promise.all([
    supabase.from("employees").select("*").eq("id", params.employeeId).single(),
    supabase.from("onboarding_templates").select("*").eq("id", body.template_id).single(),
    supabase
      .from("employee_onboarding")
      .select("id")
      .eq("employee_id", params.employeeId)
      .maybeSingle(),
  ]);

  if (empRes.error || !empRes.data) {
    return NextResponse.json({ success: false, error: "Employé introuvable" }, { status: 404 });
  }
  if (templateRes.error || !templateRes.data) {
    return NextResponse.json({ success: false, error: "Template introuvable" }, { status: 404 });
  }
  if (existingRes.data) {
    return NextResponse.json(
      { success: false, error: "Un onboarding existe déjà pour cet employé. Supprimez-le pour recommencer." },
      { status: 400 }
    );
  }

  const employee = empRes.data as Employee;
  const template = templateRes.data;
  const tasks = (template.default_tasks as OnboardingTaskTemplate[]) ?? [];

  // 2. Insert employee_onboarding
  const { data: onboarding, error: obErr } = await supabase
    .from("employee_onboarding")
    .insert({
      employee_id: params.employeeId,
      template_id: body.template_id,
      created_by: profile.id,
    })
    .select()
    .single();

  if (obErr || !onboarding) {
    return NextResponse.json({ success: false, error: obErr?.message }, { status: 500 });
  }

  // 3. Insert tasks avec due_date = date_embauche + days_offset
  const embauche = new Date(employee.date_embauche);
  const tasksToInsert = tasks.map((t) => {
    const dueDate = new Date(embauche);
    dueDate.setDate(dueDate.getDate() + (t.days_offset ?? 0));
    return {
      employee_onboarding_id: onboarding.id,
      task_order: t.order,
      label: t.label,
      category: t.category,
      description: t.description ?? null,
      due_date: dueDate.toISOString().split("T")[0],
      mandatory: !!t.mandatory,
    };
  });

  if (tasksToInsert.length > 0) {
    const { error: tasksErr } = await supabase
      .from("onboarding_tasks")
      .insert(tasksToInsert);
    if (tasksErr) {
      // Rollback onboarding
      await supabase.from("employee_onboarding").delete().eq("id", onboarding.id);
      return NextResponse.json({ success: false, error: tasksErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    success: true,
    onboarding,
    tasks_count: tasksToInsert.length,
  });
}
