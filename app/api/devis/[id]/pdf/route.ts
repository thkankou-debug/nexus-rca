// ============================================================================
// API ROUTE — GET /api/devis/:id/pdf
// P6, lot Devis. Génère le PDF du devis via pdf-lib (D5), même patron que
// generateReceiptPDF() dans payment-links/[reference]/verify/route.ts —
// seul générateur PDF serveur existant avant ce lot.
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

    const admin = getAdminClient();
    const { data: devis } = await admin
      .from("devis")
      .select(
        "id, reference, status, amount, currency, valid_until, created_at, demandes(nom_complet, email, service, agent_id), devis_lignes(description, quantity, unit_price, amount, ordre)"
      )
      .eq("id", params.id)
      .single();

    if (!devis) {
      return NextResponse.json({ success: false, error: "Devis introuvable" }, { status: 404 });
    }

    const devisRow = devis as unknown as {
      reference: string;
      status: string;
      amount: number;
      currency: string;
      valid_until: string | null;
      created_at: string;
      demandes: { nom_complet: string; email: string; service: string; agent_id: string | null } | null;
      devis_lignes: { description: string; quantity: number; unit_price: number; amount: number; ordre: number }[];
    };

    if (role === "agent" && devisRow.demandes?.agent_id !== user.id) {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
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

    // HEADER
    page.drawRectangle({ x: 0, y: height - 130, width, height: 130, color: nexusBlue });
    page.drawRectangle({ x: 0, y: height - 130, width: 6, height: 130, color: nexusOrange });
    drawText(page, height, helveticaBold, "NEXUS RCA", 50, 55, 24, white);
    drawText(page, height, helvetica, "Agence Internationale - Bangui", 50, 78, 11, rgb(0.7, 0.75, 0.85));
    page.drawRectangle({ x: width - 175, y: height - 60, width: 125, height: 24, color: nexusOrange });
    drawText(page, height, helveticaBold, "DEVIS", width - 162, 53, 12, white);
    drawText(page, height, helvetica, `No ${devisRow.reference}`, width - 175, 80, 10, white);
    drawText(
      page,
      height,
      helvetica,
      new Date(devisRow.created_at).toLocaleDateString("fr-FR"),
      width - 175,
      95,
      9,
      rgb(0.7, 0.75, 0.85)
    );

    let cursorY = 175;
    drawText(page, height, helveticaBold, "CLIENT", 50, cursorY, 9, grayMid);
    cursorY += 18;
    drawText(page, height, helveticaBold, devisRow.demandes?.nom_complet || "-", 50, cursorY, 13, nexusBlue);
    cursorY += 16;
    drawText(page, height, helvetica, devisRow.demandes?.service || "-", 50, cursorY, 10, grayDark);
    cursorY += 30;

    drawText(page, height, helveticaBold, "PRESTATIONS", 50, cursorY, 9, grayMid);
    cursorY += 15;

    const tableTop = cursorY;
    const rowHeight = 22;
    const nbRows = devisRow.devis_lignes.length;
    const tableHeight = rowHeight * (nbRows + 1);

    page.drawRectangle({
      x: 50,
      y: height - tableTop - tableHeight,
      width: width - 100,
      height: tableHeight,
      color: grayLight,
      borderColor: rgb(0.85, 0.87, 0.9),
      borderWidth: 1,
    });

    let rowY = tableTop + 15;
    drawText(page, height, helveticaBold, "Description", 65, rowY, 9, grayDark);
    drawText(page, height, helveticaBold, "Qté", 350, rowY, 9, grayDark);
    drawText(page, height, helveticaBold, "P.U.", 420, rowY, 9, grayDark);
    drawText(page, height, helveticaBold, "Montant", width - 65, rowY, 9, grayDark, "right");
    rowY += rowHeight;

    const sortedLignes = [...devisRow.devis_lignes].sort((a, b) => a.ordre - b.ordre);
    for (const ligne of sortedLignes) {
      drawText(page, height, helvetica, ligne.description.substring(0, 45), 65, rowY, 9, grayDark);
      drawText(page, height, helvetica, String(ligne.quantity), 350, rowY, 9, grayDark);
      drawText(page, height, helvetica, formatMoney(ligne.unit_price, devisRow.currency), 420, rowY, 8, grayDark);
      drawText(page, height, helveticaBold, formatMoney(ligne.amount, devisRow.currency), width - 65, rowY, 9, nexusBlue, "right");
      rowY += rowHeight;
    }

    cursorY = tableTop + tableHeight + 30;
    drawLine(page, height, 50, width - 50, cursorY, rgb(0.85, 0.87, 0.9));
    cursorY += 25;

    drawText(page, height, helveticaBold, "MONTANT TOTAL", 50, cursorY, 10, grayMid);
    drawText(page, height, helveticaBold, formatMoney(devisRow.amount, devisRow.currency), width - 65, cursorY, 16, nexusOrange, "right");
    cursorY += 30;

    if (devisRow.valid_until) {
      drawText(
        page,
        height,
        helvetica,
        `Devis valable jusqu'au ${new Date(devisRow.valid_until).toLocaleDateString("fr-FR")}`,
        50,
        cursorY,
        9,
        grayDark
      );
    }

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
        "Content-Disposition": `inline; filename="${sanitizeForPdf(devisRow.reference)}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[DEVIS] PDF EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
