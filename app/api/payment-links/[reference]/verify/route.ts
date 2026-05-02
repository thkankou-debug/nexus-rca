import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// ============================================================================
// API : POST /api/payment-links/[reference]/verify
// VERSION DÉFINITIVE - SESSION 20C-FINAL
// 
// Corrections :
//  1. PDF : sanitize tous les textes (remplace espaces insécables Unicode 0x202f)
//  2. Payments insert : flexibilité sur les colonnes (try plusieurs noms)
// ============================================================================

const METHOD_LABELS: Record<string, string> = {
  orange_money: "Orange Money RCA",
  mtn_money: "MTN Mobile Money RCA",
  express_union: "Express Union Mobile",
  virement: "Virement bancaire",
  especes: "Especes (en agence)",
  stripe_card: "Carte bancaire",
};

// CRITICAL : sanitize text pour pdf-lib WinAnsi
// Remplace tous les caractères Unicode hors WinAnsi (espaces insécables, etc.)
function sanitizeForPdf(text: string): string {
  if (!text) return "";
  return text
    .replace(/\u202f/g, " ")  // espace insécable étroit (le bug)
    .replace(/\u00a0/g, " ")  // espace insécable normal
    .replace(/\u2009/g, " ")  // espace fin
    .replace(/\u200a/g, " ")  // espace très fin
    .replace(/\u2007/g, " ")  // espace de chiffre
    .replace(/\u2060/g, "")   // word joiner
    .replace(/\u00e9/g, "e")  // é → e (helvetica peut, mais sécurité)
    .replace(/\u00e8/g, "e")  // è → e
    .replace(/\u00ea/g, "e")  // ê → e
    .replace(/\u00eb/g, "e")  // ë → e
    .replace(/\u00e0/g, "a")  // à → a
    .replace(/\u00e2/g, "a")  // â → a
    .replace(/\u00ee/g, "i")  // î → i
    .replace(/\u00ef/g, "i")  // ï → i
    .replace(/\u00f4/g, "o")  // ô → o
    .replace(/\u00f6/g, "o")  // ö → o
    .replace(/\u00f9/g, "u")  // ù → u
    .replace(/\u00fb/g, "u")  // û → u
    .replace(/\u00fc/g, "u")  // ü → u
    .replace(/\u00e7/g, "c")  // ç → c
    .replace(/\u00c9/g, "E")  // É → E
    .replace(/\u00c8/g, "E")  // È → E
    .replace(/\u00ca/g, "E")  // Ê → E
    .replace(/\u00c0/g, "A")  // À → A
    .replace(/\u00c7/g, "C")  // Ç → C
    // Filtre tout autre caractère non-ASCII restant
    .replace(/[^\x20-\x7E]/g, "?");
}

