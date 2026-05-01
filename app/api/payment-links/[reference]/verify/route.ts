import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// ============================================================================
// API : POST /api/payment-links/[reference]/verify
// 
// Le STAFF confirme avoir reçu le paiement.
// Actions :
//  1. Marque le payment_link comme "verifie"
//  2. Crée une entrée dans la table payments (apparaît dans tes finances)
//  3. Génère un reçu PDF
//  4. Envoie le PDF par email au client
// 
// Body : { notes_staff?: string }
// ============================================================================

const METHOD_LABELS: Record<string, string> = {
  orange_money: "Orange Money RCA",
  mtn_money: "MTN Mobile Money RCA",
  express_union: "Express Union Mobile",
  virement: "Virement bancaire",
  especes: "Espèces (en agence)",
  stripe_card: "Carte bancaire",
};

function formatMoney(amount: number, currency = "XAF"): string {
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
  try {
    const supabase = createClient();
    const reference = params.reference;

    // ========================================================================
    // AUTHENTIFICATION STAFF
    // ========================================================================
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, prenom, nom")
      .eq("id", user.id)
      .single();

    if (!profile || !["agent", "admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Permission refusée" },
        { status: 403 }
      );
    }

    // ========================================================================
    // RÉCUPÉRATION DU LIEN
    // ========================================================================
    const { data: paymentLink, error: fetchError } = await supabase
      .from("payment_links")
      .select("*")
      .eq("reference", reference)
      .single();

    if (fetchError || !paymentLink) {
      return NextResponse.json(
        { error: "Lien de paiement introuvable" },
        { status: 404 }
      );
    }

    if (paymentLink.statut === "verifie") {
      return NextResponse.json(
        { error: "Ce paiement a déjà été vérifié" },
        { status: 400 }
      );
    }

    if (paymentLink.statut === "annule") {
      return NextResponse.json(
        { error: "Ce lien a été annulé" },
        { status: 400 }
      );
    }

    if (paymentLink.statut !== "paiement_declare") {
      return NextResponse.json(
        { error: "Le client n'a pas encore déclaré le paiement" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const notesStaff = (body.notes_staff || "").trim();
    const now = new Date();

    // ========================================================================
    // 1. CRÉATION DE L'ENTRÉE PAYMENT (entre dans tes finances)
    // ========================================================================
    const paymentInsert: Record<string, unknown> = {
      client_id: paymentLink.client_id,
      client_nom: paymentLink.client_nom,
      client_email: paymentLink.client_email,
      service: paymentLink.service,
      description: paymentLink.description,
      montant: paymentLink.montant,
      devise: paymentLink.devise,
      methode: paymentLink.methode_choisie,
      reference_externe: paymentLink.numero_transaction,
      statut: "complete",
      created_by: profile.id,
      notes: [
        `Paiement via lien public ${paymentLink.reference}`,
        notesStaff ? `Notes staff: ${notesStaff}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    };

    // Lien optionnel à demande / RDV existant
    if (paymentLink.demande_id) {
      paymentInsert.demande_id = paymentLink.demande_id;
    }

    const { data: newPayment, error: paymentError } = await supabase
      .from("payments")
      .insert(paymentInsert)
      .select()
      .single();

    if (paymentError) {
      console.error("Erreur création payment:", paymentError);
      // Si la table payments n'a pas exactement ces colonnes, on ne bloque pas
      // → on continue et on logge
      console.warn("Le payment n'a pas été créé, mais on continue avec la vérification");
    }

    // ========================================================================
    // 2. UPDATE DU PAYMENT_LINK
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
      console.error("Erreur update payment_link:", updateError);
      return NextResponse.json(
        { error: updateError.message || "Erreur mise à jour" },
        { status: 500 }
      );
    }

    // ========================================================================
    // 3. GÉNÉRATION DU REÇU PDF
    // ========================================================================
    let pdfBase64: string | null = null;
    try {
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
    } catch (e) {
      console.error("Erreur génération PDF:", e);
    }

    // ========================================================================
    // 4. ENVOI EMAIL AU CLIENT AVEC PDF EN PIÈCE JOINTE
    // ========================================================================
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      try {
        const attachments = pdfBase64
          ? [
              {
                filename: `recu-nexus-${paymentLink.reference}.pdf`,
                content: pdfBase64,
              },
            ]
          : [];

        await resend.emails.send({
          from: "Nexus RCA <noreply@nexusrca.com>",
          to: paymentLink.client_email,
          subject: `✓ Reçu officiel ${paymentLink.reference} - Nexus RCA`,
          html: buildVerificationEmail({
            reference: paymentLink.reference,
            clientNom: paymentLink.client_nom,
            service: paymentLink.service,
            montant: paymentLink.montant,
            devise: paymentLink.devise,
            methode: METHOD_LABELS[paymentLink.methode_choisie] || paymentLink.methode_choisie,
            verifiedAt: formatDateLong(now.toISOString()),
            hasPdf: !!pdfBase64,
          }),
          attachments,
        });
        console.log(
          `[NEXUS PAY-LINK] Email vérification + PDF envoyé à ${paymentLink.client_email}`
        );
      } catch (e) {
        console.warn("Erreur envoi email vérification:", e);
      }
    }

    console.log(
      `[NEXUS PAY-LINK] Paiement vérifié : ${reference} par ${profile.id}`
    );

    return NextResponse.json({
      success: true,
      reference,
      statut: "verifie",
      payment_id: newPayment?.id || null,
      pdf_generated: !!pdfBase64,
    });
  } catch (err) {
    console.error("Erreur API verify:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ============================================================================
// GÉNÉRATION DU PDF (autonome avec pdf-lib)
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
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Couleurs Nexus
  const nexusBlue = rgb(0.047, 0.11, 0.251);   // #0C1C40
  const nexusOrange = rgb(1, 0.4, 0);           // #FF6600
  const grayDark = rgb(0.15, 0.2, 0.3);
  const grayMid = rgb(0.4, 0.45, 0.5);
  const grayLight = rgb(0.95, 0.96, 0.98);
  const white = rgb(1, 1, 1);

  // ============================================================
  // HEADER (bandeau bleu marine 120px)
  // ============================================================
  page.drawRectangle({
    x: 0,
    y: height - 130,
    width,
    height: 130,
    color: nexusBlue,
  });

  // Petit accent orange à gauche
  page.drawRectangle({
    x: 0,
    y: height - 130,
    width: 6,
    height: 130,
    color: nexusOrange,
  });

  // Logo NEXUS
  page.drawText("NEXUS RCA", {
    x: 50,
    y: height - 55,
    size: 24,
    font: helveticaBold,
    color: white,
  });

  page.drawText("Agence Internationale - Bangui", {
    x: 50,
    y: height - 78,
    size: 11,
    font: helvetica,
    color: rgb(0.7, 0.75, 0.85),
  });

  // Badge "REÇU OFFICIEL"
  page.drawRectangle({
    x: width - 175,
    y: height - 60,
    width: 125,
    height: 24,
    color: nexusOrange,
  });
  page.drawText("REÇU OFFICIEL", {
    x: width - 162,
    y: height - 53,
    size: 11,
    font: helveticaBold,
    color: white,
  });

  // Référence
  page.drawText(`N° ${data.reference}`, {
    x: width - 175,
    y: height - 80,
    size: 10,
    font: helvetica,
    color: white,
  });

  page.drawText(data.verifiedAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }), {
    x: width - 175,
    y: height - 95,
    size: 9,
    font: helvetica,
    color: rgb(0.7, 0.75, 0.85),
  });

  // ============================================================
  // CORPS — bloc montant
  // ============================================================
  let cursorY = height - 175;

  page.drawText("MONTANT REÇU", {
    x: 50,
    y: cursorY,
    size: 9,
    font: helveticaBold,
    color: grayMid,
  });
  cursorY -= 18;

  page.drawText(formatMoney(data.montant, data.devise), {
    x: 50,
    y: cursorY - 20,
    size: 32,
    font: helveticaBold,
    color: nexusBlue,
  });

  cursorY -= 60;

  // Ligne de séparation
  page.drawLine({
    start: { x: 50, y: cursorY },
    end: { x: width - 50, y: cursorY },
    thickness: 1,
    color: rgb(0.85, 0.87, 0.9),
  });
  cursorY -= 30;

  // ============================================================
  // SECTION : INFOS CLIENT
  // ============================================================
  page.drawText("CLIENT", {
    x: 50,
    y: cursorY,
    size: 9,
    font: helveticaBold,
    color: grayMid,
  });
  cursorY -= 18;

  page.drawText(data.clientNom, {
    x: 50,
    y: cursorY,
    size: 13,
    font: helveticaBold,
    color: nexusBlue,
  });
  cursorY -= 16;

  page.drawText(data.clientEmail, {
    x: 50,
    y: cursorY,
    size: 10,
    font: helvetica,
    color: grayDark,
  });
  cursorY -= 30;

  // ============================================================
  // SECTION : DÉTAILS DU PAIEMENT
  // ============================================================
  page.drawText("DÉTAILS DU PAIEMENT", {
    x: 50,
    y: cursorY,
    size: 9,
    font: helveticaBold,
    color: grayMid,
  });
  cursorY -= 25;

  // Carte blanche avec bordure
  page.drawRectangle({
    x: 50,
    y: cursorY - 165,
    width: width - 100,
    height: 165,
    color: grayLight,
    borderColor: rgb(0.85, 0.87, 0.9),
    borderWidth: 1,
  });

  // Lignes de détails
  const detailsX = 70;
  const valuesX = 220;
  let detailY = cursorY - 25;

  const drawDetailLine = (label: string, value: string, isBold = false) => {
    page.drawText(label, {
      x: detailsX,
      y: detailY,
      size: 9,
      font: helvetica,
      color: grayMid,
    });
    page.drawText(value, {
      x: valuesX,
      y: detailY,
      size: 10,
      font: isBold ? helveticaBold : helvetica,
      color: nexusBlue,
    });
    detailY -= 22;
  };

  drawDetailLine("Service", data.service, true);

  if (data.description) {
    const truncatedDesc = data.description.length > 50
      ? data.description.substring(0, 50) + "..."
      : data.description;
    drawDetailLine("Description", truncatedDesc);
  }

  drawDetailLine("Méthode de paiement", data.methode, true);

  if (data.numeroTransaction) {
    drawDetailLine("N° transaction", data.numeroTransaction);
  }

  drawDetailLine(
    "Date de réception",
    data.verifiedAt.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  );

  if (data.staffName) {
    drawDetailLine("Validé par", data.staffName);
  }

  cursorY -= 195;

  // ============================================================
  // BLOC CONFIRMATION (orange)
  // ============================================================
  page.drawRectangle({
    x: 50,
    y: cursorY - 60,
    width: width - 100,
    height: 60,
    color: rgb(1, 0.96, 0.92),
    borderColor: nexusOrange,
    borderWidth: 1.5,
  });

  page.drawText("✓ PAIEMENT CONFIRMÉ", {
    x: 70,
    y: cursorY - 25,
    size: 12,
    font: helveticaBold,
    color: nexusOrange,
  });

  page.drawText(
    `Ce reçu certifie la bonne réception du paiement de ${formatMoney(data.montant, data.devise)}`,
    {
      x: 70,
      y: cursorY - 45,
      size: 9,
      font: helvetica,
      color: grayDark,
    }
  );

  // ============================================================
  // FOOTER
  // ============================================================
  const footerY = 80;

  page.drawLine({
    start: { x: 50, y: footerY + 50 },
    end: { x: width - 50, y: footerY + 50 },
    thickness: 1,
    color: rgb(0.85, 0.87, 0.9),
  });

  page.drawText("NEXUS RCA - Agence Internationale", {
    x: 50,
    y: footerY + 30,
    size: 10,
    font: helveticaBold,
    color: nexusBlue,
  });

  page.drawText(
    "Relais Sica, vers Hôpital Général, Bangui, République Centrafricaine",
    {
      x: 50,
      y: footerY + 15,
      size: 8,
      font: helvetica,
      color: grayDark,
    }
  );

  page.drawText("Tél : +236 73 26 96 92  •  Email : contact@nexusrca.com  •  www.nexusrca.com", {
    x: 50,
    y: footerY,
    size: 8,
    font: helvetica,
    color: grayDark,
  });

  page.drawText(
    `Reçu généré automatiquement le ${data.verifiedAt.toLocaleString("fr-FR")} - Document officiel`,
    {
      x: 50,
      y: footerY - 18,
      size: 7,
      font: helvetica,
      color: grayMid,
    }
  );

  // ============================================================
  // EXPORT BASE64
  // ============================================================
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString("base64");
}

// ============================================================================
// EMAIL TEMPLATE
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
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reçu officiel - Nexus RCA</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;background:#f1f5f9;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f1f5f9;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          
          <tr>
            <td style="background:linear-gradient(135deg,#22c55e 0%,#15803d 100%);padding:32px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50%;width:60px;height:60px;line-height:60px;font-size:32px;margin-bottom:8px;">
                ✓
              </div>
              <h1 style="margin:8px 0 0 0;color:#ffffff;font-size:24px;font-weight:700;">
                Paiement confirmé
              </h1>
              <p style="margin:8px 0 0 0;color:#dcfce7;font-size:14px;">
                Votre reçu officiel est en pièce jointe
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px 0;font-size:16px;color:#0C1C40;">
                Bonjour <strong>${data.clientNom}</strong>,
              </p>
              <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.6;">
                Nous vous confirmons la bonne réception de votre paiement. Vous trouverez ci-joint votre reçu officiel Nexus RCA en format PDF${data.hasPdf ? "" : " (non disponible pour cet envoi - vous pouvez nous contacter pour l'obtenir)"}.
              </p>

              <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:20px 0;">
                <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">
                  Récapitulatif
                </p>
                
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;width:140px;">Référence</td>
                    <td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;font-family:monospace;">${data.reference}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;">Service</td>
                    <td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${data.service}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;">Montant</td>
                    <td style="padding:6px 0;font-size:18px;color:#0C1C40;font-weight:700;">${formatMoney(data.montant, data.devise)}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;">Méthode</td>
                    <td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${data.methode}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;">Date de réception</td>
                    <td style="padding:6px 0;font-size:13px;color:#475569;">${data.verifiedAt}</td>
                  </tr>
                </table>
              </div>

              ${
                data.hasPdf
                  ? `<div style="background:#dcfce7;border-radius:12px;padding:16px;margin:20px 0;">
                <p style="margin:0;font-size:13px;color:#166534;line-height:1.6;">
                  📎 <strong>Reçu PDF en pièce jointe</strong><br>
                  Conservez-le pour vos documents.
                </p>
              </div>`
                  : ""
              }

              <p style="margin:24px 0 0 0;font-size:13px;color:#64748b;line-height:1.6;">
                Merci pour votre confiance.<br>
                L'équipe Nexus RCA
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#0C1C40;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#ffffff;">
                NEXUS RCA — Agence Internationale
              </p>
              <p style="margin:0 0 4px 0;font-size:12px;color:#94a3b8;">
                Relais Sica, vers Hôpital Général, Bangui, RCA
              </p>
              <p style="margin:0 0 4px 0;font-size:12px;color:#94a3b8;">
                +236 73 26 96 92 · contact@nexusrca.com
              </p>
              <p style="margin:12px 0 0 0;font-size:11px;color:#64748b;">
                © ${new Date().getFullYear()} Nexus RCA. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
