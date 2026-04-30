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
import jsPDF from "jspdf";
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
function generateReportPDF(
  summary: MonthSummary,
  monthLabel: string,
  generatedBy: string
): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;

  const NEXUS_BLUE: [number, number, number] = [12, 28, 64];
  const NEXUS_ORANGE: [number, number, number] = [255, 102, 0];
  const SLATE_DARK: [number, number, number] = [30, 41, 59];
  const SLATE_MID: [number, number, number] = [100, 116, 139];
  const SLATE_LIGHT: [number, number, number] = [226, 232, 240];

  // ============================================================
  // HELPER : header de page commun
  // ============================================================
  const drawPageHeader = (pageNum: number, totalPages: number) => {
    // Bandeau orange en haut
    doc.setFillColor(...NEXUS_ORANGE);
    doc.rect(0, 0, pageWidth, 5, "F");

    // Titre + numero de page
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NEXUS_BLUE);
    doc.text("NEXUS RCA", margin, 11);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...SLATE_MID);
    doc.text(
      `Rapport financier - ${monthLabel}`,
      pageWidth / 2,
      11,
      { align: "center" }
    );

    doc.text(`Page ${pageNum}/${totalPages}`, pageWidth - margin, 11, {
      align: "right",
    });

    // Trait sous le header
    doc.setDrawColor(...SLATE_LIGHT);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);
  };

  const drawPageFooter = () => {
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...SLATE_MID);
    doc.text(
      "Document confidentiel · Nexus RCA · contact@nexusrca.com · +236 73 26 96 92",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.setFillColor(...NEXUS_ORANGE);
    doc.rect(0, pageHeight - 4, pageWidth, 4, "F");
  };

  const totalPages = 5;
  let pageNum = 1;

  // ============================================================
  // PAGE 1 : RESUME EXECUTIF
  // ============================================================
  drawPageHeader(pageNum, totalPages);
  let y = 25;

  // Titre principal
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_BLUE);
  doc.text("RAPPORT FINANCIER MENSUEL", margin, y);

  y += 8;
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...NEXUS_ORANGE);
  doc.text(monthLabel, margin, y);

  y += 12;
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_MID);
  doc.text(`Généré le ${new Date().toLocaleString("fr-FR")} par ${generatedBy}`, margin, y);

  y += 15;

  // Section "Encaissements"
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_ORANGE);
  doc.text("ENCAISSEMENTS DU MOIS", margin, y);
  y += 7;

  // Tableau encaissements par devise
  doc.setFontSize(9);
  const allDevises = new Set<string>();
  summary.paiements.forEach((p) => allDevises.add(p.devise));
  summary.caisse.forEach((c) => allDevises.add(c.devise));
  const devises = Array.from(allDevises).sort();

  if (devises.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...SLATE_MID);
    doc.text("Aucun encaissement ce mois", margin, y);
    y += 8;
  } else {
    devises.forEach((devise) => {
      const paie = summary.paiements.find((p) => p.devise === devise);
      const caisse = summary.caisse.find((c) => c.devise === devise);
      const totalDevise =
        (paie?.total || 0) + (caisse?.total || 0);

      // Bloc devise
      doc.setFillColor(252, 252, 253);
      doc.setDrawColor(...SLATE_LIGHT);
      doc.roundedRect(margin, y, pageWidth - 2 * margin, 22, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...NEXUS_BLUE);
      doc.text(`Total ${devise}`, margin + 5, y + 7);
      doc.setFontSize(14);
      doc.setTextColor(...NEXUS_ORANGE);
      doc.text(formatMoney(totalDevise, devise), pageWidth - margin - 5, y + 7, {
        align: "right",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...SLATE_MID);
      doc.text(
        `Paiements : ${formatMoney(paie?.total || 0, devise)} (${paie?.count || 0} transactions)`,
        margin + 5,
        y + 14
      );
      doc.text(
        `Caisse rapide : ${formatMoney(caisse?.total || 0, devise)} (${caisse?.count || 0} ventes)`,
        margin + 5,
        y + 18
      );

      y += 26;
    });
  }

  // Section "Dépenses"
  y += 4;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_ORANGE);
  doc.text("DÉPENSES DU MOIS", margin, y);
  y += 7;

  if (summary.depenses.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_MID);
    doc.text("Aucune dépense validée ce mois", margin, y);
    y += 6;
  } else {
    summary.depenses.forEach((d) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...SLATE_DARK);
      doc.text(
        `${d.devise} : ${formatMoney(d.total, d.devise)} (${d.count} dépenses)`,
        margin + 5,
        y
      );
      y += 5;
    });
  }

  if (summary.depensesEnAttente.length > 0) {
    y += 2;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(245, 158, 11);
    summary.depensesEnAttente.forEach((d) => {
      doc.text(
        `⚠ En attente de validation : ${formatMoney(d.total, d.devise)} (${d.count})`,
        margin + 5,
        y
      );
      y += 4;
    });
  }

  // Section "Solde net"
  y += 6;
  doc.setFillColor(...NEXUS_BLUE);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 30, 3, 3, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("SOLDE NET PAR DEVISE", margin + 5, y + 8);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  let soldeY = y + 14;
  devises.forEach((devise) => {
    const paieTotal = summary.paiements.find((p) => p.devise === devise)?.total || 0;
    const caisseTotal = summary.caisse.find((c) => c.devise === devise)?.total || 0;
    const depenseTotal = summary.depenses.find((d) => d.devise === devise)?.total || 0;
    const solde = paieTotal + caisseTotal - depenseTotal;

    doc.text(`${devise} :`, margin + 5, soldeY);
    doc.setFont("helvetica", "bold");
    if (solde >= 0) {
      doc.setTextColor(34, 197, 94);
    } else {
      doc.setTextColor(239, 68, 68);
    }
    doc.setFontSize(11);
    doc.text(formatMoney(solde, devise), margin + 30, soldeY);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255);
    soldeY += 5;
  });

  // Stats globales
  y += 36;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_ORANGE);
  doc.text("EN UN COUP D'ŒIL", margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_DARK);

  const totalPaiementsCount = summary.paiements.reduce((s, p) => s + p.count, 0);
  const totalCaisseCount = summary.caisse.reduce((s, c) => s + c.count, 0);
  const totalTransfertsCount = summary.transferts.reduce((s, t) => s + t.count, 0);
  const totalPartiels = summary.partiels.length;

  doc.text(`• ${totalPaiementsCount} paiement(s) clients enregistré(s)`, margin + 3, y);
  y += 5;
  doc.text(`• ${totalCaisseCount} vente(s) caisse rapide`, margin + 3, y);
  y += 5;
  doc.text(`• ${totalTransfertsCount} transfert(s) effectué(s)`, margin + 3, y);
  y += 5;
  doc.text(`• ${totalPartiels} créance(s) client en cours (paiements partiels)`, margin + 3, y);

  drawPageFooter();

  // ============================================================
  // PAGE 2 : DETAIL ENCAISSEMENTS
  // ============================================================
  doc.addPage();
  pageNum++;
  drawPageHeader(pageNum, totalPages);
  y = 25;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_BLUE);
  doc.text("DÉTAIL DES ENCAISSEMENTS", margin, y);
  y += 12;

  // Tableau Paiements gros dossiers
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_ORANGE);
  doc.text("Paiements (gros dossiers)", margin, y);
  y += 7;

  if (summary.paiements.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_MID);
    doc.text("Aucun paiement ce mois", margin, y);
    y += 8;
  } else {
    // Header tableau
    doc.setFillColor(...NEXUS_BLUE);
    doc.rect(margin, y, pageWidth - 2 * margin, 7, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Devise", margin + 3, y + 5);
    doc.text("Total reçu", margin + 50, y + 5);
    doc.text("Restant à recevoir", margin + 100, y + 5);
    doc.text("Nb transactions", margin + 150, y + 5);
    y += 7;

    summary.paiements.forEach((p, i) => {
      if (i % 2 === 1) {
        doc.setFillColor(252, 252, 253);
        doc.rect(margin, y, pageWidth - 2 * margin, 7, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...SLATE_DARK);
      doc.text(p.devise, margin + 3, y + 5);
      doc.text(formatMoney(p.total, p.devise), margin + 50, y + 5);
      doc.text(formatMoney(p.restant, p.devise), margin + 100, y + 5);
      doc.text(String(p.count), margin + 150, y + 5);
      y += 7;
    });
  }

  y += 8;

  // Tableau Caisse rapide
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_ORANGE);
  doc.text("Caisse rapide (petits services)", margin, y);
  y += 7;

  if (summary.caisse.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_MID);
    doc.text("Aucune vente caisse ce mois", margin, y);
    y += 8;
  } else {
    doc.setFillColor(...NEXUS_BLUE);
    doc.rect(margin, y, pageWidth - 2 * margin, 7, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Devise", margin + 3, y + 5);
    doc.text("Total encaissé", margin + 50, y + 5);
    doc.text("Nb ventes", margin + 130, y + 5);
    y += 7;

    summary.caisse.forEach((c, i) => {
      if (i % 2 === 1) {
        doc.setFillColor(252, 252, 253);
        doc.rect(margin, y, pageWidth - 2 * margin, 7, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...SLATE_DARK);
      doc.text(c.devise, margin + 3, y + 5);
      doc.text(formatMoney(c.total, c.devise), margin + 50, y + 5);
      doc.text(String(c.count), margin + 130, y + 5);
      y += 7;
    });
  }

  // Transferts
  y += 8;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_ORANGE);
  doc.text("Transferts effectués", margin, y);
  y += 7;

  if (summary.transferts.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_MID);
    doc.text("Aucun transfert ce mois", margin, y);
  } else {
    doc.setFillColor(...NEXUS_BLUE);
    doc.rect(margin, y, pageWidth - 2 * margin, 7, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Devise", margin + 3, y + 5);
    doc.text("Montant transféré", margin + 50, y + 5);
    doc.text("Frais collectés", margin + 110, y + 5);
    doc.text("Nb", margin + 165, y + 5);
    y += 7;

    summary.transferts.forEach((t, i) => {
      if (i % 2 === 1) {
        doc.setFillColor(252, 252, 253);
        doc.rect(margin, y, pageWidth - 2 * margin, 7, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...SLATE_DARK);
      doc.text(t.devise, margin + 3, y + 5);
      doc.text(formatMoney(t.total, t.devise), margin + 50, y + 5);
      doc.text(formatMoney(t.frais, t.devise), margin + 110, y + 5);
      doc.text(String(t.count), margin + 165, y + 5);
      y += 7;
    });
  }

  drawPageFooter();

  // ============================================================
  // PAGE 3 : DETAIL DEPENSES
  // ============================================================
  doc.addPage();
  pageNum++;
  drawPageHeader(pageNum, totalPages);
  y = 25;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_BLUE);
  doc.text("DÉTAIL DES DÉPENSES", margin, y);
  y += 12;

  // Validees
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_ORANGE);
  doc.text("Dépenses validées", margin, y);
  y += 7;

  if (summary.depenses.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_MID);
    doc.text("Aucune dépense validée", margin, y);
    y += 8;
  } else {
    doc.setFillColor(...NEXUS_BLUE);
    doc.rect(margin, y, pageWidth - 2 * margin, 7, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Devise", margin + 3, y + 5);
    doc.text("Total dépenses", margin + 50, y + 5);
    doc.text("Nombre", margin + 130, y + 5);
    y += 7;

    summary.depenses.forEach((d, i) => {
      if (i % 2 === 1) {
        doc.setFillColor(252, 252, 253);
        doc.rect(margin, y, pageWidth - 2 * margin, 7, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...SLATE_DARK);
      doc.text(d.devise, margin + 3, y + 5);
      doc.text(formatMoney(d.total, d.devise), margin + 50, y + 5);
      doc.text(String(d.count), margin + 130, y + 5);
      y += 7;
    });
  }

  y += 8;

  // En attente
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(245, 158, 11);
  doc.text("Dépenses en attente de validation", margin, y);
  y += 7;

  if (summary.depensesEnAttente.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_MID);
    doc.text("Aucune dépense en attente", margin, y);
    y += 8;
  } else {
    summary.depensesEnAttente.forEach((d) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...SLATE_DARK);
      doc.text(
        `${d.devise} : ${formatMoney(d.total, d.devise)} sur ${d.count} dépense(s)`,
        margin + 5,
        y
      );
      y += 6;
    });
  }

  drawPageFooter();

  // ============================================================
  // PAGE 4 : TOP SERVICES + TOP AGENTS
  // ============================================================
  doc.addPage();
  pageNum++;
  drawPageHeader(pageNum, totalPages);
  y = 25;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_BLUE);
  doc.text("PERFORMANCES DU MOIS", margin, y);
  y += 12;

  // Top services caisse
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_ORANGE);
  doc.text("Top services (caisse rapide)", margin, y);
  y += 7;

  if (summary.topServices.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_MID);
    doc.text("Aucune donnée", margin, y);
    y += 8;
  } else {
    doc.setFillColor(...NEXUS_BLUE);
    doc.rect(margin, y, pageWidth - 2 * margin, 7, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("#", margin + 3, y + 5);
    doc.text("Service", margin + 12, y + 5);
    doc.text("Total", margin + 90, y + 5);
    doc.text("Nb ventes", margin + 140, y + 5);
    doc.text("Devise", margin + 175, y + 5);
    y += 7;

    summary.topServices.slice(0, 10).forEach((s, i) => {
      if (i % 2 === 1) {
        doc.setFillColor(252, 252, 253);
        doc.rect(margin, y, pageWidth - 2 * margin, 7, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...SLATE_DARK);
      doc.text(`${i + 1}`, margin + 3, y + 5);
      doc.text(SERVICE_LABELS[s.service] || s.service, margin + 12, y + 5);
      doc.text(formatMoney(s.total, ""), margin + 90, y + 5);
      doc.text(String(s.count), margin + 140, y + 5);
      doc.text(s.devise, margin + 175, y + 5);
      y += 7;
    });
  }

  y += 8;

  // Top agents
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_ORANGE);
  doc.text("Top agents (par encaissements)", margin, y);
  y += 7;

  if (summary.topAgents.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_MID);
    doc.text("Aucune donnée", margin, y);
  } else {
    doc.setFillColor(...NEXUS_BLUE);
    doc.rect(margin, y, pageWidth - 2 * margin, 7, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("#", margin + 3, y + 5);
    doc.text("Agent", margin + 12, y + 5);
    doc.text("Paiements", margin + 70, y + 5);
    doc.text("Caisse", margin + 110, y + 5);
    doc.text("Total", margin + 145, y + 5);
    doc.text("Devise", margin + 175, y + 5);
    y += 7;

    summary.topAgents.slice(0, 10).forEach((a, i) => {
      if (i % 2 === 1) {
        doc.setFillColor(252, 252, 253);
        doc.rect(margin, y, pageWidth - 2 * margin, 7, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...SLATE_DARK);
      doc.text(`${i + 1}`, margin + 3, y + 5);
      doc.text(a.nom.substring(0, 28), margin + 12, y + 5);
      doc.text(formatMoney(a.paiements, ""), margin + 70, y + 5);
      doc.text(formatMoney(a.caisse, ""), margin + 110, y + 5);
      doc.setFont("helvetica", "bold");
      doc.text(formatMoney(a.total, ""), margin + 145, y + 5);
      doc.setFont("helvetica", "normal");
      doc.text(a.devise, margin + 175, y + 5);
      y += 7;
    });
  }

  drawPageFooter();

  // ============================================================
  // PAGE 5 : PAIEMENTS PARTIELS (CREANCES)
  // ============================================================
  doc.addPage();
  pageNum++;
  drawPageHeader(pageNum, totalPages);
  y = 25;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NEXUS_BLUE);
  doc.text("CRÉANCES CLIENTS", margin, y);

  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...SLATE_MID);
  doc.text("Paiements partiels - montants restant à encaisser", margin, y);
  y += 12;

  if (summary.partiels.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(34, 197, 94);
    doc.text("✓ Aucune créance en cours - tous les paiements sont à jour", margin, y);
  } else {
    doc.setFillColor(...NEXUS_BLUE);
    doc.rect(margin, y, pageWidth - 2 * margin, 7, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Référence", margin + 3, y + 5);
    doc.text("Client", margin + 35, y + 5);
    doc.text("Service", margin + 75, y + 5);
    doc.text("Total", margin + 115, y + 5);
    doc.text("Reçu", margin + 145, y + 5);
    doc.text("Restant", margin + 170, y + 5);
    y += 7;

    let totalRestantParDevise: Record<string, number> = {};

    summary.partiels.forEach((p, i) => {
      if (y > pageHeight - 30) {
        // Nouvelle page si on deborde
        drawPageFooter();
        doc.addPage();
        drawPageHeader(pageNum, totalPages);
        y = 25;
      }

      if (i % 2 === 1) {
        doc.setFillColor(252, 252, 253);
        doc.rect(margin, y, pageWidth - 2 * margin, 6, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...SLATE_DARK);
      doc.text((p.reference || "—").substring(0, 16), margin + 3, y + 4);
      doc.text(p.client_nom.substring(0, 20), margin + 35, y + 4);
      doc.text(p.service.substring(0, 20), margin + 75, y + 4);
      doc.text(formatMoney(p.montant_total, ""), margin + 115, y + 4);
      doc.text(formatMoney(p.montant_recu, ""), margin + 145, y + 4);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 102, 0);
      doc.text(formatMoney(p.restant, p.devise), margin + 170, y + 4);
      y += 6;

      // Cumul par devise
      if (!totalRestantParDevise[p.devise])
        totalRestantParDevise[p.devise] = 0;
      totalRestantParDevise[p.devise] += p.restant;
    });

    // Total
    y += 4;
    doc.setFillColor(...NEXUS_ORANGE);
    doc.rect(margin, y, pageWidth - 2 * margin, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("TOTAL CRÉANCES", margin + 3, y + 5);
    let totalText = Object.entries(totalRestantParDevise)
      .map(([d, t]) => formatMoney(t, d))
      .join(" + ");
    doc.text(totalText, pageWidth - margin - 3, y + 5, { align: "right" });
  }

  drawPageFooter();

  return doc;
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
          .select("montant_recu, montant_total, devise, statut, agent_id, client_nom, service, reference")
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
          .eq("statut", "partiel")
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
  const handleDownload = () => {
    if (!summary) return;
    setGenerating(true);
    try {
      const doc = generateReportPDF(summary, monthBounds.label, currentUserName);
      doc.save(`Rapport_Nexus_${selectedMonth}.pdf`);
      toast.success("Rapport téléchargé");
    } catch (err) {
      console.error(err);
      toast.error("Erreur génération PDF");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!summary) return;
    setGenerating(true);
    try {
      const doc = generateReportPDF(summary, monthBounds.label, currentUserName);
      const blob = doc.output("blob");
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
      const doc = generateReportPDF(summary, monthBounds.label, currentUserName);
      const base64 = doc.output("datauristring").split(",")[1];

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
