# NEXUS RCA — FEUILLE DE ROUTE V3
**Document unique d'exécution. Source de vérité du projet.**
Version 1.0 · 5 septembre 2026 · Remplace et consolide les 5 amendements précédents
Décideur : Thierry F. Kankou · Exécutant : Claude Code

---

# PARTIE I — COMMENT UTILISER CE DOCUMENT

## I.1 Boucle d'exécution (à répéter pour chaque phase, sans exception)

À chaque nouvelle session, Claude Code :

1. **Lit ce fichier**, va au tableau d'avancement (§I.5), identifie la première phase non terminée.
2. **PRÉSENTE** avant toute écriture — dans ce format exact :
   ```
   PHASE {code} — {nom}
   Objectif : une phrase.
   Préalables : vérifiés / manquants (lesquels).
   Fichiers à créer : liste.
   Fichiers à modifier : liste, avec ce qui change dans chacun.
   Migrations à ajouter : numéro + contenu résumé.
   Risque de régression : où, et comment il est couvert.
   Décision attendue de Thierry : aucune, ou laquelle.
   Durée estimée.
   ```
   Puis : `EN ATTENTE DE GO.` et **arrêt complet**.
3. **Attend le GO.** Un GO porte sur une phase, jamais sur plusieurs. Pas de GO = rien ne s'écrit.
4. **Exécute** le périmètre présenté, et rien d'autre. Une bonne idée hors périmètre se note dans `docs/DETTE.md`, elle ne s'implémente pas.
5. **Teste** : la barrière de qualité (§I.3) et les tests propres à la phase.
6. **Commit et push** sur la branche de la phase, avec le message normé (§I.4).
7. **RÉCAPITULE** :
   ```
   PHASE {code} — TERMINÉE
   Fait : liste.
   Non fait / reporté : liste + raison.
   Migrations appliquées : numéros.
   Tests : sorties réelles collées, pas résumées.
   Régression : résultat de la checklist §I.3.
   Branche poussée : nom. URL de prévisualisation : lien.
   Phase suivante : {code}.
   ```
8. **Met à jour le tableau §I.5 de ce fichier** et le commit.

**Interdiction absolue d'enchaîner deux phases sans GO intermédiaire**, même si la suivante paraît triviale.

## I.2 Règles permanentes

| # | Règle |
|---|---|
| 1 | Aucune migration destructive : pas de `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, `DELETE` de masse |
| 2 | Aucune donnée existante supprimée |
| 3 | Aucune variable d'environnement de production modifiée sans autorisation écrite |
| 4 | Aucun nombre affiché sans requête réelle derrière (§I.6) |
| 5 | Aucune donnée d'exemple, de démonstration ou de remplissage, même temporaire |
| 6 | Aucune permission garantie par le seul masquage d'un élément d'interface |
| 7 | Toute nouvelle table : RLS activée dans la même migration que sa création |
| 8 | Toute migration appliquée en base est committée en fichier `.sql` dans le même mouvement — c'est la pratique inverse qui a produit le trou 001-017 |
| 9 | Fichiers complets, jamais de fragments |
| 10 | Réponses en français, numérotées, sans emphase superflue |
| 11 | Une entrée de menu qui ne mène pas à une page fonctionnelle n'existe pas |
| 12 | Aucune page au-delà de 400 lignes après la livraison du design system |

## I.3 Barrière de qualité — la vraie garantie anti-régression

« Zéro régression » ne se décrète pas, il se construit. Trois mécanismes, cumulés :

**a) Barrière technique**, à repasser à la fin de chaque phase :
```
npx tsc --noEmit          → 0 erreur
npm run lint              → 0 erreur     (disponible à partir de P1c)
npm run build             → succès
```
Les trois sorties sont collées en clair dans le RÉCAP, jamais résumées par « tout passe ».

**b) Checklist fonctionnelle**, à repasser intégralement à chaque phase :

*Authentification* — inscription · connexion · déconnexion · mot de passe oublié · un client qui tape une URL `/dashboard/admin/...` est refusé **côté serveur**.
*Client* — voit ses dossiers et uniquement les siens · change l'identifiant dans l'URL → refus · téléverse un document · ne voit aucune note interne.
*Agent* — voit ses dossiers affectés · change un statut autorisé · est refusé sur un statut non autorisé.
*Public* — page d'accueil, une page service, formulaire de demande, formulaire de contact, prise de rendez-vous, page de paiement d'un lien réel : tous fonctionnels.
*Données* — chaque compteur affiché mène à une liste contenant exactement ce nombre de lignes.

**c) Filet de sécurité**
- `git tag backup-avant-{phase}` avant chaque phase.
- Une branche par phase, jamais de travail sur `main`.
- Déploiement en **prévisualisation** d'abord ; la mise en production n'a lieu qu'après validation de Thierry sur l'URL de prévisualisation.
- Migration page par page : l'ancienne page reste en place jusqu'à validation de sa remplaçante. Aucune suppression groupée en fin de chantier.

## I.4 Git

```
Branche : v3/{code-phase}-{slug}        ex. v3/p1b-durcissement
Tag     : backup-avant-{code-phase}     posé avant la première écriture
Commits : type(portée): description     ex. fix(rls): jeton public sur payment_links
          types : feat · fix · refactor · migration · docs · test · chore
