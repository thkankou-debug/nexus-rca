"use client";

import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import {
  FileText,
  Calendar,
  Loader2,
  Download,
  Printer,
  Mail,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShoppingCart,
  Send,
  Receipt,
  Users,
  AlertCircle,
  X,
} from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { drawText, drawFilledRect, drawLine, uint8ArrayToBase64, mm } from "@/lib/pdf-layout";
import { createClient } from "@/lib/supabase/client";

// ============================================================================
// TYPES
// ============================================================================
interface MonthSummary {
  // Encaissements paiements (gros dossiers)
  paiements: { devise: string; total: number; count: number; restant: number }[];
  // Caisse rapide
  caisse: { devise: string; total: number; count: number }[];
  // Dépenses validées
  depenses: { devise: string; total: number; count: number }[];
  // Dépenses en attente
  depensesEnAttente: { devise: string; total: number; count: number }[];
  // Transferts effectués
  transferts: { devise: string; total: number; frais: number; count: number }[];
  // Top services caisse
  topServices: { service: string; total: number; count: number; devise: string }[];
  // Top agents (par encaissements)
  topAgents: {
    nom: string;
    paiements: number;
    caisse: number;
    total: number;
    devise: string;
  }[];
  // Paiements partiels (créances)
  partiels: {
    reference: string | null;
    client_nom: string;
    service: string;
    montant_total: number;
    montant_recu: number;
    restant: number;
    devise: string;
  }[];
}

const SERVICE_LABELS: Record<string, string> = {
  photocopie: "Photocopie",
  impression: "Impression",
  scan: "Scan",
  numerisation: "Numérisation",
  plastification: "Plastification",
  saisie_document: "Saisie de document",
  assistance_formulaire: "Assistance formulaire",
  photo_identite: "Photo d'identité",
  autre: "Autre",
};

