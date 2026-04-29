"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FileDown, Loader2, Printer, Mail, X } from "lucide-react";
import jsPDF from "jspdf";
import type { Payment, PaymentMethod, PaymentStatus } from "./PaymentForm";

interface AgentInfo {
  id: string;
  nom: string;
  prenom: string | null;
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  especes: "Espèces",
  virement: "Virement bancaire",
  mobile_money: "Mobile Money",
  western_union: "Western Union",
  moneygram: "MoneyGram",
  carte: "Carte bancaire",
  cheque: "Chèque",
  autre: "Autre",
};

const STATUS_LABELS: Record<PaymentStatus, string> = {
  non_paye: "Non payé",
  partiel: "Partiel",
  paye: "Payé intégralement",
  rembourse: "Remboursé",
  annule: "Annulé",
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

function generateReceiptPDF(payment: Payment, agent?: AgentInfo): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  let y = margin;

  const NEXUS_BLUE: [number, number, number] = [12, 28, 64];
  const NEXUS_ORANGE: [number, number, number] = [255, 102, 0];
  const SLATE_DARK: [number, number, number] = [30, 41, 59];
  const SLATE_MID: [number, number, number] = [100, 116, 139];
  const SLATE_LIGHT: [number, number, number] = [226, 232, 240];

  doc.setFillColor(...NEXUS_ORANGE);
  doc.rect(0, 0, pageWidth, 8, "F");

  y = 25;
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_BLUE);
  doc.text("NEXUS RCA", margin, y);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...NEXUS_ORANGE);
  doc.text("Agence Internationale", margin, y + 6);

  doc.setFontSize(8);
  doc.setTextColor(...SLATE_MID);
  const rightX = pageWidth - margin;
  doc.text("Relais Sica, vers Hôpital Général", rightX, y - 2, { align: "right" });
  doc.text("Bangui, République Centrafricaine", rightX, y + 2, { align: "right" });
  doc.text("+236 73 26 96 92", rightX, y + 6, { align: "right" });
  doc.text("contact@nexusrca.com", rightX, y + 10, { align: "right" });
  doc.text("www.nexusrca.com", rightX, y + 14, { align: "right" });

  y += 22;
  doc.setDrawColor(...SLATE_LIGHT);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 12;
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_BLUE);
  doc.text("REÇU DE PAIEMENT", pageWidth / 2, y, { align: "center" });

  y += 7;
  doc.setFontSize(10);
  doc.setFont("courier", "normal");
  doc.setTextColor(...SLATE_MID);
  doc.text(`Référence : ${payment.reference || "—"}`, pageWidth / 2, y, {
    align: "center",
  });

  y += 10;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 2, 2, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_MID);
  doc.text("DATE DU PAIEMENT", margin + 5, y + 6);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...SLATE_DARK);
  doc.text(formatDate(payment.date_paiement), margin + 5, y + 13);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_MID);
  doc.text("STATUT", pageWidth - margin - 5, y + 6, { align: "right" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  if (payment.statut === "paye") {
    doc.setTextColor(34, 197, 94);
  } else if (payment.statut === "partiel") {
    doc.setTextColor(245, 158, 11);
  } else {
    doc.setTextColor(...SLATE_DARK);
  }
  doc.text(STATUS_LABELS[payment.statut], pageWidth - margin - 5, y + 13, {
    align: "right",
  });

  y += 25;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_ORANGE);
  doc.text("CLIENT", margin, y);

  y += 6;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...SLATE_DARK);
  doc.text(payment.client_nom, margin, y);

  y += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_MID);
  if (payment.client_email) {
    doc.text(`Email : ${payment.client_email}`, margin, y);
    y += 5;
  }
  if (payment.client_telephone) {
    doc.text(`Téléphone : ${payment.client_telephone}`, margin, y);
    y += 5;
  }

  y += 5;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_ORANGE);
  doc.text("SERVICE FOURNI", margin, y);

  y += 6;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...SLATE_DARK);
  doc.text(payment.service, margin, y);

  if (payment.description) {
    y += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...SLATE_MID);
    const descLines = doc.splitTextToSize(
      payment.description,
      pageWidth - 2 * margin
    );
    doc.text(descLines, margin, y);
    y += descLines.length * 5;
  }

  y += 10;
  const blockHeight = 45;

  doc.setFillColor(255, 247, 237);
  doc.setDrawColor(...NEXUS_ORANGE);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, blockHeight, 3, 3, "FD");

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_MID);
  doc.text("MONTANT TOTAL", margin + 8, y + 9);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...SLATE_DARK);
  doc.text(
    formatMoney(Number(payment.montant_total), payment.devise),
    margin + 8,
    y + 16
  );

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_MID);
  doc.text("MONTANT REÇU", margin + 8, y + 25);

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(34, 197, 94);
  doc.text(
    formatMoney(Number(payment.montant_recu), payment.devise),
    margin + 8,
    y + 33
  );

  const restant = Number(payment.montant_total) - Number(payment.montant_recu);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_MID);
  doc.text("RESTANT À PAYER", pageWidth - margin - 8, y + 9, { align: "right" });

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  if (restant > 0) {
    doc.setTextColor(...NEXUS_ORANGE);
  } else {
    doc.setTextColor(34, 197, 94);
  }
  doc.text(
    formatMoney(Math.max(0, restant), payment.devise),
    pageWidth - margin - 8,
    y + 17,
    { align: "right" }
  );

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_MID);
  doc.text("MODE DE PAIEMENT", pageWidth - margin - 8, y + 28, { align: "right" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...SLATE_DARK);
  doc.text(
    METHOD_LABELS[payment.mode_paiement],
    pageWidth - margin - 8,
    y + 35,
    { align: "right" }
  );

  y += blockHeight + 12;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_ORANGE);
  doc.text("ENCAISSÉ PAR", margin, y);

  y += 6;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...SLATE_DARK);
  if (agent) {
    const agentName = [agent.prenom, agent.nom].filter(Boolean).join(" ");
    doc.text(agentName || "Agent Nexus RCA", margin, y);
  } else {
    doc.text("Agent Nexus RCA", margin, y);
  }

  y += 5;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_MID);
  doc.text(`Le ${formatDateTime(payment.created_at)}`, margin, y);

  const footerY = pageHeight - 30;
  doc.setDrawColor(...SLATE_LIGHT);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...SLATE_MID);
  doc.text(
    "Ce document est un reçu officiel généré par le système Nexus RCA.",
    pageWidth / 2,
    footerY + 6,
    { align: "center" }
  );
  doc.text(
    "Pour toute question, contactez-nous au +236 73 26 96 92 ou contact@nexusrca.com",
    pageWidth / 2,
    footerY + 11,
    { align: "center" }
  );

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_BLUE);
  doc.text("Merci de votre confiance !", pageWidth / 2, footerY + 18, {
    align: "center",
  });

  doc.setFillColor(...NEXUS_ORANGE);
  doc.rect(0, pageHeight - 5, pageWidth, 5, "F");

  return doc;
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

  const handleDownload = () => {
    setGenerating(true);
    try {
      const doc = generateReceiptPDF(payment, agent);
      const filename = `Recu_${payment.reference || payment.id}_${
        payment.client_nom.replace(/\s+/g, "-")
      }.pdf`;
      doc.save(filename);
      toast.success("Reçu téléchargé");
    } catch (error) {
      console.error(error);
      toast.error("Erreur génération PDF");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    setGenerating(true);
    try {
      const doc = generateReceiptPDF(payment, agent);
      const blob = doc.output("blob");
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
      const doc = generateReceiptPDF(payment, agent);
      // Convertir en base64 (sans le prefixe data:application/pdf;base64,)
      const base64 = doc
        .output("datauristring")
        .split(",")[1];

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
