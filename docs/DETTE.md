# Dette technique — hors périmètre volontaire

Idées et écarts identifiés pendant l'exécution d'une phase, notés ici plutôt
qu'implémentés hors périmètre. Chaque entrée : phase d'origine, constat,
raison de ne pas agir maintenant, phase qui devrait s'en charger.

---

## P2 — RBAC 9 rôles (05/09/2026)

**1. Branches divergentes — `v3/p2-rbac` n'hérite pas de `v3/p1c-outillage`.**
~~`v3/p2-rbac` est branchée depuis `v3/p1b-durcissement`...~~ **Résolu le
05/09/2026** : réconciliation complète effectuée avant A3 (qui a besoin
d'A2 et P2 simultanément — devenu bloquant). Branche `v3/integration-v3`
créée depuis `v3/p3-schema-metier` (lignée P1b→P2→C0→P3, la plus complète),
fusion de `v3/a2-design-system` — qui s'est révélée inclure déjà
`v3/a1-tokens` **et** `v3/p1c-outillage` (fusion de ce dernier : "Already up
to date", rien à apporter). 3 conflits réels résolus (tableau `NEXUS_RCA_
FEUILLE_DE_ROUTE_V3 (2).md` → version P3 conservée, plus à jour ;
`types/database.ts` → régénéré depuis le schéma réel plutôt que fusionné à
la main, fichier généré ; `types/index.ts` → les deux côtés apportaient des
ajouts complémentaires, fusionnés). Barrière de qualité repassée en entier
après fusion : `tsc` 0 erreur, `next lint` 0 erreur, `next build` succès.
Toutes les phases continuent désormais sur `v3/integration-v3`.

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

---

## A3 — Shell d'administration (05/09/2026)

**1. Construction isolée, aucune page réelle basculée.**
Confirmé avec Thierry avant exécution : `lib/admin-nav.ts` et la démo sur
`/dashboard/design-system` ne remplacent aucune route existante.
`DashboardShell.tsx` (gelé) reste la navigation réelle. **À faire** : la
bascule section par section, répartie sur A4-A7.

**2. Libellés de permission de la feuille de route pas tous identiques au catalogue P2.**
Le tableau A3 utilise des libellés informels (`dossier.read.*`,
`client.read`, `rdv.read`, `rh.read`) qui ne correspondent pas
littéralement aux permissions seedées en P2 (`dossier.read.own`,
`client.read.own`, `rdv.read.own`, `rh.user.read`). Mappage documenté en
tête de `lib/admin-nav.ts`. Sans conséquence aujourd'hui (seul
`tkankou@gmail.com`, super_admin, contourne toute vérification), mais à
vérifier quand de vrais comptes `dg`/`daf`/`chef_service`/etc. existeront.

---

## A4 — Tableau de bord (05/09/2026)

**1. Choix « démonstration isolée » — confirmé par Thierry le 05/09/2026.**
~~À confirmer...~~ Lecture 1 (démo isolée) explicitement validée après
coup. La bascule d'une vraie page reste un chantier A5-A7.

**2. Alerte « documents rejetés sans relance » retirée — le concept n'existe pas dans le schéma.**
Aucune colonne de validation sur `demande_documents`, et
`demande_documents_requests.statut` n'admet que `('en_attente', 'fourni',
'annule')` par contrainte CHECK — pas d'état "rejeté". **À trancher** si un
jour un vrai flux de rejet de document est voulu : ajouter la colonne/l'état
manquant est un travail de schéma, pas de tableau de bord.

---

## A5-0 — Audit CRM et consolidation d'identité (05/09/2026)

**1. Aucun corps de section dans la feuille de route V3 consolidée.**
Le nom "A5-0" n'apparaît qu'une fois dans tout le document, comme ligne du
tableau d'avancement (§I.5) — aucun objectif, travaux ou livrable décrit,
contrairement à toutes les autres phases. Son titre ("Audit CRM et
consolidation d'identité") recoupe très largement C0 ("Audit CRM et schéma
cible de la relation client"), dont le §6 (`docs/AUDIT_CRM.md`) couvre
explicitement la stratégie de dédoublonnage/consolidation d'identité.
**Décision de Thierry (05/09/2026)** : A5-0 marquée satisfaite par C0,
aucun travail supplémentaire. **À surveiller** : si un contenu spécifique
à A5-0 existe dans un document externe non retrouvé, le signaler pour
combler ce vide avant que la numérotation ne prête à confusion ailleurs.

**3. Seuils d'alerte choisis sans consigne précise de la feuille de route.**
"Paiements en attente depuis plus de N jours" (N=3) et "dossiers sans agent
depuis 48h" (le second est donné par la feuille de route, le premier non).
**À ajuster** avec Thierry si 3 jours ne correspond pas à la réalité
opérationnelle.

**3. `StatusBadge` du tableau Dossiers utilise une teinte unique (`progress`) pour tous les statuts.**
Simplification de la démo — pas de mappage statut → teinte comme dans
`DemandesManager.tsx`/`StatCard.tsx`. **À corriger** si cette table devient
un vrai composant réutilisé au-delà de la démonstration.

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
