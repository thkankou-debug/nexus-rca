"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FileDown, Loader2, Printer, Mail, X } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  drawText,
  drawFilledRect,
  drawLine,
  wrapText,
  uint8ArrayToBase64,
  mm,
} from "@/lib/pdf-layout";
import type {
  Payment,
  PaymentStatusCanonical,
  PaymentMethodCanonical,
} from "./PaymentForm";

interface AgentInfo {
  id: string;
  nom: string;
  prenom: string | null;
}

// P6-0 : libelles pour payment.method/status (canoniques, D1).
const METHOD_LABELS: Record<PaymentMethodCanonical, string> = {
  cash: "Espèces",
  bank_transfer: "Virement bancaire",
  card: "Carte bancaire",
  other: "Autre",
  mobile_money: "Mobile Money",
  western_union: "Western Union",
  moneygram: "MoneyGram",
  cheque: "Chèque",
  orange_money: "Orange Money",
  mtn_money: "MTN Mobile Money",
  express_union: "Express Union",
  stripe: "Carte (Stripe)",
};

const STATUS_LABELS: Record<PaymentStatusCanonical, string> = {
  pending: "Non payé",
  partial: "Partiel",
  paid: "Payé intégralement",
  refunded: "Remboursé",
  voided: "Annulé",
  validated: "Validé",
  failed: "Échoué",
};

function formatMoney(amount: number, currency = "XAF"): string {
  return `${Number(amount).toLocaleString("fr-FR")} ${currency}`;
}

