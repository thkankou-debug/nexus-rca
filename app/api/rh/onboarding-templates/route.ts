import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import type { OnboardingTaskTemplate } from "@/types";

export async function GET() {
  await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("onboarding_templates")
    .select("*")
    .eq("active", true)
    .order("name");

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, templates: data });
}

interface CreateTemplateBody {
  name: string;
  description?: string;
  type_contrat?: string;
  default_tasks: OnboardingTaskTemplate[];
}

export async function POST(req: Request) {
  const profile = await requireProfile(["super_admin"]);

  let body: CreateTemplateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name || !Array.isArray(body.default_tasks)) {
    return NextResponse.json(
      { success: false, error: "name + default_tasks requis" },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("onboarding_templates")
    .insert({
      name: body.name,
      description: body.description ?? null,
      type_contrat: body.type_contrat ?? null,
      default_tasks: body.default_tasks,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, template: data });
}
