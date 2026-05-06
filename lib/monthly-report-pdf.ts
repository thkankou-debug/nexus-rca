// ============================================================================
// MONTHLY REPORT — Génération PDF server-side via pdf-lib
// ----------------------------------------------------------------------------
// Cohérent avec le pattern PDF du projet (CLAUDE_CODE_BRIEF.md) :
//   - pdf-lib (pas jsPDF qui est browser-only)
//   - sanitizeForPdf systématique avant drawText (WinAnsi safe)
//   - Couleurs Nexus (navy + orange)
// ============================================================================

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { MonthSummary } from "@/lib/monthly-report-data";

// ─── Sanitize WinAnsi ──────────────────────────────────────────────────────
function sanitizeForPdf(text: string): string {
  if (!text) return "";
  return text
    .replace(/ /g, " ")
    .replace(/ /g, " ")
    .replace(/ /g, " ")
    .replace(/ /g, " ")
    .replace(/ /g, " ")
    .replace(/⁠/g, "")
    .replace(/é/g, "e").replace(/è/g, "e").replace(/ê/g, "e").replace(/ë/g, "e")
    .replace(/à/g, "a").replace(/â/g, "a").replace(/ä/g, "a")
    .replace(/î/g, "i").replace(/ï/g, "i")
    .replace(/ô/g, "o").replace(/ö/g, "o")
    .replace(/ù/g, "u").replace(/û/g, "u").replace(/ü/g, "u")
    .replace(/ç/g, "c")
    .replace(/É/g, "E").replace(/À/g, "A").replace(/Ç/g, "C").replace(/Ê/g, "E")
    .replace(/[^\x20-\x7E]/g, "?");
}

