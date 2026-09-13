# NEXUS RCA — PLAN V3 RÉVISÉ APRÈS AUDIT
**Amendement au Blueprint V3 — à lire conjointement avec `NEXUS_RCA_V3_BLUEPRINT.md`**
4 septembre 2026 · Après lecture de `docs/AUDIT_V3.md`

> **Verdict : GO CONDITIONNEL.** L'audit est validé sur la forme et sur le fond. Trois corrections structurelles au blueprint sont nécessaires avant la Phase 1, plus une Phase 0.5 non prévue initialement. Le blueprint d'origine a été écrit sans connaissance du dépôt : il proposait des tables qui existent déjà sous d'autres noms. Appliqué tel quel, il aurait créé une base de données en double.

---

## A. CE QUE L'AUDIT CHANGE

### A.1 Le blueprint avait un angle mort : le domaine métier existe déjà

Le §3.1 du blueprint listait ~40 tables « à créer ». L'audit révèle que le cœur est déjà là sous une autre nomenclature. **Créer `dossiers` à côté de `demandes` serait la pire décision possible de toute la V3** : deux sources de vérité, deux jeux de RLS, deux interfaces, et une migration de données impossible à réconcilier dans six mois.

### A.2 L'audit a lui-même un angle mort : il n'a pas interrogé la base

Le rapport dit *« aucune connexion à la base Supabase de production n'a été effectuée (MCP Supabase non interrogé) »*. Or le connecteur Supabase est disponible, et `list_tables` / `get_advisors` / `execute_sql` en lecture sont **strictement non destructifs**. La conclusion « impossible de garantir la protection RLS » n'est vraie que depuis le dépôt Git — pas dans l'absolu. C'est l'action la plus urgente et la moins risquée du projet.

### A.3 Le modèle de rôles ordinal ne survivra pas au passage à 9 rôles

`lib/rbac.ts` repose sur `ROLE_RANK` + `roleAtLeast()` : un classement linéaire. Cela fonctionne pour `client < agent < admin < super_admin`. Cela **casse** dès qu'on ajoute `daf`, `moderateur` et `partenaire`, qui ne sont pas « au-dessus » ou « en dessous » d'un agent — ils sont **à côté**. Un DAF voit toute la finance et aucun dossier RH ; un modérateur voit les contenus et aucune finance. Aucun rang ne décrit cela.

`minRoleForPath` doit donc devenir `requiredPermissionForPath`. C'est la seule vraie réécriture de la V3, et elle doit se faire d'un bloc, pas par ajouts successifs de cas particuliers.

---

## B. TABLE DE RÉCONCILIATION DU SCHÉMA (remplace le §3.1 du blueprint)

| Table du blueprint | Existant réel | Décision |
|---|---|---|
| `dossiers` | **`demandes`** | **RÉUTILISER.** Ne jamais créer `dossiers`. Ajouter les colonnes manquantes : `priority`, `deadline`, `service_id`, `amount_estimated`, `archived_at` |
| `dossier_historique` | **`demande_status_history`** | RÉUTILISER tel quel |
| `dossier_documents` | **`demande_documents_requests`** | RÉUTILISER, vérifier la couverture des statuts (`validé`, `rejeté`, `motif_rejet`) |
| `dossier_notes` | **`demande_notes`** | RÉUTILISER — cloisonnement client déjà correct (policy `admin_super_admin_all_notes`) |
| `dossier_messages` | **`demande_messages`** | RÉUTILISER — 4 policies déjà en place |
| `dossier_etapes` | ø | **CRÉER** — la machine à états du blueprint §5 n'a pas d'équivalent |
| `rendez_vous` | **`appointments`** | RÉUTILISER, étendre si besoin |
| `profiles` | **`profiles`** | ÉTENDRE : `service_id`, `availability_status`, `is_active` |
| `services` | ø (services en dur dans les pages) | **CRÉER** — préalable au CMS (P8) |
| `documents_requis` | ø | CRÉER, rattaché à `services` |
| `taches` | ø | CRÉER |
| `absences` | **`leave_requests` + `leave_types` + `leave_balances`** | **RÉUTILISER.** Ne pas créer `absences` — le module RH couvre déjà congés, soldes et validation |
| `rh.performance` | **`performance_reviews` + `review_periods`** | RÉUTILISER |
| `paiements` | **`payments` + `payment_links`** | RÉUTILISER, étendre pour les paiements partiels et le reste dû |
| `depenses` | **`expenses`** | RÉUTILISER |
| `devis` / `devis_lignes` | **`insurance_quotes`** (partiel, assurance seule) | CRÉER un module devis générique ; évaluer si `insurance_quotes` y est absorbé ou reste spécifique |
| `factures` / `facture_lignes` | ø (reçus PDF via jspdf) | CRÉER |
| `echeanciers`, `caisse_sessions`, `categories_compta`, `commissions` | ø | CRÉER |
| `notifications` | **`notifications`** (migration 018) | RÉUTILISER, ajouter `notification_prefs` |
| `contenus_site`, `faq`, `partenaires`, `temoignages`, `pays_destinations`, `bureaux` | ø | CRÉER (P8) |
| `role_permissions`, `user_permissions` | matrice statique dans `lib/rbac.ts` | CRÉER — migration du contenu de la matrice existante vers la table, sans perte |
| `audit_log` | ø | CRÉER |
| `agency_settings` | `MOCK_SETTINGS` codé en dur | CRÉER — c'est la dette identifiée en §5b de l'audit |

