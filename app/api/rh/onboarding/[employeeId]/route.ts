import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — onboarding + tasks pour un employe
export async function GET(_: Request, { params }: { params: { employeeId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data: onboarding, error: obErr } = await supabase
    .from("employee_onboarding")
    .select("*, employees(id, nom_complet, poste, departement, type_contrat, date_embauche, email, telephone), onboarding_templates(id, name, description)")
    .eq("employee_id", params.employeeId)
    .maybeSingle();

  if (obErr) {
    return NextResponse.json({ success: false, error: obErr.message }, { status: 500 });
  }

  if (!onboarding) {
    return NextResponse.json({ success: true, onboarding: null, tasks: [] });
  }

  const { data: tasks, error: tasksErr } = await supabase
    .from("onboarding_tasks")
    .select("*")
    .eq("employee_onboarding_id", onboarding.id)
    .order("task_order");

  if (tasksErr) {
    return NextResponse.json({ success: false, error: tasksErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, onboarding, tasks: tasks ?? [] });
}

// DELETE — reset/cancel l onboarding (cascade delete tasks)
export async function DELETE(_: Request, { params }: { params: { employeeId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("employee_onboarding")
    .delete()
    .eq("employee_id", params.employeeId);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