// ============================================================================
// HELPERS
// ============================================================================
function formatMoney(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

function getMonthBounds(yearMonth: string): { start: string; end: string; label: string } {
  // yearMonth format : "2026-04"
  const [year, month] = yearMonth.split("-").map(Number);
  const start = new Date(year, month - 1, 1, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59); // dernier jour du mois
  const label = start.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  return {
    start: start.toISOString(),
    end: end.toISOString(),
    label: label.charAt(0).toUpperCase() + label.slice(1),
  };
}

function aggregateByDevise<T extends { devise?: string | null }>(
  rows: T[],
  getValue: (row: T) => number
): { devise: string; total: number; count: number }[] {
  const map: Record<string, { total: number; count: number }> = {};
  rows.forEach((row) => {
    const devise = row.devise || "XAF";
    if (!map[devise]) map[devise] = { total: 0, count: 0 };
    map[devise].total += getValue(row);
    map[devise].count += 1;
  });
  return Object.entries(map).map(([devise, data]) => ({
    devise,
    total: data.total,
    count: data.count,
  }));
}

// ============================================================================
// GENERATEUR PDF (5 pages)
// ============================================================================
async function generateReportPDF(
  summary: MonthSummary,
  monthLabel: string,
  generatedBy: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const pageHeightPt = mm(pageHeight);

  const NEXUS_BLUE = rgb(12 / 255, 28 / 255, 64 / 255);
  const NEXUS_ORANGE = rgb(255 / 255, 102 / 255, 0 / 255);
  const SLATE_DARK = rgb(30 / 255, 41 / 255, 59 / 255);
  const SLATE_MID = rgb(100 / 255, 116 / 255, 139 / 255);
  const SLATE_LIGHT = rgb(226 / 255, 232 / 255, 240 / 255);
  const WHITE = rgb(1, 1, 1);
  const ROW_ALT = rgb(252 / 255, 252 / 255, 253 / 255);
  const AMBER = rgb(245 / 255, 158 / 255, 11 / 255);
  const GREEN = rgb(34 / 255, 197 / 255, 94 / 255);
  const RED = rgb(239 / 255, 68 / 255, 68 / 255);

  // pdf-lib n'a pas de "page courante" implicite comme jsPDF : `page` est
  // reassigne a chaque addPage() et les helpers ci-dessous la referencent
  // par closure (comme jsPDF le fait avec son objet `doc` mutable).
  let page = pdfDoc.addPage([mm(pageWidth), pageHeightPt]);

  const drawPageHeader = (pageNum: number, totalPages: number) => {
    drawFilledRect(page, pageHeightPt, 0, 0, mm(pageWidth), mm(5), NEXUS_ORANGE);

    drawText(page, pageHeightPt, helveticaBold, "NEXUS RCA", mm(margin), mm(11), 9, NEXUS_BLUE);
    drawText(page, pageHeightPt, helvetica, `Rapport financier - ${monthLabel}`, mm(pageWidth / 2), mm(11), 9, SLATE_MID, "center");
    drawText(page, pageHeightPt, helvetica, `Page ${pageNum}/${totalPages}`, mm(pageWidth - margin), mm(11), 9, SLATE_MID, "right");

    drawLine(page, pageHeightPt, mm(margin), mm(pageWidth - margin), mm(14), SLATE_LIGHT, mm(0.3));
  };

  const drawPageFooter = () => {
    drawText(
      page, pageHeightPt, helveticaItalic,
      "Document confidentiel · Nexus RCA · contact@nexusrca.com · +236 73 26 96 92",
      mm(pageWidth / 2), mm(pageHeight - 10), 7, SLATE_MID, "center"
    );
    drawFilledRect(page, pageHeightPt, 0, mm(pageHeight - 4), mm(pageWidth), mm(4), NEXUS_ORANGE);
  };

  // Boilerplate commun aux ~6 tableaux du rapport : barre d'en-tete bleue
  // (les libelles de colonnes different par tableau, dessines separement)
  // et fond zebre des lignes impaires.
  const drawTableHeaderBar = (topY: number, height = 7) => {
    drawFilledRect(page, pageHeightPt, mm(margin), mm(topY), mm(pageWidth - 2 * margin), mm(height), NEXUS_BLUE);
  };

  const drawZebraRowBg = (topY: number, rowIndex: number, height = 7) => {
    if (rowIndex % 2 === 1) {
      drawFilledRect(page, pageHeightPt, mm(margin), mm(topY), mm(pageWidth - 2 * margin), mm(height), ROW_ALT);
    }
  };

  const totalPages = 5;
  let pageNum = 1;

  // ============================================================
  // PAGE 1 : RESUME EXECUTIF
  // ============================================================
  drawPageHeader(pageNum, totalPages);
  let y = 25;

  drawText(page, pageHeightPt, helveticaBold, "RAPPORT FINANCIER MENSUEL", mm(margin), mm(y), 22, NEXUS_BLUE);

  y += 8;
  drawText(page, pageHeightPt, helvetica, monthLabel, mm(margin), mm(y), 14, NEXUS_ORANGE);

  y += 12;
  drawText(
    page, pageHeightPt, helvetica,
    `Généré le ${new Date().toLocaleString("fr-FR")} par ${generatedBy}`,
    mm(margin), mm(y), 9, SLATE_MID
  );

  y += 15;

  drawText(page, pageHeightPt, helveticaBold, "ENCAISSEMENTS DU MOIS", mm(margin), mm(y), 11, NEXUS_ORANGE);
  y += 7;

  const allDevises = new Set<string>();
  summary.paiements.forEach((p) => allDevises.add(p.devise));
  summary.caisse.forEach((c) => allDevises.add(c.devise));
  const devises = Array.from(allDevises).sort();

  if (devises.length === 0) {
    drawText(page, pageHeightPt, helveticaItalic, "Aucun encaissement ce mois", mm(margin), mm(y), 9, SLATE_MID);
    y += 8;
  } else {
    devises.forEach((devise) => {
      const paie = summary.paiements.find((p) => p.devise === devise);
      const caisse = summary.caisse.find((c) => c.devise === devise);
      const totalDevise = (paie?.total || 0) + (caisse?.total || 0);

      // Bloc devise (coins carres, decision Thierry lot 1d -- pas
      // d'equivalent natif pdf-lib pour roundedRect)
      drawFilledRect(
        page, pageHeightPt, mm(margin), mm(y), mm(pageWidth - 2 * margin), mm(22),
        ROW_ALT, { color: SLATE_LIGHT, width: mm(0.3) }
      );

      drawText(page, pageHeightPt, helveticaBold, `Total ${devise}`, mm(margin + 5), mm(y + 7), 10, NEXUS_BLUE);
      drawText(page, pageHeightPt, helveticaBold, formatMoney(totalDevise, devise), mm(pageWidth - margin - 5), mm(y + 7), 14, NEXUS_ORANGE, "right");

      drawText(
        page, pageHeightPt, helvetica,
        `Paiements : ${formatMoney(paie?.total || 0, devise)} (${paie?.count || 0} transactions)`,
        mm(margin + 5), mm(y + 14), 8, SLATE_MID
      );
      drawText(
        page, pageHeightPt, helvetica,
        `Caisse rapide : ${formatMoney(caisse?.total || 0, devise)} (${caisse?.count || 0} ventes)`,
        mm(margin + 5), mm(y + 18), 8, SLATE_MID
      );

      y += 26;
    });
  }

  y += 4;
  drawText(page, pageHeightPt, helveticaBold, "DÉPENSES DU MOIS", mm(margin), mm(y), 11, NEXUS_ORANGE);
  y += 7;

  if (summary.depenses.length === 0) {
    drawText(page, pageHeightPt, helveticaItalic, "Aucune dépense validée ce mois", mm(margin), mm(y), 9, SLATE_MID);
    y += 6;
  } else {
    summary.depenses.forEach((d) => {
      drawText(
        page, pageHeightPt, helvetica,
        `${d.devise} : ${formatMoney(d.total, d.devise)} (${d.count} dépenses)`,
        mm(margin + 5), mm(y), 9, SLATE_DARK
      );
      y += 5;
    });
  }

  if (summary.depensesEnAttente.length > 0) {
    y += 2;
    summary.depensesEnAttente.forEach((d) => {
      drawText(
        page, pageHeightPt, helveticaItalic,
        `⚠ En attente de validation : ${formatMoney(d.total, d.devise)} (${d.count})`,
        mm(margin + 5), mm(y), 8, AMBER
      );
      y += 4;
    });
  }

  y += 6;
  drawFilledRect(page, pageHeightPt, mm(margin), mm(y), mm(pageWidth - 2 * margin), mm(30), NEXUS_BLUE);

  drawText(page, pageHeightPt, helveticaBold, "SOLDE NET PAR DEVISE", mm(margin + 5), mm(y + 8), 10, WHITE);

  let soldeY = y + 14;
  devises.forEach((devise) => {
    const paieTotal = summary.paiements.find((p) => p.devise === devise)?.total || 0;
    const caisseTotal = summary.caisse.find((c) => c.devise === devise)?.total || 0;
    const depenseTotal = summary.depenses.find((d) => d.devise === devise)?.total || 0;
    const solde = paieTotal + caisseTotal - depenseTotal;

    drawText(page, pageHeightPt, helvetica, `${devise} :`, mm(margin + 5), mm(soldeY), 8, WHITE);
    drawText(
      page, pageHeightPt, helveticaBold, formatMoney(solde, devise),
      mm(margin + 30), mm(soldeY), 11, solde >= 0 ? GREEN : RED
    );
    soldeY += 5;
  });

  y += 36;
  drawText(page, pageHeightPt, helveticaBold, "EN UN COUP D'ŒIL", mm(margin), mm(y), 11, NEXUS_ORANGE);
  y += 7;

  const totalPaiementsCount = summary.paiements.reduce((s, p) => s + p.count, 0);
  const totalCaisseCount = summary.caisse.reduce((s, c) => s + c.count, 0);
  const totalTransfertsCount = summary.transferts.reduce((s, t) => s + t.count, 0);
  const totalPartiels = summary.partiels.length;

  drawText(page, pageHeightPt, helvetica, `• ${totalPaiementsCount} paiement(s) clients enregistré(s)`, mm(margin + 3), mm(y), 9, SLATE_DARK);
  y += 5;
  drawText(page, pageHeightPt, helvetica, `• ${totalCaisseCount} vente(s) caisse rapide`, mm(margin + 3), mm(y), 9, SLATE_DARK);
  y += 5;
  drawText(page, pageHeightPt, helvetica, `• ${totalTransfertsCount} transfert(s) effectué(s)`, mm(margin + 3), mm(y), 9, SLATE_DARK);
  y += 5;
  drawText(page, pageHeightPt, helvetica, `• ${totalPartiels} créance(s) client en cours (paiements partiels)`, mm(margin + 3), mm(y), 9, SLATE_DARK);

  drawPageFooter();

  // ============================================================
  // PAGE 2 : DETAIL ENCAISSEMENTS
  // ============================================================
  page = pdfDoc.addPage([mm(pageWidth), pageHeightPt]);
  pageNum++;
  drawPageHeader(pageNum, totalPages);
  y = 25;

  drawText(page, pageHeightPt, helveticaBold, "DÉTAIL DES ENCAISSEMENTS", mm(margin), mm(y), 16, NEXUS_BLUE);
  y += 12;

  drawText(page, pageHeightPt, helveticaBold, "Paiements (gros dossiers)", mm(margin), mm(y), 11, NEXUS_ORANGE);
  y += 7;

  if (summary.paiements.length === 0) {
    drawText(page, pageHeightPt, helveticaItalic, "Aucun paiement ce mois", mm(margin), mm(y), 9, SLATE_MID);
    y += 8;
  } else {
    drawTableHeaderBar(y);
    drawText(page, pageHeightPt, helveticaBold, "Devise", mm(margin + 3), mm(y + 5), 9, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Total reçu", mm(margin + 50), mm(y + 5), 9, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Restant à recevoir", mm(margin + 100), mm(y + 5), 9, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Nb transactions", mm(margin + 150), mm(y + 5), 9, WHITE);
    y += 7;

    summary.paiements.forEach((p, i) => {
      drawZebraRowBg(y, i);
      drawText(page, pageHeightPt, helvetica, p.devise, mm(margin + 3), mm(y + 5), 9, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, formatMoney(p.total, p.devise), mm(margin + 50), mm(y + 5), 9, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, formatMoney(p.restant, p.devise), mm(margin + 100), mm(y + 5), 9, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, String(p.count), mm(margin + 150), mm(y + 5), 9, SLATE_DARK);
      y += 7;
    });
  }

  y += 8;

  drawText(page, pageHeightPt, helveticaBold, "Caisse rapide (petits services)", mm(margin), mm(y), 11, NEXUS_ORANGE);
  y += 7;

  if (summary.caisse.length === 0) {
    drawText(page, pageHeightPt, helveticaItalic, "Aucune vente caisse ce mois", mm(margin), mm(y), 9, SLATE_MID);
    y += 8;
  } else {
    drawTableHeaderBar(y);
    drawText(page, pageHeightPt, helveticaBold, "Devise", mm(margin + 3), mm(y + 5), 9, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Total encaissé", mm(margin + 50), mm(y + 5), 9, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Nb ventes", mm(margin + 130), mm(y + 5), 9, WHITE);
    y += 7;

    summary.caisse.forEach((c, i) => {
      drawZebraRowBg(y, i);
      drawText(page, pageHeightPt, helvetica, c.devise, mm(margin + 3), mm(y + 5), 9, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, formatMoney(c.total, c.devise), mm(margin + 50), mm(y + 5), 9, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, String(c.count), mm(margin + 130), mm(y + 5), 9, SLATE_DARK);
      y += 7;
    });
  }

  y += 8;

  drawText(page, pageHeightPt, helveticaBold, "Transferts effectués", mm(margin), mm(y), 11, NEXUS_ORANGE);
  y += 7;

  if (summary.transferts.length === 0) {
    drawText(page, pageHeightPt, helveticaItalic, "Aucun transfert ce mois", mm(margin), mm(y), 9, SLATE_MID);
  } else {
    drawTableHeaderBar(y);
    drawText(page, pageHeightPt, helveticaBold, "Devise", mm(margin + 3), mm(y + 5), 9, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Montant transféré", mm(margin + 50), mm(y + 5), 9, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Frais collectés", mm(margin + 110), mm(y + 5), 9, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Nb", mm(margin + 165), mm(y + 5), 9, WHITE);
    y += 7;

    summary.transferts.forEach((t, i) => {
      drawZebraRowBg(y, i);
      drawText(page, pageHeightPt, helvetica, t.devise, mm(margin + 3), mm(y + 5), 9, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, formatMoney(t.total, t.devise), mm(margin + 50), mm(y + 5), 9, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, formatMoney(t.frais, t.devise), mm(margin + 110), mm(y + 5), 9, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, String(t.count), mm(margin + 165), mm(y + 5), 9, SLATE_DARK);
      y += 7;
    });
  }

  drawPageFooter();

  // ============================================================
  // PAGE 3 : DETAIL DEPENSES
  // ============================================================
  page = pdfDoc.addPage([mm(pageWidth), pageHeightPt]);
  pageNum++;
  drawPageHeader(pageNum, totalPages);
  y = 25;

  drawText(page, pageHeightPt, helveticaBold, "DÉTAIL DES DÉPENSES", mm(margin), mm(y), 16, NEXUS_BLUE);
  y += 12;

  drawText(page, pageHeightPt, helveticaBold, "Dépenses validées", mm(margin), mm(y), 11, NEXUS_ORANGE);
  y += 7;

  if (summary.depenses.length === 0) {
    drawText(page, pageHeightPt, helveticaItalic, "Aucune dépense validée", mm(margin), mm(y), 9, SLATE_MID);
    y += 8;
  } else {
    drawTableHeaderBar(y);
    drawText(page, pageHeightPt, helveticaBold, "Devise", mm(margin + 3), mm(y + 5), 9, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Total dépenses", mm(margin + 50), mm(y + 5), 9, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Nombre", mm(margin + 130), mm(y + 5), 9, WHITE);
    y += 7;

    summary.depenses.forEach((d, i) => {
      drawZebraRowBg(y, i);
      drawText(page, pageHeightPt, helvetica, d.devise, mm(margin + 3), mm(y + 5), 9, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, formatMoney(d.total, d.devise), mm(margin + 50), mm(y + 5), 9, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, String(d.count), mm(margin + 130), mm(y + 5), 9, SLATE_DARK);
      y += 7;
    });
  }

  y += 8;

  drawText(page, pageHeightPt, helveticaBold, "Dépenses en attente de validation", mm(margin), mm(y), 11, AMBER);
  y += 7;

  if (summary.depensesEnAttente.length === 0) {
    drawText(page, pageHeightPt, helveticaItalic, "Aucune dépense en attente", mm(margin), mm(y), 9, SLATE_MID);
    y += 8;
  } else {
    summary.depensesEnAttente.forEach((d) => {
      drawText(
        page, pageHeightPt, helvetica,
        `${d.devise} : ${formatMoney(d.total, d.devise)} sur ${d.count} dépense(s)`,
        mm(margin + 5), mm(y), 9, SLATE_DARK
      );
      y += 6;
    });
  }

  drawPageFooter();

  // ============================================================
  // PAGE 4 : TOP SERVICES + TOP AGENTS
  // ============================================================
  page = pdfDoc.addPage([mm(pageWidth), pageHeightPt]);
  pageNum++;
  drawPageHeader(pageNum, totalPages);
  y = 25;

  drawText(page, pageHeightPt, helveticaBold, "PERFORMANCES DU MOIS", mm(margin), mm(y), 16, NEXUS_BLUE);
  y += 12;

  drawText(page, pageHeightPt, helveticaBold, "Top services (caisse rapide)", mm(margin), mm(y), 11, NEXUS_ORANGE);
  y += 7;

  if (summary.topServices.length === 0) {
    drawText(page, pageHeightPt, helveticaItalic, "Aucune donnée", mm(margin), mm(y), 9, SLATE_MID);
    y += 8;
  } else {
    drawTableHeaderBar(y);
    drawText(page, pageHeightPt, helveticaBold, "#", mm(margin + 3), mm(y + 5), 9, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Service", mm(margin + 12), mm(y + 5), 9, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Total", mm(margin + 90), mm(y + 5), 9, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Nb ventes", mm(margin + 140), mm(y + 5), 9, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Devise", mm(margin + 175), mm(y + 5), 9, WHITE);
    y += 7;

    summary.topServices.slice(0, 10).forEach((s, i) => {
      drawZebraRowBg(y, i);
      drawText(page, pageHeightPt, helvetica, `${i + 1}`, mm(margin + 3), mm(y + 5), 9, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, SERVICE_LABELS[s.service] || s.service, mm(margin + 12), mm(y + 5), 9, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, formatMoney(s.total, ""), mm(margin + 90), mm(y + 5), 9, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, String(s.count), mm(margin + 140), mm(y + 5), 9, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, s.devise, mm(margin + 175), mm(y + 5), 9, SLATE_DARK);
      y += 7;
    });
  }

  y += 8;

  drawText(page, pageHeightPt, helveticaBold, "Top agents (par encaissements)", mm(margin), mm(y), 11, NEXUS_ORANGE);
  y += 7;

  if (summary.topAgents.length === 0) {
    drawText(page, pageHeightPt, helveticaItalic, "Aucune donnée", mm(margin), mm(y), 9, SLATE_MID);
  } else {
    drawTableHeaderBar(y);
    drawText(page, pageHeightPt, helveticaBold, "#", mm(margin + 3), mm(y + 5), 9, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Agent", mm(margin + 12), mm(y + 5), 9, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Paiements", mm(margin + 70), mm(y + 5), 9, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Caisse", mm(margin + 110), mm(y + 5), 9, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Total", mm(margin + 145), mm(y + 5), 9, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Devise", mm(margin + 175), mm(y + 5), 9, WHITE);
    y += 7;

    summary.topAgents.slice(0, 10).forEach((a, i) => {
      drawZebraRowBg(y, i);
      drawText(page, pageHeightPt, helvetica, `${i + 1}`, mm(margin + 3), mm(y + 5), 9, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, a.nom.substring(0, 28), mm(margin + 12), mm(y + 5), 9, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, formatMoney(a.paiements, ""), mm(margin + 70), mm(y + 5), 9, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, formatMoney(a.caisse, ""), mm(margin + 110), mm(y + 5), 9, SLATE_DARK);
      drawText(page, pageHeightPt, helveticaBold, formatMoney(a.total, ""), mm(margin + 145), mm(y + 5), 9, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, a.devise, mm(margin + 175), mm(y + 5), 9, SLATE_DARK);
      y += 7;
    });
  }

  drawPageFooter();

  // ============================================================
  // PAGE 5 : PAIEMENTS PARTIELS (CREANCES)
  // ============================================================
  page = pdfDoc.addPage([mm(pageWidth), pageHeightPt]);
  pageNum++;
  drawPageHeader(pageNum, totalPages);
  y = 25;

  drawText(page, pageHeightPt, helveticaBold, "CRÉANCES CLIENTS", mm(margin), mm(y), 16, NEXUS_BLUE);

  y += 6;
  drawText(page, pageHeightPt, helveticaItalic, "Paiements partiels - montants restant à encaisser", mm(margin), mm(y), 9, SLATE_MID);
  y += 12;

  if (summary.partiels.length === 0) {
    drawText(page, pageHeightPt, helveticaItalic, "✓ Aucune créance en cours - tous les paiements sont à jour", mm(margin), mm(y), 10, GREEN);
  } else {
    drawTableHeaderBar(y);
    drawText(page, pageHeightPt, helveticaBold, "Référence", mm(margin + 3), mm(y + 5), 8, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Client", mm(margin + 35), mm(y + 5), 8, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Service", mm(margin + 75), mm(y + 5), 8, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Total", mm(margin + 115), mm(y + 5), 8, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Reçu", mm(margin + 145), mm(y + 5), 8, WHITE);
    drawText(page, pageHeightPt, helveticaBold, "Restant", mm(margin + 170), mm(y + 5), 8, WHITE);
    y += 7;

    const totalRestantParDevise: Record<string, number> = {};

    summary.partiels.forEach((p, i) => {
      if (y > pageHeight - 30) {
        // Nouvelle page si on deborde. `pageNum` n'est pas incremente ici
        // (bug preexistant jsPDF, "Page X/5" se repeterait) -- porte tel
        // quel, voir docs/DETTE.md.
        drawPageFooter();
        page = pdfDoc.addPage([mm(pageWidth), pageHeightPt]);
        drawPageHeader(pageNum, totalPages);
        y = 25;
      }

      drawZebraRowBg(y, i, 6);
      drawText(page, pageHeightPt, helvetica, (p.reference || "—").substring(0, 16), mm(margin + 3), mm(y + 4), 8, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, p.client_nom.substring(0, 20), mm(margin + 35), mm(y + 4), 8, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, p.service.substring(0, 20), mm(margin + 75), mm(y + 4), 8, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, formatMoney(p.montant_total, ""), mm(margin + 115), mm(y + 4), 8, SLATE_DARK);
      drawText(page, pageHeightPt, helvetica, formatMoney(p.montant_recu, ""), mm(margin + 145), mm(y + 4), 8, SLATE_DARK);
      drawText(page, pageHeightPt, helveticaBold, formatMoney(p.restant, p.devise), mm(margin + 170), mm(y + 4), 8, NEXUS_ORANGE);
      y += 6;

      if (!totalRestantParDevise[p.devise]) totalRestantParDevise[p.devise] = 0;
      totalRestantParDevise[p.devise] += p.restant;
    });

    y += 4;
    drawFilledRect(page, pageHeightPt, mm(margin), mm(y), mm(pageWidth - 2 * margin), mm(8), NEXUS_ORANGE);
    drawText(page, pageHeightPt, helveticaBold, "TOTAL CRÉANCES", mm(margin + 3), mm(y + 5), 10, WHITE);
    const totalText = Object.entries(totalRestantParDevise)
      .map(([d, t]) => formatMoney(t, d))
      .join(" + ");
    drawText(page, pageHeightPt, helveticaBold, totalText, mm(pageWidth - margin - 3), mm(y + 5), 10, WHITE, "right");
  }

  drawPageFooter();

  return pdfDoc.save();
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================
export function MonthlyReportGenerator({
  currentUserName,
}: {
  currentUserName: string;
}) {
  const supabase = createClient();

  // Mois selectionne par defaut : mois precedent
  const getDefaultMonth = () => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getDefaultMonth());
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [generating, setGenerating] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [emailDest, setEmailDest] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const monthBounds = useMemo(() => getMonthBounds(selectedMonth), [selectedMonth]);

  // ============================================================
  // CHARGER LES DONNEES DU MOIS
  // ============================================================
  const loadMonthData = async () => {
    setLoading(true);
    setSummary(null);

    try {
      const [
        paiementsRes,
        caisseRes,
        depensesValideesRes,
        depensesAttenteRes,
        transfertsRes,
        partielsRes,
        agentsRes,
      ] = await Promise.all([
        supabase
          .from("payments")
          .select("montant_recu, montant_total, devise, agent_id, client_nom, service, reference")
          .gte("date_paiement", monthBounds.start)
          .lte("date_paiement", monthBounds.end),
        supabase
          .from("quick_sales")
          .select("montant_total, devise, type_service, agent_id, quantite")
          .gte("date_paiement", monthBounds.start)
          .lte("date_paiement", monthBounds.end),
        supabase
          .from("expenses")
          .select("montant, devise, statut")
          .eq("statut", "valide")
          .gte("date_depense", monthBounds.start)
          .lte("date_depense", monthBounds.end),
        supabase
          .from("expenses")
          .select("montant, devise")
          .eq("statut", "en_attente")
          .gte("date_depense", monthBounds.start)
          .lte("date_depense", monthBounds.end),
        supabase
          .from("transferts")
          .select("montant_envoye, frais_transfert, devise, statut")
          .eq("statut", "effectue")
          .gte("created_at", monthBounds.start)
          .lte("created_at", monthBounds.end),
        // Paiements partiels (toutes périodes - créances en cours)
        supabase
          .from("payments")
          .select("reference, client_nom, service, montant_total, montant_recu, devise")
          .eq("status", "partial")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("profiles")
          .select("id, nom, prenom"),
      ]);

      const paiementsData = paiementsRes.data || [];
      const caisseData = caisseRes.data || [];
      const depensesData = depensesValideesRes.data || [];
      const depensesAttenteData = depensesAttenteRes.data || [];
      const transfertsData = transfertsRes.data || [];
      const partielsData = partielsRes.data || [];
      const agents = agentsRes.data || [];

      // Agrégation paiements par devise (avec montant restant)
      const paiementsByDevise: Record<
        string,
        { total: number; count: number; restant: number }
      > = {};
      paiementsData.forEach((p) => {
        const d = p.devise || "XAF";
        if (!paiementsByDevise[d])
          paiementsByDevise[d] = { total: 0, count: 0, restant: 0 };
        paiementsByDevise[d].total += Number(p.montant_recu || 0);
        paiementsByDevise[d].count += 1;
        paiementsByDevise[d].restant +=
          Number(p.montant_total || 0) - Number(p.montant_recu || 0);
      });

      const paiements = Object.entries(paiementsByDevise).map(([devise, data]) => ({
        devise,
        total: data.total,
        count: data.count,
        restant: Math.max(0, data.restant),
      }));

      // Caisse par devise
      const caisse = aggregateByDevise(caisseData, (c) =>
        Number(c.montant_total || 0)
      );

      // Depenses
      const depenses = aggregateByDevise(depensesData, (d) =>
        Number(d.montant || 0)
      );
      const depensesEnAttente = aggregateByDevise(depensesAttenteData, (d) =>
        Number(d.montant || 0)
      );

      // Transferts
      const transfertsByDevise: Record<
        string,
        { total: number; frais: number; count: number }
      > = {};
      transfertsData.forEach((t) => {
        const d = t.devise || "XAF";
        if (!transfertsByDevise[d])
          transfertsByDevise[d] = { total: 0, frais: 0, count: 0 };
        transfertsByDevise[d].total += Number(t.montant_envoye || 0);
        transfertsByDevise[d].frais += Number(t.frais_transfert || 0);
        transfertsByDevise[d].count += 1;
      });
      const transferts = Object.entries(transfertsByDevise).map(([devise, data]) => ({
        devise,
        total: data.total,
        frais: data.frais,
        count: data.count,
      }));

      // Top services caisse
      const servicesMap: Record<
        string,
        Record<string, { total: number; count: number }>
      > = {};
      caisseData.forEach((c) => {
        const service = c.type_service || "autre";
        const devise = c.devise || "XAF";
        if (!servicesMap[service]) servicesMap[service] = {};
        if (!servicesMap[service][devise])
          servicesMap[service][devise] = { total: 0, count: 0 };
        servicesMap[service][devise].total += Number(c.montant_total || 0);
        servicesMap[service][devise].count += Number(c.quantite || 1);
      });
      const topServices: MonthSummary["topServices"] = [];
      Object.entries(servicesMap).forEach(([service, devises]) => {
        Object.entries(devises).forEach(([devise, data]) => {
          topServices.push({
            service,
            total: data.total,
            count: data.count,
            devise,
          });
        });
      });
      topServices.sort((a, b) => b.total - a.total);

      // Top agents
      const agentsMap: Record<
        string,
        Record<string, { paiements: number; caisse: number }>
      > = {};
      paiementsData.forEach((p) => {
        if (!p.agent_id) return;
        const devise = p.devise || "XAF";
        if (!agentsMap[p.agent_id]) agentsMap[p.agent_id] = {};
        if (!agentsMap[p.agent_id][devise])
          agentsMap[p.agent_id][devise] = { paiements: 0, caisse: 0 };
        agentsMap[p.agent_id][devise].paiements += Number(p.montant_recu || 0);
      });
      caisseData.forEach((c) => {
        if (!c.agent_id) return;
        const devise = c.devise || "XAF";
        if (!agentsMap[c.agent_id]) agentsMap[c.agent_id] = {};
        if (!agentsMap[c.agent_id][devise])
          agentsMap[c.agent_id][devise] = { paiements: 0, caisse: 0 };
        agentsMap[c.agent_id][devise].caisse += Number(c.montant_total || 0);
      });

      const topAgents: MonthSummary["topAgents"] = [];
      Object.entries(agentsMap).forEach(([agentId, devises]) => {
        const agent = agents.find((a) => a.id === agentId);
        if (!agent) return;
        const nom = [agent.prenom, agent.nom].filter(Boolean).join(" ") || "—";
        Object.entries(devises).forEach(([devise, data]) => {
          topAgents.push({
            nom,
            paiements: data.paiements,
            caisse: data.caisse,
            total: data.paiements + data.caisse,
            devise,
          });
        });
      });
      topAgents.sort((a, b) => b.total - a.total);

      // Partiels
      const partiels: MonthSummary["partiels"] = partielsData.map((p) => ({
        reference: p.reference,
        client_nom: p.client_nom || "—",
        service: p.service || "—",
        montant_total: Number(p.montant_total || 0),
        montant_recu: Number(p.montant_recu || 0),
        restant: Number(p.montant_total || 0) - Number(p.montant_recu || 0),
        devise: p.devise || "XAF",
      }));

      setSummary({
        paiements,
        caisse,
        depenses,
        depensesEnAttente,
        transferts,
        topServices,
        topAgents,
        partiels,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      toast.error("Erreur chargement : " + msg);
    } finally {
      setLoading(false);
    }
  };

  // Charger automatiquement quand le mois change
  useEffect(() => {
    loadMonthData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  // ============================================================
  // ACTIONS PDF
  // ============================================================
  const handleDownload = async () => {
    if (!summary) return;
    setGenerating(true);
    try {
      const bytes = await generateReportPDF(summary, monthBounds.label, currentUserName);
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Rapport_Nexus_${selectedMonth}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Rapport téléchargé");
    } catch (err) {
      console.error(err);
      toast.error("Erreur génération PDF");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = async () => {
    if (!summary) return;
    setGenerating(true);
    try {
      const bytes = await generateReportPDF(summary, monthBounds.label, currentUserName);
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const w = window.open(url, "_blank");
      if (w) {
        w.addEventListener("load", () => {
          setTimeout(() => w.print(), 500);
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur impression");
    } finally {
      setGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!summary || !emailDest.trim()) {
      toast.error("Email destinataire requis");
      return;
    }
    setSendingEmail(true);
    try {
      const bytes = await generateReportPDF(summary, monthBounds.label, currentUserName);
      const base64 = uint8ArrayToBase64(bytes);

      const response = await fetch("/api/payments/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: `report-${selectedMonth}`, // ID factice pour l API
          recipient_email: emailDest.trim(),
          pdf_base64: base64,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erreur");

      toast.success("Rapport envoyé par email");
      setEmailModal(false);
      setEmailDest("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur";
      toast.error(msg);
    } finally {
      setSendingEmail(false);
    }
  };

  // ============================================================
  // GENERER LES OPTIONS DE MOIS (12 derniers)
  // ============================================================
  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label =
        d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
      options.push({
        value,
        label: label.charAt(0).toUpperCase() + label.slice(1),
      });
    }
    return options;
  }, []);

  // ============================================================
  // CALCULS APERCU
  // ============================================================
  const apercu = useMemo(() => {
    if (!summary) return null;
    const totalsParDevise: Record<
      string,
      {
        encaissements: number;
        depenses: number;
        solde: number;
      }
    > = {};
    [...summary.paiements, ...summary.caisse].forEach((row) => {
      if (!totalsParDevise[row.devise])
        totalsParDevise[row.devise] = { encaissements: 0, depenses: 0, solde: 0 };
      totalsParDevise[row.devise].encaissements += row.total;
    });
    summary.depenses.forEach((row) => {
      if (!totalsParDevise[row.devise])
        totalsParDevise[row.devise] = { encaissements: 0, depenses: 0, solde: 0 };
      totalsParDevise[row.devise].depenses += row.total;
    });
    Object.keys(totalsParDevise).forEach((d) => {
      totalsParDevise[d].solde =
        totalsParDevise[d].encaissements - totalsParDevise[d].depenses;
    });
    return totalsParDevise;
  }, [summary]);

  return (
    <div className="space-y-6">
      {/* SELECTEUR DE MOIS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Mois du rapport
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-nexus-blue-950 focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30 sm:max-w-xs"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!summary || generating}
              className="inline-flex items-center gap-1.5 rounded-full bg-nexus-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 hover:bg-nexus-orange-600 disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Télécharger PDF
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={!summary || generating}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Printer className="h-4 w-4" />
              Imprimer
            </button>
            <button
              type="button"
              onClick={() => setEmailModal(true)}
              disabled={!summary}
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
            >
              <Mail className="h-4 w-4" />
              Envoyer par email
            </button>
          </div>
        </div>
      </div>

      {/* APERCU */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-nexus-orange-500" />
          <p className="mt-3 text-sm text-slate-600">
            Chargement des données du mois...
          </p>
        </div>
      )}

      {!loading && summary && apercu && (
        <>
          {/* Header apercu */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-nexus-blue-950 to-nexus-blue-800 p-6 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-nexus-orange-400">
                  Aperçu du rapport
                </p>
                <h2 className="mt-1 font-display text-3xl font-bold">
                  {monthBounds.label}
                </h2>
              </div>
              <Calendar className="h-8 w-8 text-nexus-orange-400" />
            </div>
          </div>

          {/* Soldes par devise */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(apercu).map(([devise, data]) => (
              <div
                key={devise}
                className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-nexus-blue-100 px-2.5 py-0.5 text-xs font-bold text-nexus-blue-700">
                    {devise}
                  </span>
                  {data.solde >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <p className="mt-3 text-xs text-slate-500">Encaissements</p>
                <p className="font-display text-lg font-bold text-green-600">
                  +{formatMoney(data.encaissements, devise)}
                </p>
                <p className="mt-2 text-xs text-slate-500">Dépenses</p>
                <p className="font-display text-lg font-bold text-red-600">
                  -{formatMoney(data.depenses, devise)}
                </p>
                <div className="mt-3 border-t border-slate-200 pt-3">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Solde net
                  </p>
                  <p
                    className={`font-display text-2xl font-bold ${
                      data.solde >= 0 ? "text-nexus-blue-950" : "text-red-700"
                    }`}
                  >
                    {data.solde >= 0 ? "+" : ""}
                    {formatMoney(data.solde, devise)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats inline */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatBlock
              icon={Wallet}
              label="Paiements (gros)"
              value={summary.paiements
                .reduce((s, p) => s + p.count, 0)
                .toString()}
              sub={`${summary.paiements.length} devise(s)`}
              color="text-nexus-orange-600"
            />
            <StatBlock
              icon={ShoppingCart}
              label="Ventes caisse"
              value={summary.caisse
                .reduce((s, c) => s + c.count, 0)
                .toString()}
              sub="Petits services"
              color="text-purple-600"
            />
            <StatBlock
              icon={Send}
              label="Transferts"
              value={summary.transferts
                .reduce((s, t) => s + t.count, 0)
                .toString()}
              sub="Effectués"
              color="text-indigo-600"
            />
            <StatBlock
              icon={AlertCircle}
              label="Créances"
              value={summary.partiels.length.toString()}
              sub={
                summary.partiels.length > 0
                  ? "Paiements partiels"
                  : "Aucune créance"
              }
              color={
                summary.partiels.length > 0 ? "text-amber-600" : "text-green-600"
              }
            />
          </div>

          {/* Top 3 services et agents */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                <ShoppingCart className="h-4 w-4 text-purple-600" />
                Top services (caisse)
              </h3>
              {summary.topServices.length === 0 ? (
                <p className="text-sm text-slate-500">Aucune vente</p>
              ) : (
                <div className="space-y-2">
                  {summary.topServices.slice(0, 5).map((s, i) => (
                    <div
                      key={`${s.service}-${s.devise}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-slate-700">
                        <span className="mr-2 font-mono text-xs text-slate-400">
                          #{i + 1}
                        </span>
                        {SERVICE_LABELS[s.service] || s.service}
                      </span>
                      <span className="font-semibold text-nexus-blue-950">
                        {formatMoney(s.total, s.devise)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                <Users className="h-4 w-4 text-nexus-orange-600" />
                Top agents (encaissements)
              </h3>
              {summary.topAgents.length === 0 ? (
                <p className="text-sm text-slate-500">Aucune donnée</p>
              ) : (
                <div className="space-y-2">
                  {summary.topAgents.slice(0, 5).map((a, i) => (
                    <div
                      key={`${a.nom}-${a.devise}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-slate-700">
                        <span className="mr-2 font-mono text-xs text-slate-400">
                          #{i + 1}
                        </span>
                        {a.nom}
                      </span>
                      <span className="font-semibold text-nexus-blue-950">
                        {formatMoney(a.total, a.devise)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Note */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <p>
              <strong>📄 Le rapport PDF contient 5 pages :</strong> Résumé
              exécutif, Détail des encaissements, Détail des dépenses,
              Performances (top services + top agents), Créances clients
              (paiements partiels).
            </p>
          </div>
        </>
      )}

      {/* MODAL EMAIL */}
      {emailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setEmailModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                  Envoyer le rapport par email
                </h3>
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
                value={emailDest}
                onChange={(e) => setEmailDest(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
                placeholder="comptable@exemple.com"
              />
              <p className="mt-2 text-xs text-slate-500">
                Le PDF sera envoyé en pièce jointe depuis noreply@nexusrca.com.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEmailModal(false)}
                disabled={sendingEmail}
                className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {sendingEmail ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBlock({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 font-display text-xl font-bold text-nexus-blue-950">
            {value}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
        </div>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
    </div>
  );
}