Push    : en fin de phase, après la barrière de qualité, jamais avant
```
Le RÉCAP indique l'URL de prévisualisation pour que Thierry vérifie en ligne.

**Note du 05/09/2026** : les branches de phase P0.5-P3/A1/A2 avaient divergé
indépendamment de `main`. Réconciliées dans `v3/integration-v3` avant A3
(voir `docs/DETTE.md`, entrée P2 #1). À partir d'A3, chaque nouvelle phase
se branche depuis `v3/integration-v3`, pas depuis `main`.

## I.5 Tableau d'avancement — à tenir à jour dans ce fichier

| Code | Phase | État | Branche | Date |
|---|---|---|---|---|
| P0 | Audit du dépôt | ✅ terminée | — | 04/09 |
| P0.5 | Baseline schéma + RLS | ✅ terminée | — | 05/09 |
| P1a | Correctif de sécurité immédiat | ✅ terminée | — | 05/09 |
| P1a-bis | Compléter le rendu de P1a | ✅ terminée | — | 05/09 |
| P1b | Durcissement sécurité | ✅ terminée | v3/p1b-durcissement | 05/09 |
| P1c | Outillage et dette technique | ✅ terminée | v3/p1c-outillage | 05/09 |
| A1 | Tokens et fondations visuelles | ✅ terminée | v3/a1-tokens | 05/09 |
| A2 | Design system | ✅ terminée | v3/a2-design-system | 05/09 |
| P2 | RBAC 9 rôles | ✅ terminée — voir docs/DETTE.md pour les écarts notés | v3/p2-rbac | 05/09 |
| C0 | Audit CRM et schéma cible de la relation client | ✅ terminée — D7 confirmée par Thierry | v3/c0-audit-crm | 05/09 |
| P3 | Extension du schéma métier | ✅ terminée — voir docs/DETTE.md | v3/p3-schema-metier | 05/09 |
| A3 | Shell d'administration | ✅ terminée — démo isolée, voir docs/DETTE.md | v3/integration-v3 | 05/09 |
| A4 | Tableau de bord | ⬜ | | |
| A5-0 | Audit CRM et consolidation d'identité | ⬜ | | |
| A5 | CRM — Dossiers et pipeline | ⬜ | | |
| A6 | CRM — Clients 360, prospects, RDV, communications, tâches | ⬜ | | |
| A7 | RH rhabillé | ⬜ | | |
| P6-0 | Convergence des colonnes `payments` | ⬜ | | |
| P6 | Finance | ⬜ | | |
| P8 | CMS et contenus | ⬜ | | |
| P9 | Portail client | ⬜ | | |
| P10 | Site public | ⬜ | | |
| P11 | Notifications multicanal | ⬜ | | |
| P12 | Durcissement final | ⬜ | | |

## I.6 La règle du chiffre honnête

Avant d'afficher un nombre, il passe trois tests. S'il en rate un, il ne s'affiche pas.

1. **Origine** — une requête Supabase le produit, et Claude Code peut l'écrire.
2. **Définition** — une phrase suffit à l'expliquer, et deux personnes arriveraient au même résultat à la main.
3. **Comportement à vide** — on sait ce qui s'affiche quand la donnée manque. Pas un `0` là où la réponse est « pas encore mesurable ».

**Aucune variation en pourcentage** tant que la métrique n'a pas 30 jours d'historique **et** un dénominateur d'au moins 20. En dessous, la valeur absolue, seule. Une hausse d'un mauvais indicateur ne se peint jamais en vert.

**Contrôle anti-fiction**, à chaque écran livré : `grep` sur `Math.random`, `fake`, `mock`, `demo`, `sample`, `placeholder` → zéro occurrence dans le module.

---

# PARTIE II — ÉTAT DES LIEUX

## II.1 Le socle (établi en P0 et P0.5)

Next.js 14.2 App Router · React 18 · TypeScript 5.9 · Tailwind 3 · Supabase Auth (`@supabase/ssr`) · Stripe · Resend · npm.
454 fichiers TS/TSX, 144 routes au build, 69 route handlers.
Base `nexus-rca -new` (ca-central-1) : **40 tables, toutes avec RLS, 128 policies.**
Volumes réels : 19 demandes, 20 profils, 9 liens de paiement, 3 paiements, 4 rendez-vous.

**Ce qui fonctionne réellement** : authentification et routage par rôle, demandes avec assignation automatique et historique, paiements multi-méthodes avec webhook Stripe vérifié, module RH complet, i18n FR/EN, PWA.

**Ce qui est solide et doit être imité** : double protection (middleware RBAC + `requireProfile` sur 129 points d'entrée), suppression bloquée sur `payments`, séparation agent/admin sur `expenses`, journaux immuables `payment_events` et `stripe_webhook_log`, RLS posée dans la même migration que la table depuis 018.

## II.2 Contexte d'usage

**Les agents travaillent sur ordinateur.** L'administration se conçoit desktop-first : densité élevée, tableaux à 8-10 colonnes, raccourcis clavier. Le mobile reste couvert comme vue secondaire (tableaux transformés en cartes), sans ambition de parité. Le réseau de Bangui reste une contrainte : chargement bloc par bloc, aucun bloc ne retarde les autres.

## II.3 Décisions

### Tranchées par Thierry le 5 septembre 2026 — non renégociables

**D1 · Finance, source unique de vérité.** Dans `payments`, les colonnes canoniques sont **`status`** et **`amount`**. Un paiement est une transaction individuelle : `amount` est plus précis que `montant_total`. `statut` et `montant_total` deviennent des colonnes héritées. Par cohérence de la même règle, **`method`** est canonique face à `mode_paiement`. La finance utilise exclusivement `status`, `amount` et `method`, côté serveur comme côté interface. Aucune colonne héritée n'est supprimée avant que tous ses consommateurs aient migré, et jamais en V3. → phase **P6-0**.

**D2 · Messages et notes.** `demande_messages` et `demande_notes` sont nécessaires et conservées. Zéro ligne signifie « fonctionnalité non raccordée ou cassée », pas « inutile ». Leurs rôles restent distincts : `demande_messages` = communications partageables avec le client ; `demande_notes` = observations strictement internes, jamais visibles du client. En A5, diagnostiquer la cause du vide (absence d'interface, insertion cassée, mauvaise table, RLS bloquante, fonctionnalité jamais branchée) puis les rendre réellement opérationnelles, avec permissions, auteur, horodatage et journalisation.

**D3 · Rendez-vous.** `appointments` est la table canonique. `rendez_vous` est marquée obsolète sans suppression : inventaire de ses données et de ses consommateurs, migration des données utiles, remplacement progressif des lectures et écritures, blocage des nouvelles écritures après migration. **Suppression seulement après vérification complète et autorisation explicite de Thierry** — donc pas en V3.

### En attente

| # | Question | Bloque | Recommandation |
|---|---|---|---|
| D4 | `framer-motion` : interdit par CLAUDE.md, utilisé dans 14 fichiers | P1c | Assumer, mettre à jour CLAUDE.md, l'interdire dans l'administration |
| D5 | `pdf-lib` ou `jspdf` ? | P6 | `pdf-lib` (Unicode et accents), migration des 5 fichiers `jspdf` en entrée de P6 |
| D6 | Quelles valeurs de `payment_status` font foi ? L'enum en compte 11, mélangeant deux vocabulaires (voir P6-0 §1) | **P6-0** | Choisir un jeu canonique de 5 à 6 valeurs anglaises, cohérent avec D1 |
| D7 | **Quelle table est l'entité « personne » canonique ?** Cinq tables décrivent aujourd'hui un être humain : `profiles`, `clients`, `contacts`, `contact_demandes`, `appointment_requests` — plus les champs client dénormalisés dans `demandes`. Une fiche à 360° est impossible tant que ce n'est pas tranché | **C0, et tout le CRM** | `clients` = personne (prospect ou client, avec ou sans compte) ; `profiles` = compte d'authentification, relié par `clients.profile_id` ; tout le reste pointe sur `clients.id`. Voir C0 |

### Règle de nomenclature issue de D1

La base devient volontairement mixte : `demandes.statut` en français, `payments.status` en anglais. C'est un compromis assumé pour ne pas renommer une table métier en production. **Règle pour la suite : toute nouvelle table créée en V3 utilise l'anglais** (`status`, `amount`, `method`, `created_at`), afin que la dérive s'arrête ici au lieu de se propager au hasard des phases.

---

# PARTIE III — LES PHASES

---

## P1a-bis · Compléter le rendu de la Phase 1a
**Préalable** : aucun. **Durée** : courte.

Deux éléments manquent au compte-rendu de P1a.

1. **Verdict brut sur `profiles`** : l'auto-élévation de rôle était-elle possible avant le trigger, ou déjà bloquée ? Réponse binaire, avec la définition du trigger trouvé le cas échéant.
2. **Si elle était possible** : contrôler les 20 profils — un compte a-t-il changé de rôle sans raison légitime ? Vingt lignes se vérifient à la main.
3. **Policy UPDATE de `payment_links`**, avant et après, en texte intégral. La ligne du tableau précédent était tronquée.

**Livrable** : un message, pas de code. **Aucun commit.**

---

## P1b · Durcissement sécurité
**Préalable** : P1a-bis. **GO déjà donné par Thierry.**

### Ordre imposé, non réordonnable

**1. Migration 034 — jeton public sur `payment_links`**
```sql
-- pgcrypto vit dans le schéma extensions sur Supabase : qualifier l'appel
ALTER TABLE payment_links ADD COLUMN public_token text
  DEFAULT encode(extensions.gen_random_bytes(32), 'hex');
