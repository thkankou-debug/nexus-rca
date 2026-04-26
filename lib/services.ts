import {
  Briefcase,
  FileText,
  GraduationCap,
  Award,
  FileSignature,
  Plane,
  Coins,
  Send,
  Bot,
  Globe,
  Handshake,
  type LucideIcon,
} from "lucide-react";

export interface Service {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  icon: LucideIcon;
  features: string[];
  accent: "blue" | "orange";
  image: string;
}

export const SERVICES: Service[] = [
  {
    id: "1",
    slug: "financement",
    title: "Incubateur & financement en partenariat",
    shortDesc:
      "Partenariat direct, accompagnement et investissement dans des projets sélectionnés.",
    longDesc:
      "NEXUS RCA ne se limite pas à conseiller. Nous accompagnons, participons au développement et investissons en partenariat dans des projets sélectionnés. Notre approche repose sur une collaboration directe, un suivi long terme et un partage des résultats. Soumettez votre projet : nous l'étudions selon des critères clairs (viabilité, potentiel, structuration, engagement du porteur) et revenons avec une réponse transparente.",
    icon: Handshake,
    features: [
      "Accompagnement complet du projet de A à Z",
      "Investissement direct en partenariat",
      "Suivi long terme et développement stratégique",
      "Sélection rigoureuse selon critères transparents",
      "Partage des résultats avec les porteurs",
    ],
    accent: "blue",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "2",
    slug: "visa",
    title: "Visa & e-Visa",
    shortDesc:
      "Canada, Europe, États-Unis — les bons papiers, au bon format, au bon moment.",
    longDesc:
      "Spécialistes des démarches consulaires, nous traitons vos demandes de visa tourisme, études, affaires et travail. Canada, Europe, USA — nous connaissons les subtilités de chaque consulat et préparons des dossiers qui passent.",
    icon: FileText,
    features: [
      "Visa tourisme, études, affaires, travail",
      "Canada, France, Belgique, USA, Schengen",
      "E-visa rapide (48-72h selon destination)",
      "Permis de travail Canada (EIMT, MIFI)",
      "Assistance entretien consulaire",
    ],
    accent: "orange",
    image:
      "https://images.unsplash.com/photo-1569974498991-d3c12a504f95?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "3",
    slug: "tcf",
    title: "Préparation TCF Canada",
    shortDesc:
      "Le test de français qui fait la différence pour votre dossier d'immigration.",
    longDesc:
      "Formation intensive au TCF Canada (Test de Connaissance du Français) reconnu par IRCC. Nos coachs préparent les quatre épreuves — compréhension orale, expression orale, compréhension écrite, expression écrite — avec simulations réelles.",
    icon: GraduationCap,
    features: [
      "Cours intensifs en groupe ou individuel",
      "Simulations complètes d'examen",
      "Inscription officielle au centre de test",
      "Coaching expression orale personnalisé",
      "Ressources numériques illimitées",
    ],
    accent: "blue",
    image:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "4",
    slug: "bourses",
    title: "Bourses d'études Canada",
    shortDesc:
      "De la recherche de l'université à la lettre d'admission — nous gérons tout.",
    longDesc:
      "Accompagnement complet pour étudier au Canada. Nous identifions les universités alignées à votre profil, montons un dossier gagnant et recherchons activement les bourses auxquelles vous êtes éligible.",
    icon: Award,
    features: [
      "Identification des universités ciblées",
      "Montage du dossier d'admission complet",
      "Rédaction lettres de motivation percutantes",
      "Recherche de bourses (BCBG, MELS, provinciales)",
      "CAQ + permis d'études",
    ],
    accent: "orange",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "5",
    slug: "administratif",
    title: "Services administratifs",
    shortDesc:
      "CV, traductions, formulaires — la paperasse faite proprement et vite.",
    longDesc:
      "Tout ce qui touche aux documents officiels : rédaction, mise en forme, traduction français-anglais, remplissage de formulaires complexes, impression et numérisation. Vos papiers sortent d'ici propres et prêts à être déposés.",
    icon: FileSignature,
    features: [
      "CV format canadien + lettre de motivation",
      "Rédaction et mise en forme de documents",
      "Traduction français ↔ anglais",
      "Remplissage formulaires (IRCC, consulats)",
      "Impression, scan, reliure",
    ],
    accent: "blue",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "6",
    slug: "billets",
    title: "Billets d'avion & hôtels",
    shortDesc:
      "Comparez, réservez, voyagez — directement via les meilleures plateformes mondiales.",
    longDesc:
      "Accès direct aux meilleures plateformes internationales pour vos billets d'avion et réservations d'hôtels. Comparaison en temps réel, tarifs compétitifs, et accompagnement Nexus pour les itinéraires complexes ou groupes.",
    icon: Plane,
    features: [
      "Recherche de vols via Google Flights",
      "Réservation hôtels via Skyscanner",
      "Itinéraires multi-destinations",
      "Tarifs groupes & famille",
      "Assistance voyage 24/7 (WhatsApp)",
    ],
    accent: "orange",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "7",
    slug: "change",
    title: "Change de devises",
    shortDesc:
      "FCFA, EUR, USD, CAD — des taux compétitifs et des transactions sécurisées.",
    longDesc:
      "Service de change de devises aux meilleurs taux du marché. Achat et vente de FCFA, Euro, Dollar américain, Dollar canadien. Opérations sécurisées avec reçu et traçabilité complète.",
    icon: Coins,
    features: [
      "FCFA ↔ EUR / USD / CAD / GBP",
      "Taux compétitifs quotidiens",
      "Transactions sécurisées avec reçu",
      "Pas de frais cachés",
      "Disponibilité en agence à Bangui",
    ],
    accent: "blue",
    image:
      "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "8",
    slug: "transfert",
    title: "Transfert d'argent",
    shortDesc:
      "Western Union, MoneyGram, Ria — vos transferts partent et arrivent vite.",
    longDesc:
      "Agent officiel pour les grands réseaux internationaux. Envoyez et recevez de l'argent partout dans le monde en quelques minutes, avec la fiabilité de Western Union, MoneyGram et Ria.",
    icon: Send,
    features: [
      "Western Union (mondial)",
      "MoneyGram (rapide)",
      "Ria Money Transfer",
      "Transferts reçus en quelques minutes",
      "Paiement en FCFA ou devises",
    ],
    accent: "orange",
    image:
      "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "9",
    slug: "nexus-ia",
    title: "Nexus IA 🤖",
    shortDesc:
      "Un assistant intelligent pour répondre à vos questions à toute heure.",
    longDesc:
      "L'assistant virtuel de Nexus RCA, disponible 24/7 pour vous guider sur vos démarches : visa, études, financement, voyages. Posez vos questions en langage naturel, recevez des réponses précises et des recommandations adaptées à votre situation.",
    icon: Bot,
    features: [
      "Disponible 24/7",
      "Conseils personnalisés visa & études",
      "Orientation sur tous les services Nexus",
      "Réponses instantanées en français",
      "Transfert vers un conseiller humain si besoin",
    ],
    accent: "blue",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "10",
    slug: "digitalisation",
    title: "Digital & développement d'activité",
    shortDesc:
      "Sites web, WhatsApp Business, visibilité — donnez à votre activité la présence digitale qu'elle mérite.",
    longDesc:
      "Nexus RCA aide les particuliers et les entreprises à se digitaliser, renforcer leur crédibilité et attirer des clients grâce à des outils modernes et efficaces. Sites web professionnels, WhatsApp Business, formulaires clients, structuration de la présence digitale et accompagnement stratégique.",
    icon: Globe,
    features: [
      "Sites web professionnels (vitrine, e-commerce, sur-mesure)",
      "WhatsApp Business (catalogue, réponses automatiques)",
      "Formulaires clients optimisés pour générer des leads",
      "Structuration complète de la présence digitale",
      "3 packs adaptés : Essentiel, Pro, Premium",
    ],
    accent: "orange",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  },
];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
