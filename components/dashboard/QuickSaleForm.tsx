"use client";

import { embedNexusLogoClient } from "@/lib/pdf-logo-client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  X,
  Loader2,
  ShoppingCart,
  Printer,
  Mail,
  FileDown,
  Copy,
  Scan,
  FileText,
  Layers,
  PenLine,
  HelpCircle,
  Camera,
  Package,
} from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  drawText,
  drawDashedLine,
  wrapText,
  uint8ArrayToBase64,
  mm,
} from "@/lib/pdf-layout";
import { createClient } from "@/lib/supabase/client";
import { ClientSelector } from "./ClientSelector";

// ============================================================================
// TYPES
// ============================================================================
export type QuickServiceType =
  | "photocopie"
  | "impression"
  | "scan"
  | "numerisation"
  | "plastification"
  | "saisie_document"
  | "assistance_formulaire"
  | "photo_identite"
  | "autre";

export type QuickPaymentMethod =
  | "especes"
  | "virement"
  | "mobile_money"
  | "western_union"
  | "moneygram"
  | "carte"
  | "cheque"
  | "autre";

export interface QuickSale {
  id: string;
  reference: string | null;
  client_record_id: string | null;
  client_nom: string | null;
  client_email: string | null;
  client_telephone: string | null;
  type_service: QuickServiceType;
  description: string | null;
  quantite: number;
  prix_unitaire: number;
  montant_total: number;
  devise: string;
  mode_paiement: QuickPaymentMethod;
  date_paiement: string;
  agent_id: string | null;
  notes_internes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const SERVICE_LABELS: Record<QuickServiceType, string> = {
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

export const SERVICE_ICONS: Record<QuickServiceType, typeof Copy> = {
  photocopie: Copy,
  impression: FileText,
  scan: Scan,
  numerisation: Scan,
  plastification: Layers,
  saisie_document: PenLine,
  assistance_formulaire: HelpCircle,
  photo_identite: Camera,
  autre: Package,
};

const PAYMENT_LABELS: Record<QuickPaymentMethod, string> = {
  especes: "Espèces",
  virement: "Virement",
  mobile_money: "Mobile Money",
  western_union: "Western Union",
  moneygram: "MoneyGram",
  carte: "Carte",
  cheque: "Chèque",
  autre: "Autre",
};

interface AgentInfo {
  id: string;
  nom: string;
  prenom: string | null;
}

// ============================================================================
// GENERATEUR TICKET PDF (format ticket de caisse, 80mm de large)
// ============================================================================
async function generateTicketPDF(
  sale: QuickSale,
  agent?: AgentInfo
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  // Format ticket de caisse : 80mm de large, hauteur fixe (comportement d'origine)
  const width = 80;
  const height = 200;
  const pageHeight = mm(height);
  const page = pdfDoc.addPage([mm(width), pageHeight]);

  const black = rgb(0, 0, 0);
  const margin = 5;
  const centerX = width / 2;
  let y = 8;

  // En-tete (logo officiel — jamais bloquant)
  const nexusLogo = await embedNexusLogoClient(pdfDoc);
  if (nexusLogo) {
    page.drawImage(nexusLogo, { x: mm(centerX - 6), y: pageHeight - mm(y + 12), width: mm(12), height: mm(12) });
    y += 13;
  }
  drawText(page, pageHeight, helveticaBold, "NEXUS RCA", mm(centerX), mm(y), 14, black, "center");

  y += 5;
  drawText(page, pageHeight, helvetica, "Agence Internationale", mm(centerX), mm(y), 8, black, "center");

  y += 3;
  drawText(page, pageHeight, helvetica, "Bangui, RCA", mm(centerX), mm(y), 8, black, "center");

  y += 3;
  drawText(page, pageHeight, helvetica, "+236 73 26 96 92", mm(centerX), mm(y), 8, black, "center");

  // Trait
  y += 5;
  drawDashedLine(page, pageHeight, mm(margin), mm(width - margin), mm(y), black);

  // Reference et date
  y += 5;
  drawText(page, pageHeight, helveticaBold, "TICKET DE CAISSE", mm(centerX), mm(y), 9, black, "center");

  y += 4;
  drawText(page, pageHeight, courier, sale.reference || "—", mm(centerX), mm(y), 7, black, "center");

  y += 4;
  const dateStr = new Date(sale.date_paiement).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  drawText(page, pageHeight, helvetica, dateStr, mm(centerX), mm(y), 8, black, "center");

  // Trait
  y += 4;
  drawDashedLine(page, pageHeight, mm(margin), mm(width - margin), mm(y), black);

  // Client (si renseigne)
  if (sale.client_nom) {
    y += 4;
    drawText(page, pageHeight, helveticaBold, "Client :", mm(margin), mm(y), 8, black);
    y += 3;
    drawText(page, pageHeight, helvetica, sale.client_nom, mm(margin), mm(y), 8, black);

    y += 3;
    drawDashedLine(page, pageHeight, mm(margin), mm(width - margin), mm(y), black);
  }

  // Article
  y += 5;
  drawText(
    page,
    pageHeight,
    helveticaBold,
    SERVICE_LABELS[sale.type_service].toUpperCase(),
    mm(margin),
    mm(y),
    8,
    black
  );

  if (sale.description) {
    y += 3;
    const lines = wrapText(helvetica, sale.description, mm(width - 2 * margin), 7);
    lines.forEach((line, i) => {
      drawText(page, pageHeight, helvetica, line, mm(margin), mm(y + i * 3), 7, black);
    });
    y += lines.length * 3;
  }

  y += 4;
  drawText(page, pageHeight, helvetica, `Qté : ${sale.quantite}`, mm(margin), mm(y), 8, black);
  drawText(
    page,
    pageHeight,
    helvetica,
    `${Number(sale.prix_unitaire).toLocaleString("fr-FR")} ${sale.devise}`,
    mm(width - margin),
    mm(y),
    8,
    black,
    "right"
  );

  // Total
  y += 5;
  drawDashedLine(page, pageHeight, mm(margin), mm(width - margin), mm(y), black);
  y += 5;
  drawText(page, pageHeight, helveticaBold, "TOTAL", mm(margin), mm(y), 11, black);
  drawText(
    page,
    pageHeight,
    helveticaBold,
    `${Number(sale.montant_total).toLocaleString("fr-FR")} ${sale.devise}`,
    mm(width - margin),
    mm(y),
    11,
    black,
    "right"
  );

  y += 5;
  drawText(page, pageHeight, helvetica, `Mode : ${PAYMENT_LABELS[sale.mode_paiement]}`, mm(margin), mm(y), 7, black);

  if (agent) {
    const agentName = [agent.prenom, agent.nom].filter(Boolean).join(" ");
    y += 3;
    drawText(page, pageHeight, helvetica, `Agent : ${agentName}`, mm(margin), mm(y), 7, black);
  }

  // Footer
  y += 6;
  drawDashedLine(page, pageHeight, mm(margin), mm(width - margin), mm(y), black);
  y += 4;
  drawText(page, pageHeight, helveticaOblique, "Merci de votre visite !", mm(centerX), mm(y), 7, black, "center");
  y += 3;
  drawText(page, pageHeight, helveticaOblique, "www.nexusrca.com", mm(centerX), mm(y), 7, black, "center");

  return pdfDoc.save();
}

// ============================================================================
// COMPOSANT BOUTONS RECU TICKET
// ============================================================================
export function QuickSaleReceiptButtons({
  sale,
  agent,
  compact = false,
}: {
  sale: QuickSale;
  agent?: AgentInfo;
  compact?: boolean;
}) {
  const [emailModal, setEmailModal] = useState(false);
  const [emailDest, setEmailDest] = useState(sale.client_email || "");
  const [sending, setSending] = useState(false);

  const handleDownload = async () => {
    try {
      const bytes = await generateTicketPDF(sale, agent);
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Ticket_${sale.reference || sale.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Ticket téléchargé");
    } catch (error) {
      console.error(error);
      toast.error("Erreur génération PDF");
    }
  };

  const handlePrint = async () => {
    try {
      const bytes = await generateTicketPDF(sale, agent);
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.addEventListener("load", () => {
          setTimeout(() => printWindow.print(), 500);
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur impression");
    }
  };

  const handleSendEmail = async () => {
    if (!emailDest.trim()) {
      toast.error("Email destinataire requis");
      return;
    }
    setSending(true);
    try {
      const bytes = await generateTicketPDF(sale, agent);
      const base64 = uint8ArrayToBase64(bytes);

      const response = await fetch("/api/payments/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: sale.id, // on reuse l API existante
          recipient_email: emailDest.trim(),
          pdf_base64: base64,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erreur");

      toast.success("Ticket envoyé par email");
      setEmailModal(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erreur";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const btnClass = compact
    ? "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold"
    : "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold";

  return (
    <>
      <button
        type="button"
        onClick={handlePrint}
        className={`${btnClass} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
      >
        <Printer className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        Imprimer
      </button>
      <button
        type="button"
        onClick={handleDownload}
        className={`${btnClass} border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100`}
      >
        <FileDown className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        PDF
      </button>
      <button
        type="button"
        onClick={() => setEmailModal(true)}
        className={`${btnClass} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
      >
        <Mail className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        Email
      </button>

      {emailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setEmailModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <h3 className="font-display text-lg font-bold text-nexus-blue-950">
                Envoyer le ticket par email
              </h3>
            </div>
            <input
              type="email"
              value={emailDest}
              onChange={(e) => setEmailDest(e.target.value)}
              className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30"
              placeholder="email@exemple.com"
            />
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEmailModal(false)}
                disabled={sending}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? (
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
    </>
  );
}

// ============================================================================
// FORMULAIRE DE VENTE RAPIDE
// ============================================================================
export function QuickSaleForm({
  currentUserId,
  onClose,
  onSaved,
}: {
  currentUserId: string;
  onClose: () => void;
  onSaved: (sale: QuickSale) => void;
}) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    type_service: "photocopie" as QuickServiceType,
    description: "",
    quantite: "1",
    prix_unitaire: "",
    devise: "XAF",
    mode_paiement: "especes" as QuickPaymentMethod,
    client_record_id: null as string | null,
    client_nom: "",
    client_email: "",
    client_telephone: "",
    notes_internes: "",
  });

  const total =
    (parseFloat(form.prix_unitaire) || 0) * (parseInt(form.quantite) || 0);

  const handleChange = (field: keyof typeof form, value: string | null) => {
    setForm((prev) => ({ ...prev, [field]: value as never }));
  };

  const handleClientPicked = (client: {
    id: string;
    type: string;
    nom: string;
    prenom: string | null;
    raison_sociale: string | null;
    email: string | null;
    telephone: string | null;
  }) => {
    const fullName =
      client.type === "particulier"
        ? [client.prenom, client.nom].filter(Boolean).join(" ")
        : client.nom;
    setForm((prev) => ({
      ...prev,
      client_record_id: client.id,
      client_nom: fullName || prev.client_nom,
      client_email: client.email || prev.client_email,
      client_telephone: client.telephone || prev.client_telephone,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (parseFloat(form.prix_unitaire) <= 0) {
      toast.error("Prix unitaire requis");
      setSaving(false);
      return;
    }
    if (parseInt(form.quantite) <= 0) {
      toast.error("Quantité doit être > 0");
      setSaving(false);
      return;
    }

    const payload = {
      type_service: form.type_service,
      description: form.description.trim() || null,
      quantite: parseInt(form.quantite),
      prix_unitaire: parseFloat(form.prix_unitaire),
      montant_total: total,
      devise: form.devise,
      mode_paiement: form.mode_paiement,
      client_record_id: form.client_record_id,
      client_nom: form.client_nom.trim() || null,
      client_email: form.client_email.trim() || null,
      client_telephone: form.client_telephone.trim() || null,
      notes_internes: form.notes_internes.trim() || null,
      agent_id: currentUserId,
      created_by: currentUserId,
    };

    const { data, error } = await supabase
      .from("quick_sales")
      .insert(payload)
      .select()
      .single();

    setSaving(false);

    if (error) {
      // Verrou base 091 : aucun encaissement sans session de caisse ouverte.
      if (error.message.includes("CAISSE_FERMEE")) {
        toast.error(
          "Caisse fermée — ouvrez d'abord votre session de caisse (page Sessions de caisse) avant d'encaisser."
        );
      } else if (error.message.includes("SESSION_CLOTUREE")) {
        toast.error("Cette session est soumise ou clôturée — ses transactions sont figées.");
      } else {
        toast.error("Erreur : " + error.message);
      }
      return;
    }

    toast.success("Vente enregistrée");
    onSaved(data as QuickSale);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-2xl rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="font-display text-xl font-bold text-nexus-blue-950">
              Nouvelle vente rapide
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Encaissement immédiat, ticket imprimable.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {/* SERVICES (boutons rapides) */}
          <Section title="Service">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {(
                Object.entries(SERVICE_LABELS) as [QuickServiceType, string][]
              ).map(([val, label]) => {
                const Icon = SERVICE_ICONS[val];
                const isActive = form.type_service === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleChange("type_service", val)}
                    className={
                      isActive
                        ? "flex flex-col items-center gap-1 rounded-xl border-2 border-nexus-orange-500 bg-nexus-orange-50 p-3 text-nexus-orange-700"
                        : "flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white p-3 text-slate-600 hover:border-slate-300"
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[10px] font-semibold leading-tight text-center">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* DESCRIPTION */}
          <Section title="Description (optionnel)">
            <input
              type="text"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={inputClass}
              placeholder="Ex : 5 pages couleur A4"
            />
          </Section>

          {/* QUANTITE / PRIX / TOTAL */}
          <Section title="Quantité & prix">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Quantité *">
                <input
                  type="number"
                  required
                  min="1"
                  value={form.quantite}
                  onChange={(e) => handleChange("quantite", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Prix unitaire *">
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.prix_unitaire}
                  onChange={(e) =>
                    handleChange("prix_unitaire", e.target.value)
                  }
                  className={inputClass}
                  placeholder="0"
                />
              </Field>
              <Field label="Devise">
                <select
                  value={form.devise}
                  onChange={(e) => handleChange("devise", e.target.value)}
                  className={inputClass}
                >
                  <option value="XAF">FCFA</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </Field>
              <Field label="Mode">
                <select
                  value={form.mode_paiement}
                  onChange={(e) =>
                    handleChange("mode_paiement", e.target.value)
                  }
                  className={inputClass}
                >
                  {(
                    Object.entries(PAYMENT_LABELS) as [
                      QuickPaymentMethod,
                      string
                    ][]
                  ).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Total */}
            <div className="mt-4 rounded-xl border-2 border-nexus-orange-300 bg-nexus-orange-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  Total à encaisser
                </span>
                <span className="font-display text-2xl font-bold text-nexus-orange-700">
                  {total.toLocaleString("fr-FR")} {form.devise}
                </span>
              </div>
            </div>
          </Section>

          {/* CLIENT (optionnel) */}
          <Section title="Client (optionnel)">
            <div className="space-y-3">
              <ClientSelector
                selectedClientId={form.client_record_id}
                onSelect={(id) => handleChange("client_record_id", id)}
                onClientPicked={handleClientPicked}
              />
              {!form.client_record_id && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-xs text-slate-500">
                    Ou saisis manuellement (utile pour envoyer un reçu par email)
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      type="text"
                      value={form.client_nom}
                      onChange={(e) =>
                        handleChange("client_nom", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Nom client"
                    />
                    <input
                      type="email"
                      value={form.client_email}
                      onChange={(e) =>
                        handleChange("client_email", e.target.value)
                      }
                      className={inputClass}
                      placeholder="Email"
                    />
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* NOTES */}
          <Section title="Note interne (optionnel)">
            <textarea
              rows={2}
              value={form.notes_internes}
              onChange={(e) => handleChange("notes_internes", e.target.value)}
              className={inputClass}
              placeholder="Information complémentaire..."
            />
          </Section>

          {/* BOUTONS */}
          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || total <= 0}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-nexus-orange-500/30 transition hover:bg-nexus-orange-600 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Encaisser {total > 0 ? total.toLocaleString("fr-FR") : ""}{" "}
                  {form.devise}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-500/30";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
