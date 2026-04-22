import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardRootPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  switch (profile.role) {
    case "super_admin":
      redirect("/dashboard/super-admin");
    case "admin":
      redirect("/dashboard/admin");
    case "agent":
      redirect("/dashboard/agent");
    case "client":
    default:
      redirect("/dashboard/client");
  }
}
