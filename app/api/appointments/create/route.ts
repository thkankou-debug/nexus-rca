import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

// ============================================================================
// API : POST /api/appointments/create
// 
// Crée un rendez-vous avec :
//  - Validation des données
//  - Vérification anti double-booking
//  - Auto-assignation agent (load balancing via fonction SQL)
//  - Validation plages horaires (09h-17h, lun-ven)
// ============================================================================

const ALLOWED_HEURES = [
  "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00",
];

const ALLOWED_SERVICES = [
  "visa",
  "bourse",
  "tcf",
  "billet",
  "hotel",
  "transfert",
  "consultation_generale",
  "autre",
];

interface CreateAppointmentBody {
  service_type: string;
  rdv_date: string;     // format "YYYY-MM-DD"
  rdv_heure: string;    // format "HH:00"
  notes_client?: string;
  client_nom?: string;
  client_email?: string;
  client_telephone?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body: CreateAppointmentBody = await request.json();

    // ========================================================================
    // 1) VALIDATION DES CHAMPS REQUIS
    // ========================================================================
    if (!body.service_type || !body.rdv_date || !body.rdv_heure) {
      return NextResponse.json(
        { error: "Champs requis manquants : service_type, rdv_date, rdv_heure" },
        { status: 400 }
      );
    }

    if (!ALLOWED_SERVICES.includes(body.service_type)) {
      return NextResponse.json(
        { error: `Service invalide. Doit être : ${ALLOWED_SERVICES.join(", ")}` },
        { status: 400 }
      );
    }

    if (!ALLOWED_HEURES.includes(body.rdv_heure)) {
      return NextResponse.json(
        { error: "Heure invalide. Créneaux disponibles : 09h-16h" },
        { status: 400 }
      );
    }

    // ========================================================================
    // 2) VALIDATION DE LA DATE
    // ========================================================================
    const dateObj = new Date(body.rdv_date + "T00:00:00");
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }

    // Bloquer dates passées
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      return NextResponse.json(
        { error: "Impossible de réserver dans le passé" },
        { status: 400 }
      );
    }

    // Bloquer weekends (samedi=6, dimanche=0)
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return NextResponse.json(
        { error: "Pas de RDV le weekend. Disponible du lundi au vendredi." },
        { status: 400 }
      );
    }

    // Bloquer dates trop lointaines (> 90 jours)
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    if (dateObj > maxDate) {
      return NextResponse.json(
        { error: "RDV possible jusqu'à 90 jours à l'avance maximum" },
        { status: 400 }
      );
    }

    // ========================================================================
    // 3) RÉCUPÉRATION DE L'UTILISATEUR
    // ========================================================================
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let clientNom = body.client_nom?.trim() || "";
    let clientEmail = body.client_email?.trim().toLowerCase() || "";
    let clientTelephone = body.client_telephone?.trim() || "";
    let clientId: string | null = null;

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, prenom, nom, email, telephone")
        .eq("id", user.id)
        .single();

      if (profile) {
        clientId = profile.id;
        clientNom =
          clientNom ||
          [profile.prenom, profile.nom].filter(Boolean).join(" ");
        clientEmail = clientEmail || (profile.email || "").toLowerCase();
        clientTelephone = clientTelephone || profile.telephone || "";
      }
    }

    if (!clientNom || !clientEmail) {
      return NextResponse.json(
        { error: "Nom et email du client requis" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // ========================================================================
    // 4) ANTI DOUBLE-BOOKING
    // ========================================================================
    const { data: existingAppointments, error: checkError } = await supabase
      .from("appointments")
      .select("id, statut")
      .eq("rdv_date", body.rdv_date)
      .eq("rdv_heure", body.rdv_heure)
      .in("statut", ["en_attente", "confirme"]);

    if (checkError) {
      console.error("Erreur vérification créneau:", checkError);
      return NextResponse.json(
        { error: "Erreur lors de la vérification du créneau" },
        { status: 500 }
      );
    }

    if (existingAppointments && existingAppointments.length > 0) {
      return NextResponse.json(
        {
          error:
            "Ce créneau est déjà réservé. Merci de choisir un autre horaire.",
          code: "SLOT_TAKEN",
        },
        { status: 409 }
      );
    }

    // ========================================================================
    // 5) LOAD BALANCING : fonction SQL find_available_agent
    // ========================================================================
    let assignedAgentId: string | null = null;

    const { data: agentResult } = await supabase.rpc("find_available_agent", {
      target_date: body.rdv_date,
    });

    if (agentResult) {
      assignedAgentId = agentResult;
    }

    // ========================================================================
    // 6) CRÉATION DU RDV
    // ========================================================================
    const { data: newAppointment, error: insertError } = await supabase
      .from("appointments")
      .insert({
        client_id: clientId,
        client_nom: clientNom,
        client_email: clientEmail,
        client_telephone: clientTelephone || null,
        agent_id: assignedAgentId,
        service_type: body.service_type,
        rdv_date: body.rdv_date,
        rdv_heure: body.rdv_heure,
        duree_minutes: 60,
        statut: "en_attente",
        notes_client: body.notes_client?.trim() || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Erreur création RDV:", insertError);
      return NextResponse.json(
        { error: insertError.message || "Erreur lors de la création du RDV" },
        { status: 500 }
      );
    }

    // ========================================================================
    // 7) LOG (notifications email/WhatsApp à venir en SESSION 19D)
    // ========================================================================
    console.log(
      `[NEXUS RDV] Nouveau RDV créé : ${newAppointment.reference} - ${clientNom} - ${body.service_type} - ${body.rdv_date} ${body.rdv_heure}`
    );

    // ─── NOTIFICATION CLOCHE — agent affecté ─────────────────────────────
    if (assignedAgentId) {
      await createNotification(
        assignedAgentId,
        "demande_assigned",
        `Nouveau RDV affecté · ${newAppointment.reference}`,
        `${clientNom} — ${body.service_type} le ${body.rdv_date} à ${body.rdv_heure}`,
        "/dashboard/agent/rdv"
      );
    }

    return NextResponse.json(
      {
        success: true,
        appointment: newAppointment,
        message: "Rendez-vous réservé avec succès",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Erreur API /api/appointments/create:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
