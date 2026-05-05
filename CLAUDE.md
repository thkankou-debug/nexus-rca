# CLAUDE.md

> Ce fichier est lu automatiquement par Claude Code à chaque session.
> Il contient le contexte essentiel pour travailler sur Nexus RCA.
> **TOUJOURS lire ce fichier en premier avant toute modification.**

---

## ⚠️ AVANT DE COMMENCER — RÈGLE D'OR

**Le site Nexus RCA est EN PRODUCTION avec de vrais clients qui paient.**

Tu n'es PAS là pour "améliorer" ce qui marche déjà. Tu es là pour **ajouter ce qui manque** ou **corriger ce qui est demandé EXPLICITEMENT**.

Si Thierry te dit "améliore le site", **POSE-LUI DES QUESTIONS PRÉCISES** avant de toucher quoi que ce soit. Liste les améliorations possibles, demande son accord, attaque UNE feature à la fois.

---

## 🚨 CHOSES À NE JAMAIS FAIRE (FROZEN)

### ❌ NE JAMAIS modifier sans demande explicite :
1. **Le logo Nexus** (taille, position, couleur, fichier)
2. **Les couleurs principales** : `nexus-blue-950` (#0C1C40) et `nexus-orange-500` (#FF6600)
3. **Les polices** : Syne (titres) et Plus Jakarta Sans (corps)
4. **Les titres des pages services** (voir liste plus bas)
5. **La structure de routing** (`app/dashboard/agent/`, `app/dashboard/client/`, etc.)
6. **Le DashboardShell** (sidebar + header utilisé partout)
7. **Les variables d'env Vercel** (RESEND_API_KEY, SUPABASE_*, NEXT_PUBLIC_SITE_URL)

### ❌ NE JAMAIS faire :
- Refactoring massif d'un fichier qui marche
- Remplacer une bibliothèque (pas de shadcn, MUI, Chakra — Tailwind only)
- Créer un dossier avec syntaxe `{a,b,c}` dans `app/` (route group parallèle = bug)
- Utiliser `toLocaleString("fr-FR")` dans un PDF (insère `\u202f` qui crash WinAnsi)
- Hardcoder des valeurs magiques (mets des constantes en haut du fichier)
- Modifier les RLS Supabase sans précaution (peut bloquer toute l'app)
- Pousser sans avoir testé `npm run build` localement (build Vercel échoue sur erreurs TS)

---

## 🎨 RÈGLES DE DESIGN STRICTES

### 🔴 RÈGLE — Titres des pages services
**Format obligatoire** : 2-6 mots maximum, court et élégant.

**Liste exacte des titres officiels** (ne PAS modifier sans demande explicite) :

| Page | Titre exact |
|---|---|
| `/services/visa` | `Visa & e-Visa` |
| `/services/billet-avion-hotel` | `Billet d'avion & Hôtels` |
| `/services/incubateur` | `Incubateur & Financement en partenariat` |
| `/nexus-ia` | `Rencontrez NEXUS IA 🤖` |

**INTERDIT** :
- Phrases longues type "Dossiers visa préparés selon les standards décisionnels consulaires"
- Titres marketing "Obtenez votre visa rapidement avec nos experts"
- Reformulations "créatives" sans accord

### 🔴 RÈGLE — Taille des titres (look premium discret)
**Hero pages publiques** :
```tsx
<h1 className="font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
  {titre}
</h1>
```
- ✅ Tailles autorisées : `text-3xl`, `text-4xl`, `text-5xl`, `text-6xl`
- ❌ INTERDIT : `text-7xl`, `text-8xl`, `text-9xl` (pas premium)

**Hero dashboards** :
```tsx
<h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
  Bonjour, {nom}
</h1>
```

**Pattern premium** :
- Titre court (h1)
- Sous-titre descriptif (`<p className="mt-4 text-lg text-slate-300 max-w-2xl">`)
- Padding généreux autour
- PAS de titre à rallonge qui occupe toute la page

### 🔴 RÈGLE — Couleurs (palette Nexus uniquement)

| Usage | Classe Tailwind | Hex |
|---|---|---|
| Fond hero principal | `bg-nexus-blue-950` | #0C1C40 |
| Dégradé hero | `from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950` | navy |
| Accent boutons/badges | `bg-nexus-orange-500` | #FF6600 |
| Texte sur navy | `text-white` ou `text-slate-300` | |
| Texte sur blanc | `text-nexus-blue-950` | |
| Hover orange | `hover:bg-nexus-orange-600` | |

**INTERDIT** :
- Introduire de nouvelles couleurs primaires (pas de bleu clair, pas de rouge, pas de violet)
- Modifier les valeurs `#0C1C40` ou `#FF6600` dans `tailwind.config.ts`
- Utiliser des couleurs hex en dur (`bg-[#0C1C40]`) au lieu des classes (`bg-nexus-blue-950`)

### 🔴 RÈGLE — Polices

```tsx
<h1 className="font-display ...">  // Titres en Syne
<p className="font-sans ...">       // Corps en Plus Jakarta Sans (par défaut)
```

**INTERDIT** :
- Importer une nouvelle police Google Fonts
- Utiliser `font-mono` sauf pour code/références techniques (ex: `RDV-2026-XXX`)

### 🔴 RÈGLE — Composants UI

- **Icônes** : `lucide-react` UNIQUEMENT (jamais `react-icons`, `heroicons`, etc.)
- **Pas de bibliothèque UI** : Tailwind utility classes uniquement (pas de shadcn, MUI, Chakra, Ant Design)
- **Pattern cards** : `rounded-2xl` ou `rounded-3xl`, `border border-slate-200`, `shadow-sm`
- **Pattern buttons primary** : `bg-nexus-orange-500 hover:bg-nexus-orange-600 text-white rounded-xl px-6 py-3 font-semibold`

---

## 📋 CONTEXTE PROJET

### Identité
- **Nom** : Nexus RCA
- **Domaine** : Agence internationale (visas, billets d'avion, hôtels, transferts, immigration, financement)
- **Lieu** : Bangui, République Centrafricaine
- **Production** : https://www.nexusrca.com
- **Repo** : https://github.com/thkankou-debug/nexus-rca
- **Hosting** : Vercel auto-deploy depuis `main`

### Contacts
- **Adresse** : Relais Sica, vers Hôpital Général, Bangui, RCA
- **Téléphone RCA** : +236 73 26 96 92 (DEFAULT WhatsApp + Mobile Money)
- **Téléphone Canada** : +1 587 327 6344
- **Email** : contact@nexusrca.com

### Stack
- **Framework** : Next.js 14 App Router + TypeScript strict
- **UI** : Tailwind CSS + lucide-react
- **DB** : Supabase (Postgres + Auth + RLS)
- **Email** : Resend (domaine `nexusrca.com` vérifié)
- **PDF** : pdf-lib v1.17.1
- **PWA** : activée (manifest.json + sw.js)

### Variables Vercel (NE PAS TOUCHER)
- `RESEND_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL=https://www.nexusrca.com`

Si tu ajoutes une nouvelle variable, **dis-le explicitement** à Thierry pour qu'il l'ajoute dans Vercel Settings → Environment Variables.

### Comptes de test
- **Super admin** : tkankou@gmail.com
- **Client test** : yatolamarie04@gmail.com

---

## 🗂️ STRUCTURE DU PROJET

```
nexus-rca/
├── app/
│   ├── (pages publiques: a-propos, contact, services, nexus-connect)
│   ├── api/
│   │   ├── appointments/
│   │   ├── payment-links/
│   │   └── ...
│   ├── dashboard/
│   │   ├── client/
│   │   ├── agent/
│   │   ├── admin/
│   │   └── super-admin/
│   ├── payer/[reference]/
│   ├── login/
│   └── layout.tsx
├── components/
│   ├── dashboard/
│   │   ├── DashboardShell.tsx
│   │   ├── StatusBadge.tsx
│   │   └── ...
│   └── ui/
├── lib/
│   ├── auth.ts
│   ├── supabase/
│   └── utils.ts
├── types/index.ts
├── supabase/migrations/ (001 → 017)
└── public/ (manifest.json, sw.js, logo)
```

---

## ✅ MODULES EXISTANTS (NE PAS CASSER)

### Authentification
Multi-rôles : `client`, `agent`, `admin`, `super_admin`. Helper `requireProfile([roles])` dans `lib/auth.ts`.

### Pages publiques
`/`, `/a-propos`, `/contact`, `/services`, `/nexus-connect`, `/demande/complet`, `/login`

### Espace Client
`/dashboard/client` (NEXUS CONNECT), `/demandes`, `/paiements`, `/rdv`, `/rdv/nouveau`

### Espace Agent
`/dashboard/agent` (premium dashboard avec leaderboard), `/caisse`, `/rdv`, `/demandes`, `/clients`, `/paiements`, `/depenses`, `/transferts`

### Espace Super Admin
`/dashboard/super-admin`, `/rapports`, `/rdv`, `/paiements/en-attente`, `/paiements/nouveau-lien`

### Système Paiements Liens Mobile Money
6 méthodes : Orange/MTN/Express RCA, Virement, Espèces, Stripe (désactivé). Workflow : génération → déclaration → vérification → PDF + email auto.

### Système RDV
Booking client 4 étapes, affectation auto agent, 8 statuts, email Resend.

### Tables Supabase
`profiles`, `clients`, `demandes`, `appointments`, `payments`, `payment_links`, `expenses`, `transferts`, `quick_sales`

⚠️ **Table `payments` n'a PAS de colonne `methode`**. Utilise `notes` ou `description`.

---

## 🐛 BUGS DÉJÀ RÉSOLUS (NE PAS RECRÉER)

| Bug | Cause | Fix |
|---|---|---|
| Aucun email envoyé | `RESEND_API_KEY` manquante Vercel | Variable ajoutée |
| PDF crash WinAnsi | Espace insécable `0x202f` | Sanitize systématique |
| Payments insert fail | Colonne `methode` inexistante | Try multiple structures |
| Routing agent cassé | Dossier `{client,agent,admin,super-admin}` vide | Dossier supprimé |
| Build TS fail | `Property 'poste' does not exist on type 'Profile'` | Cast `as unknown as Record<string, unknown>` |

---

## 🛠️ COMMENT TRAVAILLER

### 🟢 AVANT chaque modification
1. **Lire ce fichier (CLAUDE.md) en entier**
2. **Lire les fichiers concernés** avec View
3. **Identifier les composants partagés** avec `grep`
4. **Poser 2-3 questions clarifiantes à Thierry** si quelque chose est ambigu
5. **Attendre confirmation explicite** avant de coder

### 🟡 PENDANT le code
1. **TypeScript strict** — pas de `any`, types précis
2. **Logs explicites** — préfixe `[FEATURE_NAME]` dans `console.log`
3. **Try/catch** sur toutes les API routes
4. **Sanitize** les textes PDF
5. **Respecter le design system** (couleurs, polices, tailles)
6. **Hauteur des titres** : `text-3xl` à `text-6xl` MAX

### 🔴 APRÈS le code
1. **Récap des fichiers modifiés/créés**
2. **Liste des variables d'env nouvelles** (si applicable)
3. **Liste des migrations SQL** (si applicable)
4. **Commande git exacte** à exécuter
5. **Procédure de test** étape par étape

### 📐 Format des réponses pour Thierry
- **Étapes numérotées** (Étape 1, 2, 3...)
- **Code dans blocs** ` ```typescript`, ` ```sql`, ` ```bash`
- **Pas de blabla inutile**, droit au but
- **Procédures claires** : action → vérification

### 👤 À propos de Thierry
- Français, débutant en dev
- Lenovo T440s Windows 11 + VS Code + Chrome
- Préfère recevoir 1 fichier complet à glisser plutôt que des diffs
- Phrase de validation : "Tout marche" → trigger feature suivante
- Tolérance zéro pour : erreurs de build, fichiers incomplets, longues théories sans action

---

## 🎯 ROADMAP (par priorité)

1. **WhatsApp Twilio** — notifications auto RDV/paiements
2. **Stripe activation** — cartes bancaires internationales
3. **Messagerie interne** — chat agent ↔ client
4. **Multi-langue FR/EN** — pour diaspora
5. **Cron rapports mensuels** — PDF auto le 1er du mois
6. **Search global** — recherche transverse
7. **Notifications cloche** — in-app
8. **Export Excel** — rapports comptables

---

## 🚨 SCÉNARIOS À ÉVITER

### ❌ Refactoring "pour faire propre"
"Je vais réécrire ce fichier pour qu'il soit plus moderne" = **NON**.

### ❌ Modifications de masse silencieuses
Si tu touches à 5 fichiers, **liste-les explicitement** avant de coder.

### ❌ Reformulation des textes existants
Les titres et textes UI sont des choix produit. **Ne les modifie JAMAIS** sans demande explicite de Thierry.

### ❌ Ajout d'animations/effets non demandés
Pas de framer-motion, pas de transitions complexes. Le site est sobre et premium.

### ❌ Création d'une nouvelle palette
Bleu marine + orange. Point.

---

## ✅ EXEMPLE DE BONNE INTERACTION

**Thierry** :
> "Améliore la page contact"

**Toi (mauvaise réponse)** :
> "Je vais refaire toute la page contact avec un nouveau hero, des animations, un formulaire moderne..."

**Toi (bonne réponse)** :
> J'ai lu CLAUDE.md et `app/contact/page.tsx`.
>
> Avant de modifier, j'ai 3 questions :
> 1. Tu veux ajouter quelque chose en particulier (ex: carte Google Maps, formulaire de contact fonctionnel) ou améliorer le visuel existant ?
> 2. Le formulaire actuel envoie-t-il un email ? Si oui je le garde tel quel.
> 3. Quelle partie te déplait visuellement précisément ?
>
> En attendant, je ne touche à RIEN.

---

## 💬 PHRASES DE COMMUNICATION

- Quand tu démarres : *"J'ai lu CLAUDE.md. Voici ce que je comprends de la mission : [...]. Avant de coder, j'ai N questions."*
- Quand tu finis : *"Fichiers modifiés : [...]. Pour tester : [...]. Push avec : [...]."*
- Si tu hésites : *"Avant de continuer, je veux confirmer : [...]"*

---

**Le site est en production. Sois prudent. Pose des questions. Ne brise pas ce qui marche. 🐢**
