import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  AppointmentRequestsManager,
  type AppointmentRequest,
} from "@/components/dashboard/AppointmentRequestsManager";

export const metadata = {
  title: "Demandes de rendez-vous | Super Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminAppointmentsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;
  if (role !== "super_admin" && role !== "admin") {
    redirect("/dashboard");
  }

  const { data: requests, error } = await supabase
    .from("appointment_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur chargement rendez-vous :", error);
  }

  const appointments: AppointmentRequest[] = (requests || []) as AppointmentRequest[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
          Demandes de rendez-vous
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Toutes les demandes de rendez-vous soumises via le formulaire public /rendez-vous.
        </p>
      </div>

      <AppointmentRequestsManager
        initialRequests={appointments}
        canDelete={role === "super_admin"}
      />
    </div>
  );
}
