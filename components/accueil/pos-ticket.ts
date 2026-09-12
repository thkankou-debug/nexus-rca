// ============================================================================
// TICKET POS 80mm — Comptoir POS (§3.2 "Après encaissement : génération du
// reçu au format 80 mm"). Multi-lignes, hauteur dynamique — même patron que
// le générateur mono-ligne de QuickSaleForm.tsx (non touché), même
// bibliothèque (pdf-lib + lib/pdf-layout, sanitize systématique via
// drawText/wrapText).
// ============================================================================

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { drawText, drawDashedLine, wrapText, mm } from "@/lib/pdf-layout";

export interface PosTicketLine {
  label: string;
  quantite: number;
  prix_unitaire: number;
  montant_total: number;
}

export interface PosTicketData {
  reference: string;
  date: Date;
  clientNom?: string | null;
  dossierReference?: string | null;
  lignes: PosTicketLine[];
  total: number;
  devise: string;
  modePaiement: string;
  montantRecu?: number | null;
  monnaieRendue?: number | null;
  caissiereNom?: string | null;
  /** CAI-06 : une réimpression est identifiable — bandeau DUPLICATA. */
  duplicata?: boolean;
}

const WIDTH_MM = 80;
const MARGIN_MM = 5;

export async function generatePosTicketPdf(data: PosTicketData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  // Hauteur dynamique : en-tête/pied fixes + ~10mm par ligne de ticket.
  const heightMm = 95 + data.lignes.length * 10 + (data.clientNom ? 10 : 0) + (data.dossierReference ? 5 : 0);
  const pageHeight = mm(heightMm);
  const page = pdfDoc.addPage([mm(WIDTH_MM), pageHeight]);

  const black = rgb(0, 0, 0);
  const centerX = WIDTH_MM / 2;
  const margin = MARGIN_MM;
  let y = 8;

  drawText(page, pageHeight, helveticaBold, "NEXUS RCA", mm(centerX), mm(y), 14, black, "center");
  y += 5;
  drawText(page, pageHeight, helvetica, "Agence Internationale", mm(centerX), mm(y), 8, black, "center");
  y += 3;
  drawText(page, pageHeight, helvetica, "Bangui, RCA", mm(centerX), mm(y), 8, black, "center");
  y += 3;
  drawText(page, pageHeight, helvetica, "+236 73 26 96 92", mm(centerX), mm(y), 8, black, "center");

  y += 5;
  drawDashedLine(page, pageHeight, mm(margin), mm(WIDTH_MM - margin), mm(y), black);

  y += 5;
  drawText(page, pageHeight, helveticaBold, "TICKET DE CAISSE", mm(centerX), mm(y), 9, black, "center");
  if (data.duplicata) {
    y += 4;
    drawText(page, pageHeight, helveticaBold, "*** DUPLICATA — REIMPRESSION ***", mm(centerX), mm(y), 8, black, "center");
  }
  y += 4;
  drawText(page, pageHeight, courier, data.reference, mm(centerX), mm(y), 7, black, "center");
  y += 4;
  const dateStr = data.date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  drawText(page, pageHeight, helvetica, dateStr, mm(centerX), mm(y), 8, black, "center");

  y += 4;
  drawDashedLine(page, pageHeight, mm(margin), mm(WIDTH_MM - margin), mm(y), black);

  if (data.clientNom) {
    y += 4;
    drawText(page, pageHeight, helveticaBold, "Client :", mm(margin), mm(y), 8, black);
    y += 3;
    drawText(page, pageHeight, helvetica, data.clientNom, mm(margin), mm(y), 8, black);
    y += 3;
  }
  if (data.dossierReference) {
    y += 3;
    drawText(page, pageHeight, helvetica, `Dossier : ${data.dossierReference}`, mm(margin), mm(y), 7, black);
    y += 2;
  }
  if (data.clientNom || data.dossierReference) {
    drawDashedLine(page, pageHeight, mm(margin), mm(WIDTH_MM - margin), mm(y), black);
  }

  for (const ligne of data.lignes) {
    y += 5;
    const labelLines = wrapText(helveticaBold, ligne.label, mm(WIDTH_MM - 2 * margin), 8);
    for (const line of labelLines) {
      drawText(page, pageHeight, helveticaBold, line, mm(margin), mm(y), 8, black);
      y += 3;
    }
    drawText(
      page,
      pageHeight,
      helvetica,
      `${ligne.quantite} x ${Math.round(ligne.prix_unitaire).toLocaleString("fr-FR")}`,
      mm(margin),
      mm(y + 1),
      8,
      black
    );
    drawText(
      page,
      pageHeight,
      helvetica,
      `${Math.round(ligne.montant_total).toLocaleString("fr-FR")} ${data.devise}`,
      mm(WIDTH_MM - margin),
      mm(y + 1),
      8,
      black,
      "right"
    );
    y += 4;
  }

  y += 3;
  drawDashedLine(page, pageHeight, mm(margin), mm(WIDTH_MM - margin), mm(y), black);
  y += 5;
  drawText(page, pageHeight, helveticaBold, "TOTAL", mm(margin), mm(y), 11, black);
  drawText(
    page,
    pageHeight,
    helveticaBold,
    `${Math.round(data.total).toLocaleString("fr-FR")} ${data.devise}`,
    mm(WIDTH_MM - margin),
    mm(y),
    11,
    black,
    "right"
  );

  y += 5;
  drawText(page, pageHeight, helvetica, `Mode : ${data.modePaiement}`, mm(margin), mm(y), 7, black);

  if (data.montantRecu !== null && data.montantRecu !== undefined) {
    y += 3;
    drawText(
      page,
      pageHeight,
      helvetica,
      `Recu : ${Math.round(data.montantRecu).toLocaleString("fr-FR")} ${data.devise}`,
      mm(margin),
      mm(y),
      7,
      black
    );
    if (data.monnaieRendue !== null && data.monnaieRendue !== undefined && data.monnaieRendue > 0) {
      drawText(
        page,
        pageHeight,
        helvetica,
        `Monnaie : ${Math.round(data.monnaieRendue).toLocaleString("fr-FR")} ${data.devise}`,
        mm(WIDTH_MM - margin),
        mm(y),
        7,
        black,
        "right"
      );
    }
  }

  if (data.caissiereNom) {
    y += 4;
    drawText(page, pageHeight, helvetica, `Servi par : ${data.caissiereNom}`, mm(margin), mm(y), 7, black);
  }

  y += 6;
  drawDashedLine(page, pageHeight, mm(margin), mm(WIDTH_MM - margin), mm(y), black);
  y += 5;
  drawText(page, pageHeight, helvetica, "Merci de votre confiance", mm(centerX), mm(y), 8, black, "center");
  y += 4;
  drawText(page, pageHeight, helvetica, "www.nexusrca.com", mm(centerX), mm(y), 7, black, "center");

  return pdfDoc.save();
}

/** Ouvre le ticket dans un nouvel onglet pour impression (même approche que QuickSaleForm). */
export function openPdfForPrint(bytes: Uint8Array): void {
  const buffer = new Uint8Array(bytes).buffer as ArrayBuffer;
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    win.addEventListener("load", () => win.print());
  }
}

export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const buffer = new Uint8Array(bytes).buffer as ArrayBuffer;
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
