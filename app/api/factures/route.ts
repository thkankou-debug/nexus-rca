// ============================================================================
// API ROUTE — /api/factures
// P6, lot Factures. Même patron que /api/devis (route.ts). GET (liste, scope
// agent = ses dossiers / staff = tout), POST (création brouillon + lignes,
// soit manuelle sur une demande, soit générée depuis un devis "accepte").
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

interface LigneInput {
  description: string;
  quantity: number;
  unit_price: number;
}

interface CreateFactureBody {
  // Génération depuis un devis accepté (copie des lignes, devis_id renseigné)
  devis_id?: string;
  // Création manuelle
  demande_id?: string;
  due_date?: string | null;
  lignes?: LigneInput[];
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase.from("profiles").select("id, role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const admin = getAdminClient();
    let query = admin
      .from("factures")
      .select(
        "id, reference, status, amount, currency, due_date, validated_at, created_at, demande_id, devis_id, client_record_id, created_by, demandes(reference, nom_complet, service, agent_id)"
      )
      .order("created_at", { ascending: false });

    if (role === "agent") {
      const { data: ownDemandes } = await admin.from("demandes").select("id").eq("agent_id", user.id);
      const ids = (ownDemandes || []).map((d) => (d as { id: string }).id);
      if (ids.length === 0) {
        return NextResponse.json({ success: true, factures: [] });
      }
      query = query.in("demande_id", ids);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[FACTURES] list error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, factures: data });
  } catch (err) {
    console.error("[FACTURES] GET EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await assertPermission("facture.create");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase.from("profiles").select("id, role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const body = (await request.json().catch(() => null)) as CreateFactureBody | null;
    if (!body) {
      return NextResponse.json({ success: false, error: "Corps invalide" }, { status: 400 });
    }

    const admin = getAdminClient();

    let demandeId: string;
    let clientRecordId: string | null;
    let devisId: string | null = null;
    let lignesToInsert: { description: string; quantity: number; unit_price: number; amount: number; ordre: number }[];

    if (body.devis_id) {
      // Génération depuis un devis accepté : copie des lignes.
      const { data: devis } = await admin
        .from("devis")
        .select("id, status, demande_id, client_record_id, demandes(agent_id), devis_lignes(description, quantity, unit_price, ordre)")
        .eq("id", body.devis_id)
        .single();

      if (!devis) {
        return NextResponse.json({ success: false, error: "Devis introuvable" }, { status: 404 });
      }
      const devisRow = devis as unknown as {
        id: string;
        status: string;
        demande_id: string | null;
        client_record_id: string | null;
        demandes: { agent_id: string | null } | null;
        devis_lignes: { description: string; quantity: number; unit_price: number; ordre: number }[];
      };

      if (devisRow.status !== "accepte") {
        return NextResponse.json(
          { success: false, error: "Seul un devis accepté peut générer une facture" },
          { status: 400 }
        );
      }
      if (role === "agent" && devisRow.demandes?.agent_id !== user.id) {
        return NextResponse.json({ success: false, error: "Ce dossier n'est pas affecté à cet agent" }, { status: 403 });
      }
      if (!devisRow.demande_id) {
        return NextResponse.json({ success: false, error: "Devis sans dossier associé" }, { status: 400 });
      }

      demandeId = devisRow.demande_id;
      clientRecordId = devisRow.client_record_id;
      devisId = devisRow.id;
      lignesToInsert = devisRow.devis_lignes.map((l, idx) => ({
        description: l.description,
        quantity: l.quantity,
        unit_price: l.unit_price,
        amount: l.quantity * l.unit_price,
        ordre: idx,
      }));
    } else {
      if (!body.demande_id || !Array.isArray(body.lignes) || body.lignes.length === 0) {
        return NextResponse.json(
          { success: false, error: "demande_id et au moins une ligne sont requis (ou devis_id)" },
          { status: 400 }
        );
      }
      for (const ligne of body.lignes) {
        if (!ligne.description || !Number.isFinite(ligne.quantity) || !Number.isFinite(ligne.unit_price)) {
          return NextResponse.json(
            { success: false, error: "Chaque ligne requiert description, quantity, unit_price" },
            { status: 400 }
          );
        }
        if (ligne.quantity <= 0 || ligne.unit_price < 0) {
          return NextResponse.json({ success: false, error: "quantity doit être > 0, unit_price >= 0" }, { status: 400 });
        }
      }

      const { data: demande } = await admin
        .from("demandes")
        .select("id, agent_id, client_record_id")
        .eq("id", body.demande_id)
        .single();
      if (!demande) {
        return NextResponse.json({ success: false, error: "Dossier introuvable" }, { status: 404 });
      }
      const demandeRow = demande as { id: string; agent_id: string | null; client_record_id: string | null };
      if (role === "agent" && demandeRow.agent_id !== user.id) {
        return NextResponse.json({ success: false, error: "Ce dossier n'est pas affecté à cet agent" }, { status: 403 });
      }

      demandeId = body.demande_id;
      clientRecordId = demandeRow.client_record_id;
      lignesToInsert = body.lignes.map((l, idx) => ({
        description: l.description,
        quantity: l.quantity,
        unit_price: l.unit_price,
        amount: l.quantity * l.unit_price,
        ordre: idx,
      }));
    }

    const total = lignesToInsert.reduce((sum, l) => sum + l.amount, 0);

    const { data: created, error: insertError } = await admin
      .from("factures")
      .insert({
        demande_id: demandeId,
        devis_id: devisId,
        client_record_id: clientRecordId,
        amount: total,
        due_date: body.due_date || null,
        created_by: user.id,
      })
      .select("id, reference")
      .single();

    if (insertError || !created) {
      console.error("[FACTURES] insert error:", insertError?.message);
      return NextResponse.json({ success: false, error: insertError?.message || "Échec de création" }, { status: 500 });
    }

    const factureId = (created as { id: string }).id;

    const { error: lignesError } = await admin
      .from("facture_lignes")
      .insert(lignesToInsert.map((l) => ({ ...l, facture_id: factureId })));
    if (lignesError) {
      console.error("[FACTURES] lignes insert error:", lignesError.message);
      return NextResponse.json({ success: false, error: lignesError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "facture.creee",
      entityType: "factures",
      entityId: factureId,
      newValue: { demande_id: demandeId, devis_id: devisId, amount: total, reference: (created as { reference: string }).reference },
    });

    return NextResponse.json({ success: true, facture: created });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[FACTURES] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