function formatDate(dateStr: string): string {
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

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

async function generateReceiptPDF(
  payment: Payment,
  agent?: AgentInfo
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const pageHeightPt = mm(pageHeight);
  const page = pdfDoc.addPage([mm(pageWidth), pageHeightPt]);

  const NEXUS_BLUE = rgb(12 / 255, 28 / 255, 64 / 255);
  const NEXUS_ORANGE = rgb(255 / 255, 102 / 255, 0 / 255);
  const SLATE_DARK = rgb(30 / 255, 41 / 255, 59 / 255);
  const SLATE_MID = rgb(100 / 255, 116 / 255, 139 / 255);
  const SLATE_LIGHT = rgb(226 / 255, 232 / 255, 240 / 255);
  const GREEN = rgb(34 / 255, 197 / 255, 94 / 255);
  const AMBER = rgb(245 / 255, 158 / 255, 11 / 255);
  const GRAY_BG = rgb(248 / 255, 250 / 255, 252 / 255);
  const ORANGE_BG = rgb(255 / 255, 247 / 255, 237 / 255);

  let y = margin;

  drawFilledRect(page, pageHeightPt, 0, 0, mm(pageWidth), mm(8), NEXUS_ORANGE);

  y = 25;
  drawText(page, pageHeightPt, helveticaBold, "NEXUS RCA", mm(margin), mm(y), 24, NEXUS_BLUE);
  drawText(page, pageHeightPt, helvetica, "Agence Internationale", mm(margin), mm(y + 6), 10, NEXUS_ORANGE);

  const rightX = pageWidth - margin;
  drawText(page, pageHeightPt, helvetica, "Relais Sica, vers Hôpital Général", mm(rightX), mm(y - 2), 8, SLATE_MID, "right");
  drawText(page, pageHeightPt, helvetica, "Bangui, République Centrafricaine", mm(rightX), mm(y + 2), 8, SLATE_MID, "right");
  drawText(page, pageHeightPt, helvetica, "+236 73 26 96 92", mm(rightX), mm(y + 6), 8, SLATE_MID, "right");
  drawText(page, pageHeightPt, helvetica, "contact@nexusrca.com", mm(rightX), mm(y + 10), 8, SLATE_MID, "right");
  drawText(page, pageHeightPt, helvetica, "www.nexusrca.com", mm(rightX), mm(y + 14), 8, SLATE_MID, "right");

  y += 22;
  drawLine(page, pageHeightPt, mm(margin), mm(pageWidth - margin), mm(y), SLATE_LIGHT);

  y += 12;
  drawText(page, pageHeightPt, helveticaBold, "REÇU DE PAIEMENT", mm(pageWidth / 2), mm(y), 20, NEXUS_BLUE, "center");

  y += 7;
  drawText(page, pageHeightPt, courier, `Référence : ${payment.reference || "—"}`, mm(pageWidth / 2), mm(y), 10, SLATE_MID, "center");

  y += 10;
  drawFilledRect(page, pageHeightPt, mm(margin), mm(y), mm(pageWidth - 2 * margin), mm(18), GRAY_BG);

  drawText(page, pageHeightPt, helvetica, "DATE DU PAIEMENT", mm(margin + 5), mm(y + 6), 9, SLATE_MID);
  drawText(page, pageHeightPt, helveticaBold, formatDate(payment.date_paiement), mm(margin + 5), mm(y + 13), 11, SLATE_DARK);

  drawText(page, pageHeightPt, helvetica, "STATUT", mm(pageWidth - margin - 5), mm(y + 6), 9, SLATE_MID, "right");

  const statusColor =
    payment.status === "paid" ? GREEN : payment.status === "partial" ? AMBER : SLATE_DARK;
  drawText(
    page, pageHeightPt, helveticaBold, STATUS_LABELS[payment.status],
    mm(pageWidth - margin - 5), mm(y + 13), 11, statusColor, "right"
  );

  y += 25;
  drawText(page, pageHeightPt, helveticaBold, "CLIENT", mm(margin), mm(y), 11, NEXUS_ORANGE);

  y += 6;
  drawText(page, pageHeightPt, helveticaBold, payment.client_nom, mm(margin), mm(y), 13, SLATE_DARK);

  y += 6;
  if (payment.client_email) {
    drawText(page, pageHeightPt, helvetica, `Email : ${payment.client_email}`, mm(margin), mm(y), 10, SLATE_MID);
    y += 5;
  }
  if (payment.client_telephone) {
    drawText(page, pageHeightPt, helvetica, `Téléphone : ${payment.client_telephone}`, mm(margin), mm(y), 10, SLATE_MID);
    y += 5;
  }

  y += 5;
  drawText(page, pageHeightPt, helveticaBold, "SERVICE FOURNI", mm(margin), mm(y), 11, NEXUS_ORANGE);

  y += 6;
  drawText(page, pageHeightPt, helveticaBold, payment.service, mm(margin), mm(y), 12, SLATE_DARK);

  if (payment.description) {
    y += 6;
    const descLines = wrapText(helvetica, payment.description, mm(pageWidth - 2 * margin), 10);
    descLines.forEach((line, i) => {
      drawText(page, pageHeightPt, helvetica, line, mm(margin), mm(y + i * 5), 10, SLATE_MID);
    });
    y += descLines.length * 5;
  }

  y += 10;
  const blockHeight = 45;

  drawFilledRect(
    page, pageHeightPt, mm(margin), mm(y), mm(pageWidth - 2 * margin), mm(blockHeight),
    ORANGE_BG, { color: NEXUS_ORANGE, width: mm(0.5) }
  );

  drawText(page, pageHeightPt, helvetica, "MONTANT TOTAL", mm(margin + 8), mm(y + 9), 9, SLATE_MID);
  drawText(
    page, pageHeightPt, helveticaBold,
    formatMoney(Number(payment.montant_total), payment.devise),
    mm(margin + 8), mm(y + 16), 13, SLATE_DARK
  );

  drawText(page, pageHeightPt, helvetica, "MONTANT REÇU", mm(margin + 8), mm(y + 25), 9, SLATE_MID);
  drawText(
    page, pageHeightPt, helveticaBold,
    formatMoney(Number(payment.montant_recu), payment.devise),
    mm(margin + 8), mm(y + 33), 15, GREEN
  );

  const restant = Number(payment.montant_total) - Number(payment.montant_recu);

  drawText(page, pageHeightPt, helvetica, "RESTANT À PAYER", mm(pageWidth - margin - 8), mm(y + 9), 9, SLATE_MID, "right");
  drawText(
    page, pageHeightPt, helveticaBold,
    formatMoney(Math.max(0, restant), payment.devise),
    mm(pageWidth - margin - 8), mm(y + 17), 15,
    restant > 0 ? NEXUS_ORANGE : GREEN, "right"
  );

  drawText(page, pageHeightPt, helvetica, "MODE DE PAIEMENT", mm(pageWidth - margin - 8), mm(y + 28), 9, SLATE_MID, "right");
  drawText(
    page, pageHeightPt, helveticaBold, METHOD_LABELS[payment.method],
    mm(pageWidth - margin - 8), mm(y + 35), 11, SLATE_DARK, "right"
  );

  y += blockHeight + 12;

  drawText(page, pageHeightPt, helveticaBold, "ENCAISSÉ PAR", mm(margin), mm(y), 11, NEXUS_ORANGE);

  y += 6;
  const agentName = agent ? [agent.prenom, agent.nom].filter(Boolean).join(" ") : "";
  drawText(page, pageHeightPt, helveticaBold, agentName || "Agent Nexus RCA", mm(margin), mm(y), 11, SLATE_DARK);

  y += 5;
  drawText(page, pageHeightPt, helvetica, `Le ${formatDateTime(payment.created_at)}`, mm(margin), mm(y), 9, SLATE_MID);

  const footerY = pageHeight - 30;
  drawLine(page, pageHeightPt, mm(margin), mm(pageWidth - margin), mm(footerY), SLATE_LIGHT);

  drawText(
    page, pageHeightPt, helveticaOblique,
    "Ce document est un reçu officiel généré par le système Nexus RCA.",
    mm(pageWidth / 2), mm(footerY + 6), 8, SLATE_MID, "center"
  );
  drawText(
    page, pageHeightPt, helveticaOblique,
    "Pour toute question, contactez-nous au +236 73 26 96 92 ou contact@nexusrca.com",
    mm(pageWidth / 2), mm(footerY + 11), 8, SLATE_MID, "center"
  );

  drawText(page, pageHeightPt, helveticaBold, "Merci de votre confiance !", mm(pageWidth / 2), mm(footerY + 18), 9, NEXUS_BLUE, "center");

  drawFilledRect(page, pageHeightPt, 0, mm(pageHeight - 5), mm(pageWidth), mm(5), NEXUS_ORANGE);

  return pdfDoc.save();
}

// ============================================================================
// COMPOSANT BOUTONS
// ============================================================================
export function ReceiptButtons({
  payment,
  agent,
}: {
  payment: Payment;
  agent?: AgentInfo;
}) {
  const [generating, setGenerating] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [emailDestinataire, setEmailDestinataire] = useState(
    payment.client_email || ""
  );
  const [sending, setSending] = useState(false);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const bytes = await generateReceiptPDF(payment, agent);
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const filename = `Recu_${payment.reference || payment.id}_${
        payment.client_nom.replace(/\s+/g, "-")
      }.pdf`;
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Reçu téléchargé");
    } catch (error) {
      console.error(error);
      toast.error("Erreur génération PDF");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = async () => {
    setGenerating(true);
    try {
      const bytes = await generateReceiptPDF(payment, agent);
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.addEventListener("load", () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        });
      } else {
        toast.error("Popup bloqué — autorise les popups pour imprimer");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur impression");
    } finally {
      setGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailDestinataire.trim()) {
      toast.error("Email destinataire requis");
      return;
    }

    setSending(true);
    try {
      const bytes = await generateReceiptPDF(payment, agent);
      const base64 = uint8ArrayToBase64(bytes);

      const response = await fetch("/api/payments/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: payment.id,
          recipient_email: emailDestinataire.trim(),
          pdf_base64: base64,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur d'envoi");
      }

      toast.success("Reçu envoyé par email !");
      setEmailModal(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";
      toast.error("Erreur : " + message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleDownload}
        disabled={generating}
        className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 disabled:opacity-50"
      >
        {generating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileDown className="h-3.5 w-3.5" />
        )}
        Reçu PDF
      </button>
      <button
        type="button"
        onClick={handlePrint}
        disabled={generating}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        <Printer className="h-3.5 w-3.5" />
        Imprimer
      </button>
      <button
        type="button"
        onClick={() => setEmailModal(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
      >
        <Mail className="h-3.5 w-3.5" />
        Envoyer par email
      </button>

      {/* Modal envoi email */}
      {emailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setEmailModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                    Envoyer le reçu par email
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Référence : {payment.reference}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmailModal(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Email du destinataire *
              </label>
              <input
                type="email"
                value={emailDestinataire}
                onChange={(e) => setEmailDestinataire(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
                placeholder="email@exemple.com"
              />
              <p className="mt-2 text-xs text-slate-500">
                Le PDF du reçu sera joint à un email professionnel envoyé depuis
                noreply@nexusrca.com.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEmailModal(false)}
                disabled={sending}
                className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Envoyer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
