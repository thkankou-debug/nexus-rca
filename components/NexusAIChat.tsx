"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Zap } from "lucide-react";
import { cn, whatsappLink } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  time: Date;
  suggestions?: string[];
}

const INITIAL_SUGGESTIONS = [
  "Comment obtenir un visa Canada ?",
  "Comment passer le TCF ?",
  "Comment financer mon projet ?",
  "Quels documents pour étudier au Canada ?",
  "Je veux envoyer de l'argent, comment faire ?",
  "Combien coûte un visa touriste ?",
];

function generateResponse(input: string): { text: string; suggestions?: string[] } {
  const q = input.toLowerCase();

  if (/(visa|e-visa|evisa)/.test(q)) {
    if (/canada/.test(q)) {
      return {
        text:
          "Pour un visa Canada, voici les étapes clés :\n\n" +
          "1. Déterminer le type (études, visite, travail, résidence permanente)\n" +
          "2. Réunir les pièces : passeport valide, photos biométriques, justificatifs financiers, lettre d'invitation ou admission\n" +
          "3. Remplir le formulaire en ligne sur le site IRCC\n" +
          "4. Payer les frais et prendre rendez-vous pour les biométries\n" +
          "5. Déposer le dossier au VFS ou consulat\n\n" +
          "Nexus monte votre dossier complet et vous accompagne jusqu'à la décision. Voulez-vous qu'un conseiller étudie votre profil ?",
        suggestions: [
          "Oui, étudier mon profil",
          "Combien de temps ça prend ?",
          "Quels sont les tarifs Nexus ?",
        ],
      };
    }
    return {
      text:
        "Nous traitons tous types de visas : tourisme, études, affaires, travail, et pour plusieurs destinations (Canada, France, Belgique, USA, Schengen).\n\nPour quelle destination et quel motif souhaitez-vous un visa ?",
      suggestions: ["Canada", "France", "USA", "Schengen"],
    };
  }

  if (/(tcf|français|francais)/.test(q)) {
    return {
      text:
        "Le TCF Canada est reconnu par IRCC pour les demandes d'immigration. Nexus propose :\n\n" +
        "• Cours intensifs en petits groupes\n" +
        "• Simulations complètes des 4 épreuves\n" +
        "• Coaching expression orale\n" +
        "• Inscription officielle au centre de test\n\n" +
        "Les prochaines sessions ouvrent chaque mois. Souhaitez-vous que je vous oriente vers un conseiller ?",
      suggestions: ["Oui, m'inscrire", "Durée de la formation ?", "Prix ?"],
    };
  }

  if (/(bourse|étude|etude|université|universite|admission)/.test(q)) {
    return {
      text:
        "Pour étudier au Canada :\n\n" +
        "1. Choisir les universités (nous identifions celles adaptées à votre profil)\n" +
        "2. Monter un dossier d'admission fort (lettre de motivation, CV, relevés)\n" +
        "3. Obtenir la lettre d'admission\n" +
        "4. Demander le CAQ (Québec) ou équivalent\n" +
        "5. Demander le permis d'études (visa)\n\n" +
        "Côté bourses, plusieurs dispositifs existent : BCBG, bourses provinciales, bourses universitaires. Nexus identifie celles pour lesquelles vous êtes éligible et monte les dossiers.",
      suggestions: ["Comment être éligible aux bourses ?", "Universités recommandées ?"],
    };
  }

  if (/(financement|business|entreprise|investisseur|projet)/.test(q)) {
    return {
      text:
        "Nexus accompagne les entrepreneurs centrafricains sur :\n\n" +
        "• Montage de dossiers bancaires solides (business plan, prévisionnels)\n" +
        "• Mise en relation avec investisseurs locaux et internationaux\n" +
        "• Structuration juridique et fiscale\n" +
        "• Accompagnement stratégique\n\n" +
        "Pour avancer, il me faut quelques infos : secteur d'activité, montant recherché, stade du projet. Préférez-vous en discuter avec un conseiller sur WhatsApp ?",
      suggestions: ["Oui, contacter un conseiller", "Quel type de dossier ?"],
    };
  }

  if (/(transfert|envoyer.*argent|western|moneygram|ria)/.test(q)) {
    return {
      text:
        "Nexus est agent pour Western Union, MoneyGram et Ria. Vous pouvez :\n\n" +
        "• Envoyer de l'argent dans le monde entier\n" +
        "• Recevoir un transfert en quelques minutes\n" +
        "• Payer en FCFA ou en devises\n\n" +
        "Passez directement en agence (Relais Sica, Bangui) avec une pièce d'identité. Pour un transfert important, prévenez-nous par WhatsApp.",
      suggestions: ["Voir l'adresse", "WhatsApp"],
    };
  }

  if (/(change|devise|fcfa|euro|dollar|cad)/.test(q)) {
    return {
      text:
        "Nous opérons le change de devises aux meilleurs taux :\n\n" +
        "• FCFA ↔ EUR / USD / CAD / GBP\n" +
        "• Transactions sécurisées avec reçu\n" +
        "• Taux quotidiens affichés en agence\n\n" +
        "Pour un montant important, appelez-nous en amont pour réserver le taux.",
      suggestions: ["Adresse de l'agence", "Quel est le taux aujourd'hui ?"],
    };
  }

  if (/(vol|avion|billet|hôtel|hotel|voyage|skyscanner|google flights)/.test(q)) {
    return {
      text:
        "Pour les vols et hôtels, Nexus donne accès direct aux meilleures plateformes :\n\n" +
        "• Google Flights pour comparer les vols\n" +
        "• Skyscanner pour les hôtels\n\n" +
        "Nous accompagnons aussi les itinéraires complexes, les groupes et les voyages famille. Souhaitez-vous qu'on organise votre voyage ensemble ?",
      suggestions: ["Oui, organiser mon voyage", "Voir Google Flights", "Voir Skyscanner"],
    };
  }

  if (/(cv|lettre|motivation|document|traduction|formulaire|administratif)/.test(q)) {
    return {
      text:
        "Nexus gère tous vos documents administratifs :\n\n" +
        "• CV au format canadien\n" +
        "• Lettres de motivation percutantes\n" +
        "• Traductions français ↔ anglais\n" +
        "• Remplissage formulaires IRCC et consulats\n" +
        "• Impression, scan, reliure\n\n" +
        "Apportez vos brouillons à l'agence ou envoyez-les sur WhatsApp.",
      suggestions: ["Prix CV + lettre ?", "Voir l'adresse"],
    };
  }

  if (/(contact|adresse|téléphone|telephone|whatsapp|horaire|agence)/.test(q)) {
    return {
      text:
        "📍 Adresse : Relais Sica, vers Hôpital Général, Bangui, RCA\n" +
        "📞 WhatsApp : +1 587 327 6344\n\n" +
        "Nous répondons rapidement sur WhatsApp. Passez en agence sans rendez-vous pour un premier contact.",
      suggestions: ["Ouvrir WhatsApp", "Faire une demande en ligne"],
    };
  }

  if (/(bonjour|salut|hello|bonsoir|hi|hey)/.test(q)) {
    return {
      text:
        "Bonjour ! Je suis Nexus IA 🤖 — votre assistant virtuel. Je peux vous aider sur le visa, les études au Canada, le TCF, le financement business, les transferts, les voyages, et plus encore. Que puis-je faire pour vous ?",
      suggestions: INITIAL_SUGGESTIONS.slice(0, 4),
    };
  }

  if (/(merci|thanks|thank you)/.test(q)) {
    return {
      text:
        "Avec plaisir ! Si vous avez d'autres questions, je suis là. Pour aller plus loin, un conseiller humain peut aussi prendre le relais.",
      suggestions: ["Parler à un conseiller", "Faire une demande"],
    };
  }

  // Default
  return {
    text:
      "Je peux vous orienter sur plusieurs sujets : visa, études Canada, TCF, financement business, transferts d'argent, voyages, change de devises, et documents administratifs.\n\nPouvez-vous préciser votre question ? Ou choisissez un sujet ci-dessous.",
    suggestions: INITIAL_SUGGESTIONS,
  };
}

