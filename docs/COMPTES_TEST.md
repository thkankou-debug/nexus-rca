# Comptes de test (L2)

> Créés le 09/09/2026 via `scripts/create-test-accounts.js`. Domaine `@nexusrca.test`
> (TLD réservé RFC 2606, jamais résolvable — aucun email réel ne peut y arriver).
> Tous marqués `is_test = true` sur `profiles` (et `clients` pour le compte client).
> **Aucun mot de passe dans ce fichier** — transmis à Thierry hors dépôt.

| Rôle | Identifiant | Service de rattachement | Date création |
|---|---|---|---|
| super_admin | test.superadmin@nexusrca.test | — | 09/09/2026 |
| admin | test.admin@nexusrca.test | — | 09/09/2026 |
| dg | test.dg@nexusrca.test | — | 09/09/2026 |
| daf | test.daf@nexusrca.test | — | 09/09/2026 |
| chef_service | test.chefservice@nexusrca.test | Visa & e-Visa | 09/09/2026 |
| agent | test.agent@nexusrca.test | Visa & e-Visa | 09/09/2026 |
| comptable | test.comptable@nexusrca.test | — | 09/09/2026 |
| moderateur | test.moderateur@nexusrca.test | — | 09/09/2026 |
| partenaire | test.partenaire@nexusrca.test | — | 09/09/2026 |
| accueil_caisse | test.accueilcaisse@nexusrca.test | — | 11/09/2026 |
| client | test.client@nexusrca.test | — | 09/09/2026 |

## Jeu de données de test associé (tout `is_test = true`)

- 1 fiche `clients` (Test Client, rattachée à `test.client@nexusrca.test`)
- 3 `demandes` : une nouvelle (non assignée), une "traitement" avec `deadline`
  dépassée (en retard), une "documents_demandes" (en attente client) —
  toutes rattachées à Test Client / Test Agent, pôle Visa & e-Visa
- 1 `appointments` (RDV confirmé, J+2, Test Agent)
- 1 `payment_links` à 100 XAF (référence `PAY-LINK-2026-000012`)
- 1 `expenses` en attente de validation (5 000 XAF)
- 1 `demande_messages` + 1 `demande_notes` sur le dossier "documents_demandes"

## Re-génération

Le script est idempotent par email : relancer `node scripts/create-test-accounts.js`
ne recrée pas un compte déjà existant (il le signale et passe au suivant).

## Test de paiement (f) — exécuté le 09/09/2026

Sur le lien `PAY-LINK-2026-000012` (100 XAF), serveur de développement local :

1. **Affichage par jeton** (`GET /payer/t/<token>`) → 200, montant/nom affichés
   correctement.
2. **Déclaration** (`POST /api/payment-links/t/<token>/declare`) → 200,
   `statut: "paiement_declare"`, `skipped: "is_test"` (aucun email réel émis,
   confirmé).
3. **Seconde déclaration** avec un numéro de transaction différent → **BUG
   TROUVÉ, pas un faux positif** : la route acceptait la seconde déclaration
   (200, `success: true`) et **écrasait silencieusement**
   `numero_transaction` et `paid_declared_at` de la première.
4. **Corrigé le 09/09/2026** (validation explicite de Thierry) : la route
   (`app/api/payment-links/t/[token]/declare/route.ts`) refuse désormais
   (400) toute déclaration quand `statut === "paiement_declare"`. Rejoué
   après correction sur le même lien (réinitialisé à `en_attente`) :
   1ère déclaration acceptée, 2e refusée (400), `numero_transaction`
   toujours celui de la 1ère en base. Voir `docs/DETTE.md`.

## Rotation du 13/09/2026 — incident et règle

**Incident** : les recettes HTTP du 13/09 (rapports PDF, logo/bouton
Retour) posaient un mot de passe temporaire ALÉATOIRE sur chaque compte
de test avant de s'y connecter — les mots de passe transmis à Thierry ne
fonctionnaient plus. Détecté par Thierry le 13/09 au soir.

**Correction** : un mot de passe UNIQUE commun a été posé sur les
11 comptes et la connexion de chacun vérifiée (11/11). Comme toujours,
**aucun mot de passe dans ce fichier** — transmis à Thierry hors dépôt.

**Règle permanente pour les recettes futures** : les scripts de recette
HTTP réutilisent le mot de passe commun courant (transmis hors dépôt) et
n'en génèrent JAMAIS un nouveau. Si une rotation est inévitable, elle se
termine par la repose du mot de passe commun + vérification 11/11 +
message à Thierry.

**Rappel avant GO production** : ces comptes `is_test` restent en base ;
mot de passe à faire tourner (ou comptes désactivés) au moment de la
bascule (P12/durcissement).

## Désactivation du 13/09/2026 (post-bascule production)

Les 11 comptes de test sont **DÉSACTIVÉS** (profiles.actif=false + ban
auth — connexion refusée, vérifiée 11/11, tracée dans audit_log). Les
données de test (fiche client, demandes, lien de paiement) sont
conservées et restent marquées is_test.

**Réactivation** : depuis la section « Utilisateurs & habilitations »
(/dashboard/utilisateurs, super-admin), bouton « Réactiver » sur le
compte voulu — ou me le demander.