**Bilan : 20 tables à créer au lieu de 40. La moitié du blueprint était déjà construite.**

Règle de nommage : **on garde le vocabulaire du dépôt** (`demandes`, `payments`, `appointments`), pas celui du blueprint. Un blueprint ne renomme pas une base en production.

---

## C. PHASE 0.5 — ÉTABLIR LA VÉRITÉ DU SCHÉMA (nouvelle, bloquante)

Rien ne démarre tant que cette phase n'est pas terminée. Elle est en **lecture seule sur la production** et ne produit qu'un fichier.

```
PHASE 0.5 — BASELINE DU SCHÉMA (lecture seule sur la base, écriture d'un seul fichier)

Le rapport d'audit conclut que l'état RLS des 9 tables cœur est invérifiable.
C'est vrai depuis Git, faux dans l'absolu : le connecteur Supabase est disponible.

MISSION
1. Via le connecteur Supabase, en LECTURE SEULE uniquement :
   - list_tables sur tous les schémas → inventaire réel des tables et colonnes
   - get_advisors (security + performance) → failles RLS et index manquants signalés
     directement par Supabase
   - execute_sql en SELECT uniquement sur pg_policies et pg_class pour extraire :
     * pour chaque table : rowsecurity O/N
     * pour chaque policy : nom, commande, rôle, expression USING, expression WITH CHECK
   - définition des fonctions SECURITY DEFINER, dont is_staff()
   - définition des triggers de génération de référence (demandes, payment_links)

   INTERDICTION ABSOLUE : aucun INSERT, UPDATE, DELETE, ALTER, DROP, CREATE.
   Aucune migration appliquée. Aucune variable d'environnement touchée.

2. Écrire supabase/migrations/000_schema_baseline.sql — reconstitution fidèle du
   schéma réel des tables non versionnées. En-tête obligatoire :
   « BASELINE — reconstitué depuis la production le {date}. Ne jamais rejouer sur
     une base existante. Sert de référence de schéma uniquement. »
   Ce fichier n'est PAS destiné à être exécuté sur la production.

3. Écrire docs/RLS_ETAT_REEL.md : un tableau table par table (RLS O/N, nombre de
   policies, verdict), avec en tête la liste des tables SANS RLS s'il y en a.

4. Comparer le schéma réel à types/index.ts et lister chaque écart.

SORTIE
Trois livrables, puis : « BASELINE ÉTABLIE — {N} tables, {M} sans RLS. EN ATTENTE DE GO. »
Si une seule table contenant des données personnelles est sans RLS, le signaler en
première ligne, en majuscules, et ne rien faire d'autre.
```

---

## D. PHASES RÉVISÉES

