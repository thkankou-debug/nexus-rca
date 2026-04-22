# 🌍 NEXUS RCA – Agence Internationale

Plateforme digitale complète pour l'agence **Nexus RCA** basée à Bangui, République Centrafricaine. Gestion des demandes clients, authentification multi-rôles, dashboards dédiés, et intégration Supabase.

---

## 📍 Coordonnées de l'agence

- **Adresse :** Relais Sica, vers Hôpital Général, Bangui, Centrafrique
- **WhatsApp :** +1 587 327 6344

---

## 🚀 Stack technique

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + design system personnalisé
- **Supabase** (Auth + PostgreSQL + Row Level Security)
- **Lucide Icons** + **Framer Motion**
- **React Hot Toast** pour les notifications

---

## 📦 Installation

### 1. Prérequis

- **Node.js** ≥ 18.17
- **npm** ou **pnpm** ou **yarn**
- Un compte **Supabase** gratuit → https://supabase.com

### 2. Cloner et installer

```bash
cd nexus-rca
npm install
```

### 3. Créer le projet Supabase

1. Connectez-vous à [Supabase](https://supabase.com) et cliquez sur **New project**.
2. Choisissez un nom (`nexus-rca`), un mot de passe DB, et une région proche (ex. `eu-west-3`).
3. Attendez quelques minutes pour que la base soit provisionnée.

### 4. Exécuter le schéma SQL

1. Dans le dashboard Supabase, ouvrez **SQL Editor** (icône éclair à gauche).
2. Copiez tout le contenu de `supabase/schema.sql`.
3. Collez-le dans l'éditeur et cliquez sur **Run**.

Cela crée :
- Les 4 tables (`profiles`, `demandes`, `rendez_vous`, `contacts`)
- Les enums (`user_role`, `demande_status`, `urgence_level`)
- Les triggers (création automatique du profil, update de `updated_at`)
- Les politiques **Row Level Security** pour les 4 rôles

### 5. Configurer les variables d'environnement

Copiez `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

Remplissez avec vos clés Supabase (récupérées dans **Project Settings → API**) :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=15873276344
```

### 6. Désactiver la confirmation email (recommandé en dev)

Dans Supabase → **Authentication → Providers → Email** : désactivez **Confirm email** pour accélérer les tests. En production, activez-la.

### 7. Lancer le projet

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) 🎉

---

## 👤 Créer le premier super admin

1. Créez un compte normal via `/register`
2. Dans Supabase → **SQL Editor**, exécutez :

```sql
update public.profiles
set role = 'super_admin'
where email = 'votre-email@exemple.com';
```

3. Déconnectez-vous puis reconnectez-vous → vous accédez à `/dashboard/super-admin`

Depuis l'interface super-admin, vous pouvez promouvoir d'autres utilisateurs en `agent`, `admin` ou `super_admin`.

---

## 🗂️ Structure du projet

```
nexus-rca/
├── app/
│   ├── page.tsx                     # Homepage
│   ├── layout.tsx                   # Root layout (fonts, metadata)
│   ├── globals.css
│   ├── services/
│   │   ├── page.tsx                 # Liste des services
│   │   ├── [slug]/page.tsx          # Page dynamique par service
│   │   └── nexus-ia/page.tsx        # Assistant IA
│   ├── demande/page.tsx             # Formulaire de demande
│   ├── contact/page.tsx             # Formulaire de contact
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── auth/callback/route.ts       # Callback OAuth/email
│   └── dashboard/
│       ├── page.tsx                 # Redirection selon rôle
│       ├── client/                  # Espace client
│       ├── agent/                   # Espace agent
│       ├── admin/                   # Espace admin
│       └── super-admin/             # Espace super-admin
├── components/
│   ├── layout/                      # Navbar, Footer, WhatsAppFloat
│   ├── dashboard/                   # Shell, Managers, StatCard
│   ├── ui/                          # Button, Input, Card, Logo, Container
│   ├── Hero.tsx
│   ├── ServicesGrid.tsx
│   ├── HowItWorks.tsx
│   ├── TravelCTA.tsx
│   ├── Testimonials.tsx
│   ├── FinalCTA.tsx
│   ├── NexusAIChat.tsx
│   └── DemandeForm.tsx
├── lib/
│   ├── supabase/                    # Clients browser/server/middleware
│   ├── services.ts                  # Catalogue des 9 services
│   ├── auth.ts                      # Helper requireProfile
│   └── utils.ts
├── types/index.ts                   # Types Profile, Demande, etc.
├── supabase/schema.sql              # Schema complet + RLS
├── middleware.ts                    # Protection des routes
└── tailwind.config.ts               # Design system Nexus
```

