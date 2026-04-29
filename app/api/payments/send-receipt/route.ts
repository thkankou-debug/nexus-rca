import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

interface SendReceiptBody {
  payment_id: string;
  recipient_email?: string; // optionnel, sinon on utilise client_email
  pdf_base64: string; // PDF du recu encode en base64
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // Verifier que l utilisateur est connecte
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as SendReceiptBody;
    if (!body.payment_id || !body.pdf_base64) {
      return NextResponse.json(
        { error: "payment_id et pdf_base64 requis" },
        { status: 400 }
      );
    }

    // Recuperer le paiement
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", body.payment_id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Paiement introuvable" },
        { status: 404 }
      );
    }

    const recipientEmail = body.recipient_email || payment.client_email;
    if (!recipientEmail) {
      return NextResponse.json(
        { error: "Aucun email destinataire" },
        { status: 400 }
      );
    }

    // Verifier la cle API Resend
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Service email non configuré. Le super-admin doit ajouter RESEND_API_KEY dans les variables d'environnement.",
        },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    // Decoder le PDF base64
    const pdfBuffer = Buffer.from(body.pdf_base64, "base64");

    // Format du montant
    const montantRecu = Number(payment.montant_recu).toLocaleString("fr-FR");
    const reference = payment.reference || "—";

    // Envoyer l email
    const { data, error } = await resend.emails.send({
      from: "Nexus RCA <noreply@nexusrca.com>",
      to: recipientEmail,
      subject: `Reçu de paiement ${reference} - Nexus RCA`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #FF6600; padding: 20px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">NEXUS RCA</h1>
            <p style="color: white; margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Agence Internationale</p>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #0C1C40; font-size: 16px;">Bonjour ${payment.client_nom},</p>
            <p style="color: #475569; line-height: 1.6;">
              Veuillez trouver ci-joint votre reçu de paiement pour le service
              <strong>${payment.service}</strong>.
            </p>
            <div style="background: #FFF7ED; border: 1px solid #FFD4A8; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; color: #64748B; font-size: 12px; text-transform: uppercase; font-weight: bold;">Montant reçu</p>
              <p style="margin: 5px 0 0 0; color: #0C1C40; font-size: 24px; font-weight: bold;">${montantRecu} ${payment.devise}</p>
              <p style="margin: 10px 0 0 0; color: #64748B; font-size: 12px;">Référence : <span style="font-family: monospace;">${reference}</span></p>
            </div>
            <p style="color: #475569; line-height: 1.6;">
              Le reçu officiel est joint à cet email au format PDF.
            </p>
            <p style="color: #475569; line-height: 1.6;">
              Merci de votre confiance,<br>
              <strong>L'équipe Nexus RCA</strong>
            </p>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;">
            <p style="color: #94A3B8; font-size: 12px; text-align: center;">
              Nexus RCA · Relais Sica, Bangui, RCA<br>
              +236 73 26 96 92 · contact@nexusrca.com · www.nexusrca.com
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Recu_${reference}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error("Erreur Resend :", error);
      return NextResponse.json(
        { error: "Erreur d'envoi : " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    console.error("Erreur send-receipt :", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