| Phase | Contenu | Changement vs blueprint |
|---|---|---|
| **P0** | Audit | ✅ Fait |
| **P0.5** | Baseline du schéma réel + état RLS | **Nouvelle, bloquante** |
| **P1** | Sécurité : combler les trous RLS révélés en P0.5, ESLint (Strict), rate-limiting sur les 7 endpoints publics, suppression des 3 `.backup.*` | Recentrée sur les constats réels |
| **P1b** | Dette de sincérité : suppression de `fakeTrend()`, table `agency_settings` réelle, resynchronisation de CLAUDE.md (migrations 018-032, i18n livré, framer-motion assumé) | **Nouvelle — courte, à faire tôt** |
| **P2** | RBAC : `role_permissions` en base, `assertPermission()`, abandon du modèle ordinal, extension à 9 rôles, `requiredPermissionForPath` | Réécriture assumée, pas extension |
| **P3** | Extension du schéma métier (20 tables, pas 40) selon la table §B | Fortement réduite |
| **P4** | Demandes : Kanban, fiche complète, filtres, actions groupées — **sur `demandes`, pas sur une nouvelle table** | Recentrée |
| **P5** | Tableau de bord réel, métriques cliquables | Inchangée |
| **P6** | Finance : devis, factures, échéanciers, caisse, commissions, PDF | Inchangée — arbitrer `pdf-lib` vs `jspdf` en entrée de phase |
| **P7** | RH : **compléter** l'existant (tâches, charge, affectations), ne pas le refaire | Fortement réduite |
| **P8** | CMS : `services`, FAQ, partenaires, témoignages vérifiés, textes | Inchangée |
| **P9** | Portail client | Inchangée |
| **P10** | Site public : factorisation des 7 pages `services/*` de 1200-2200 lignes, SEO, a11y, Lighthouse | **Élargie** — la factorisation est le vrai chantier |
| **P11** | Notifications multicanal sur la table `notifications` existante | Recentrée |
| **P12** | Durcissement, tests, documentation | Inchangée |

**Gel des dépendances :** Next 14→16, React 18→19, Tailwind 3→4 sont **hors périmètre V3**. Trois montées de version majeure pendant une refonte fonctionnelle, c'est deux chantiers qui se cachent l'un derrière l'autre quand quelque chose casse. À traiter en V3.1, seul, sur une branche dédiée.

---

## E. ARBITRAGES À TRANCHER (décisions à prendre, pas techniques)

| # | Question | Recommandation |
|---|---|---|
| 1 | `framer-motion` : retirer ou assumer ? | **Assumer.** 14 fichiers l'utilisent, le retirer coûte cher pour rien. Mettre à jour CLAUDE.md, poser une règle d'usage (transitions de page et micro-interactions seulement) |
| 2 | `pdf-lib` ou `jspdf` ? | **`pdf-lib`** comme cible unique (meilleur support des accents et de l'Unicode, indispensable pour le français). Migration des 5 fichiers `jspdf` en entrée de P6, pas avant |
| 3 | Rôle dans `app_metadata` en plus de `profiles.role` ? | **Oui, mais après P0.5.** Si les RLS de `profiles` sont saines, la dualité est un confort ; si elles ne le sont pas, c'est une urgence |
| 4 | `insurance_quotes` absorbé dans le module devis générique ? | À trancher en entrée de P6, sur lecture du schéma réel |
| 5 | 68 fichiers > 500 lignes | Ne rien factoriser avant P10, sauf si un fichier bloque une phase. La factorisation prématurée casse ce qui marche |

---

## F. CE QUI EST VALIDÉ SANS RÉSERVE DANS L'AUDIT

Le double contrôle middleware + `requireProfile` sur 129 points d'entrée, la vérification de signature Stripe, le Bearer `CRON_SECRET`, la RLS activée dans la même migration que la table depuis 018, le cloisonnement des notes internes, `tsc` à zéro erreur et un build propre sur 144 routes : c'est une base saine. Le problème de ce projet n'est pas sa qualité de code, c'est sa **traçabilité** — des migrations appliquées directement en base sans être committées. La Phase 0.5 corrige la cause, pas seulement le symptôme.

**Règle permanente à ajouter dans CLAUDE.md :** aucune migration n'est appliquée via MCP ou via le SQL Editor sans qu'un fichier `.sql` correspondant soit committé dans le même mouvement. C'est exactement cette pratique qui a produit le trou 001-017.

---

*Prochaine action : exécuter la Phase 0.5. Aucune écriture sur la base, un seul fichier de sortie, puis arrêt.*
