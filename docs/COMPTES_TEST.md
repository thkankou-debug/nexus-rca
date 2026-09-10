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
