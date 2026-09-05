# Dette technique — hors périmètre volontaire

Idées et écarts identifiés pendant l'exécution d'une phase, notés ici plutôt
qu'implémentés hors périmètre. Chaque entrée : phase d'origine, constat,
raison de ne pas agir maintenant, phase qui devrait s'en charger.

---

## P2 — RBAC 9 rôles (05/09/2026)

**1. Branches divergentes — `v3/p2-rbac` n'hérite pas de `v3/p1c-outillage`.**
`v3/p2-rbac` est branchée depuis `v3/p1b-durcissement` (sur demande explicite).
Les 4 branches de phase (`a1-tokens`, `a2-design-system`, `p1b-durcissement`,
`p1c-outillage`) ont chacune divergé indépendamment de `main`. P2 n'a donc PAS
les commits de P1c : config ESLint (`.eslintrc.json`), régénération des types
TypeScript, optimisation `auth_rls_initplan` sur 122 policies, index sur 42 FK,
séquence `gen_demande_ref()`. Les 3 fichiers `.backup.*` ont été re-supprimés
manuellement sur cette branche (P1c l'avait déjà fait sur la sienne) car ils
cassaient la compilation TypeScript de P2 — seul point réconcilié ici.
**À faire** : fusionner les branches de phase entre elles (ou toutes dans
`main`) avant que deux chantiers censés être indépendants ne divergent trop
pour se réconcilier proprement. Décision de topologie, pas d'exécution de
phase — à trancher avec Thierry.

**2. `<Can>`/`RoleGate.tsx` non migré vers le nouveau vocabulaire de permissions.**
Le plan présenté prévoyait de faire migrer `<Can>` de `action`+`resource` vers
une prop `permission` (chaîne). Constat en exécutant : `RoleProvider` (dans
`DashboardShell.tsx`, gelé par CLAUDE.md) ne porte que `{role, userId}`, pas
un ensemble de permissions. Le brancher sur `role_permissions` demanderait de
modifier `DashboardShell.tsx` au-delà d'un ajout mécanique de types — hors
périmètre sans demande explicite. `<Can>`/`useCan()` restent inchangés
(zéro appelant réel actuellement, donc zéro régression). **À faire en A3**,
qui remplace de toute façon `DashboardShell` par le nouveau shell d'admin.

**3. `auth_service_id()` non créée.**
Dépend de `profiles.service_id`, qui n'existe pas avant P3 ("Profils |
ÉTENDRE : service_id, availability_status, is_active"). `has_permission()`
n'en a pas besoin (la portée "service" est une étiquette de permission, son
filtrage par ligne est un chantier RLS/requêtes de P3/A3). **À faire en P3**,
en même temps que la colonne.

**4. Seed de `role_permissions` partiellement inféré au-delà de l'extrait de la feuille de route.**
La matrice fournie par la feuille de route (§P2) est explicitement un
"extrait — à compléter". Pour respecter "sans perte" par rapport à la MATRIX
TypeScript actuelle, plusieurs permissions ont été ajoutées pour `admin`/
`agent` sur des ressources que l'extrait ne couvrait pas (dossiers, clients,
rdv, documents, messagerie, caisse) — voir le commentaire en tête de
`043b_rbac_permissions_infra.sql`. Aucun compte réel `admin`/`agent`/`dg`/...
n'existe à ce jour (seul `tkankou@gmail.com`, super_admin) : faible risque
immédiat. **À revoir** directement dans la table `role_permissions` (aucun
code à changer) quand de vrais comptes employés seront créés.

**5. Migration `042_contact_demandes` appliquée en base sans fichier `.sql` committé.**
Découvert en cherchant un numéro de migration libre pour P2 (version
`20260511220546`, 11/05/2026). Même défaut que le trou 001-017 déjà connu.
Non corrigé ici (hors périmètre P2) ; la nouvelle migration a été numérotée
043 pour ne pas réutiliser ce numéro. **À investiguer** si quelqu'un a besoin
un jour de rejouer le schéma depuis zéro.

**6. Les 137 appels `requireProfile([...])` existants ne sont pas migrés vers `assertPermission()`.**
Scope volontairement exclu de P2 (confirmé dans la présentation de phase) :
ils continuent de fonctionner tels quels, les 4 rôles actuels ne changeant
pas de sens. **À migrer progressivement**, page par page, au fil des phases
qui les touchent (A3, A5, A6, P6…).

---

## P3 — Extension du schéma métier (05/09/2026)

**1. `logAudit()` branché uniquement sur le changement de statut de dossier.**
`app/api/demandes/[id]/status/route.ts` écrit dans `audit_log` ; aucune autre
route sensible (validation de paiement, changement de rôle, suppression) ne
l'appelle encore. Le trigger DB reste la seule capture pour ces actions.
**À étendre** progressivement, action par action, au fil des phases qui les
touchent (P6 pour les paiements/factures, A6 pour les fusions client).

**2. 20 tables du schéma sans aucune UI.**
Toutes RLS-protégées et prêtes, mais aucune page ne les consomme encore
(volontaire — P3 est schéma seul). **À construire** : A5 (`taches`,
`dossier_etapes`, `affectations_hist`, `dossier_partages`), P6 (`devis*`,
`factures*`, `echeanciers`, `categories_compta`, `caisse_sessions`,
`commissions`), P8 (`contenus_site`, `faq`, `partenaires`, `temoignages`,
`pays_destinations`, `bureaux`, `agency_settings`), P11
(`notification_prefs`).

**3. Permissions P2 pour des ressources qui n'existaient pas encore au moment de leur seed.**
`role_permissions` a des lignes pour `devis.*`, `facture.*`, `caisse.*`,
etc. — posées par anticipation en P2, avant que les tables elles-mêmes
n'existent. Cohérent maintenant que P3 les a créées, mais aucune page ne
vérifie encore ces permissions (même raison que le point 2).
