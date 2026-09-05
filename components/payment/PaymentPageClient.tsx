"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Loader2,
  Phone,
  Building2,
  Banknote,
  CreditCard,
  Smartphone,
  Copy,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// CONFIGURATION
// ============================================================================
const NEXUS_PAYMENT_PHONE = "+236 73 26 96 92";
const NEXUS_PAYMENT_PHONE_RAW = "23673269692";
const NEXUS_EMAIL = "contact@nexusrca.com";
const NEXUS_IBAN_PLACEHOLDER = "À demander à l'agence Nexus";
const NEXUS_BANK_NAME = "Banque centrale de l'Afrique";

const PAYMENT_METHODS = [
  {
    id: "orange_money",
    label: "Orange Money RCA",
    description: "Paiement instantané depuis votre Orange Money",
    icon: Smartphone,
    color: "from-orange-500 to-orange-700",
    borderColor: "border-orange-200",
    bgColor: "bg-orange-50",
    badge: "Le plus populaire",
    instructions: [
      `Composez **#144*1#** depuis votre téléphone`,
      `Choisissez **Transfert d'argent** → **Vers un numéro**`,
      `Entrez le numéro Nexus : **${NEXUS_PAYMENT_PHONE}**`,
      `Entrez le montant exact`,
      `Validez avec votre code secret`,
      `Notez le **numéro de transaction** (ID) reçu par SMS`,
    ],
  },
  {
    id: "mtn_money",
    label: "MTN Mobile Money RCA",
    description: "Paiement depuis votre MTN Money",
    icon: Smartphone,
    color: "from-yellow-500 to-yellow-600",
    borderColor: "border-yellow-200",
    bgColor: "bg-yellow-50",
    instructions: [
      `Composez **#126#** depuis votre téléphone MTN`,
      `Choisissez **Transfert** → **À un numéro**`,
      `Entrez le numéro Nexus : **${NEXUS_PAYMENT_PHONE}**`,
      `Entrez le montant exact`,
      `Validez avec votre code MTN Money`,
      `Notez le **numéro de transaction** reçu par SMS`,
    ],
  },
  {
    id: "express_union",
    label: "Express Union Mobile",
    description: "Paiement via Express Union",
    icon: Smartphone,
    color: "from-red-500 to-red-700",
    borderColor: "border-red-200",
    bgColor: "bg-red-50",
    instructions: [
      `Ouvrez l'application Express Union Mobile`,
      `Choisissez **Envoyer de l'argent**`,
      `Entrez le numéro Nexus : **${NEXUS_PAYMENT_PHONE}**`,
      `Entrez le montant exact`,
      `Confirmez la transaction`,
      `Notez le **numéro de transaction** reçu`,
    ],
  },
  {
    id: "virement",
    label: "Virement bancaire",
    description: "Virement vers le compte Nexus RCA",
    icon: Building2,
    color: "from-blue-600 to-blue-800",
    borderColor: "border-blue-200",
    bgColor: "bg-blue-50",
    instructions: [
      `Demandez l'IBAN Nexus en contactant l'agence`,
      `Téléphone : **${NEXUS_PAYMENT_PHONE}**`,
      `Email : **${NEXUS_EMAIL}**`,
      `Effectuez le virement avec la **référence du paiement** en libellé`,
      `Notez le **numéro de référence bancaire** de votre virement`,
    ],
  },
  {
    id: "especes",
    label: "Espèces (en agence)",
    description: "Paiement en espèces à notre bureau de Bangui",
    icon: Banknote,
    color: "from-green-600 to-green-800",
    borderColor: "border-green-200",
    bgColor: "bg-green-50",
    instructions: [
      `Rendez-vous à notre bureau Nexus RCA`,
      `Adresse : **Relais Sica, vers Hôpital Général, Bangui**`,
      `Sur rendez-vous : ${NEXUS_PAYMENT_PHONE}`,
      `Mentionnez votre **référence de paiement** à l'accueil`,
      `Vous recevrez un reçu officiel après paiement`,
    ],
  },
  {
    id: "stripe_card",
    label: "Carte bancaire (Visa/Mastercard)",
    description: "Paiement instantané sécurisé · Stripe",
    icon: CreditCard,
    color: "from-indigo-600 to-purple-700",
    borderColor: "border-indigo-200",
    bgColor: "bg-indigo-50",
    badge: "Instantané",
    disabled: false,
    instructions: [
      `Vous serez redirigé vers Stripe pour le paiement sécurisé.`,
      `Cartes acceptées : Visa, Mastercard, American Express.`,
      `Devises : XAF, EUR, USD, CAD.`,
      `Confirmation automatique dès validation par Stripe.`,
    ],
  },
];