---

## 🎭 Les 4 rôles

| Rôle | Accès | Permissions clés |
|------|-------|------------------|
| **client** | `/dashboard/client` | Créer et voir ses demandes, prendre RDV |
| **agent** | `/dashboard/agent` | Traiter les demandes, mettre à jour statuts, ajouter notes |
| **admin** | `/dashboard/admin` | Voir stats globales, supprimer demandes, lister utilisateurs |
| **super_admin** | `/dashboard/super-admin` | Modifier les rôles, contrôle total |

Les permissions sont doublement enforced :
- Côté **application** via `requireProfile()` (redirige si rôle insuffisant)
- Côté **base de données** via les **policies RLS** (empêche toute fuite même en cas de bug front)

---

## 🧠 Les 9 services intégrés

1. **Financement business & partenariat** — montage de dossiers, recherche d'investisseurs
2. **Visa & e-Visa** — Canada, Europe, USA, permis de travail
3. **Préparation TCF Canada** — cours + simulations + inscription
4. **Bourses d'études Canada** — universités, dossiers, bourses
5. **Services administratifs** — CV canadien, traductions, formulaires
6. **Billets d'avion & hôtels** — intégration directe **Google Flights** + **Skyscanner**
7. **Change de devises** — FCFA/EUR/USD/CAD
8. **Transfert d'argent** — Western Union, MoneyGram, Ria
9. **Nexus IA 🤖** — assistant conversationnel 24/7

---

## 🚢 Déploiement

### Vercel (recommandé)

```bash
npm install -g vercel
vercel
```

Ajoutez les variables d'environnement sur le dashboard Vercel (**Settings → Environment Variables**).

### Autres plateformes

Next.js se déploie aussi sur Netlify, Railway, Fly.io, Cloudflare Pages. Assurez-vous simplement que les variables d'environnement sont correctement définies.

---

## ✅ Checklist de mise en production

- [ ] Supabase : activer **Confirm email** dans Authentication
- [ ] Supabase : ajouter le domaine production dans **Auth → URL Configuration → Redirect URLs**
- [ ] Supabase : vérifier que toutes les politiques RLS sont actives
- [ ] Promouvoir le premier `super_admin`
- [ ] Créer les premiers comptes `agent` et `admin`
- [ ] Vérifier le numéro WhatsApp dans `.env`
- [ ] Tester le formulaire `/demande` sans être connecté et connecté
- [ ] Tester les 4 dashboards avec des comptes différents
- [ ] Ajouter un favicon personnalisé dans `public/`
- [ ] Configurer un domaine personnalisé (ex. `nexus-rca.com`)

---

## 🎨 Design system

- **Couleurs primaires :** bleu nuit `#050f3d` → `#0a1a6b` + orange signature `#f97316`
- **Typographies :** Syne (display) + Plus Jakarta Sans (body)
- **Motifs :** gradients mesh, glass morphism, grain, ombres orange douces
- **Animations :** fade, float, shimmer, gradient-x

Toute la palette est définie dans `tailwind.config.ts` → `theme.extend.colors.nexus`.

---

