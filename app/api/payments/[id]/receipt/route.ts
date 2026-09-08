// ============================================================================
// API ROUTE — GET /api/payments/:id/receipt
// P9, Lot 2. Génère le reçu de paiement à la demande (pdf-lib), même patron
// que /api/devis/[id]/pdf et /api/factures/[id]/pdf. Remplace, pour le
// téléchargement self-service, le flux existant (PaymentReceipt.tsx génère
// côté navigateur puis envoie par e-mail via /api/payments/send-receipt) —
// celui-ci reste utilisé par le staff pour le renvoi par e-mail, inchangé.
//
// Règle de conception (document P9 v5) : le reçu se télécharge par une
// route serveur qui vérifie la permission, jamais par une URL de stockage
// publique — aucun fichier n'est stocké, le PDF est généré à chaque appel.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";
import { drawText, drawLine, sanitizeForPdf } from "@/lib/pdf-layout";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function formatMoney(amount: number, currency: string): string {
  return `${Math.round(amount).toLocaleString("en-US").replace(/,/g, " ")} ${currency}`;
}

const RECEIPTABLE_STATUSES = ["paid", "validated", "partial"];

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";
    const isStaff = role === "admin" || role === "super_admin";

    const admin = getAdminClient();
    const { data: payment } = await admin
      .from("payments")
      .select(
        "id, reference, status, service, montant_total, montant_recu, devise, method, date_paiement, client_nom, client_id, client_record_id, clients(profile_id), dossier_id, demandes(agent_id)"
      )
      .eq("id", params.id)
      .single();

    if (!payment) {
      return NextResponse.json({ success: false, error: "Paiement introuvable" }, { status: 404 });
    }

    const p = payment as unknown as {
      reference: string;
      status: string;
      service: string;
      montant_total: number;
      montant_recu: number;
      devise: string;
      method: string | null;
      date_paiement: string;
      client_nom: string;
      client_id: string | null;
      clients: { profile_id: string | null } | null;
      demandes: { agent_id: string | null } | null;
    };

    // Propriété : staff = tout ; agent = ses dossiers ; client = son
    // paiement (client_id direct OU via clients.profile_id — les deux
    // colonnes coexistent sur `payments`, voir docs/DETTE.md P9 #2).
    if (!isStaff) {
      const isAgentOwner = role === "agent" && p.demandes?.agent_id === user.id;
      const isClientOwner =
        role === "client" && (p.client_id === user.id || p.clients?.profile_id === user.id);
      if (!isAgentOwner && !isClientOwner) {
        return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
      }
    }

    if (!RECEIPTABLE_STATUSES.includes(p.status)) {
      return NextResponse.json(
        { success: false, error: "Aucun reçu disponible pour ce statut de paiement" },
        { status: 400 }
      );
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const nexusBlue = rgb(0.047, 0.11, 0.251);
    const nexusOrange = rgb(1, 0.4, 0);
    const grayDark = rgb(0.15, 0.2, 0.3);
    const grayMid = rgb(0.4, 0.45, 0.5);
    const grayLight = rgb(0.95, 0.96, 0.98);
    const white = rgb(1, 1, 1);

    page.drawRectangle({ x: 0, y: height - 130, width, height: 130, color: nexusBlue });
    page.drawRectangle({ x: 0, y: height - 130, width: 6, height: 130, color: nexusOrange });
    drawText(page, height, helveticaBold, "NEXUS RCA", 50, 55, 24, white);
    drawText(page, height, helvetica, "Agence Internationale - Bangui", 50, 78, 11, rgb(0.7, 0.75, 0.85));
    page.drawRectangle({ x: width - 175, y: height - 60, width: 125, height: 24, color: nexusOrange });
    drawText(page, height, helveticaBold, "RECU", width - 155, 53, 12, white);
    drawText(page, height, helvetica, `No ${p.reference}`, width - 175, 80, 10, white);
    drawText(
      page,
      height,
      helvetica,
      new Date(p.date_paiement).toLocaleDateString("fr-FR"),
      width - 175,
      95,
      9,
      rgb(0.7, 0.75, 0.85)
    );

    let cursorY = 175;
    drawText(page, height, helveticaBold, "CLIENT", 50, cursorY, 9, grayMid);
    cursorY += 18;
    drawText(page, height, helveticaBold, p.client_nom || "-", 50, cursorY, 13, nexusBlue);
    cursorY += 16;
    drawText(page, height, helvetica, p.service || "-", 50, cursorY, 10, grayDark);
    cursorY += 40;

    page.drawRectangle({
      x: 50,
      y: height - cursorY - 90,
      width: width - 100,
      height: 90,
      color: grayLight,
      borderColor: rgb(0.85, 0.87, 0.9),
      borderWidth: 1,
    });

    let rowY = cursorY + 20;
    drawText(page, height, helveticaBold, "Méthode", 65, rowY, 9, grayMid);
    drawText(page, height, helvetica, p.method || "—", 65, rowY + 16, 11, grayDark);

    drawText(page, height, helveticaBold, "Montant reçu", width - 65, rowY, 9, grayMid, "right");
    drawText(
      page,
      height,
      helveticaBold,
      formatMoney(Number(p.montant_recu), p.devise),
      width - 65,
      rowY + 18,
      18,
      nexusOrange,
      "right"
    );

    const restant = Number(p.montant_total) - Number(p.montant_recu);
    if (restant > 0) {
      drawText(page, height, helvetica, `Reste dû : ${formatMoney(restant, p.devise)}`, 65, rowY + 45, 9, grayMid);
    }

    cursorY += 110;
    drawLine(page, height, 50, width - 50, cursorY, rgb(0.85, 0.87, 0.9));
    cursorY += 20;
    drawText(
      page,
      height,
      helvetica,
      "Ce reçu confirme la réception du paiement indiqué ci-dessus par Nexus RCA.",
      50,
      cursorY,
      9,
      grayDark
    );

    const footerY = 80;
    drawLine(page, height, 50, width - 50, height - footerY - 50, rgb(0.85, 0.87, 0.9));
    drawText(page, height, helveticaBold, "NEXUS RCA - Agence Internationale", 50, height - footerY - 30, 10, nexusBlue);
    drawText(
      page,
      height,
      helvetica,
      "Croisement Marabena, Route de l'Aeroport, PO.BOX 1204, Bangui",
      50,
      height - footerY - 15,
      8,
      grayDark
    );
    drawText(
      page,
      height,
      helvetica,
      "Tel: +236 73 26 96 92  -  Email: contact@nexusrca.com  -  www.nexusrca.com",
      50,
      height - footerY,
      8,
      grayDark
    );

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Recu_${sanitizeForPdf(p.reference)}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[PAYMENTS_RECEIPT] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