// ============================================================================
function formatMoney(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
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

// Migration 034 : ce type reflète le contrat minimal exposé par /payer/[token]
// (service_role + colonnes publiques uniquement, voir app/payer/[token]/page.tsx).
// client_email, numero_transaction et verified_at ne font plus partie du
// payload public — ne pas les réintroduire sans revalider avec docs/RLS_ETAT_REEL.md.
interface PaymentLink {
  reference: string;
  client_nom: string;
  service: string;
  description: string | null;
  montant: number;
  devise: string;
  statut: string;
  expires_at: string;
}

interface Props {
  paymentLink: PaymentLink;
  isExpired: boolean;
  // Optionnel le temps de la transition : la page /payer/[reference], encore
  // active jusqu'à confirmation de Thierry, n'a pas de jeton et continue de
  // déclarer par référence (route existante, déjà en service_role depuis 033).
  token?: string;
}

export default function PaymentPageClient({ paymentLink, isExpired, token }: Props) {
  const [step, setStep] = useState<"choose" | "instructions" | "submit" | "success">("choose");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // RDV déjà payé
  const isAlreadyPaid = paymentLink.statut === "verifie";
  const isAlreadyDeclared = paymentLink.statut === "paiement_declare";
  const isCancelled = paymentLink.statut === "annule";

  const selectedMethodData = PAYMENT_METHODS.find((m) => m.id === selectedMethod);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(
        token
          ? `/api/payment-links/t/${token}/declare`
          : `/api/payment-links/${paymentLink.reference}/declare`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            methode_choisie: selectedMethod,
            numero_transaction: transactionNumber.trim(),
            notes_client: clientNotes.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la déclaration");
        setSubmitting(false);
        return;
      }

      setStep("success");
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================================
  // RENDU : LIEN EXPIRÉ / ANNULÉ / DÉJÀ PAYÉ
  // ============================================================================
  if (isExpired) {
    return (
      <StatusPage
        icon={Clock}
        iconColor="bg-amber-500"
        title="Lien de paiement expiré"
        description="Ce lien de paiement n'est plus valide. Contactez Nexus pour obtenir un nouveau lien."
        bgGradient="from-amber-50 to-amber-100"
      />
    );
  }

  if (isCancelled) {
    return (
      <StatusPage
        icon={AlertCircle}
        iconColor="bg-red-500"
        title="Paiement annulé"
        description="Ce lien de paiement a été annulé. Contactez Nexus pour plus d'informations."
        bgGradient="from-red-50 to-red-100"
      />
    );
  }

  if (isAlreadyPaid) {
    return (
      <StatusPage
        icon={CheckCircle2}
        iconColor="bg-green-500"
        title="Paiement déjà reçu ✓"
        description="Ce paiement a été vérifié et reçu par Nexus."
        bgGradient="from-green-50 to-green-100"
      />
    );
  }

  if (isAlreadyDeclared && step !== "success") {
    return (
      <StatusPage
        icon={Clock}
        iconColor="bg-amber-500"
        title="Paiement en attente de vérification"
        description="Notre équipe va vérifier votre paiement très prochainement. Vous recevrez un email de confirmation dès que ce sera fait."
        bgGradient="from-amber-50 to-amber-100"
        showPaymentDetails
        paymentLink={paymentLink}
      />
    );
  }

  // ============================================================================
  // ÉTAPE 4 : SUCCÈS
  // ============================================================================
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="bg-gradient-to-br from-green-500 to-green-700 p-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="mt-4 font-display text-3xl font-bold text-white">
                Paiement déclaré !
              </h1>
              <p className="mt-2 text-green-50">
                Notre équipe va vérifier votre paiement
              </p>
            </div>

            <div className="space-y-4 p-6 sm:p-8">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Référence
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-nexus-blue-950">
                  {paymentLink.reference}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Service
                  </p>
                  <p className="mt-1 font-semibold text-nexus-blue-950">
                    {paymentLink.service}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Montant déclaré
                  </p>
                  <p className="mt-1 font-display text-lg font-bold text-nexus-blue-950">
                    {formatMoney(paymentLink.montant, paymentLink.devise)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">
                  ✓ Que se passe-t-il maintenant ?
                </p>
                <ul className="mt-2 space-y-1 text-sm text-blue-900">
                  <li>1. Notre équipe vérifie votre paiement (sous 1-24h)</li>
                  <li>2. Vous recevez un email de confirmation à l&apos;adresse enregistrée pour ce paiement</li>
                  <li>3. Le reçu officiel Nexus vous est envoyé en PDF</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-900">
                  💡 <strong>Conservez la référence {paymentLink.reference}</strong> pour toute question.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDU PRINCIPAL : ÉTAPES 1-3
  // ============================================================================
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        {/* HEADER NEXUS */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-base font-bold text-nexus-blue-950">
                NEXUS RCA
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Paiement sécurisé
              </p>
            </div>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700">
            🔒 Sécurisé
          </span>
        </div>

        {/* CARD PRINCIPALE */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          {/* HEADER PAIEMENT */}
          <div className="bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-nexus-orange-400">
              Paiement à effectuer
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {paymentLink.service}
            </h1>
            {paymentLink.description && (
              <p className="mt-1 text-sm text-slate-300">
                {paymentLink.description}
              </p>
            )}
            <div className="mt-4 flex items-baseline gap-2">
              <p className="font-display text-4xl font-bold text-white sm:text-5xl">
                {formatMoney(paymentLink.montant, paymentLink.devise)}
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Référence : <span className="font-mono">{paymentLink.reference}</span>
            </p>
          </div>

          {/* INFOS CLIENT */}
          <div className="border-b border-slate-100 bg-slate-50 p-4 sm:px-8">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pour
            </p>
            <p className="mt-0.5 text-sm font-semibold text-nexus-blue-950">
              {paymentLink.client_nom}
            </p>
          </div>

          {/* CONTENU */}
          <div className="p-6 sm:p-8">
            {/* ÉTAPE 1 : CHOIX MÉTHODE */}
            {step === "choose" && (
              <>
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
                    Étape 1 / 3
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold text-nexus-blue-950">
                    Choisissez votre moyen de paiement
                  </h2>
                </div>

                <div className="space-y-2">
                  {PAYMENT_METHODS.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={m.disabled}
                        onClick={async () => {
                          if (m.disabled) return;
                          // Stripe : redirige directement vers Checkout Session
                          if (m.id === "stripe_card") {
                            setSubmitting(true);
                            setError("");
                            try {
                              const res = await fetch(
                                "/api/payments/stripe-checkout",
                                {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    reference: paymentLink.reference,
                                  }),
                                }
                              );
                              const data = await res.json();
                              if (!res.ok || !data.url) {
                                setError(
                                  data.error || "Erreur lors de la création de la session Stripe"
                                );
                                setSubmitting(false);
                                return;
                              }
                              window.location.href = data.url;
                            } catch {
                              setError("Erreur réseau. Réessayez.");
                              setSubmitting(false);
                            }
                            return;
                          }
                          // Autres méthodes : flow classique instructions → submit
                          setSelectedMethod(m.id);
                          setStep("instructions");
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition",
                          m.disabled
                            ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
                            : `${m.borderColor} ${m.bgColor} hover:shadow-md hover:-translate-y-0.5`
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow",
                            m.color
                          )}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-nexus-blue-950">
                              {m.label}
                            </p>
                            {m.badge && (
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                                  m.disabled
                                    ? "bg-slate-200 text-slate-600"
                                    : "bg-nexus-orange-100 text-nexus-orange-700"
                                )}
                              >
                                {m.badge}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-slate-600">
                            {m.description}
                          </p>
                        </div>
                        {!m.disabled && (
                          <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-6 text-xs text-slate-500">
                  💡 Si vous avez des questions, contactez-nous au{" "}
                  <a
                    href={`tel:${NEXUS_PAYMENT_PHONE_RAW}`}
                    className="font-semibold text-nexus-blue-950 hover:text-nexus-orange-600"
                  >
                    {NEXUS_PAYMENT_PHONE}
                  </a>
                </p>
              </>
            )}

            {/* ÉTAPE 2 : INSTRUCTIONS */}
            {step === "instructions" && selectedMethodData && (
              <>
                <button
                  type="button"
                  onClick={() => setStep("choose")}
                  className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-nexus-blue-950"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Changer de moyen
                </button>

                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
                    Étape 2 / 3
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold text-nexus-blue-950">
                    Effectuez votre paiement
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Suivez ces instructions pour payer via{" "}
                    <strong>{selectedMethodData.label}</strong>
                  </p>
                </div>

                {/* MONTANT À PAYER (rappel + copy) */}
                <div className="mb-4 rounded-2xl border-2 border-nexus-orange-300 bg-nexus-orange-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-nexus-orange-700">
                        Montant à payer exactement
                      </p>
                      <p className="mt-1 font-display text-2xl font-bold text-nexus-blue-950">
                        {formatMoney(paymentLink.montant, paymentLink.devise)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(paymentLink.montant.toString())}
                      className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-nexus-blue-950 shadow hover:bg-slate-50"
                    >
                      <Copy className="h-3 w-3" />
                      {copied ? "Copié !" : "Copier"}
                    </button>
                  </div>
                </div>

                {/* NUMÉRO MOBILE MONEY (si applicable) */}
                {["orange_money", "mtn_money", "express_union"].includes(selectedMethodData.id) && (
                  <div className="mb-4 rounded-2xl border-2 border-blue-300 bg-blue-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      Numéro Nexus à composer
                    </p>
                    <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-xl font-bold text-blue-950">
                        {NEXUS_PAYMENT_PHONE}
                      </p>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(NEXUS_PAYMENT_PHONE_RAW)}
                        className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-blue-950 shadow hover:bg-slate-50"
                      >
                        <Copy className="h-3 w-3" />
                        Copier
                      </button>
                    </div>
                  </div>
                )}

                {/* INSTRUCTIONS NUMÉROTÉES */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Étapes à suivre
                  </p>
                  <ol className="space-y-3">
                    {selectedMethodData.instructions.map((inst, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-nexus-blue-950 text-xs font-bold text-white">
                          {i + 1}
                        </span>
                        <span
                          className="text-sm text-slate-700"
                          dangerouslySetInnerHTML={{
                            __html: inst.replace(
                              /\*\*(.+?)\*\*/g,
                              '<strong class="text-nexus-blue-950">$1</strong>'
                            ),
                          }}
                        />
                      </li>
                    ))}
                  </ol>
                </div>

                <button
                  type="button"
                  onClick={() => setStep("submit")}
                  disabled={selectedMethodData.disabled}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  J&apos;ai effectué le paiement
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* ÉTAPE 3 : DÉCLARER LE PAIEMENT */}
            {step === "submit" && selectedMethodData && (
              <>
                <button
                  type="button"
                  onClick={() => setStep("instructions")}
                  className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-nexus-blue-950"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour aux instructions
                </button>

                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
                    Étape 3 / 3
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold text-nexus-blue-950">
                    Confirmer votre paiement
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Renseignez le numéro de transaction reçu par SMS
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-nexus-blue-950">
                      Numéro de transaction <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={transactionNumber}
                      onChange={(e) => setTransactionNumber(e.target.value)}
                      placeholder={
                        selectedMethodData.id === "virement"
                          ? "Ex: REF-VIR-1234567"
                          : selectedMethodData.id === "especes"
                            ? "Ex: Reçu en agence le DD/MM/YYYY"
                            : "Ex: MP123456789"
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedMethodData.id === "orange_money" && "Le numéro reçu par SMS d'Orange Money"}
                      {selectedMethodData.id === "mtn_money" && "Le numéro reçu par SMS de MTN Money"}
                      {selectedMethodData.id === "express_union" && "Le numéro de transaction Express Union"}
                      {selectedMethodData.id === "virement" && "La référence de votre virement bancaire"}
                      {selectedMethodData.id === "especes" && "Date et heure du paiement en agence"}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-nexus-blue-950">
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      rows={2}
                      placeholder="Précisions sur votre paiement..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-nexus-orange-500 focus:outline-none focus:ring-2 focus:ring-nexus-orange-200"
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      <AlertCircle className="mr-1 inline h-4 w-4" />
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !transactionNumber.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-nexus-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-nexus-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Confirmer mon paiement
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-slate-500">
                    En cliquant, vous déclarez avoir effectué le paiement.<br />
                    Notre équipe vérifiera dans les 24h.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Une question ? Contactez-nous :{" "}
            <a
              href={`tel:${NEXUS_PAYMENT_PHONE_RAW}`}
              className="font-semibold text-nexus-blue-950"
            >
              {NEXUS_PAYMENT_PHONE}
            </a>
            {" · "}
            <a
              href={`mailto:${NEXUS_EMAIL}`}
              className="font-semibold text-nexus-blue-950"
            >
              {NEXUS_EMAIL}
            </a>
          </p>
          <p className="mt-2 text-[10px] text-slate-400">
            © {new Date().getFullYear()} Nexus RCA — Agence Internationale
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
function StatusPage({
  icon: Icon,
  iconColor,
  title,
  description,
  bgGradient,
  showPaymentDetails = false,
  paymentLink,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  title: string;
  description: string;
  bgGradient: string;
  showPaymentDetails?: boolean;
  paymentLink?: PaymentLink;
}) {
  return (
    <div className={cn("min-h-screen bg-gradient-to-br px-4 py-12", bgGradient)}>
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="p-8 text-center">
            <div
              className={cn(
                "mx-auto flex h-20 w-20 items-center justify-center rounded-full text-white shadow-xl",
                iconColor
              )}
            >
              <Icon className="h-12 w-12" />
            </div>
            <h1 className="mt-6 font-display text-2xl font-bold text-nexus-blue-950 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-3 text-slate-600">{description}</p>

            {showPaymentDetails && paymentLink && (
              <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-left">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Référence</span>
                    <span className="font-mono font-semibold text-nexus-blue-950">
                      {paymentLink.reference}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service</span>
                    <span className="font-semibold text-nexus-blue-950">
                      {paymentLink.service}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Montant</span>
                    <span className="font-semibold text-nexus-blue-950">
                      {formatMoney(paymentLink.montant, paymentLink.devise)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <a
                href={`tel:${NEXUS_PAYMENT_PHONE_RAW}`}
                className="inline-flex items-center gap-2 rounded-full bg-nexus-blue-950 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-nexus-blue-900"
              >
                <Phone className="h-4 w-4" />
                Contacter Nexus
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
