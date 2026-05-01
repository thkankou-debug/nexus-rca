"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Wallet,
  Loader2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Send,
  AlertCircle,
  User,
  Mail,
  Phone,
  FileText,
  DollarSign,
  Sparkles,
} from "lucide-react";

const SERVICES_RAPIDES = [
  "Visa Canada",
  "Visa France",
  "Visa Schengen",
  "Bourse d'études",
  "TCF / Test français",
  "Billet d'avion",
  "Réservation hôtel",
  "Transfert d'argent",
  "Consultation",
  "Autre",
];

const DEVISES = [
  { code: "XAF", label: "XAF (Franc CFA)", symbol: "F" },
  { code: "EUR", label: "EUR (Euro)", symbol: "€" },
  { code: "USD", label: "USD (Dollar US)", symbol: "$" },
  { code: "CAD", label: "CAD (Dollar CAN)", symbol: "$" },
];

export default function NewPaymentLinkForm() {
  const [clientNom, setClientNom] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientTel, setClientTel] = useState("");
  const [service, setService] = useState("");
  const [serviceCustom, setServiceCustom] = useState("");
  const [description, setDescription] = useState("");
  const [montant, setMontant] = useState("");
  const [devise, setDevise] = useState("XAF");
  const [notesStaff, setNotesStaff] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    reference: string;
    publicUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    const finalService = service === "Autre" ? serviceCustom.trim() : service;

    if (!clientNom.trim() || !clientEmail.trim() || !finalService) {
      setError("Nom client, email et service sont obligatoires");
      setSubmitting(false);
      return;
    }

    const montantNum = parseFloat(montant);
    if (isNaN(montantNum) || montantNum <= 0) {
      setError("Montant invalide");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/payment-links/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_nom: clientNom.trim(),
          client_email: clientEmail.trim().toLowerCase(),
          client_telephone: clientTel.trim() || undefined,
          service: finalService,
          description: description.trim() || undefined,
          montant: montantNum,
          devise,
          notes_staff: notesStaff.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la création");
        setSubmitting(false);
        return;
      }

      setSuccess({
        reference: data.reference,
        publicUrl: data.public_url,
      });
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ============================================================================
  // ÉCRAN SUCCÈS
  // ============================================================================
  if (success) {
    const finalService = service === "Autre" ? serviceCustom.trim() : service;
    const whatsappMessage = encodeURIComponent(
      `Bonjour ${clientNom},\n\nVoici votre lien de paiement Nexus RCA pour le service "${finalService}".\n\nMontant : ${montant} ${devise}\nRéférence : ${success.reference}\n\nLien sécurisé :\n${success.publicUrl}\n\nMerci !\nÉquipe Nexus RCA`
    );
    const whatsappUrl = clientTel
      ? `https://wa.me/${clientTel.replace(/\D/g, "")}?text=${whatsappMessage}`
      : `https://wa.me/?text=${whatsappMessage}`;

    return (
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl border border-green-200 bg-white shadow-lg">
          <div className="bg-gradient-to-br from-green-500 to-green-700 p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold text-white">
              Lien créé avec succès !
            </h1>
            <p className="mt-2 text-green-50">
              Envoyez maintenant le lien à votre client
            </p>
          </div>

          <div className="space-y-4 p-6 sm:p-8">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Référence
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-nexus-blue-950">
                {success.reference}
              </p>
            </div>

            {/* URL PUBLIQUE */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Lien à envoyer au client
              </p>
              <div className="flex flex-col gap-2 rounded-2xl border-2 border-nexus-orange-200 bg-nexus-orange-50 p-3 sm:flex-row">
                <input
                  type="text"
                  readOnly
                  value={success.publicUrl}
                  className="flex-1 bg-transparent text-sm font-mono text-nexus-blue-950 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(success.publicUrl)}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-nexus-blue-950 shadow hover:bg-slate-50"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copié !" : "Copier"}
                </button>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="grid gap-2 sm:grid-cols-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-green-600"
              >
                <Send className="h-4 w-4" />
                WhatsApp
              </a>

              <a
                href={`mailto:${clientEmail}?subject=Lien de paiement Nexus - ${success.reference}&body=${whatsappMessage}`}
                className="flex items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-600"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>

              <a
                href={success.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ExternalLink className="h-4 w-4" />
                Aperçu
              </a>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-900">
                💡 Que se passe-t-il ensuite ?
              </p>
              <ol className="mt-2 space-y-1 text-sm text-blue-900">
                <li>1. Le client ouvre le lien sur son téléphone</li>
                <li>2. Il choisit son moyen de paiement (Mobile Money, etc.)</li>
                <li>3. Il paie et déclare la transaction</li>
                <li>4. Tu reçois un email pour confirmer la réception</li>
                <li>5. Tu confirmes en 1 clic → reçu PDF auto envoyé</li>
              </ol>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/dashboard/super-admin/paiements/en-attente"
                className="flex-1 rounded-full bg-nexus-blue-950 px-5 py-3 text-center text-sm font-semibold text-white shadow hover:bg-nexus-blue-900"
              >
                Voir tous les paiements
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSuccess(null);
                  setClientNom("");
                  setClientEmail("");
                  setClientTel("");
                  setService("");
                  setServiceCustom("");
                  setDescription("");
                  setMontant("");
                  setNotesStaff("");
                }}
                className="flex-1 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-nexus-blue-950 hover:bg-slate-50"
              >
                Créer un autre lien
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // FORMULAIRE
  // ============================================================================
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard/super-admin/paiements/en-attente"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-nexus-blue-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux paiements
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-lg">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
            Nouveau lien de paiement
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Génère un lien sécurisé à envoyer à ton client.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-5">
          {/* SECTION CLIENT */}
          <div>
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
              <User className="h-3.5 w-3.5" />
              Informations client
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Nom complet du client <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientNom}
                  onChange={(e) => setClientNom(e.target.value)}
                  placeholder="Ex: Marie Dupont"
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Téléphone (avec WhatsApp)
                </label>
                <input
                  type="tel"
                  value={clientTel}
                  onChange={(e) => setClientTel(e.target.value)}
                  placeholder="+236 70 00 00 00"
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
                />
              </div>
            </div>
          </div>

          {/* SECTION SERVICE */}
          <div>
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
              <FileText className="h-3.5 w-3.5" />
              Service
            </p>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Type de service <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICES_RAPIDES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setService(s)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        service === s
                          ? "border-nexus-orange-500 bg-nexus-orange-100 text-nexus-orange-700"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {service === "Autre" && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Précisez le service <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={serviceCustom}
                    onChange={(e) => setServiceCustom(e.target.value)}
                    placeholder="Ex: Service personnalisé"
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Description (optionnel - aide le client à comprendre)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Ex: Frais de constitution dossier visa étudiant Canada"
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
                />
              </div>
            </div>
          </div>

          {/* SECTION MONTANT */}
          <div>
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
              <DollarSign className="h-3.5 w-3.5" />
              Montant
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Montant à payer <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  placeholder="250000"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Devise <span className="text-red-500">*</span>
                </label>
                <select
                  value={devise}
                  onChange={(e) => setDevise(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
                >
                  {DEVISES.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* NOTES INTERNES */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Notes internes (optionnel - non visibles par le client)
            </label>
            <textarea
              value={notesStaff}
              onChange={(e) => setNotesStaff(e.target.value)}
              rows={2}
              placeholder="Ex: Acompte de 50%, reste à payer après réception visa"
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* BOUTON */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                Générer le lien de paiement
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
            Le lien sera valide pendant 30 jours.
          </p>
        </div>
      </div>
    </div>
  );
}