UPDATE payment_links SET public_token = encode(extensions.gen_random_bytes(32), 'hex')
  WHERE public_token IS NULL;
CREATE UNIQUE INDEX payment_links_public_token_key ON payment_links(public_token);
ALTER TABLE payment_links ALTER COLUMN public_token SET NOT NULL;
```
Le `DEFAULT` est obligatoire : sans lui, tout lien créé par le code existant naîtrait sans jeton et le `NOT NULL` ferait échouer l'insertion. L'ordre est contraignant : `NOT NULL` avant le backfill échouerait sur les 9 lignes existantes.
Vérifier ensuite : aucun jeton nul, aucun doublon, 9 jetons distincts de 64 caractères, et aucune policy n'expose `public_token` à `anon`.

**2. STOP — livrable pour Thierry**
Tableau des liens **actifs et impayés** : référence, client, montant, statut, nouvelle URL `/payer/<token>`. **Thierry renvoie lui-même ces URLs aux clients concernés.** Rien ne se neutralise avant sa confirmation.

**3. Nouvelle route `/payer/[token]`**
`service_role`, recherche par égalité exacte sur `public_token`. Payload public strictement limité à : `reference`, `service`, `description`, `montant`, `devise`, `statut`, `client_nom`, `expires_at`. **Retirer `numero_transaction`, `verified_at` et `client_email`.**

**4. `POST /api/payment-links/[token]/declare`**
La déclaration passe par le jeton. Toute la validation métier existante est conservée (expiration, statut modifiable, méthode). Ajouter : refus si le lien est déjà vérifié, pour qu'une déclaration ne puisse pas en écraser une autre.

**5. Neutralisation de `/payer/[reference]`**
Page sobre affichant la référence et invitant à contacter son conseiller. Aucune donnée personnelle, aucune déclaration possible.
**Aucune redirection vers l'URL à jeton** — elle publierait la correspondance référence → jeton et un énumérateur récupérerait tous les jetons en incrémentant le compteur. Ce serait annuler le correctif en le déployant.

**6. Policies de propriété — sortir de l'e-mail**
Compter les `payment_links` à `client_id IS NULL`. Les rattacher par correspondance exacte d'e-mail avec `profiles`, **une fois, en migration** — le rattachement ne reste pas dans la policy. Puis remplacer la policy « client propriétaire » par `client_id = (select auth.uid())`. Chercher le motif de jointure par e-mail dans les 128 policies et **signaler** toute autre occurrence sans la corriger dans cette phase.

**7. Fonctions `SECURITY DEFINER`**
`SET search_path = public` sur les 13 fonctions recensées.

**8. Fonctions de trigger exposées en RPC**
`REVOKE EXECUTE FROM anon, authenticated` sur `assign_demande_to_agent`, `auto_link_*`, `find_available_agent`, `notify_specialist_agents`. Conserver l'exécution de `is_staff`, `is_admin`, `get_user_role` si des policies en dépendent.

**9. Rate-limiting**
Les 7 endpoints publics identifiés en P0, plus la nouvelle route `declare`. Fenêtre glissante par IP.

### Tests — sorties collées en clair
```
a) SET ROLE anon; SELECT count(*) FROM payment_links;   → doit refuser
b) GET /payer/PAY-LINK-2026-000001 … 000012              → aucune donnée personnelle
c) 20 jetons aléatoires de 64 caractères                 → 404
d) POST declare avec une référence au lieu d'un jeton    → refus
e) POST declare deux fois sur un lien vérifié            → second refusé
f) Un lien réel ouvert par son jeton : affichage + déclaration de bout en bout
g) Réponse brute de /payer/[token] : ni numero_transaction, ni verified_at,
   ni client_email  (vérifier le payload réseau, pas l'écran)
```

**Rendu** : migrations · policies finales de `payment_links` et `profiles` en texte intégral · fichiers modifiés · les 7 sorties de test · nombre de liens rattachés à l'étape 6.

---

## P1c · Outillage et dette technique
**Préalable** : P1b.

1. **ESLint** — configuration Strict, puis correction des erreurs. Le critère « lint = 0 » devient enfin vérifiable.
2. **Types TypeScript** — régénérer via `generate_typescript_types` du connecteur Supabase les 12 tables sans type, dont `payments`. **Jamais à la main** : un type écrit à la main dérive dès la migration suivante. Corriger aussi `Demande.client_record_id` (absente) et `Contact` (9 colonnes manquantes).
   *Si la décision n°1 (colonnes de `payments`) n'est pas tranchée, générer quand même — les doublons apparaîtront tels quels et documenteront le problème.*
3. **Performance des policies** — les 118 `auth_rls_initplan` : `auth.uid()` → `(select auth.uid())`. Ajouter les index sur les 42 clés étrangères non couvertes (purement additif).
4. **`gen_demande_ref()`** — passer de `MAX(...)+1` à une vraie séquence Postgres, **en conservant le format `DEM-YYYY-NNNNNN`**, séquence initialisée au maximum actuel. Une référence est un identifiant que le client cite au téléphone : le format ne change pas.
5. **Nettoyage** — supprimer les 3 fichiers `.backup.*`.
6. **CLAUDE.md** — resynchroniser : numérotation réelle des migrations (018-032, pas 001-017), i18n déjà livré, position tranchée sur framer-motion, et **ajouter la règle 8 de §I.2** (toute migration appliquée est committée).

---

## A1 · Tokens et fondations visuelles
**Préalable** : aucun. **Parallélisable avec P1b/P1c** — aucun contact avec la base ni les permissions.

Couche sémantique de couleurs par-dessus la palette de marque existante. L'administration n'appelle jamais une couleur de marque directement.

```
--surface · --surface-raised · --surface-sunken
--border · --border-strong
--text-primary (nexus-blue-950) · --text-secondary · --text-muted
--accent (nexus-orange-500) · --focus
```

**Règle de rareté de l'accent : une seule action orange par écran.** Un tableau dont chaque ligne porte un bouton orange n'a plus de hiérarchie.

**Statuts : six familles, jamais quinze couleurs.** Neutre (nouvelle demande, qualification) · Attente côté client (documents demandés, incomplet, paiement en attente) · En cours côté agence (étude, devis envoyé, traitement, transmis) · Succès (devis accepté, décision reçue, terminé) · Échec (refusé, annulé) · Inerte (archivé). Le badge est un point coloré + libellé en casse normale sur fond neutre, jamais une pastille pleine.

**Typographie** — une seule famille, chiffres tabulaires obligatoires (`font-variant-numeric: tabular-nums`), sans quoi les colonnes de montants ne s'alignent pas. Échelle : 12 / 13 / 14 / 16 / 20 / 24 / 30. Graisse 600 maximum.

**Espacement** — échelle de 4 px. Lignes de tableau : 44 px en confortable, 36 px en compact, choix mémorisé par utilisateur.

**Rayons et ombres** — un rayon de 6 px pour l'interactif, 8 px pour les conteneurs. **Aucune ombre décorative** : l'ombre est réservée à ce qui flotte réellement (menus, modales, popovers).

**Mouvement** — dans l'administration : transitions CSS de 120-150 ms sur les changements d'état déclenchés par l'utilisateur, rien d'autre. Aucune animation d'entrée de page, aucun effet au survol des cartes. `prefers-reduced-motion` respecté.

**Interdits** — dégradés · cartes à ombre douce identiques pour tout contenu · libellés en majuscules espacées · flèche `→` collée aux libellés de boutons · icône décorative dans un carré teinté sur une carte de compteur (le libellé porte déjà l'information) · mode sombre en V3.

---

## A2 · Design system
**Préalable** : A1. **Parallélisable.** Emplacement : `components/admin/ui/`.

**Structure** — `AdminShell` · `Sidebar` · `SidebarGroup` · `Topbar` · `GlobalSearch` · `NotificationCenter` · `UserMenu` · `Breadcrumb` · `PageHeader`
**Données** — `DataTable` (tri, sélection, pagination, colonnes configurables, densité) · `DataCardList` · `FilterBar` · `SavedViews` · `Pagination` · `BulkActionBar` · `ColumnPicker` · `ExportButton`
**Affichage** — `StatCard` · `StatusBadge` · `PriorityBadge` · `Avatar` · `Timeline` · `EmptyState` · `Skeleton` · `ErrorState`
**Saisie** — `Field` · `Input` · `Select` · `Combobox` · `DatePicker` · `FileDrop` · `Textarea` · `FormSection` · `FormStepper` · `UnsavedChangesGuard`
**Retour** — `Modal` · `ConfirmDialog` (saisie du nom pour les actions destructives) · `SlideOver` · `Toast` · `Alert` · `Tooltip`

**Gouvernance, à partir de cette livraison** : toute page qui introduit un bouton, un badge ou un tableau stylé localement au lieu du composant du système est refusée en relecture. La cohérence ne tient pas par bonne volonté.

**Livrable de validation** : une page `/dashboard/_design-system` (accessible au seul `super_admin`, retirée en P12) présentant tous les composants dans tous leurs états. Thierry la valide en ligne avant A3.

---

## P2 · RBAC — 9 rôles
**Préalable** : P1b. **Bloque A3.**

### Pourquoi c'est une réécriture et pas une extension

`lib/rbac.ts` repose sur `ROLE_RANK` + `roleAtLeast()` : un classement linéaire. Cela marche pour `client < agent < admin < super_admin`. Cela **casse** dès qu'on ajoute `daf`, `moderateur` et `partenaire` : un DAF n'est ni au-dessus ni en dessous d'un agent, il est à côté. Aucun rang ne décrit « toute la finance, aucun dossier RH ».

`minRoleForPath` devient `requiredPermissionForPath`. D'un bloc, pas par ajouts successifs de cas particuliers.

### Les 9 rôles

`super_admin` · `admin` · `dg` · `daf` · `chef_service` · `agent` · `comptable` · `moderateur` · `partenaire`

### Permissions — `ressource.action[.portée]`, portées `all` / `service` / `own`

```
dossier.read.{all|service|own} · dossier.create · dossier.update · dossier.assign
dossier.status.change · dossier.delete · dossier.archive · dossier.export
document.read · document.upload · document.validate · document.reject · document.delete
note_interne.read · note_interne.write · message.read · message.send
devis.create · devis.send · devis.validate
facture.create · facture.validate · facture.cancel
paiement.record · paiement.validate · paiement.refund
depense.create · depense.validate · caisse.read · caisse.close
commission.read · commission.validate · finance.report.read · finance.export
rh.user.create · rh.user.disable · rh.role.assign · rh.performance.read
cms.service.write · cms.content.write · cms.faq.write · cms.partenaire.write
notification.broadcast · audit.read · settings.write
```

### Matrice (extrait — à compléter dans `role_permissions`)

| Permission | super_admin | admin | dg | daf | chef_service | agent | comptable | moderateur | partenaire |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| dossier.read | all | all | all | all | service | own | — | — | partagés |
| dossier.assign | ✓ | ✓ | — | — | ✓ service | — | — | — | — |
| dossier.status.change | ✓ | ✓ | — | — | ✓ | ✓ own | — | — | décision seule |
| dossier.delete | ✓ | — | — | — | — | — | — | — | — |
| note_interne.read | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ own | — | — | ✗ |
| devis.validate | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — |
| facture.validate | ✓ | ✓ | — | ✓ | — | — | — | — | — |
| paiement.record | ✓ | ✓ | — | ✓ | — | — | ✓ | — | — |
| paiement.validate | ✓ | — | — | ✓ | — | — | ✗ | — | — |
| caisse.close | ✓ | — | — | ✓ | — | — | — | — | — |
| rh.role.assign | ✓ | — | — | — | — | — | — | — | — |
| cms.content.write | ✓ | ✓ | — | — | — | — | — | ✓ | — |
| audit.read | ✓ | ✓ | ✓ | — | — | — | — | — | — |
| settings.write | ✓ | — | — | — | — | — | — | — | — |

**Séparation des tâches** : qui saisit ne valide pas. Le `comptable` saisit, le `daf` valide.

### Trois niveaux d'application, cumulés

1. **Base (RLS)** — vérité ultime, jamais contournable.
2. **Serveur** — `assertPermission(user, 'facture.validate')` en première ligne de chaque action mutante.
3. **Interface** — `<Can permission="…">`, confort visuel uniquement, jamais une garantie.

### Travaux

Tables `role_permissions` et `user_permissions` · migration du contenu de la matrice TypeScript existante vers la table, sans perte · fonctions `has_permission(perm)`, `auth_role()`, `auth_service_id()` en base (`SECURITY DEFINER`, `search_path` fixé) · `assertPermission()` côté serveur · extension de l'enum `user_role` aux 9 valeurs · `requiredPermissionForPath` dans le middleware · extension de `types/index.ts`.

**Tests** : les 9 rôles, sur chaque parcours touché, en tableau. Un rôle qui ne devrait pas accéder et qui accède est un échec de phase.

---

## C0 · Audit CRM et schéma cible de la relation client
**Préalable** : P1c. **Bloque P3.** Lecture seule, aucune écriture hors rapport.

### Pourquoi cette phase existe

Le CRM natif validé le 5 septembre n'est pas un module nouveau : environ 85 % de son périmètre est déjà couvert par les phases P3, A5, A6, P6 et l'`audit_log`. **Le risque n'est pas de manquer de fonctionnalités, c'est de construire « CRM & Dossiers » à côté de l'existant** et de recréer la duplication qu'on passe la V3 à supprimer.

Un seul point est réellement nouveau et réellement bloquant : **il n'existe pas d'entité « personne » canonique.**

Cinq tables décrivent aujourd'hui un être humain — `profiles` (comptes), `clients` (fiches), `contacts` (formulaire de contact), `contact_demandes` (contact pro), `appointment_requests` (prise de rendez-vous) — auxquelles s'ajoutent les champs client dénormalisés portés directement par `demandes`, qui possède en plus **deux** clés étrangères vers deux notions de client : `client_id` et `client_record_id`. Trois façons de savoir qui est le client d'un dossier.

Une fiche à 360° est mathématiquement impossible dans cet état : selon la table interrogée, la même personne apparaît trois fois, sans lien entre ses dossiers, ses rendez-vous et ses paiements. **C'est la décision D7, et elle commande tout le CRM.**

### Travaux — rapport `docs/AUDIT_CRM.md`

**1. Inventaire des entités « personne »**
Pour chacune des cinq tables : nombre de lignes, colonnes d'identité, colonnes de contact, qui l'écrit (formulaire public, staff, trigger), qui la lit. Combien de personnes physiques distinctes se cachent derrière l'ensemble, après normalisation des e-mails et des téléphones ?

**2. Cartographie des relations**
Graphe complet : client ↔ demande ↔ rendez-vous ↔ message ↔ note ↔ document ↔ paiement ↔ devis. Pour chaque lien : par quelle colonne, avec quelle intégrité (clé étrangère réelle ou simple correspondance d'e-mail), et combien de lignes sont orphelines.

**3. Doublons de colonnes**
Les champs client dénormalisés de `demandes` face à `client_id` et `client_record_id` : lesquels sont renseignés, lesquels divergent, lequel le code lit réellement. Même exercice sur `payment_links` (`client_nom`, `client_email` face à `client_id`).

**4. Ce qui est cassé, vide ou simulé**
Les tables à 0 ligne du parcours dossier (`demande_messages`, `demande_notes`, `demande_status_history`, `demande_documents_requests`) : pour chacune, **diagnostic de cause** — pas d'interface ? insertion cassée ? mauvaise table écrite ? RLS bloquante ? jamais raccordée ? C'est la décision D2 appliquée, et le diagnostic conditionne A5.

**5. Schéma cible proposé**
Sur la base recommandée en D7 :
- `clients` devient l'entité personne unique — prospect **ou** client, avec **ou sans** compte. Un prospect est un client sans dossier, pas une table séparée.
- `profiles` reste l'identité d'authentification, reliée par `clients.profile_id` (déjà présent).
- `contacts`, `contact_demandes`, `appointment_requests` restent les **canaux d'entrée** : elles conservent leur rôle de boîte de réception, et un rattachement crée ou retrouve un `clients`. Elles ne sont ni fusionnées ni supprimées.
- `demandes.client_record_id` (déjà présent, absent de `types/index.ts`) devient le lien canonique dossier → personne. Les champs dénormalisés sont conservés comme trace de la saisie d'origine, jamais lus comme source.
- Aucune table `dossiers` n'est créée : **`demandes` est le dossier**, et la « conversion demande → dossier » est un changement d'étape dans la machine à états, pas un changement de table.

**6. Stratégie de dédoublonnage**
Règle de rapprochement (e-mail normalisé, téléphone au format international), seuil de correspondance, et surtout : **une fusion est toujours proposée à un humain, jamais automatique.** Prévoir la trace de fusion (qui, quand, quelles fiches) et la réversibilité tant que rien n'est supprimé.

**7. Plan de migration non destructif**
Ordre des backfills, ce qui est conservé, fusionné, migré, marqué obsolète. Aucune suppression.

**8. Parcours et pages du CRM**
Ce qui existe déjà, ce qui est à construire, et dans quelle phase (A5, A6, P6) — pas de module parallèle.

**STOP.** Rapport présenté à Thierry, décision D7 confirmée ou corrigée, GO avant P3.

### Ce que C0 ne fait pas

Aucune écriture, aucune migration, aucune fusion. C'est un audit et une proposition de schéma. Les migrations correspondantes sont exécutées en P3.

---

## P3 · Extension du schéma métier
**Préalable** : P2.

### Table de réconciliation — ce qui existe déjà ne se recrée pas

**Le domaine métier existe. Créer `dossiers` à côté de `demandes` serait la pire décision de toute la V3** : deux sources de vérité, deux jeux de RLS, deux interfaces, impossibles à réconcilier ensuite.

| Concept | Existant réel | Décision |
|---|---|---|
| Dossier | **`demandes`** | RÉUTILISER. Ajouter `priority`, `deadline`, `service_id`, `amount_estimated`, `archived_at` |
| Historique | `demande_status_history` | RÉUTILISER |
| Documents | `demande_documents`, `demande_documents_requests` | RÉUTILISER |
| Notes internes | `demande_notes` | RÉUTILISER — cloisonnement déjà correct |
| Messages | `demande_messages` | RÉUTILISER |
| Rendez-vous | `appointments`, `appointment_requests` | RÉUTILISER |
| Paiements | `payments`, `payment_links` | RÉUTILISER, étendre pour partiels et reste dû |
| Dépenses | `expenses` | RÉUTILISER |
| Congés / absences | `leave_requests`, `leave_types`, `leave_balances` | RÉUTILISER — ne pas créer `absences` |
| Performances | `performance_reviews`, `review_periods` | RÉUTILISER |
| Notifications | `notifications` | RÉUTILISER |
| Profils | `profiles` | ÉTENDRE : `service_id`, `availability_status`, `is_active` |

**À créer (20, pas 40)** : `services` · `documents_requis` · `dossier_etapes` · `dossier_partages` · `taches` · `affectations_hist` · `devis` · `devis_lignes` · `factures` · `facture_lignes` · `echeanciers` · `categories_compta` · `caisse_sessions` · `commissions` · `contenus_site` · `faq` · `partenaires` · `temoignages` · `pays_destinations` · `bureaux` · `notification_prefs` · `audit_log` · `agency_settings`.

**Nomenclature** : on garde le vocabulaire du dépôt (`demandes`, `payments`, `appointments`), pas celui du blueprint. Un plan ne renomme pas une base en production.

### `audit_log`

Calqué sur `payment_events`, qui implémente déjà le bon patron : lecture restreinte, **aucune policy `UPDATE` ni `DELETE` pour aucun rôle, y compris `super_admin`**, écriture par `service_role`.
Contenu : utilisateur, rôle au moment de l'action, action, entité, identifiant, ancienne valeur (JSON), nouvelle valeur (JSON), horodatage, IP, agent utilisateur. Champs sensibles masqués dans les diffs (passeport, coordonnées bancaires). Écriture par trigger sur les tables sensibles **et** appel explicite dans les actions serveur — les deux, pas l'un ou l'autre.

### Machine à états des dossiers

```
nouvelle_demande → qualification
   ├→ documents_demandes ⇄ dossier_incomplet → etude_faisabilite → devis_envoye
   │     ├→ devis_accepte → paiement_attente → traitement
   │     └→ refuse
   └→ annule

traitement → transmis_partenaire → decision_recue → { termine | refuse }
{termine | refuse | annule} → archive
```
Transitions déclarées dans un objet `TRANSITIONS` typé, **validées côté serveur**. Chaque transition écrit dans `demande_status_history` **et** `audit_log`. Certaines exigent une permission. Retour arrière réservé à `admin`/`super_admin`, avec motif obligatoire.

### Règles de migration

Un fichier par migration, horodaté, jamais réécrit après application. `ADD COLUMN` toujours `NULL` ou avec `DEFAULT`. Renommage = nouvelle colonne + backfill + vue de compatibilité ; l'ancienne colonne disparaît en V3.1, pas maintenant. RLS activée dans la même migration que la table, avec une policy `deny all` par défaut si les policies définitives ne sont pas encore écrites.

---

## A3 · Shell d'administration
**Préalable** : A2 **et** P2. Sans exception — une navigation par rôles bâtie sur le modèle ordinal est du travail à refaire.

### Navigation : six groupes repliables

| Groupe | Module | Permission | Table | Vague |
|---|---|---|---|:--:|
| **Pilotage** | Vue d'ensemble | tout staff | agrégats | 1 |
| | Rapports | `finance.report.read` | agrégats | 2 |
| **Activité** | Dossiers | `dossier.read.*` | `demandes` | 1 |
| | Clients | `client.read` | `clients`, `profiles` | 1 |
| | Rendez-vous | `rdv.read` | `appointments` | 1 |
| | Tâches | `tache.read` | `taches` | 2 |
| **Finances** | Vue d'ensemble | `finance.report.read` | agrégats | 2 |
| | Caisse et transactions | `caisse.read` | `payments`, `expenses` | 2 |
| | Devis et factures | `facture.read` | `devis`, `factures` | 2 |
| **Organisation** | Ressources humaines | `rh.read` | module RH | 1 |
| | Employés et accès | `rh.user.*` | `profiles` | 1 |
| | Partenaires | `cms.partenaire.write` | `partenaires` | 2 |
| **Contenus** | Services et tarifs | `cms.service.write` | `services` | 2 |
| | Communications | `message.read` | `demande_messages` | 1 |
| | Documents | `document.read` | Storage | 2 |
| **Système** | Notifications | — | `notifications` | 1 |
| | Journal d'audit | `audit.read` | `audit_log` | 2 |
| | Paramètres | `settings.write` | `agency_settings` | 2 |

**Un module de vague 2 n'apparaît dans le menu que le jour où sa phase backend est livrée.** Pas de grisé, pas de « bientôt disponible ». Une entrée qui ne mène nulle part est le premier symptôme du back-office désordonné qu'on quitte.

**Un seul module « Dossiers »**, pas deux. « Demandes reçues » et « Dossiers clients » sont la même table : deux entrées de menu dessus, c'est la mécanique exacte qui produit un admin confus, et les deux pages divergent en six mois. À la place, des **vues enregistrées** en onglets : Boîte de réception · Mes dossiers · Actifs · Urgents · En retard · Terminés · Archivés.

Le menu est **calculé côté serveur** à partir des permissions effectives, jamais filtré côté client à partir d'une liste complète — sinon la liste complète part dans le HTML et renseigne un curieux sur la structure interne.

### Le shell

Barre latérale 240 px, repliable à 64 px (icônes, libellé au survol), logo, nom et rôle de l'utilisateur en pied. Barre supérieure : fil d'Ariane à gauche ; à droite recherche globale (⌘K), bouton d'action rapide (⊕), notifications, profil. Les compteurs sur les entrées de menu comptent **ce qui réclame une action de cet utilisateur**, pas un total.

```
┌──────────────┬──────────────────────────────────────────────────────────┐
│ NEXUS RCA  ⟨ │  Dossiers  ›  DEM-2026-000147            ⌕  ⊕  🔔  TK   │
├──────────────┼──────────────────────────────────────────────────────────┤
│ PILOTAGE     │                                                          │
│  Vue d'ens.  │                                                          │
│ ACTIVITÉ   ⌄ │                    contenu de la page                    │
│  Dossiers 12 │                                                          │
│  Clients     │                                                          │
│  Rendez-vous │                                                          │
│ ORGANISATION›│                                                          │
│ SYSTÈME     ›│                                                          │
├──────────────┤                                                          │
│ Thierry K.   │                                                          │
│ Super-admin  │                                                          │
└──────────────┴──────────────────────────────────────────────────────────┘
```

---

## A4 · Tableau de bord
**Préalable** : A3. **Le bloc financier est bloqué par la décision n°1.**

Quatre blocs. Pas douze. Chacun avec sa source réelle et son état vide rédigé.

**1. À traiter** — quatre compteurs, une seule requête agrégée, chacun cliquable vers la liste filtrée. Aucune variation.
```sql
select
  count(*) filter (where statut = 'nouvelle' and assigned_to is null) as nouvelles,
  count(*) filter (where statut in ('documents_demandes','incomplet','paiement_attente')) as attente_client,
  count(*) filter (where statut in ('qualification','traitement','transmis')) as en_traitement,
  count(*) filter (where deadline < now()
    and statut not in ('termine','refuse','annule','archive')) as en_retard
from demandes;
```
*Valeurs d'enum à aligner sur `demande_status` réel. `deadline` arrive en P3 ; d'ici là ce compteur est **absent**, pas à zéro.*
Vide : « Aucun dossier ne demande d'action aujourd'hui. » — pas quatre zéros alignés.

**2. Pipeline** — `count` par statut, chaque étape cliquable. Sur 19 dossiers, la plupart afficheront 0 à 3 : **c'est l'information utile**, elle montre où le flux se bloque.

**3. Aujourd'hui** — rendez-vous du jour (`appointments`) et activité récente (union `demandes` / `demande_status_history` / `payments`, 15 dernières). Vide : « Rien depuis le {date du dernier événement réel} » — plus honnête et plus informatif qu'un flux vide. Le libellé « en temps réel » n'apparaît que s'il y a un abonnement Realtime derrière.

**4. Alertes** — uniquement des faits vérifiables, chacun cliquable : dossiers hors délai, paiements en attente depuis plus de N jours, documents rejetés sans relance, dossiers sans agent depuis 48 h. Vide : « Aucune alerte. » sans couleur d'alarme.

**Ne pas construire** : blocs financiers (décision n°1), scores de performance et de satisfaction (aucune source ne peut exister), courbe 30 jours (sous ~100 dossiers c'est un graphique de bruit), badges de santé système, citation décorative.

**Vérification avant de rendre** : pour chaque nombre visible, citer la requête qui le produit. Si elle ne peut pas être citée, le nombre est retiré.

---

## A5 · CRM & Dossiers — noyau
**Préalable** : A4, C0, et la décision D2.

Liste avec vues enregistrées · vue Kanban sur la machine à états · fiche détaillée à onglets. **Sur `demandes`, jamais sur une nouvelle table.**

```
Dossiers                                          [+ Nouveau dossier]
[Réception 7] [Mes dossiers 12] [Urgents 2] [En retard 3] [Tous]   ⊕ Vue
⌕ Rechercher…   Service ▾  Statut ▾  Agent ▾  Priorité ▾  Période ▾   ⚏ ⚙
┌──┬──────────────┬──────────┬─────────┬───────────┬────────┬────────┐
│☐ │ Référence    │ Client   │ Service │ Statut    │ Agent  │ Limite │
├──┼──────────────┼──────────┼─────────┼───────────┼────────┼────────┤
│☐ │ DEM-…-000147 │ M. Bemba │ Visa    │ ● En cours│ A. K.  │ 12 sept│
└──┴──────────────┴──────────┴─────────┴───────────┴────────┴────────┘
                                          1-20 sur 19   ‹ 1 ›
── 3 sélectionnés  [Affecter] [Changer le statut] [Exporter] [×] ──
```

**Fiche dossier** — l'en-tête répond aux quatre questions dès la première ligne : où je suis, quel est l'état, ce qui presse, ce que je peux faire.
```
‹ Dossiers          DEM-2026-000147                        [Actions ▾]
M. Bemba · Visa Schengen · ● Traitement · Priorité haute
Agent : A. Kongbo · Créé le 12 août · Limite : 12 septembre (dans 8 j)

●────────●────────●────────○────────○
Reçu   Documents  Étude   Transmis  Décision

[Résumé] [Documents 4/6] [Messages 2] [Paiements] [Rendez-vous] [Historique]
─────────────────────────────────────────  ┌────────────────────────┐
   contenu de l'onglet                     │ ACTIONS                │
                                           │ Changer le statut      │
                                           │ Demander un document   │
                                           │ Envoyer un message     │
                                           │ Enregistrer un paiement│
                                           │ Réaffecter             │
                                           ├────────────────────────┤
                                           │ NOTES INTERNES         │
                                           │ jamais visible client  │
                                           └────────────────────────┘
```
Les notes internes portent un repère visuel permanent : la protection RLS existe, il faut aussi la protection humaine — un agent ne doit jamais confondre une note et un message client.

---

## A6 · CRM — fiche client 360°, entrées, rendez-vous, communications
**Préalable** : A5, C0, et la décision D3.

**1. Fiche client 360°** — la page qui donne son sens au CRM. Sur `clients` comme entité canonique : identité et coordonnées · origine du contact · services demandés · dossiers associés · rendez-vous · communications · documents · devis, factures, paiements et solde restant · chronologie complète. Onglets, pas une page fleuve.

**2. Boîte de réception des demandes entrantes** — `contacts`, `contact_demandes`, `appointment_requests` et les demandes du site public convergent dans une file unique : qualification, priorité, source, attribution à un agent, rattachement ou création d'une fiche client, puis passage à l'étape suivante de la machine à états. **La « conversion en dossier » est un changement d'étape, pas un changement de table.**

**3. Dédoublonnage** — détection au rattachement (e-mail normalisé, téléphone international), fusion **toujours proposée à un humain**, jamais automatique, tracée dans `audit_log`, sans suppression de la fiche absorbée.

**4. Rendez-vous** — sur `appointments`, reliés au client, au dossier et à l'agent. Calendrier, confirmations, rappels, statuts, historique. `rendez_vous` : inventaire de ses données et de ses consommateurs, migration des données utiles, écritures bloquées après bascule, **suppression seulement sur autorisation explicite de Thierry** (D3) — donc pas en V3.

**5. Communications et notes** — `demande_messages` (partageable avec le client) et `demande_notes` (strictement interne) rendues opérationnelles selon le diagnostic de C0 : auteur, horodatage, permissions, journalisation. Repère visuel permanent sur les notes internes. Pièces jointes. Architecture prête pour e-mail, SMS et WhatsApp via P11, sans dépendance dure à un fournisseur.

**6. Notifications** — module sur `notifications`.

**Performance CRM** — demandes reçues, dossiers actifs, délais moyens, dossiers en retard, revenus par service, performance par agent : chacun soumis à la règle du chiffre honnête (§I.6). Le **taux de conversion** exige d'abord une définition écrite du dénominateur et une colonne `source` fiable ; sans elles, il ne s'affiche pas. La **satisfaction client** n'a aucune source et n'est pas construite en V3.

---

## A7 · RH rhabillé
**Préalable** : A5.

Le module RH existe et fonctionne (15 migrations, RLS partout). Il est **rhabillé dans le nouveau shell, pas réécrit**. Compléter avec `taches` et `affectations_hist`, brancher la charge de travail et les délais moyens sur des données réelles.

---

## P6-0 · Convergence des colonnes `payments`
**Préalable** : P3. **Bloque P6 et le bloc financier de A4.** Applique la décision D1.

Phase courte mais délicate : elle touche la table la plus sensible du système. Ordre imposé, un STOP au milieu.

### 1. Analyse — lecture seule, avant toute écriture

```sql
-- combien de lignes ont l'une, l'autre, les deux, aucune
select
  count(*)                                              as total,
  count(*) filter (where statut is not null)            as a_statut_fr,
  count(*) filter (where status is not null)            as a_status_en,
  count(*) filter (where statut is not null and status is not null) as les_deux,
  count(*) filter (where statut is null and status is null)         as aucune
from payments;

-- divergences réelles : les lignes où les deux existent et se contredisent
select id, reference, statut, status, montant_total, amount, mode_paiement, method
from payments
where (statut is not null and status is not null)
   or (montant_total is not null and amount is not null and montant_total <> amount);
```

**Livrer aussi** : la correspondance observée entre les valeurs françaises et anglaises de l'enum · la liste de **tous les consommateurs** (composants, routes API, exports, rapports, triggers, vues, policies) et la colonne que chacun lit ou écrit · les valeurs par défaut et triggers qui alimentent aujourd'hui l'une ou l'autre colonne.

**STOP.** Présenter à Thierry : le tableau de divergences, la liste des consommateurs, et une **proposition de jeu canonique de valeurs** pour `payment_status` (décision D6). L'enum en compte 11 (`non_paye, partiel, paye, rembourse, annule, pending, paid, failed, validated, refunded, voided`) : choisir les colonnes ne suffit pas, il faut aussi choisir les valeurs, sinon deux écrans afficheront toujours deux totaux. Attendre le GO.

### 2. Backfill contrôlé

Migration additive. Pour chaque ligne, `status` et `amount` reçoivent la valeur canonique, dérivée de la colonne héritée quand elle seule est renseignée. Aucune ligne n'est laissée avec `status` ou `amount` nul. Les divergences relevées à l'étape 1 sont tranchées **une par une**, jamais par une règle automatique — sur 3 lignes aujourd'hui, c'est faisable à la main, et c'est justement le bon moment pour le faire.

Poser un `NOT NULL` sur `status` et `amount` une fois le backfill vérifié.

### 3. Synchronisation temporaire

Trigger `BEFORE INSERT OR UPDATE` qui recopie `status` → `statut` et `amount` → `montant_total`. Il protège les consommateurs pas encore migrés pendant la transition. **Le sens est unique** : le canonique alimente l'hérité, jamais l'inverse. Un trigger bidirectionnel créerait une boucle et deux vérités.

### 4. Migration des consommateurs

Un par un, dans l'ordre de la liste de l'étape 1. Après chaque groupe, la barrière de qualité. Aucune lecture de `statut`, `montant_total` ou `mode_paiement` ne subsiste à la fin — le vérifier par `grep` et le prouver dans le récapitulatif.

Corriger aussi les valeurs par défaut et les triggers qui écrivaient dans les colonnes héritées : ils doivent désormais écrire dans les canoniques.

### 5. Test de réconciliation — le critère d'acceptation

Un même mois doit produire **exactement le même total partout** :

```sql
select date_trunc('month', created_at) as mois,
       sum(amount)        as total_canonique,
       sum(montant_total) as total_herite,
       sum(amount) - sum(montant_total) as ecart
from payments group by 1 order by 1;
```
Écart attendu : **0 sur chaque mois**. Puis comparer ce total à ce qu'affichent le tableau de bord, la page Caisse et l'export CSV : les quatre doivent coïncider au franc près. Tant qu'ils ne coïncident pas, la phase n'est pas terminée.

### 6. Ce qui ne se fait pas

Les colonnes héritées **restent en base**, marquées obsolètes dans la documentation et dans un commentaire SQL (`COMMENT ON COLUMN`). Leur suppression est un chantier de V3.1, après une période d'observation en production. Le trigger de synchronisation reste actif jusque-là : il ne coûte rien et il rattrape tout consommateur oublié.

---

## P6 · Finance
**Préalable** : P3 **et P6-0 terminée**. Rien ne commence avant.

Devis · factures · reçus · paiements partiels et reste dû · échéanciers · dépenses · caisse (ouverture, solde théorique, solde réel, écart, clôture) · catégories comptables · commissions · PDF via `pdf-lib` · exports CSV · rapports journaliers, mensuels, annuels · rapprochement et validation.

Numérotation : `DEV-YYYY-NNNNNN`, `FAC-YYYY-NNNNNN`, `REC-YYYY-NNNNNN`, par séquence Postgres avec trigger `BEFORE INSERT` — **jamais** par `count(*)+1`.

Toute opération sensible passe par une permission et laisse une ligne d'`audit_log`. Migration des 5 fichiers `jspdf` vers `pdf-lib` en entrée de phase.

---

## P8 · CMS et contenus
**Préalable** : P3.

Le `super_admin` gère sans toucher au code : catégories et services, descriptions, tarifs ou « sur devis », documents demandés, délais indicatifs, étapes de traitement, pays et destinations, FAQ, coordonnées, bureaux, partenaires, témoignages **vérifiés**, textes et appels à l'action du site, activation ou désactivation d'un service.

**Aucun faux partenaire, aucun faux témoignage, aucun logo non autorisé.** Un témoignage n'est publiable que marqué vérifié, avec sa source.

---

## P9 · Portail client
**Préalable** : A5, P6.

Suivi d'avancement · étapes faites et restantes · téléversement · documents manquants · demandes de correction · consultation et acceptation d'un devis · factures et reçus · suivi des paiements · rendez-vous · échange avec son conseiller · notifications · téléchargement des documents officiels · historique.

**Aucune note interne, aucune information administrative sensible.** À tester en changeant l'identifiant dans l'URL, systématiquement.

---

## P10 · Site public
**Préalable** : P8.

Le vrai chantier est la **factorisation** : 7 pages `services/*` de 1200 à 2272 lignes, chacune avec son `*Form.tsx` de 1200+ lignes, toutes sur le même moule. Un gabarit de page service alimenté par la table `services`, un composant de formulaire configuré par service.

Puis hiérarchie visuelle, présentation des 8 pôles, appels à l'action, états de chargement et messages d'erreur, navigation mobile, pied de page, SEO, accessibilité, performance. Cible Lighthouse ≥ 90 sur les quatre axes.

**Ne pas transformer le site en modèle générique de startup.** L'identité reste élégante, institutionnelle, internationale.

---

## P11 · Notifications multicanal
**Préalable** : P3.

Architecture par événements : chaque action métier émet un événement (`dossier.cree`, `document.rejete`, `paiement.recu`, `echeance.proche`…). Un dispatcher lit `notification_prefs` et écrit dans `notifications`. Les adaptateurs e-mail, SMS et WhatsApp implémentent une interface commune `NotificationChannel` et restent inactifs tant que les fournisseurs ne sont pas configurés. **Aucune dépendance dure à un fournisseur dans le code métier.**

---

## P12 · Durcissement final
**Préalable** : toutes les phases.

Repasser la checklist complète sur les 9 rôles · Lighthouse sur le public · retirer la page `_design-system` · `docs/V3.md` documentant tables, routes, rôles et permissions · vider `docs/DETTE.md` ou arbitrer ce qui reste · journal des versions.

---

# PARTIE IV — INDICATEURS DE RÉUSSITE

| Indicateur | Cible |
|---|---|
| Tables sans RLS | 0 |
| Vérifications de permission côté client uniquement | 0 |
| Valeurs codées en dur dans les tableaux de bord | 0 |
| Erreurs TypeScript / lint | 0 |
| Couverture des 9 rôles par des tests de parcours | 100 % |
| Actions sensibles tracées dans `audit_log` | 100 % |
| Lighthouse public (perf / a11y / bonnes pratiques / SEO) | ≥ 90 |
| Tableaux d'administration lisibles sur mobile sans défilement horizontal | 100 % |
| Compteurs dont la liste filtrée contient exactement le même nombre de lignes | 100 % |

**Hors périmètre V3** : montées de version majeures (Next 14→16, React 18→19, Tailwind 3→4). Trois majeures pendant une refonte fonctionnelle, ce sont deux chantiers qui se cachent l'un derrière l'autre le jour où quelque chose casse. À traiter en V3.1, seules, sur une branche dédiée.

---

*Ce document est la source de vérité. En cas de contradiction avec un échange antérieur, c'est lui qui fait foi. Première action : P1a-bis.*