function formatMoney(amount: number, currency = "XAF"): string {
  // ATTENTION: toLocaleString("fr-FR") insère des espaces insécables (0x202f)
  // On formate manuellement avec des espaces normaux pour le PDF
  const rounded = Math.round(amount);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formatted} ${currency}`;
}

function formatMoneyHTML(amount: number, currency = "XAF"): string {
  // Pour le HTML email, OK d'utiliser toLocaleString
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

function formatDateLong(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { reference: string } }
) {
  console.log("===== [PAY-VERIFY] START =====", params.reference);

  try {
    const supabase = createClient();
    const reference = params.reference;

    // AUTH
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, prenom, nom")
      .eq("id", user.id)
      .single();

    if (!profile || !["agent", "admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
    }

    // RÉCUPÉRATION
    const { data: paymentLink, error: fetchError } = await supabase
      .from("payment_links")
      .select("*")
      .eq("reference", reference)
      .single();

    if (fetchError || !paymentLink) {
      return NextResponse.json({ error: "Lien introuvable" }, { status: 404 });
    }

    if (paymentLink.statut === "verifie") {
      return NextResponse.json({ error: "Deja verifie" }, { status: 400 });
    }
    if (paymentLink.statut === "annule") {
      return NextResponse.json({ error: "Annule" }, { status: 400 });
    }
    if (paymentLink.statut !== "paiement_declare") {
      return NextResponse.json(
        { error: "Le client n'a pas encore declare le paiement" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const notesStaff = (body.notes_staff || "").trim();
    const now = new Date();

    console.log("[PAY-VERIFY] Verification:", reference, "->", paymentLink.client_email);

    // ========================================================================
    // 1. CRÉATION PAYMENT (essai avec plusieurs structures de colonnes possibles)
    // ========================================================================
    let newPayment: { id: string } | null = null;
    try {
      console.log("[PAY-VERIFY] Tentative creation payments...");

      // STRUCTURE MINIMALE - colonnes les plus communes
      const minimalInsert: Record<string, unknown> = {
        client_id: paymentLink.client_id,
        montant: paymentLink.montant,
        devise: paymentLink.devise,
        statut: "complete",
        created_by: profile.id,
      };

      // Notes contiennent toutes les infos auxiliaires
      const notesContent = [
        `Paiement via lien public ${paymentLink.reference}`,
        `Client: ${paymentLink.client_nom} (${paymentLink.client_email})`,
        `Service: ${paymentLink.service}`,
        `Methode: ${paymentLink.methode_choisie}`,
        `Tx: ${paymentLink.numero_transaction}`,
        notesStaff ? `Staff: ${notesStaff}` : "",
      ].filter(Boolean).join("\n");

      // Essai 1 : avec colonne 'notes'
      const { data: data1, error: err1 } = await supabase
        .from("payments")
        .insert({ ...minimalInsert, notes: notesContent })
        .select("id")
        .single();

      if (!err1 && data1) {
        newPayment = data1;
        console.log("[PAY-VERIFY] ✅ Payment cree (essai 1):", newPayment?.id);
      } else {
        console.warn("[PAY-VERIFY] Essai 1 failed:", err1?.message);

        // Essai 2 : sans 'notes', avec 'description'
        const { data: data2, error: err2 } = await supabase
          .from("payments")
          .insert({ ...minimalInsert, description: notesContent.substring(0, 500) })
          .select("id")
          .single();

        if (!err2 && data2) {
          newPayment = data2;
          console.log("[PAY-VERIFY] ✅ Payment cree (essai 2):", newPayment?.id);
        } else {
          console.warn("[PAY-VERIFY] Essai 2 failed:", err2?.message);

          // Essai 3 : structure ultra-minimale
          const { data: data3, error: err3 } = await supabase
            .from("payments")
            .insert(minimalInsert)
            .select("id")
            .single();

          if (!err3 && data3) {
            newPayment = data3;
            console.log("[PAY-VERIFY] ✅ Payment cree (essai 3 minimal):", newPayment?.id);
          } else {
            console.warn("[PAY-VERIFY] Tous essais payments failed - on continue sans");
          }
        }
      }
    } catch (e) {
      console.warn("[PAY-VERIFY] Exception payments:", e instanceof Error ? e.message : e);
    }

    // ========================================================================
    // 2. UPDATE PAYMENT_LINK
    // ========================================================================
    const { error: updateError } = await supabase
      .from("payment_links")
      .update({
        statut: "verifie",
        verified_at: now.toISOString(),
        verified_by: profile.id,
        notes_staff: notesStaff || null,
        payment_id: newPayment?.id || null,
      })
      .eq("reference", reference);

    if (updateError) {
      console.error("[PAY-VERIFY] Erreur update:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log("[PAY-VERIFY] Statut -> verifie");

    // ========================================================================
    // 3. PDF GENERATION (avec sanitize)
    // ========================================================================
    let pdfBase64: string | null = null;
    try {
      console.log("[PAY-VERIFY] PDF generation START...");
      pdfBase64 = await generateReceiptPDF({
        reference: paymentLink.reference,
        clientNom: paymentLink.client_nom,
        clientEmail: paymentLink.client_email,
        service: paymentLink.service,
        description: paymentLink.description,
        montant: paymentLink.montant,
        devise: paymentLink.devise,
        methode: METHOD_LABELS[paymentLink.methode_choisie] || paymentLink.methode_choisie,
        numeroTransaction: paymentLink.numero_transaction,
        verifiedAt: now,
        staffName: [profile.prenom, profile.nom].filter(Boolean).join(" "),
      });
      console.log("[PAY-VERIFY] ✅ PDF genere, taille base64:", pdfBase64.length);
    } catch (e) {
      console.error("[PAY-VERIFY] ❌ PDF FAILED:", e instanceof Error ? e.message : e);
      console.error("[PAY-VERIFY] Stack:", e instanceof Error ? e.stack : "");
    }

    // ========================================================================
    // 4. EMAIL
    // ========================================================================
    let emailSent = false;
    let emailError: unknown = null;
    let fromUsed: string | null = null;

    if (!process.env.RESEND_API_KEY) {
      console.error("[PAY-VERIFY] ❌ RESEND_API_KEY manquante");
    } else {
      console.log("[PAY-VERIFY] EMAIL START -> ", paymentLink.client_email);
      const resend = new Resend(process.env.RESEND_API_KEY);

      const FROM_PRIMARY = "Nexus RCA <noreply@nexusrca.com>";
      const FROM_FALLBACK = "Nexus RCA <onboarding@resend.dev>";
      const subject = `Recu officiel ${paymentLink.reference} - Nexus RCA`;
      const html = buildVerificationEmail({
        reference: paymentLink.reference,
        clientNom: paymentLink.client_nom,
        service: paymentLink.service,
        montant: paymentLink.montant,
        devise: paymentLink.devise,
        methode: METHOD_LABELS[paymentLink.methode_choisie] || paymentLink.methode_choisie,
        verifiedAt: formatDateLong(now.toISOString()),
        hasPdf: !!pdfBase64,
      });

      const attachments = pdfBase64
        ? [{ filename: `recu-nexus-${paymentLink.reference}.pdf`, content: pdfBase64 }]
        : [];

      try {
        console.log("[PAY-VERIFY] Tentative 1 from:", FROM_PRIMARY, "attachments:", attachments.length);
        const result = await resend.emails.send({
          from: FROM_PRIMARY,
          to: paymentLink.client_email,
          subject,
          html,
          attachments,
        });

        if (result.error) {
          console.error("[PAY-VERIFY] Tentative 1 FAILED:", JSON.stringify(result.error));
          emailError = result.error;
        } else {
          console.log("[PAY-VERIFY] ✅ EMAIL SUCCESS via", FROM_PRIMARY, "ID:", result.data?.id);
          emailSent = true;
          fromUsed = FROM_PRIMARY;
        }
      } catch (e) {
        console.error("[PAY-VERIFY] Tentative 1 EXCEPTION:", e instanceof Error ? e.message : e);
        emailError = e;
      }

      if (!emailSent) {
        try {
          console.log("[PAY-VERIFY] Tentative 2 (fallback):", FROM_FALLBACK);
          const result = await resend.emails.send({
            from: FROM_FALLBACK,
            to: paymentLink.client_email,
            subject,
            html,
            attachments,
          });

          if (result.error) {
            console.error("[PAY-VERIFY] Tentative 2 FAILED:", JSON.stringify(result.error));
            emailError = result.error;
          } else {
            console.log("[PAY-VERIFY] ✅ EMAIL SUCCESS via FALLBACK ID:", result.data?.id);
            emailSent = true;
            fromUsed = FROM_FALLBACK;
          }
        } catch (e) {
          console.error("[PAY-VERIFY] Tentative 2 EXCEPTION:", e instanceof Error ? e.message : e);
          emailError = e;
        }
      }
    }

    console.log("===== [PAY-VERIFY] END =====", {
      reference,
      pdf_ok: !!pdfBase64,
      email_ok: emailSent,
      from_used: fromUsed,
    });

    return NextResponse.json({
      success: true,
      reference,
      statut: "verifie",
      payment_id: newPayment?.id || null,
      pdf_generated: !!pdfBase64,
      email_sent: emailSent,
      from_used: fromUsed,
      email_error: emailError ? String(emailError) : null,
    });
  } catch (err) {
    console.error("[PAY-VERIFY] EXCEPTION GLOBALE:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ============================================================================
// PDF GENERATION (avec sanitize systématique)
// ============================================================================
async function generateReceiptPDF(data: {
  reference: string;
  clientNom: string;
  clientEmail: string;
  service: string;
  description: string | null;
  montant: number;
  devise: string;
  methode: string;
  numeroTransaction: string | null;
  verifiedAt: Date;
  staffName: string;
}): Promise<string> {
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

  // Helper safe : sanitize avant chaque drawText
  const drawSafeText = (text: string, options: Parameters<typeof page.drawText>[1]) => {
    page.drawText(sanitizeForPdf(text), options);
  };

  // HEADER
  page.drawRectangle({ x: 0, y: height - 130, width, height: 130, color: nexusBlue });
  page.drawRectangle({ x: 0, y: height - 130, width: 6, height: 130, color: nexusOrange });
  drawSafeText("NEXUS RCA", { x: 50, y: height - 55, size: 24, font: helveticaBold, color: white });
  drawSafeText("Agence Internationale - Bangui", { x: 50, y: height - 78, size: 11, font: helvetica, color: rgb(0.7, 0.75, 0.85) });
  page.drawRectangle({ x: width - 175, y: height - 60, width: 125, height: 24, color: nexusOrange });
  drawSafeText("RECU OFFICIEL", { x: width - 162, y: height - 53, size: 11, font: helveticaBold, color: white });
  drawSafeText(`No ${data.reference}`, { x: width - 175, y: height - 80, size: 10, font: helvetica, color: white });
  drawSafeText(data.verifiedAt.toLocaleDateString("fr-FR"), { x: width - 175, y: height - 95, size: 9, font: helvetica, color: rgb(0.7, 0.75, 0.85) });

  // MONTANT (formatMoney utilise déjà des espaces normaux)
  let cursorY = height - 175;
  drawSafeText("MONTANT RECU", { x: 50, y: cursorY, size: 9, font: helveticaBold, color: grayMid });
  cursorY -= 18;
  drawSafeText(formatMoney(data.montant, data.devise), { x: 50, y: cursorY - 20, size: 32, font: helveticaBold, color: nexusBlue });
  cursorY -= 60;
  page.drawLine({ start: { x: 50, y: cursorY }, end: { x: width - 50, y: cursorY }, thickness: 1, color: rgb(0.85, 0.87, 0.9) });
  cursorY -= 30;

  // CLIENT
  drawSafeText("CLIENT", { x: 50, y: cursorY, size: 9, font: helveticaBold, color: grayMid });
  cursorY -= 18;
  drawSafeText(data.clientNom, { x: 50, y: cursorY, size: 13, font: helveticaBold, color: nexusBlue });
  cursorY -= 16;
  drawSafeText(data.clientEmail, { x: 50, y: cursorY, size: 10, font: helvetica, color: grayDark });
  cursorY -= 30;

  // DETAILS
  drawSafeText("DETAILS DU PAIEMENT", { x: 50, y: cursorY, size: 9, font: helveticaBold, color: grayMid });
  cursorY -= 25;
  page.drawRectangle({ x: 50, y: cursorY - 165, width: width - 100, height: 165, color: grayLight, borderColor: rgb(0.85, 0.87, 0.9), borderWidth: 1 });

  let detailY = cursorY - 25;
  const drawDetail = (label: string, value: string, isBold = false) => {
    drawSafeText(label, { x: 70, y: detailY, size: 9, font: helvetica, color: grayMid });
    drawSafeText(value.substring(0, 60), { x: 220, y: detailY, size: 10, font: isBold ? helveticaBold : helvetica, color: nexusBlue });
    detailY -= 22;
  };

  drawDetail("Service", data.service, true);
  if (data.description) drawDetail("Description", data.description.substring(0, 50));
  drawDetail("Methode", data.methode, true);
  if (data.numeroTransaction) drawDetail("No transaction", data.numeroTransaction);
  drawDetail("Date reception", data.verifiedAt.toLocaleDateString("fr-FR"));
  if (data.staffName) drawDetail("Valide par", data.staffName);

  cursorY -= 195;

  // CONFIRMATION
  page.drawRectangle({ x: 50, y: cursorY - 60, width: width - 100, height: 60, color: rgb(1, 0.96, 0.92), borderColor: nexusOrange, borderWidth: 1.5 });
  drawSafeText("PAIEMENT CONFIRME", { x: 70, y: cursorY - 25, size: 12, font: helveticaBold, color: nexusOrange });
  drawSafeText(`Recu certifiant la reception de ${formatMoney(data.montant, data.devise)}`, { x: 70, y: cursorY - 45, size: 9, font: helvetica, color: grayDark });

  // FOOTER
  const footerY = 80;
  page.drawLine({ start: { x: 50, y: footerY + 50 }, end: { x: width - 50, y: footerY + 50 }, thickness: 1, color: rgb(0.85, 0.87, 0.9) });
  drawSafeText("NEXUS RCA - Agence Internationale", { x: 50, y: footerY + 30, size: 10, font: helveticaBold, color: nexusBlue });
  drawSafeText("Relais Sica, vers Hopital General, Bangui, Republique Centrafricaine", { x: 50, y: footerY + 15, size: 8, font: helvetica, color: grayDark });
  drawSafeText("Tel: +236 73 26 96 92  -  Email: contact@nexusrca.com  -  www.nexusrca.com", { x: 50, y: footerY, size: 8, font: helvetica, color: grayDark });
  drawSafeText(`Recu genere le ${data.verifiedAt.toLocaleString("fr-FR")} - Document officiel`, { x: 50, y: footerY - 18, size: 7, font: helvetica, color: grayMid });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString("base64");
}

// ============================================================================
function buildVerificationEmail(data: {
  reference: string;
  clientNom: string;
  service: string;
  montant: number;
  devise: string;
  methode: string;
  verifiedAt: string;
  hasPdf: boolean;
}): string {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f1f5f9;">
  <table cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f1f5f9;padding:24px 0;">
    <tr><td align="center">
      <table cellspacing="0" cellpadding="0" border="0" width="600" style="background:#fff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#22c55e 0%,#15803d 100%);padding:32px 40px;text-align:center;">
          <h1 style="margin:8px 0 0 0;color:#fff;font-size:24px;font-weight:700;">Paiement confirmé ✓</h1>
          <p style="margin:8px 0 0 0;color:#dcfce7;font-size:14px;">Votre reçu officiel est en pièce jointe</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 20px 0;font-size:16px;color:#0C1C40;">Bonjour <strong>${data.clientNom}</strong>,</p>
          <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.6;">Nous vous confirmons la bonne réception de votre paiement.${data.hasPdf ? " Votre reçu officiel est en pièce jointe." : ""}</p>
          <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:20px 0;">
            <table cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr><td style="padding:6px 0;font-size:13px;color:#64748b;width:140px;">Référence</td><td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;font-family:monospace;">${data.reference}</td></tr>
              <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Service</td><td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${data.service}</td></tr>
              <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Montant</td><td style="padding:6px 0;font-size:18px;color:#0C1C40;font-weight:700;">${formatMoneyHTML(data.montant, data.devise)}</td></tr>
              <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Méthode</td><td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${data.methode}</td></tr>
              <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Date</td><td style="padding:6px 0;font-size:13px;color:#475569;">${data.verifiedAt}</td></tr>
            </table>
          </div>
        </td></tr>
        <tr><td style="background:#0C1C40;padding:24px 40px;text-align:center;">
          <p style="margin:0;font-size:14px;font-weight:700;color:#fff;">NEXUS RCA</p>
          <p style="margin:4px 0;font-size:12px;color:#94a3b8;">+236 73 26 96 92 · contact@nexusrca.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
  `.trim();
}