function formatMoney(amount: number, currency = "XAF"): string {
  // Pas de toLocaleString("fr-FR") en PDF (insère espace insécable étroit).
  const intPart = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${intPart} ${currency}`;
}

// ─── Génération PDF ────────────────────────────────────────────────────────
export async function buildMonthlyReportPdf(summary: MonthSummary): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const nexusBlue = rgb(0.047, 0.11, 0.251); // #0C1C40
  const nexusOrange = rgb(1, 0.4, 0); // #FF6600
  const grayDark = rgb(0.15, 0.2, 0.3);
  const grayMid = rgb(0.4, 0.45, 0.5);
  const grayLight = rgb(0.85, 0.87, 0.9);
  const white = rgb(1, 1, 1);

  // A4 : 595 x 842
  const PAGE_W = 595;
  const PAGE_H = 842;
  const MARGIN_X = 40;

  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let cursorY = PAGE_H;

  const drawText = (
    text: string,
    options: {
      x: number;
      y: number;
      size: number;
      font?: typeof helvetica;
      color?: ReturnType<typeof rgb>;
    }
  ) => {
    page.drawText(sanitizeForPdf(text), {
      x: options.x,
      y: options.y,
      size: options.size,
      font: options.font ?? helvetica,
      color: options.color ?? grayDark,
    });
  };

  const drawRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: ReturnType<typeof rgb>
  ) => {
    page.drawRectangle({ x, y, width: w, height: h, color });
  };

  const newPageIfNeeded = (need: number) => {
    if (cursorY - need < 60) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      cursorY = PAGE_H - 50;
    }
  };

  // ─── Header navy ───────────────────────────────────────────────────────
  drawRect(0, PAGE_H - 130, PAGE_W, 130, nexusBlue);
  drawRect(0, PAGE_H - 130, 6, 130, nexusOrange);

  drawText("NEXUS RCA", {
    x: MARGIN_X,
    y: PAGE_H - 55,
    size: 22,
    font: helveticaBold,
    color: white,
  });
  drawText("Rapport mensuel financier", {
    x: MARGIN_X,
    y: PAGE_H - 78,
    size: 12,
    color: rgb(0.7, 0.78, 0.9),
  });
  drawText(summary.bounds.label, {
    x: MARGIN_X,
    y: PAGE_H - 105,
    size: 18,
    font: helveticaBold,
    color: white,
  });

  drawText(
    `Genere le ${new Date(summary.bounds.end).toLocaleDateString("fr-FR")}`,
    {
      x: PAGE_W - MARGIN_X - 130,
      y: PAGE_H - 55,
      size: 9,
      color: rgb(0.7, 0.78, 0.9),
    }
  );
  drawText("Document confidentiel", {
    x: PAGE_W - MARGIN_X - 130,
    y: PAGE_H - 70,
    size: 9,
    color: rgb(0.7, 0.78, 0.9),
  });

  cursorY = PAGE_H - 160;

  // ─── Synthèse globale (tuiles) ─────────────────────────────────────────
  drawText("Synthese globale", {
    x: MARGIN_X,
    y: cursorY,
    size: 14,
    font: helveticaBold,
    color: nexusBlue,
  });
  cursorY -= 20;

  const tiles: { label: string; value: string }[] = [
    {
      label: "Revenus XAF",
      value: formatMoney(summary.totals.revenus_xaf, "XAF"),
    },
    {
      label: "Paiements",
      value: String(summary.totals.paiements_count),
    },
    {
      label: "Nouvelles demandes",
      value: String(summary.totals.nouvelles_demandes),
    },
    {
      label: "Dossiers clotures",
      value: String(summary.totals.dossiers_clotures),
    },
    {
      label: "Nouveaux clients",
      value: String(summary.totals.nouveaux_clients),
    },
    {
      label: "RDV termines",
      value: String(summary.rdvTermines),
    },
  ];

  const tileW = (PAGE_W - 2 * MARGIN_X - 10) / 3;
  const tileH = 50;
  tiles.forEach((t, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = MARGIN_X + col * (tileW + 5);
    const y = cursorY - row * (tileH + 5) - tileH;

    drawRect(x, y, tileW, tileH, grayLight);
    drawRect(x, y + tileH - 3, tileW, 3, nexusOrange);
    drawText(t.label.toUpperCase(), {
      x: x + 8,
      y: y + tileH - 14,
      size: 7,
      font: helveticaBold,
      color: grayMid,
    });
    drawText(t.value, {
      x: x + 8,
      y: y + 14,
      size: 13,
      font: helveticaBold,
      color: nexusBlue,
    });
  });
  cursorY -= 2 * (tileH + 5) + 10;

  // ─── Helper section ────────────────────────────────────────────────────
  const sectionTitle = (title: string) => {
    newPageIfNeeded(40);
    drawRect(MARGIN_X, cursorY - 4, 4, 16, nexusOrange);
    drawText(title, {
      x: MARGIN_X + 10,
      y: cursorY,
      size: 12,
      font: helveticaBold,
      color: nexusBlue,
    });
    cursorY -= 22;
  };

  // ─── Paiements par devise ──────────────────────────────────────────────
  sectionTitle("Paiements encaisses (par devise)");
  if (summary.paiements.length === 0) {
    drawText("Aucun paiement sur la periode.", {
      x: MARGIN_X + 10,
      y: cursorY,
      size: 9,
      color: grayMid,
    });
    cursorY -= 16;
  } else {
    drawText("Devise", { x: MARGIN_X + 10, y: cursorY, size: 8, font: helveticaBold, color: grayMid });
    drawText("Encaisse", { x: MARGIN_X + 110, y: cursorY, size: 8, font: helveticaBold, color: grayMid });
    drawText("Restant a percevoir", { x: MARGIN_X + 230, y: cursorY, size: 8, font: helveticaBold, color: grayMid });
    drawText("Nb", { x: MARGIN_X + 400, y: cursorY, size: 8, font: helveticaBold, color: grayMid });
    cursorY -= 12;

    for (const p of summary.paiements) {
      newPageIfNeeded(16);
      drawText(p.devise, { x: MARGIN_X + 10, y: cursorY, size: 10, color: grayDark });
      drawText(formatMoney(p.total, p.devise), { x: MARGIN_X + 110, y: cursorY, size: 10, color: grayDark });
      drawText(formatMoney(p.restant, p.devise), { x: MARGIN_X + 230, y: cursorY, size: 10, color: nexusOrange });
      drawText(String(p.count), { x: MARGIN_X + 400, y: cursorY, size: 10, color: grayDark });
      cursorY -= 14;
    }
  }
  cursorY -= 8;

  // ─── Caisse rapide ─────────────────────────────────────────────────────
  sectionTitle("Caisse rapide");
  if (summary.caisse.length === 0) {
    drawText("Aucune vente caisse sur la periode.", { x: MARGIN_X + 10, y: cursorY, size: 9, color: grayMid });
    cursorY -= 16;
  } else {
    for (const c of summary.caisse) {
      newPageIfNeeded(16);
      drawText(`${c.devise} : ${formatMoney(c.total, c.devise)}  (${c.count} vente${c.count > 1 ? "s" : ""})`, {
        x: MARGIN_X + 10, y: cursorY, size: 10, color: grayDark,
      });
      cursorY -= 14;
    }
  }
  cursorY -= 8;

  // ─── Dépenses ──────────────────────────────────────────────────────────
  sectionTitle("Depenses");
  drawText("Validees :", { x: MARGIN_X + 10, y: cursorY, size: 9, font: helveticaBold, color: grayMid });
  cursorY -= 12;
  if (summary.depenses.length === 0) {
    drawText("Aucune depense validee.", { x: MARGIN_X + 20, y: cursorY, size: 9, color: grayMid });
    cursorY -= 14;
  } else {
    for (const d of summary.depenses) {
      newPageIfNeeded(14);
      drawText(`${d.devise} : ${formatMoney(d.total, d.devise)}  (${d.count})`, {
        x: MARGIN_X + 20, y: cursorY, size: 10, color: grayDark,
      });
      cursorY -= 14;
    }
  }
  drawText("En attente :", { x: MARGIN_X + 10, y: cursorY, size: 9, font: helveticaBold, color: grayMid });
  cursorY -= 12;
  if (summary.depensesEnAttente.length === 0) {
    drawText("Aucune depense en attente.", { x: MARGIN_X + 20, y: cursorY, size: 9, color: grayMid });
    cursorY -= 14;
  } else {
    for (const d of summary.depensesEnAttente) {
      newPageIfNeeded(14);
      drawText(`${d.devise} : ${formatMoney(d.total, d.devise)}  (${d.count})`, {
        x: MARGIN_X + 20, y: cursorY, size: 10, color: nexusOrange,
      });
      cursorY -= 14;
    }
  }
  cursorY -= 8;

  // ─── Transferts ────────────────────────────────────────────────────────
  sectionTitle("Transferts effectues");
  if (summary.transferts.length === 0) {
    drawText("Aucun transfert sur la periode.", { x: MARGIN_X + 10, y: cursorY, size: 9, color: grayMid });
    cursorY -= 16;
  } else {
    for (const t of summary.transferts) {
      newPageIfNeeded(16);
      drawText(
        `${t.devise} : ${formatMoney(t.total, t.devise)}  (frais ${formatMoney(t.frais, t.devise)})  - ${t.count} envoi${t.count > 1 ? "s" : ""}`,
        { x: MARGIN_X + 10, y: cursorY, size: 10, color: grayDark }
      );
      cursorY -= 14;
    }
  }
  cursorY -= 8;

  // ─── Top agents ────────────────────────────────────────────────────────
  sectionTitle("Top agents (XAF)");
  if (summary.topAgents.length === 0) {
    drawText("Pas de classement disponible.", { x: MARGIN_X + 10, y: cursorY, size: 9, color: grayMid });
    cursorY -= 16;
  } else {
    drawText("Rang", { x: MARGIN_X + 10, y: cursorY, size: 8, font: helveticaBold, color: grayMid });
    drawText("Agent", { x: MARGIN_X + 50, y: cursorY, size: 8, font: helveticaBold, color: grayMid });
    drawText("Paiements", { x: MARGIN_X + 230, y: cursorY, size: 8, font: helveticaBold, color: grayMid });
    drawText("Caisse", { x: MARGIN_X + 330, y: cursorY, size: 8, font: helveticaBold, color: grayMid });
    drawText("RDV term.", { x: MARGIN_X + 430, y: cursorY, size: 8, font: helveticaBold, color: grayMid });
    cursorY -= 12;

    summary.topAgents.forEach((a, i) => {
      newPageIfNeeded(16);
      drawText(String(i + 1), { x: MARGIN_X + 10, y: cursorY, size: 10, color: grayDark });
      drawText(a.nom.slice(0, 26), { x: MARGIN_X + 50, y: cursorY, size: 10, color: grayDark });
      drawText(formatMoney(a.paiements_xaf, "XAF"), { x: MARGIN_X + 230, y: cursorY, size: 10, color: grayDark });
      drawText(formatMoney(a.caisse_xaf, "XAF"), { x: MARGIN_X + 330, y: cursorY, size: 10, color: grayDark });
      drawText(String(a.rdv_termines), { x: MARGIN_X + 430, y: cursorY, size: 10, color: grayDark });
      cursorY -= 14;
    });
  }
  cursorY -= 8;

  // ─── Créances en cours ─────────────────────────────────────────────────
  sectionTitle("Creances en cours (paiements partiels)");
  if (summary.partiels.length === 0) {
    drawText("Aucune creance en cours.", { x: MARGIN_X + 10, y: cursorY, size: 9, color: grayMid });
    cursorY -= 16;
  } else {
    for (const p of summary.partiels.slice(0, 20)) {
      newPageIfNeeded(16);
      const ref = (p.reference || "—").slice(0, 18);
      const client = (p.client_nom || "Client inconnu").slice(0, 22);
      drawText(`${ref}  ${client}`, { x: MARGIN_X + 10, y: cursorY, size: 9, color: grayDark });
      drawText(formatMoney(p.montant_restant, p.devise), {
        x: MARGIN_X + 380, y: cursorY, size: 9, font: helveticaBold, color: nexusOrange,
      });
      cursorY -= 13;
    }
    if (summary.partiels.length > 20) {
      newPageIfNeeded(16);
      drawText(`... +${summary.partiels.length - 20} autres creances non listees`, {
        x: MARGIN_X + 10, y: cursorY, size: 8, color: grayMid,
      });
      cursorY -= 14;
    }
  }

  // ─── Footer ────────────────────────────────────────────────────────────
  // Sur la dernière page, footer fixe en bas.
  drawRect(0, 0, PAGE_W, 30, nexusBlue);
  drawText("NEXUS RCA - Bangui, Republique Centrafricaine", {
    x: MARGIN_X, y: 12, size: 8, color: white,
  });
  drawText("contact@nexusrca.com  -  +236 73 26 96 92", {
    x: PAGE_W - MARGIN_X - 180, y: 12, size: 8, color: white,
  });

  return await pdfDoc.save();
}
