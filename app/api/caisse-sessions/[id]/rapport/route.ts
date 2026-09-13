// ============================================================================
// API ROUTE — GET /api/caisse-sessions/:id/rapport
// Cahier « reprise Accueil & caisse » §6 (12/09/2026) : « Produire un
// rapport téléchargeable » à la clôture. PDF A4 : session (opératrice,
// poste, horaires), fonds d'ouverture + coupures, ventilation §5 (espèces
// nettes, électroniques par moyen, cautions reçues/restituées, entrées/
// sorties de fonds), solde théorique, compté, écart + justification, puis
// journal complet (ventes + mouvements). Lecture seule — n'altère rien.
// PDF : pas de toLocaleString("fr-FR") (espace insécable   = crash
// WinAnsi, bug connu) — formatage manuel des milliers.
// ============================================================================

import { readFileSync } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";
import { computeExpectedBalance, signedCashAmount } from "@/lib/caisse-server";

export const dynamic = "force-dynamic";

const SUPERVISION_ROLES = ["admin", "super_admin", "daf", "comptable"];

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function nombre(n: number): string {
  const sign = n < 0 ? "-" : "";
  const s = Math.round(Math.abs(n)).toString();
  let out = "";
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) out += " ";
    out += s[i];
  }
  return `${sign}${out} FCFA`;
}

