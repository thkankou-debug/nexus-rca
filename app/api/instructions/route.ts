// ============================================================================
// API ROUTE — /api/instructions (cahier des charges §10).
// POST : émettre une instruction (permission instruction.create — dg, admin,
// chef_service ; super_admin passe). Destinataires staff, responsable
// principal optionnel. Chaque destinataire reçoit une notification réelle
// renvoyant vers l'objet source (§10.4).
// GET : mes instructions (émises + reçues) — service-role après contrôle,
// même périmètre que la RLS de lecture.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { getFinanceAdminClient } from "@/lib/finance-server";
import { createNotification } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const STAFF_ROLES = [
  "super_admin",
  "admin",
  "dg",
  "daf",
  "chef_service",
  "agent",
  "comptable",
  "moderateur",
  "accueil_caisse",
];

interface CreateBody {
  subject: string;
  body: string;
  priority?: "basse" | "normale" | "haute" | "critique";
  due_date?: string | null;
  requires_ack?: boolean;
  demande_id?: string | null;
  recipient_ids: string[];
  lead_id?: string | null;
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

    const admin = getFinanceAdminClient();
    const { data: received } = await admin
      .from("instruction_recipients")
      .select(
        "id, is_lead, acked_at, status, status_note, updated_at, instructions(id, reference, subject, body, priority, due_date, requires_ack, status, created_at, author_id, author_role, profiles:author_id(nom, prenom))"
      )
      .eq("recipient_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(100);

    const { data: sent } = await admin
      .from("instructions")
      .select(
        "id, reference, subject, body, priority, due_date, requires_ack, status, created_at, closed_at, close_note, instruction_recipients(id, recipient_id, is_lead, acked_at, status, status_note, profiles:recipient_id(nom, prenom))"
      )
      .eq("author_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    return NextResponse.json({ success: true, received: received || [], sent: sent || [] });
  } catch (err) {
    console.error("[INSTRUCTIONS] GET EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await assertPermission("instruction.create");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }
    const { data: actor } = await supabase
      .from("profiles")
      .select("role, is_test, nom, prenom")
      .eq("id", user.id)
      .single();
    const actorRow = actor as { role: string; is_test?: boolean; nom: string; prenom: string | null } | null;
    const role = actorRow?.role || "";

    const body = (await request.json().catch(() => null)) as CreateBody | null;
    if (!body?.subject?.trim() || !body.body?.trim()) {
      return NextResponse.json({ success: false, error: "Sujet et contenu requis" }, { status: 400 });
    }
    const recipientIds = Array.from(new Set(body.recipient_ids || [])).filter((r) => r !== user.id);
    if (recipientIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Au moins un destinataire (différent de l'émetteur) est requis" },
        { status: 400 }
      );
    }
    if (body.lead_id && !recipientIds.includes(body.lead_id)) {
      return NextResponse.json(
        { success: false, error: "Le responsable principal doit être un des destinataires" },
        { status: 400 }
      );
    }

    const admin = getFinanceAdminClient();
    const { data: recipients } = await admin
      .from("profiles")
      .select("id, role, actif")
      .in("id", recipientIds);
    const validRecipients = ((recipients || []) as { id: string; role: string; actif: boolean }[]).filter(
      (r) => r.actif && STAFF_ROLES.includes(r.role)
    );
    if (validRecipients.length !== recipientIds.length) {
      return NextResponse.json(
        { success: false, error: "Destinataires invalides (staff actif uniquement)" },
        { status: 400 }
      );
    }

    const { data: created, error: insertError } = await admin
      .from("instructions")
      .insert({
        author_id: user.id,
        author_role: role,
        subject: body.subject.trim(),
        body: body.body.trim(),
        priority: body.priority || "normale",
        due_date: body.due_date || null,
        requires_ack: body.requires_ack !== false,
        demande_id: body.demande_id || null,
        is_test: Boolean(actorRow?.is_test),
      })
      .select("id, reference, subject")
      .single();
    if (insertError || !created) {
      console.error("[INSTRUCTIONS] insert error:", insertError?.message);
      return NextResponse.json(
        { success: false, error: insertError?.message || "Échec de l'émission" },
        { status: 500 }
      );
    }
    const instruction = created as { id: string; reference: string; subject: string };

    const { error: recError } = await admin.from("instruction_recipients").insert(
      recipientIds.map((rid) => ({
        instruction_id: instruction.id,
        recipient_id: rid,
        is_lead: rid === body.lead_id,
      }))
    );
    if (recError) {
      console.error("[INSTRUCTIONS] recipients error:", recError.message);
      return NextResponse.json({ success: false, error: recError.message }, { status: 500 });
    }

    // §10.4 : notification par destinataire, renvoyant vers l'objet source.
    const authorName = [actorRow?.prenom, actorRow?.nom].filter(Boolean).join(" ") || "Direction";
    await Promise.all(
      recipientIds.map((rid) =>
        createNotification(
          rid,
          "info",
          `Instruction ${instruction.reference} — ${instruction.subject}`,
          `Émise par ${authorName}. Accusez réception puis rendez compte.`,
          "/dashboard/instructions"
        )
      )
    );

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "instruction.emise",
      entityType: "instructions",
      entityId: instruction.id,
      newValue: {
        reference: instruction.reference,
        recipients: recipientIds,
        lead: body.lead_id || null,
        priority: body.priority || "normale",
        due_date: body.due_date || null,
      },
    });

    return NextResponse.json({ success: true, instruction });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[INSTRUCTIONS] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
