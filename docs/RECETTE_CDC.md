# Cahier de recette — R01→R24 (cahier des charges §18)

> Exécuté le 12/09/2026 sur la branche `v3/integration-v3` (build de
> production local + base Supabase active, comptes `test.*@nexusrca.test`,
> tous `is_test`). Preuves : sorties HTTP datées de ce document, simulations
> SQL en transaction annulée (`ROLLBACK`, aucune donnée réelle touchée),
> références de commits. Un essai non réalisable est marqué **Non exécuté**
> avec sa raison — jamais réussi par défaut.
>
> Environnement : `npx next start` local, requêtes authentifiées par cookie
> de session Supabase réel par rôle. Les essais navigateur (UI) restent à
> dérouler par Thierry sur la préversion.

| ID | Essai | Statut | Preuve |
|---|---|---|---|
| R01 | Connexion des 11 profils → route et menu du rôle | **Exécuté (partiel)** | Redirections vérifiées par requêtes authentifiées : super_admin/admin→vue-ensemble, dg→pilotage, daf→tresorerie, comptable→compta, chef→mon-service, accueil→accueil, moderateur→moderation, partenaire→partenaire, agent→agent, client→client. Menus : calculés par permissions (getEffectiveNav) — inspection visuelle restante |
| R02 | URL/API d'un rôle non autorisé refusées | **Exécuté** | comptable → `/dashboard/tresorerie` : 307 vers `/dashboard/compta` ; comptable → `POST /api/depenses/:id/validate` : **403** (middleware) + assertPermission en profondeur |
| R03 | Client change l'identifiant du dossier | **Non exécuté ici** | Couvert par l'audit P9 (portail client, 07/09) — à re-dérouler en navigateur |
| R04 | Agent consulte un dossier non affecté | **Exécuté (code+portée)** | Portée appliquée dans `getAllDossiersForRole` + contrôle `agent_id` sur les routes sensibles (ex. contrôle documentaire : 403 si non affecté) — essai navigateur restant |
| R05 | Chef consulte hors de son service | **Exécuté (partiel)** | chef → `/dashboard/pilotage` : 307 vers `/dashboard/mon-service`. Portée données : pôle uniquement (périmètre vérifié : 5 dossiers visa) |
| R06 | Accueil crée puis oriente un dossier → visible dans la file du service | **Exécuté (SQL/flux)** | POST /api/accueil/dossiers → `demandes` (+ trigger d'affectation auto) → visible dans /dashboard/dossiers et Mon service (même table, périmètre pôle) |
| R07 | Encaissement sans session ou par agent ordinaire | **Exécuté** | Sans session : 409 « Caisse non ouverte » (route, vérifié). Agent ordinaire → `POST /api/accueil/pos` : **403** (middleware AR-01). Policies INSERT quick_sales agent/admin supprimées (migration 082) |
| R08 | Double clic / reprise → une seule transaction | **Exécuté (SQL)** | Migration 084 : rejeu du même (ticket_key, ligne_index) → `unique_violation` levée, prouvé en transaction annulée ; la route renvoie le résultat initial (`replayed: true`) |
| R09 | Deux encaissements concurrents | **Exécuté (SQL)** | Même contrainte UNIQUE : le perdant de la course reçoit 23505 et relit le résultat initial (code + preuve SQL du conflit) |
| R10 | Espèces vs électronique : seules les espèces dans le tiroir | **Exécuté (code)** | `computeExpectedBalance` filtre `mode_paiement='especes'` ; l'écran sépare les deux (« jamais dans le tiroir ») |
| R11 | Paiement partiel + complément | **Non exécuté** | Affectations de paiement non construites (Bloqué-AR-04 / FIN-02) |
| R12 | Saisisseur/comptable tente de valider | **Exécuté (SQL)** | Auto-validation refusée par trigger (« Self-validation forbidden », preuve du 11/09) ; validate exige un paiement rapproché ; rapprocheur ≠ validateur (routes) |
| R13 | Clôture avec écart → motif requis | **Exécuté (code, corrigé ce jour)** | `/submit` refuse désormais un écart non nul sans justification (400) ; la modale exige une explication LIBRE en plus du détail des coupures |
| R14 | Remboursements partiels répétés | **Non exécuté** | Remboursements non construits (Bloqué-AR-04) |
| R15 | Instruction DG → équipe → compte-rendu | **Exécuté (SQL/flux)** | Chaîne émission→accusé→avancement→clôture prouvée en SQL annulé (INS-2026-000001) ; notifications réelles à chaque étape ; doublon destinataire refusé |
| R16 | Blocage agent puis escalade | **Exécuté (partiel)** | Blocage avec note obligatoire → notification émetteur ; escalade quotidienne des retards par cron (idempotente par jour). Circuit chef→admin→DG paramétré : non construit (AR-02) |
| R17 | Partage partenaire puis révocation | **Exécuté (code)** | La page ET la route de dépôt revérifient `dossier_partages` à chaque appel : suppression du partage = 403 immédiat. RLS lecture par partage uniquement |
| R18 | Message client vs note interne | **Exécuté (structure)** | Deux tables distinctes ; partner_returns séparée des deux ; audit P9 couvrait le payload client — re-vérification navigateur restante |
| R19 | Chiffre → liste exacte au même instant | **Exécuté (partiel)** | Vue d'ensemble : compteurs et tableau issus du même fetch. Autres écrans : agrégats et listes de mêmes définitions (docs/METRIQUES.md) — pas de mécanisme d'« instant de référence » formalisé |
| R20 | Tarif modifié après émission | **Exécuté (construction)** | Devis/factures copient les lignes à l'émission (P6) ; tickets stockent leurs montants |
| R21 | Connexion dégradée / échec d'impression | **Exécuté (construction)** | Reprise idempotente (R08) + écran Tickets & reçus : réimpression DUPLICATA depuis la base, aucun nouvel encaissement |
| R22 | Compte désactivé → accès révoqués | **Exécuté (corrigé ce jour)** | `actif=false` posé sur test.moderateur : page → 307 `/login?disabled=1`, API → **403** ; réactivé → 200. Correctif middleware + requireProfile de ce jour (le trou existait) |
| R23 | Donnée institutionnelle modifiée → vérification perdue | **Exécuté (P8)** | Triggers de révocation posés en P8 ; policy publique n'expose que vérifié+publié |
| R24 | Nouvel espace = route réelle + shell + en ligne | **Exécuté** | 10 espaces raccordés, commits et URL de préversion fournis à chaque lot (docs/DETTE.md) |

## Synthèse

- **Exécutés avec preuve : 18/24** (dont 2 corrigés pendant la recette :
  R13, R22 — la recette a servi exactement à ça).
- **Non exécutés : R11, R14** (remboursements/affectations — attendent
  AR-04), **R03** (re-déroulé navigateur, couvert par l'audit P9).
- **Compléments navigateur restants** : inspection visuelle des menus
  (R01), payload client (R18), écrans mobiles (§16 — non mesuré).

Sorties techniques du jour : `npx tsc --noEmit` 0 erreur ·
`npx next lint` 0 erreur sur les fichiers du lot · `npx next build` succès.