## 🗂️ Migration 002 — Demande complète + documents

Cette migration ajoute le **formulaire de demande détaillé** (`/demande/complet`) avec upload de documents, champs dynamiques selon le service, et intégration avec Nexus IA.

### Ce qu'elle apporte

- **Table `demandes` étendue** : 12 nouvelles colonnes (ville, langue préférée, objet, date souhaitée, pays concerné, destination, budget, traitement prioritaire, source, consentements RGPD, et `details_service` en JSONB pour les champs dynamiques)
- **2 nouveaux statuts** : `incomplet` (dossier manquant de pièces) et `en_traitement` (conseiller activement sur le dossier)
- **Nouvelle table `demande_documents`** pour stocker les métadonnées des fichiers joints, avec RLS stricte
- **Bucket Supabase Storage `demande-documents`** (privé) avec policies : un client ne voit que ses propres fichiers, le staff voit tout
- **Vue `demandes_avec_documents`** qui expose le nombre de documents par demande

### Étapes d'exécution

1. Assurez-vous d'avoir déjà exécuté `supabase/schema.sql`
2. Ouvrez **SQL Editor** dans Supabase
3. Copiez tout le contenu de `supabase/migration_002_demande_complete.sql`
4. Collez et cliquez sur **Run**
5. Allez dans **Storage** (menu de gauche) et vérifiez que le bucket **`demande-documents`** existe et est **privé** (Public : OFF)
   - S'il n'apparaît pas, créez-le manuellement : **New bucket** → nom `demande-documents` → Public : OFF
6. Dans **Storage → Policies**, vérifiez que 3 policies existent pour ce bucket (Insert, Select, Delete). Si absentes, elles seront créées automatiquement au prochain `Run` de la migration.

### Contraintes sur les fichiers

Définies dans `lib/demande-form.ts` — faciles à ajuster :

- **Taille max** : 10 Mo par fichier
- **Nombre max** : 8 fichiers par demande
- **Formats autorisés** : PDF, JPG, JPEG, PNG, DOC, DOCX

### Comment Nexus IA route vers le formulaire complet

Le composant `NexusAIChat` détecte automatiquement le service évoqué dans les 5 derniers messages utilisateur (regex sur `visa`, `tcf`, `études`, `financement`, etc.) et construit une URL pré-remplie :

```
/demande/complet?service=visa&ia_context=Contexte depuis Nexus IA : "..."
```

Une bannière de nudge apparaît automatiquement après 3 échanges pour proposer l'ouverture du dossier complet. Les champs `service_type`, `description` et `source=nexus_ia` sont pré-remplis côté formulaire.

### Vérification post-migration

Testez rapidement en soumettant une demande via `/demande/complet` avec 1 ou 2 fichiers :

1. La demande apparaît dans `public.demandes` avec `source = 'formulaire_complet'` et `details_service` en JSONB
2. Les fichiers apparaissent dans `public.demande_documents`
3. Les fichiers sont stockés dans le bucket `demande-documents/{demande_id}/...`
4. Dans le dashboard (agent / admin), l'expansion d'une demande affiche tous les champs + le bouton **Télécharger** pour chaque document (URL signée valable 60s)

### Notes importantes

- Le composant `DemandeDocumentsList` génère des **URLs signées temporaires** (60 secondes) — les fichiers ne sont jamais accessibles publiquement
- Si vous passez une demande au statut `incomplet`, le client est notifié qu'il manque des pièces (à vous d'ajouter la logique email/SMS selon votre setup)
- Les 3 consentements RGPD sont horodatés via `created_at` de la demande — preuves légales

---

## 🤝 Support

Pour toute question technique sur ce projet, contactez Nexus RCA :
- WhatsApp : [+1 587 327 6344](https://wa.me/15873276344)
- Adresse : Relais Sica, vers Hôpital Général, Bangui

---

**© 2026 Nexus RCA — De Bangui au monde 🌍**
