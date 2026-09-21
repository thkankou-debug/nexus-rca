// POST /api/boutique/commandes — transmet une commande (non payée).
// Prix et disponibilité recalculés en base via submit_boutique_commande.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

interface ItemBody {
  slug?: string;
  quantite?: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as {
      items?: ItemBody[];
      notes?: string;
    } | null;
    const items = Array.isArray(body?.items) ? body!.items : [];
    if (items.length === 0) {
      return NextResponse.json({ success: false, error: "Panier vide" }, { status: 400 });
    }

    const payload = items.map((it) => ({
      slug: String(it.slug || "").trim(),
      quantite: Number(it.quantite),
    }));

    const { data, error } = await supabase.rpc("submit_boutique_commande", {
      p_items: payload,
      p_notes: body?.notes?.trim() || null,
    });

    if (error) {
      console.error("[BOUTIQUE] submit error:", error.message);
      return NextResponse.json(
        { success: false, error: error.message || "Échec de transmission" },
        { status: 400 }
      );
    }

    const commande = data as {
      id: string;
      reference: string;
      total_xaf: number;
      status: string;
    };

    const { data: actor } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    await logAudit({
      userId: user.id,
      userRole: (actor as { role?: string } | null)?.role || "client",
      action: "boutique.commande.transmise",
      entityType: "boutique_commandes",
      entityId: commande.id,
      newValue: {
        reference: commande.reference,
        total_xaf: commande.total_xaf,
        status: commande.status,
      },
    });

    return NextResponse.json({ success: true, commande });
  } catch (err) {
    console.error("[BOUTIQUE] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("boutique_commandes")
      .select("id, reference, status, total_xaf, devise, created_at")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[BOUTIQUE] list error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, commandes: data || [] });
  } catch (err) {
    console.error("[BOUTIQUE] GET EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