function dateStr(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    timeZone: "Africa/Bangui",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// WinAnsi accepte le Latin-1 (accents français) — on remplace seulement les
// caractères hors plage, dont les espaces insécables.
function tk(text: string): string {
  return text
    .replace(/[    ]/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^ -~À-ÿŒœ]/g, "?");
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
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
    const { data: session } = await admin
      .from("caisse_sessions")
      .select(
        "id, agent_id, opened_at, closed_at, opening_balance, expected_balance, actual_balance, discrepancy, status, notes, poste, opening_breakdown, opening_note, profiles(nom, prenom)"
      )
      .eq("id", params.id)
      .single();
    if (!session) {
      return NextResponse.json({ success: false, error: "Session introuvable" }, { status: 404 });
    }
    const s = session as unknown as {
      id: string;
      agent_id: string;
      opened_at: string;
      closed_at: string | null;
      opening_balance: number;
      expected_balance: number | null;
      actual_balance: number | null;
      discrepancy: number | null;
      status: string;
      notes: string | null;
      poste: string | null;
      opening_breakdown: Record<string, number> | null;
      opening_note: string | null;
      profiles: { nom: string | null; prenom: string | null } | null;
    };
    if (s.agent_id !== user.id && !SUPERVISION_ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }

    let ventesQuery = admin
      .from("quick_sales")
      .select("description, montant_total, mode_paiement, nature, created_at, reference")
      .eq("agent_id", s.agent_id)
      .gte("created_at", s.opened_at)
      .order("created_at", { ascending: true });
    if (s.closed_at) ventesQuery = ventesQuery.lte("created_at", s.closed_at);
    const [{ data: ventes }, { data: mouvements }] = await Promise.all([
      ventesQuery,
      admin
        .from("caisse_movements")
        .select("type, montant, motif, justificatif, created_at")
        .eq("session_id", s.id)
        .order("created_at", { ascending: true }),
    ]);

    const rows = (ventes || []) as {
      description: string | null;
      montant_total: number;
      mode_paiement: string;
      nature?: string | null;
      created_at: string;
      reference?: string | null;
    }[];
    const funds = (mouvements || []) as {
      type: string;
      montant: number;
      motif: string;
      justificatif: string | null;
      created_at: string;
    }[];

    const vent = {
      especes: 0,
      cautionsRecues: 0,
      cautionsRestituees: 0,
      electro: {} as Record<string, number>,
      entrees: 0,
      sorties: 0,
    };
    for (const v of rows) {
      const m = Number(v.montant_total);
      if (v.mode_paiement === "especes") {
        if (v.nature === "caution_remboursement") vent.cautionsRestituees += m;
        else if (v.nature === "caution") vent.cautionsRecues += m;
        else vent.especes += m;
      } else {
        vent.electro[v.mode_paiement] = (vent.electro[v.mode_paiement] || 0) + m;
      }
    }
    for (const f of funds) {
      if (f.type === "entree") vent.entrees += Number(f.montant);
      else vent.sorties += Number(f.montant);
    }
    const theorique =
      s.status === "ouverte" || s.expected_balance === null
        ? await computeExpectedBalance(admin, s.agent_id, s.opened_at, Number(s.opening_balance), s.id)
        : Number(s.expected_balance);

    // ── PDF A4 ──
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    let page = pdf.addPage([595, 842]);
    const M = 50;
    let y = 792;
    const line = (
      text: string,
      opts: { b?: boolean; size?: number; right?: string; indent?: number } = {}
    ) => {
      if (y < 60) {
        page = pdf.addPage([595, 842]);
        y = 792;
      }
      const f = opts.b ? bold : font;
      const size = opts.size ?? 10;
      page.drawText(tk(text), { x: M + (opts.indent || 0), y, size, font: f, color: rgb(0.06, 0.09, 0.16) });
      if (opts.right) {
        const w = f.widthOfTextAtSize(tk(opts.right), size);
        page.drawText(tk(opts.right), { x: 545 - w, y, size, font: f, color: rgb(0.06, 0.09, 0.16) });
      }
      y -= size + 6;
    };
    const rule = () => {
      y += 2;
      page.drawLine({ start: { x: M, y }, end: { x: 545, y }, thickness: 0.7, color: rgb(0.8, 0.8, 0.82) });
      y -= 12;
    };

    const operatrice =
      [s.profiles?.prenom, s.profiles?.nom].filter(Boolean).join(" ") || s.agent_id.slice(0, 8);
    // Logo officiel Nexus RCA (demande Thierry 12/09) — jamais bloquant.
    let logoIndent = 0;
    try {
      const logo = await pdf.embedPng(
        readFileSync(path.join(process.cwd(), "public", "icones", "icon-192.png"))
      );
      page.drawImage(logo, { x: M, y: y - 22, width: 38, height: 38 });
      logoIndent = 48;
    } catch {
      logoIndent = 0;
    }
    line("NEXUS RCA — Rapport de session de caisse", { b: true, size: 16, indent: logoIndent });
    line(`Session ${s.id.slice(0, 8)} · ${s.status === "cloturee" ? "Clôturée" : s.status === "a_cloturer" ? "Soumise, en attente de validation" : "Ouverte"}`, { size: 10, indent: logoIndent });
    rule();
    line(`Opératrice : ${operatrice}`, { right: `Poste : ${s.poste || "Réception"}` });
    line(`Ouverte le : ${dateStr(s.opened_at)}`, { right: `Clôturée le : ${dateStr(s.closed_at)}` });
    if (s.opening_note) line(`Observation d'ouverture : ${s.opening_note}`);
    if (s.opening_breakdown) {
      const det = Object.entries(s.opening_breakdown)
        .map(([k, v]) => (k === "pieces" ? `pièces ${nombre(Number(v))}` : `${k} x ${v}`))
        .join(" · ");
      line(`Coupures à l'ouverture : ${det}`, { size: 9 });
    }
    rule();
    line("Ventilation de la journée", { b: true, size: 12 });
    line("Fonds d'ouverture", { right: nombre(Number(s.opening_balance)) });
    line("Encaissements espèces (nets de monnaie rendue)", { right: nombre(vent.especes) });
    line("Cautions reçues en espèces (tiroir, pas une recette)", { right: nombre(vent.cautionsRecues) });
    line("Cautions restituées en espèces", { right: `- ${nombre(vent.cautionsRestituees)}` });
    for (const [moyen, montant] of Object.entries(vent.electro)) {
      line(`Paiements électroniques — ${moyen} (hors tiroir)`, { right: nombre(montant) });
    }
    line("Entrées de fonds autorisées", { right: nombre(vent.entrees) });
    line("Sorties de fonds autorisées", { right: `- ${nombre(vent.sorties)}` });
    rule();
    line("Solde théorique d'espèces", { b: true, right: nombre(theorique) });
    if (s.actual_balance !== null) {
      line("Espèces réellement comptées", { b: true, right: nombre(Number(s.actual_balance)) });
      line("Écart", { b: true, right: nombre(Number(s.discrepancy ?? 0)) });
      if (s.notes) line(`Justification / notes : ${s.notes}`, { size: 9 });
    }
    rule();
    line(`Journal des encaissements (${rows.length})`, { b: true, size: 12 });
    for (const v of rows) {
      const heure = new Date(v.created_at).toLocaleTimeString("fr-FR", {
        timeZone: "Africa/Bangui",
        hour: "2-digit",
        minute: "2-digit",
      });
      const label = `${heure} · ${v.reference || ""} ${v.description || "Vente"} (${v.mode_paiement}${v.nature && v.nature !== "prestation" ? ", " + v.nature : ""})`;
      line(label.slice(0, 95), {
        size: 8.5,
        right: nombre(signedCashAmount(v)),
      });
    }
    if (funds.length > 0) {
      rule();
      line(`Mouvements de fonds hors vente (${funds.length})`, { b: true, size: 12 });
      for (const f of funds) {
        const heure = new Date(f.created_at).toLocaleTimeString("fr-FR", {
          timeZone: "Africa/Bangui",
          hour: "2-digit",
          minute: "2-digit",
        });
        line(
          `${heure} · ${f.type === "entree" ? "Entrée" : "Sortie"} — ${f.motif}${f.justificatif ? " (justif. : " + f.justificatif + ")" : ""}`.slice(0, 95),
          { size: 8.5, right: `${f.type === "entree" ? "" : "- "}${nombre(Number(f.montant))}` }
        );
      }
    }
    rule();
    line(
      `Généré le ${dateStr(new Date().toISOString())} · www.nexusrca.com · Ce rapport n'altère aucune donnée.`,
      { size: 8 }
    );

    const bytes = await pdf.save();
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rapport-caisse-${s.id.slice(0, 8)}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[CAISSE_RAPPORT] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
