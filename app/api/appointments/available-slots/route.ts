import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// API : GET /api/appointments/available-slots?date=YYYY-MM-DD
// 
// Retourne les créneaux disponibles pour une date donnée.
// Utilisé par le formulaire de réservation côté client.
// ============================================================================

const ALL_SLOTS = [
  "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00",
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    // ========================================================================
    // 1) VALIDATION
    // ========================================================================
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Date invalide. Format attendu : YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const dateObj = new Date(date + "T00:00:00");
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }

    // Bloquer dates passées
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      return NextResponse.json({
        date,
        available_slots: [],
        message: "Date passée",
      });
    }

    // Bloquer weekends
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return NextResponse.json({
        date,
        available_slots: [],
        message: "Pas de RDV le weekend",
      });
    }

    // ========================================================================
    // 2) RÉCUPÉRATION DES CRÉNEAUX OCCUPÉS
    // ========================================================================
    const supabase = createClient();

    const { data: occupied, error } = await supabase
      .from("appointments")
      .select("rdv_heure")
      .eq("rdv_date", date)
      .in("statut", ["en_attente", "confirme"]);

    if (error) {
      console.error("Erreur récupération créneaux:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des créneaux" },
        { status: 500 }
      );
    }

    const occupiedSlots = new Set(
      (occupied || []).map((a) => a.rdv_heure)
    );

    // ========================================================================
    // 3) FILTRER LES CRÉNEAUX DISPONIBLES
    // ========================================================================
    let availableSlots = ALL_SLOTS.filter((slot) => !occupiedSlots.has(slot));

    // Si c'est aujourd'hui, retirer les créneaux déjà passés
    const isToday = dateObj.toDateString() === today.toDateString();
    if (isToday) {
      const currentHour = new Date().getHours();
      availableSlots = availableSlots.filter((slot) => {
        const slotHour = parseInt(slot.split(":")[0], 10);
        return slotHour > currentHour;
      });
    }

    return NextResponse.json({
      date,
      total_slots: ALL_SLOTS.length,
      occupied_count: occupiedSlots.size,
      available_count: availableSlots.length,
      available_slots: availableSlots,
      occupied_slots: Array.from(occupiedSlots),
    });
  } catch (err) {
    console.error("Erreur API /api/appointments/available-slots:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