export function NexusAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text:
        "Bonjour et bienvenue 👋\n\nJe suis Nexus IA 🤖, votre assistant virtuel. Je vous aide sur toutes les démarches Nexus : visa, études, TCF, financement, voyages, documents...\n\nQue puis-je faire pour vous aujourd'hui ?",
      time: new Date(),
      suggestions: INITIAL_SUGGESTIONS,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: clean,
      time: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const { text: response, suggestions } = generateResponse(clean);
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: "bot",
        text: response,
        time: new Date(),
        suggestions,
      };
      setMessages((m) => [...m, botMsg]);
      setIsTyping(false);
    }, 700 + Math.random() * 600);
  };

  // Détecte le slug de service depuis l'historique de conversation pour préremplir
  const detectServiceSlug = (): string | null => {
    const recentUserText = messages
      .filter((m) => m.role === "user")
      .slice(-5)
      .map((m) => m.text.toLowerCase())
      .join(" ");
    if (/(visa|e-visa|evisa|passeport|consulat)/.test(recentUserText)) return "visa";
    if (/(tcf|français|francais)/.test(recentUserText)) return "tcf";
    if (/(bourse|université|etudes|études|licence|master)/.test(recentUserText)) return "bourses";
    if (/(financement|business|entreprise|projet|partenariat|investisseur)/.test(recentUserText)) return "financement";
    if (/(billet|avion|vol|hôtel|hotel|voyage)/.test(recentUserText)) return "billets";
    if (/(transfert|western union|moneygram|ria|change|devise)/.test(recentUserText)) return "change";
    if (/(cv|traduction|formulaire|lettre de motivation)/.test(recentUserText)) return "administratif";
    return null;
  };

  // Construit l'URL vers le formulaire complet avec contexte IA
  const buildCompleteFormUrl = (): string => {
    const params = new URLSearchParams();
    const slug = detectServiceSlug();
    if (slug) params.set("service", slug);
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      const ctx = `Contexte depuis Nexus IA : "${lastUserMsg.text}"`;
      params.set("ia_context", ctx);
    }
    const qs = params.toString();
    return qs ? `/demande/complet?${qs}` : "/demande/complet";
  };

  const handleSuggestion = (s: string) => {
    if (s === "Ouvrir WhatsApp" || s === "WhatsApp") {
      window.open(whatsappLink("Bonjour Nexus, je viens du chat IA."), "_blank");
      return;
    }
    if (s === "Parler à un conseiller" || s === "Oui, contacter un conseiller") {
      window.open(whatsappLink("Bonjour Nexus, j'aimerais parler à un conseiller."), "_blank");
      return;
    }
    // Routage vers formulaire complet avec contexte
    if (
      s === "Ouvrir le formulaire complet" ||
      s === "Lancer le traitement de mon dossier" ||
      s === "Faire une demande" ||
      s === "Faire une demande en ligne" ||
      s === "Oui, étudier mon profil" ||
      s === "Oui, m'inscrire" ||
      s === "Oui, organiser mon voyage"
    ) {
      window.location.href = buildCompleteFormUrl();
      return;
    }
    // Routage vers formulaire simple
    if (s === "Demande rapide") {
      window.location.href = "/demande";
      return;
    }
    if (s === "Voir Google Flights") {
      window.open("https://www.google.com/flights", "_blank");
      return;
    }
    if (s === "Voir Skyscanner") {
      window.open("https://www.skyscanner.net/hotels", "_blank");
      return;
    }
    send(s);
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden" style={{ height: "min(80vh, 700px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-nexus-blue-900 via-nexus-blue-800 to-nexus-orange-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur">
              <Bot className="h-6 w-6" />
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 ring-2 ring-nexus-blue-800" />
          </div>
          <div>
            <div className="font-display text-lg font-bold">Nexus IA 🤖</div>
            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-400" /> En ligne · Réponse instantanée
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs sm:flex">
          <Zap className="h-3.5 w-3.5 text-nexus-orange-300" /> Propulsé par Nexus
        </div>
      </div>

      {/* Nudge CTA vers le formulaire complet (après 3 échanges utilisateur) */}
      {messages.filter((m) => m.role === "user").length >= 3 && (
        <div className="flex items-center justify-between gap-3 border-b border-nexus-orange-200 bg-gradient-to-r from-nexus-orange-50 to-nexus-blue-50 px-4 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="h-4 w-4 shrink-0 text-nexus-orange-600" />
            <p className="truncate text-xs text-nexus-blue-900 sm:text-sm">
              Prêt·e ? Ouvrez votre dossier complet, je récupère notre échange.
            </p>
          </div>
          <button
            onClick={() => (window.location.href = buildCompleteFormUrl())}
            className="shrink-0 rounded-full bg-nexus-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-nexus-orange-600"
          >
            Ouvrir le dossier →
          </button>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={cn("flex gap-2.5", m.role === "user" ? "justify-end" : "justify-start")}
            >
              {m.role === "bot" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nexus-blue-700 to-nexus-orange-500 text-white shadow">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div className={cn("max-w-[80%] space-y-2", m.role === "user" && "items-end")}>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-line",
                    m.role === "user"
                      ? "bg-nexus-blue-900 text-white rounded-tr-sm"
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-sm"
                  )}
                >
                  {m.text}
                </div>
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {m.suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestion(s)}
                        className="rounded-full border border-nexus-orange-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-nexus-orange-700 transition-all hover:-translate-y-0.5 hover:bg-nexus-orange-500 hover:text-white hover:shadow"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {m.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nexus-blue-100 text-nexus-blue-800">
                  <User className="h-4 w-4" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-nexus-blue-700 to-nexus-orange-500 text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
              <span className="h-2 w-2 animate-bounce rounded-full bg-nexus-orange-500" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-nexus-orange-500" style={{ animationDelay: "120ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-nexus-orange-500" style={{ animationDelay: "240ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-slate-200 bg-white p-3"
      >
        <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 focus-within:border-nexus-orange-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-nexus-orange-100">
          <Sparkles className="h-4 w-4 text-nexus-orange-500" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question à Nexus IA..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-600 text-white transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            aria-label="Envoyer"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          Nexus IA est un assistant virtuel. Pour les dossiers complexes, un conseiller humain prend le relais.
        </p>
      </form>
    </div>
  );
}
