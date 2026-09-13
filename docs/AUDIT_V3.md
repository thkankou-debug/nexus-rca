# AUDIT V3 — NEXUS RCA
**Phase 0 du Blueprint V3 — Audit seul, aucune écriture de code effectuée.**
Date : 4 septembre 2026 · Exécutant : Claude Code · Périmètre : dépôt local `nexus-rca-claude-test`

> Méthode : lecture de code, `grep`/recherche statique, `git log`, exécution de `tsc --noEmit`, `next lint`, `next build`. Aucune connexion à la base Supabase de production n'a été effectuée (MCP Supabase non interrogé) — les constats sur le schéma et les RLS reposent uniquement sur les fichiers de migration présents dans le dépôt.

---

## 0. RÉSUMÉ EXÉCUTIF — 3 CONSTATS À LIRE EN PREMIER

1. **Les migrations SQL 001 à 017 n'existent nulle part** — ni sur le disque, ni dans l'historique Git (`git log` sur `supabase/migrations` ne remonte qu'à la migration 018). Les tables cœur (`profiles`, `clients`, `demandes`, `payments`, `payment_links`, `appointments`, `quick_sales`, `expenses`, `transferts`) n'ont donc **aucune trace versionnée** de leur création ni de leurs policies RLS. Impossible de garantir depuis le dépôt seul que ces tables sont protégées.
2. **`next lint` n'a jamais été configuré dans ce projet** (aucun `.eslintrc*` ni `eslint.config.*` à la racine). La commande déclenche un assistant interactif de premier lancement. Le critère « lint = 0 erreur » du Definition of Done n'a donc jamais pu être vérifié à ce jour.
3. **Deux violations directes de la Règle 0.5/0.6** (zéro statistique codée en dur / zéro faux chiffre) sont déjà en production : `app/dashboard/agent/page.tsx` génère de fausses tendances (`fakeTrend()`, commentée `// TODO: remplacer par des queries Supabase`) et `app/dashboard/super-admin/parametres/page.tsx` sert des paramètres d'agence figés (`MOCK_SETTINGS`) au lieu de données réelles.

En dehors de ces trois points, l'état technique est bon : `tsc --noEmit` = 0 erreur, `next build` réussit proprement sur 144 routes, aucun `@ts-ignore`, un seul `any` explicite (dans un `catch`).

---

## 1. INVENTAIRE TECHNIQUE

### 1.1 Versions

| Paquet | Installé | Dernière dispo | Écart |
|---|---|---|---|
| next | 14.2.15 | 16.3.4 | 2 majeures |
| react / react-dom | 18.3.1 | 19.2.8 | 1 majeure |
| typescript | 5.9.3 | 7.0.2 | 2 majeures |
| @supabase/supabase-js | 2.103.3 | 2.115.0 | mineure |
| @supabase/ssr | 0.5.2 | 0.12.6 | mineure (mais loin derrière) |
| tailwindcss | 3.4.19 | 4.3.3 | 1 majeure |
| eslint | 8.57.1 | 10.10.0 | 2 majeures |
| lucide-react | 0.451.0 | 1.41.0 | 1 majeure |
| framer-motion | 11.18.2 | 13.2.0 | 1 majeure |
| stripe | 22.1.0 | 22.6.1 | mineure |
| resend | 6.12.2 | 6.26.0 | mineure |

Package manager : npm (lockfile `package-lock.json` présent, cohérent).

### 1.2 App Router / Server vs Client components

100 % App Router (`app/`). Aucun `pages/` résiduel. Répartition server/client non comptée exhaustivement (nécessiterait un parcours AST) ; observation qualitative : les pages `dashboard/*` sont très majoritairement Server Components avec `requireProfile()` en tête de fichier, les formulaires (`*Form.tsx`) sont client components (`"use client"`).

### 1.3 Dépendances à signaler

- **Deux bibliothèques PDF en parallèle** : `pdf-lib` (documenté dans CLAUDE.md comme LA librairie PDF) **et** `jspdf` (utilisée dans 5 fichiers : `MonthlyReportGenerator.tsx`, `QuickSaleForm.tsx`, `QuickSalesManager.tsx`, `AgentStats.tsx`, `PaymentReceipt.tsx`). Doublon non documenté — contredit la description du stack dans CLAUDE.md.
- **`framer-motion` est installé et utilisé dans 14 fichiers** (`components/dashboard/PageTransition.tsx`, `components/ui/TiltCard.tsx`, tous les `*Form.tsx` de services, `NexusAIChat.tsx`...) alors que CLAUDE.md l'interdit explicitement (« Pas de framer-motion, pas de transitions complexes »). Soit la règle a changé sans mise à jour du fichier, soit c'est une dérive à corriger.
- **`next-intl` est pleinement câblé** (`i18n.ts`, `messages/fr.json`, `messages/en.json`, utilisé dans 17 fichiers dont `layout.tsx`, `Navbar`, `Footer`, `LocaleToggle`, plusieurs pages `services/*` et une page d'admin `/dashboard/super-admin/i18n`) — alors que la roadmap de CLAUDE.md liste « Multi-langue FR/EN » comme un chantier futur (priorité #4). **Le document de référence est en retard sur le code réel.**

### 1.4 Taille du dépôt

- 454 fichiers `.ts`/`.tsx` hors `node_modules`/`.next`.
- **68 fichiers dépassent 500 lignes.** Les 10 plus gros :

| Fichier | Lignes |
|---|---:|
| `app/services/visa/page.tsx` | 2272 |
| `app/services/etudes/page.tsx` | 1777 |
| `components/DemandeFormComplete.tsx` | 1768 |
| `app/services/billets/page.tsx` | 1682 |
| `app/services/tcf/page.tsx` | 1564 |
| `app/services/bourses/page.tsx` | 1526 |
| `app/services/financement/page.tsx` | 1503 |
| `components/etudes/EtudesForm.tsx` | 1503 |
| `app/services/change/page.tsx` | 1477 |
| `components/visa/VisaExpressForm.tsx` | 1470 |

Chaque page `services/*` + son `*Form.tsx` associé dépasse systématiquement 1200 lignes — motif répété, pas un cas isolé.

### 1.5 Fichiers morts

Trois fichiers `.backup.*` traînent dans l'arborescence de production (aucun n'est un nom de fichier Next.js valide, donc sans impact sur le routing, mais c'est du code mort versionné) :
- `components/dashboard/DashboardShell.backup.tsx`
- `app/dashboard/super-admin/page.backup.tsx`
- `components/layout/Navbar.backup.tsx`

### 1.6 Respect effectif de CLAUDE.md

| Règle CLAUDE.md | Respectée ? |
|---|---|
| Tailwind only, pas de shadcn/MUI/Chakra | ✅ Aucune trace de ces libs |
| lucide-react uniquement pour les icônes | ✅ |
| Couleurs `nexus-blue-950` / `nexus-orange-500` non modifiées en dur | ✅ Aucun `bg-[#0C1C40]` trouvé en recherche rapide |
| Pas de framer-motion | ❌ Violé (14 fichiers, voir 1.3) |
| `supabase/migrations/ (001 → 017)` | ❌ Faux — ces fichiers n'existent pas, la numérotation réelle va de 018 à 032 |
| Table `payments` sans colonne `methode` | Non vérifiable (table hors dépôt, voir section 3) |

---

## 2. CARTOGRAPHIE DES ROUTES

Total : **69 route handlers API** (`app/api/**/route.ts`) + ~150 pages (`page.tsx`).

### 2.1 Mécanisme de protection observé

Deux couches indépendantes, ce qui est un bon signe (défense en profondeur) :
1. **`middleware.ts` → `lib/supabase/middleware.ts`** : bloque tout accès non authentifié à `/dashboard/*` et `/api/{super-admin,admin,agent}/*`, et applique un gating par rôle via `lib/rbac.ts` (`minRoleForPath` + `roleAtLeast`) en lisant `profiles.role` en base à chaque requête. Retourne 403 JSON pour les API, redirect pour les pages.
2. **`requireProfile([...roles])`** (`lib/auth.ts`) appelé en tête de **129 pages/route handlers** recensés — reconfirme le rôle côté serveur et redirige/`403` si insuffisant.

Ce double contrôle couvre la quasi-totalité des routes `dashboard/*` et `api/rh/*`, `api/demandes/*`.

### 2.2 Routes API sans `requireProfile`/`getUser`/secret Bearer détecté

9 routes sur 69 ne présentent aucun des motifs de contrôle recherchés (`requireProfile`, `getUser()`, `CRON_SECRET`, `Authorization`) :

| Route | Protection réelle constatée | Verdict |
|---|---|---|
| `api/payments/stripe-webhook` | Vérification de signature Stripe (`stripe.webhooks.constructEvent`) | ✅ OK — pattern correct, pas besoin de session utilisateur |
| `api/cron/rdv-reminders` | Bearer `CRON_SECRET` comparé en dur | ✅ OK (vérifié en lisant le fichier) |
| `api/payment-links/[reference]/declare` | Aucune auth — accès par `reference` (token dans l'URL), passe par `createClient()` (client anon, donc soumis aux RLS de `payment_links`) | ⚠️ Public par design (client externe non connecté) mais **aucun rate-limiting** — un tiers connaissant/devinant une référence peut spammer des déclarations de paiement |
| `api/demandes/complete` | Aucune — formulaire public multi-étapes | ⚠️ Public par design, mais aucun rate-limiting/anti-spam constaté |
| `api/contact` | Aucune | ⚠️ Idem — formulaire de contact public, pas de rate-limit ni captcha |
| `api/appointments/create`, `api/appointments/available-slots`, `api/appointments/send-confirmation` | Aucune | ⚠️ Booking public par design, pas de rate-limit |
| `api/assurance/devis` | Aucune | ⚠️ Devis public par design, pas de rate-limit |
| `api/visa/express` (racine) | Aucune | ⚠️ Idem |
| `api/payments/stripe-checkout` | Non vérifié en détail (probable création de session Stripe) | À vérifier en Phase 1 |

**Aucune de ces routes n'est un accès direct aux données d'un autre utilisateur** (pas d'IDOR détecté par lecture rapide) — le risque est plutôt l'abus/spam (absence de rate-limiting), à traiter en Phase 1 du blueprint (§6, P1).

### 2.3 Fichier orphelin dans les routes

`app/dashboard/super-admin/page.backup.tsx` contient un appel `requireProfile(["super_admin"])` — c'est une copie de sauvegarde d'une ancienne version de la page, sans effet routing (nom de fichier invalide pour Next.js) mais à supprimer pour éviter la confusion.

---

## 3. SCHÉMA SUPABASE

### 3.1 Migrations présentes dans le dépôt

Seuls **15 fichiers, numérotés 018 à 032** (87 782 octets au total) :

`018_notifications` · `019_monthly_reports` · `020_visa_express` · `021_contacts` · `022_rh_module` · `023_rh_phase_bc` · `024_rh_phase_a` · `025_rh_phase_b` · `026_rh_phase_c` · `027_rh_phase_d` · `028_rh_phase_e` · `029_insurance_quotes` · `030_demandes_complete` · `031_nexus_connect` · `032_categorisation_specialites`

### 3.2 ⚠️ Dérive critique : migrations 001-017 introuvables

`git log --oneline -- supabase/migrations` ne remonte qu'à 15 commits, tous relatifs aux migrations 018+. **Aucune trace, dans l'historique Git entier du dépôt, d'un fichier `001_*.sql` à `017_*.sql`.** La migration 031 confirme elle-même la pratique : son en-tête dit *« déjà appliquée via MCP — fichier conservé pour traçabilité »*, ce qui indique que des migrations ont été appliquées directement à la base (probablement via l'outil MCP Supabase ou le SQL Editor du dashboard) sans être systématiquement committées comme fichiers.

**Conséquence directe** : les tables suivantes, mentionnées comme existantes dans CLAUDE.md, n'ont **aucune définition versionnée** dans ce dépôt : `profiles`, `clients`, `demandes`, `appointments`, `payments`, `payment_links`, `expenses`, `transferts`, `quick_sales`. Il est donc **impossible de confirmer depuis le code seul** :
- si RLS est activée sur ces tables,
- quelles policies existent,
- si le schéma réel en base correspond à ce que `types/index.ts` déclare.

**C'est le point le plus important de cet audit.** Une reconstruction de la base à partir de ce dépôt Git serait incomplète. Recommandation Phase 1 : exporter le schéma réel de production (`pg_dump --schema-only` ou `list_tables`/`get_advisors` via MCP Supabase) et le rejouer en migration `000_schema_baseline.sql` pour combler ce trou, **avant** toute nouvelle modification structurelle.

### 3.3 Tables et RLS observables (migrations 018-032 uniquement)

| Table | RLS activée | Policies |
|---|:--:|---:|
| `employees` | ✅ | — |
| `payslips` | ✅ | — |
| `payslip_validation_history` | ✅ | — |
| `hr_documents` | ✅ | — |
| `employee_notes` | ✅ | — |
| `company_documents` | ✅ | — |
| `leave_types` | ✅ | — |
| `leave_requests` | ✅ | — |
| `leave_balances` | ✅ | — |
| `holidays_car` | ✅ | — |
| `onboarding_templates` | ✅ | — |
| `employee_onboarding` | ✅ | — |
| `onboarding_tasks` | ✅ | — |
| `review_periods` | ✅ | — |
| `performance_reviews` | ✅ | — |
| `rh_settings` | ✅ | — |
| `demande_status_history` | ✅ | 2 (staff `is_staff()` + client lecture propre) |
| `demande_documents_requests` | ✅ | 2 (idem) |
| `demande_messages` | ✅ | 4 (staff + lecture/écriture client scoped) |
| `demande_notes` | ✅ | 1 (`admin_super_admin_all_notes` — cohérent avec la règle « cloisonnement client » du blueprint §4) |

**52 `CREATE POLICY` au total, réparties sur ces 20 tables uniquement.** Toutes les tables visibles ont RLS activée dans la même migration que leur création — bonne pratique déjà respectée pour tout ce qui est postérieur à 018.

Le pattern `is_staff(auth.uid())` (fonction `SECURITY DEFINER` référencée mais non trouvée dans les migrations présentes — donc définie dans les migrations manquantes 001-017) est utilisé de façon cohérente pour distinguer staff/client, ce qui est un bon signe de conception.

### 3.4 Numérotation des références

Non vérifiable depuis les migrations présentes (le trigger de génération de `reference` pour `demandes`/`payment_links` n'apparaît pas dans 018-032 — probablement dans 001-017 manquantes). À documenter en Phase 1.

---

## 4. AUTHENTIFICATION ET RÔLES

- **Mécanisme** : Supabase Auth (cookies de session via `@supabase/ssr`), pas de JWT custom.
- **Stockage du rôle** : table `profiles.role`, lu côté serveur uniquement (middleware + `requireProfile`). Aucune lecture de rôle depuis `user_metadata` détectée — conforme à la bonne pratique. **Cependant**, le blueprint V3 demande un stockage **dual** `profiles.role` + `auth.users.app_metadata` (non modifiable côté client) ; seul `profiles.role` est utilisé aujourd'hui. Comme la lecture se fait toujours côté serveur via une requête à la table (jamais depuis un JWT/claim fourni par le client), le risque pratique dépend entièrement des policies RLS de `profiles` — **non vérifiables** (cf. §3.2).
- **Rôles actuels** : seulement **4** (`super_admin`, `admin`, `agent`, `client`) dans `types/index.ts` et `lib/rbac.ts`. Les 9 rôles du blueprint (`dg`, `daf`, `chef_service`, `comptable`, `moderateur`, `partenaire`) **n'existent pas encore** — confirme que la Phase P2 du blueprint est un chantier complet à faire, pas une extension mineure.
- **Fondation RBAC déjà en place** : `lib/rbac.ts` implémente déjà un système par matrice ressource × action × rôle (`can()`, `MATRIX`), avec une hiérarchie ordinale (`ROLE_RANK`) et un helper `hasAccessToRecord()` pour l'assignation. C'est une base de bonne qualité, réutilisable : la Phase 2 du blueprint (permissions granulaires en base, table `role_permissions`) peut s'appuyer dessus plutôt que repartir de zéro.
- **Rafraîchissement/expiration/déconnexion/mot de passe oublié** : gérés par Supabase Auth standard (`/login`, `/register`, `/auth/callback`, `/auth/accept-invite` présents) — non testés fonctionnellement dans cette phase (interdiction d'écrire/exécuter des actions mutantes en Phase 0).

---

## 5. FONCTIONNALITÉS

### 5a. Réellement opérationnelles (données réelles, bout en bout)

- Authentification + routing par rôle (middleware + `requireProfile`), 4 rôles.
- Dossiers/demandes : création, assignation auto par trigger round-robin (migration 031), historique de statut, documents, notes internes cloisonnées, messagerie client↔conseiller.
- Paiements : liens de paiement multi-méthodes (Orange/MTN/Express/virement/espèces/Stripe), déclaration client, vérification staff, webhook Stripe fonctionnel avec vérification de signature.
- Module RH complet (employés, paie, congés, onboarding, évaluations, documents) — 15 migrations dédiées, RLS activée partout.
- i18n FR/EN opérationnel (contrairement à ce que dit la roadmap CLAUDE.md).
- PWA (manifest + service worker présents).
- Build de production : 144 routes générées sans erreur.

### 5b. Partielles (UI présente, logique incomplète)

- **`app/dashboard/super-admin/parametres/page.tsx:16-98`** : sert `MOCK_SETTINGS` codé en dur avec le commentaire *« Données mockées (table agency_settings à créer en migration ultérieure) »*. La page est visuellement complète mais ne persiste rien de réel — à vérifier si `ParametresAgenceClient` écrit quelque part ou si c'est un cul-de-sac.
- Le RBAC granulaire (permissions par ressource stockées en base, 9 rôles) — la brique `lib/rbac.ts` existe mais reste un objet TypeScript statique, pas une table `role_permissions` interrogeable/modifiable par un `super_admin` sans redéploiement.

### 5c. Simulées (mock, données codées en dur, TODO)

- **`app/dashboard/agent/page.tsx:25-28,298-304`** : fonction `fakeTrend()` — génère des pourcentages de tendance (+11 %, +12 %, +13 %, +14 %) affichés sur les tuiles du dashboard agent, sans lien avec l'historique réel. Commentaire explicite : *« TODO: remplacer par des queries Supabase groupées par jour »*. **Violation directe de la règle 0.5/0.6 du blueprint**, actuellement en production.
- `app/dashboard/super-admin/parametres/page.tsx` — voir 5b, à la limite entre partiel et simulé selon que la sauvegarde fonctionne réellement.

Aucune autre occurrence de données fabriquées détectée sur un premier passage des pages publiques (page d'accueil, pages `services/*` contrôlées ponctuellement) — pas de faux témoignages/partenaires trouvés en recherche ciblée sur `app/page.tsx`, mais cette vérification n'a pas été exhaustive sur les ~30 pages publiques.

---

## 6. QUALITÉ

### 6.1 `tsc --noEmit`

```
EXIT: 0
(aucune sortie — 0 erreur)
```

### 6.2 `next lint`

```
? How would you like to configure ESLint? https://nextjs.org/docs/basic-features/eslint
❯ Strict (recommended)
  Base
  Cancel
```
**Le lint n'a jamais été configuré** (ni `.eslintrc*` ni `eslint.config.*` à la racine, seulement dans `node_modules`). La commande attend une réponse interactive et n'a donc **jamais pu s'exécuter jusqu'ici** dans ce projet. Le critère « lint = 0 erreur » du Definition of Done (CLAUDE.md, blueprint §0) n'a donc jamais été réellement vérifié. Aucune configuration n'a été créée durant cette phase d'audit (interdiction d'écrire).

### 6.3 `next build`

```
▲ Next.js 14.2.15
✓ Compiled successfully
✓ Generating static pages (144/144)
```
Build de production réussi sans erreur ni warning bloquant. 144 routes, 1 seule statique (`/services/[slug]`), le reste en rendu dynamique (`ƒ`) — cohérent avec une app pilotée par base de données. Middleware : 79,9 kB.

### 6.4 Recherches ciblées

| Motif | Occurrences | Détail |
|---|---:|---|
| `: any` explicite | 1 | `components/DemandeForm.tsx:100` — `catch (err: any)`, cas mineur |
| `@ts-ignore` | 0 | — |
| `console.log` | 75, dans 22 fichiers | Essentiellement des logs préfixés par feature (`[STRIPE_WEBHOOK]`, `[PAY-DECLARE]`, `[CRON RDV-REMINDERS]`...) — conforme à la convention demandée par CLAUDE.md, pas un problème en soi |
| `SUPABASE_SERVICE_ROLE_KEY` | 24 fichiers | Tous des `route.ts` ou fichiers `lib/*` (serveur) — aucune fuite détectée côté composant client dans cette recherche |
| Duplication composants/logique | Non quantifié précisément | Chaque service (`visa`, `etudes`, `billets`...) a son propre `*Form.tsx` de 1200+ lignes suivant manifestement le même moule — fort potentiel de factorisation, à évaluer en phase dédiée (hors scope P0) |
| Accessibilité / performance | Non auditées dans cette phase | Nécessite Lighthouse (indicateur cible ≥ 90 au §12 du blueprint) — à faire en Phase 10 |

---

## 7. SÉCURITÉ — PAR GRAVITÉ

**CRITIQUE**
- Migrations 001-017 absentes du dépôt et de l'historique Git → impossible de confirmer l'état RLS des tables `profiles`, `clients`, `demandes`, `payments`, `payment_links`, `appointments`, `expenses`, `transferts`, `quick_sales` depuis le code (§3.2). Ce n'est pas une preuve de vulnérabilité, mais une impossibilité de preuve — à traiter en priorité absolue avant toute Phase 1.

**ÉLEVÉ**
- Aucune configuration ESLint fonctionnelle → aucune vérification automatisée de patterns dangereux (ex. injections, mauvaises pratiques React) n'a jamais tourné sur ce projet (§6.2).

**MOYEN**
- 7 endpoints publics sans rate-limiting ni CAPTCHA (`payment-links/[reference]/declare`, `demandes/complete`, `contact`, `appointments/create|available-slots|send-confirmation`, `assurance/devis`, `visa/express`) — risque de spam/abus, pas de fuite de données (§2.2).
- Deux violations de la règle « zéro faux chiffre » déjà en production (`fakeTrend`, `MOCK_SETTINGS`) — risque de confiance/gouvernance plus que de sécurité technique (§5c).

**FAIBLE**
- 3 fichiers `.backup.*` de code mort versionnés dans l'arborescence de production (§1.5).
- Dépendances vieillissantes de 1-2 versions majeures (Next 14→16, React 18→19, Tailwind 3→4) — pas de faille connue identifiée, mais fenêtre de maintenance à prévoir (§1.1).
- Doublon `pdf-lib`/`jspdf` (§1.3) — pas un risque de sécurité, un risque de maintenance/incohérence.

---

## 8. SYNTHÈSE

### 8.1 Dix problèmes prioritaires (ordonnés)

1. Combler le trou de migrations 001-017 (exporter le schéma réel de production en `000_schema_baseline.sql`) — préalable obligatoire à toute Phase 1/2.
2. Confirmer l'état RLS réel des 9 tables cœur directement en base (via MCP Supabase `get_advisors`/`list_tables`), indépendamment du dépôt Git.
3. Configurer ESLint (`next lint`, choix « Strict ») pour que le Definition of Done soit enfin vérifiable.
4. Supprimer `fakeTrend()` dans `app/dashboard/agent/page.tsx` — remplacer par un état vide honnête ou une vraie requête Supabase groupée par jour.
5. Clarifier le sort de `app/dashboard/super-admin/parametres/page.tsx` (`MOCK_SETTINGS`) — créer la table `agency_settings` ou afficher un état « à venir » assumé.
6. Décider du sort de `framer-motion` : soit la règle CLAUDE.md est mise à jour pour refléter l'usage réel (14 fichiers), soit il faut le retirer — statu quo actuel = documentation et code contradictoires.
7. Étendre `lib/rbac.ts` (4 rôles) vers les 9 rôles du blueprint, en conservant son design par matrice qui est une bonne base.
8. Ajouter un rate-limiting basique sur les 7 endpoints publics identifiés en §2.2.
9. Nettoyer les 3 fichiers `.backup.*`.
10. Mettre à jour CLAUDE.md sur deux points au moins : la numérotation réelle des migrations (018-032, pas 001-017) et le statut i18n (déjà livré, pas « à faire »).

### 8.2 Ce qui doit être conservé tel quel

- Le double niveau de protection serveur (middleware RBAC + `requireProfile` par page) — pattern solide, à répliquer pour les futures ressources plutôt qu'à remplacer.
- Le design de `lib/rbac.ts` (matrice ressource/action/rôle + hiérarchie ordinale) — bonne fondation pour la Phase 2.
- La vérification de signature Stripe dans `stripe-webhook` et l'auth Bearer `CRON_SECRET` dans les tâches cron — patterns corrects à reproduire pour tout futur webhook/cron.
- Le pattern RLS des migrations 018-032 (RLS activée dans la même migration que la table, fonction `is_staff()` centralisée) — à poursuivre pour toute nouvelle table du blueprint V3.

### 8.3 Ce qui doit être amélioré (pas réécrit)

- RBAC : passer de la matrice statique en code à une table `role_permissions` pilotable, sans jeter le design existant.
- Dashboard agent/super-admin : remplacer les données simulées par de vraies requêtes ou des états vides honnêtes.
- Configuration outillage : ESLint, éventuellement upgrade progressif des dépendances majeures (hors urgence).
- Documentation : CLAUDE.md à resynchroniser avec l'état réel du code sur au moins 2 points (migrations, i18n).

### 8.4 Ce qui doit être réécrit (et justification)

Aucun module ne justifie une réécriture complète à ce stade. Le code est globalement cohérent, compile sans erreur, et respecte l'essentiel des règles de design déjà en place. Le seul candidat à une refonte structurelle est le RBAC (4 rôles → 9 rôles + permissions en base), mais il s'agit d'une **extension pilotée par le blueprint (Phase P2)**, pas d'une réécriture punitive d'un existant défaillant.

### 8.5 Fichiers et tables qui seront touchés en V3

**Nouveaux fichiers/tables (blueprint §3.1)** : `role_permissions`, `user_permissions`, `services`, `dossier_etapes`, `documents_requis`, `dossier_partages`, `devis`, `devis_lignes`, `factures`, `facture_lignes`, `echeanciers`, `categories_compta`, `caisse_sessions`, `commissions`, `taches`, `absences`, `affectations_hist`, `contenus_site`, `faq`, `partenaires`, `temoignages`, `pays_destinations`, `bureaux`, `notification_prefs`, `audit_log`.

**Fichiers existants à modifier** : `lib/rbac.ts` (extension 9 rôles), `lib/auth.ts` (`requireProfile` → intégration `assertPermission`), `types/index.ts` (`UserRole` étendu), `middleware.ts`/`lib/supabase/middleware.ts` (nouveaux rôles dans `ROUTE_MIN_ROLE`), `app/dashboard/agent/page.tsx`, `app/dashboard/super-admin/parametres/page.tsx`.

**Migration à créer avant tout le reste** : `000_schema_baseline.sql` (reconstitution du schéma cœur manquant, cf. §3.2 et §8.1 point 1).

---

**AUDIT TERMINÉ — EN ATTENTE DE VALIDATION**

Aucune modification de fichier, de migration ou de donnée n'a été effectuée pendant cette phase. Seul le présent rapport (`docs/AUDIT_V3.md`) a été créé ; les fichiers de sortie temporaires générés par `tsc`/`lint`/`build` pendant les vérifications ont été supprimés après lecture.
