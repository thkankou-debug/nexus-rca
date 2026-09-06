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

---

## A5 — CRM & Dossiers, noyau (05/09/2026)

**1. `payments.demande_id`/`dossier_id` non renseignés sur aucun paiement réel.**
Découvert en vérifiant le schéma avant d'écrire l'onglet Paiements de la
fiche dossier — les deux colonnes existent (redondance déjà suspecte en
soi) mais aucune des deux n'est peuplée sur les 3 paiements réels. Même
défaut que `demandes.client_record_id` avant sa correction en P3. L'onglet
Paiements est honnêtement vide tant que ce n'est pas corrigé.
**À faire** : identifier où un paiement est créé pour un dossier (caisse,
lien de paiement) et y renseigner `demande_id` — travail sur le flux de
création, pas sur la fiche dossier. Candidat naturel : P6 (Finance).

**2. `appointments` n'a aucune colonne reliant un rendez-vous à un dossier.**
L'onglet Rendez-vous utilise `client_id` comme corrélation approchée
(rendez-vous du même client, pas du même dossier précisément), étiqueté
comme tel dans l'interface. **À trancher** : si un lien dossier-RDV précis
est voulu, ajouter `appointments.demande_id` est un changement de schéma,
pas un changement d'écran.

**3. Vue Kanban limitée à 11 colonnes actives + 1 colonne "Terminés" groupée.**
Choix pragmatique (16 dossiers réels répartis sur 15 états auraient produit
des colonnes presque toutes vides). **À revoir** si le volume de dossiers
grandit au point qu'une distinction entre `termine`/`refuse`/`annule`/
`archive` devient utile dans le Kanban lui-même.

**4. Actions de masse "Affecter"/"Changer le statut" appellent les routes existantes en boucle, une requête HTTP par dossier sélectionné.**
Pas de véritable endpoint "bulk" côté API. Fonctionnel et correct (chaque
dossier reçoit son historique/audit/email comme une action individuelle
légitime), mais N requêtes séquentielles pour N dossiers sélectionnés —
lent au-delà d'une trentaine. **À optimiser** si le volume réel le
justifie un jour (paralléliser, ou un vrai endpoint bulk côté serveur).

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

---

## A6 — CRM, fiche client 360° et entrées (05/09/2026)

**1. `contact_demandes` exclue du rattachement client (Lot 2).**
Portée du Lot 2 tranchée avec Thierry : rattachement `client_record_id`
ajouté sur `contacts` et `appointment_requests` uniquement.
`contact_demandes` a 0 ligne et aucune route API n'y écrit (confirmé par
recherche exhaustive) — c'est une table morte, rien à rattacher. **À
traiter** si un jour un formulaire "contact pro" est branché dessus :
ajouter la même colonne `client_record_id` à ce moment-là.

**2. 1 dossier orphelin (`demandes`, statut `termine`) non couvert par la vue Réception.**
La vue "Réception" d'A5 filtre sur `statut = 'nouvelle_demande'` — un
dossier plus ancien (avril 2026, statut `termine`, sans agent, sans
`client_record_id`) n'apparaît dans aucune vue enregistrée actuelle.
**À traiter** : rattachement manuel ponctuel par Thierry, ou extension
d'une vue "Non rattachés" si d'autres cas similaires apparaissent.

**3. ~~Page `/dashboard/admin/rdv` interroge des colonnes qui n'existent pas sur `appointment_requests`.~~ Corrigé au Lot 4.**
Découvert en vérifiant le périmètre du Lot 2 (non lié à ce lot — défaut
préexistant) : la requête utilisait `appointment_date`/`appointment_time`/
`nom_complet`, alors que le schéma réel de `appointment_requests` porte
`preferred_date`/`preferred_time`/`full_name`. L'erreur était absorbée par
un `console.warn`, la page affichait silencieusement "Aucun rendez-vous".
**Résolu au Lot 4** : la page lit désormais `appointments` (table
canonique, D3), mêmes colonnes que `/dashboard/super-admin/rdv`.

**4. Fusion (Lot 3) ne réassigne pas `contact_demandes` ni `profile_id`.**
`contact_demandes` exclue pour la même raison qu'au point 1 (table morte).
`profile_id` volontairement non réassigné lors d'une fusion : fusionner
deux fiches `clients` ne doit pas fusionner deux comptes d'authentification
distincts — ce serait un chantier différent (fusion d'identité), plus
risqué, non demandé par la feuille de route. Si les deux fiches fusionnées
ont chacune un `profile_id`, les deux comptes restent utilisables tels
quels après la fusion. **À trancher** séparément si ce cas se présente
réellement.

**5. Doublon réel trouvé en vérifiant le Lot 3 : deux fiches `clients` partagent le même téléphone mais sont deux personnes différentes.**
`Francis` et `Charjane`, même numéro (`5813490474`), emails et
`profile_id` distincts — coïncidence de données de test, pas un vrai
doublon. Confirme concrètement la nécessité de la revue humaine avant
fusion (aucune fusion automatique n'a été faite sur ces deux fiches).

**6. `appointments.demande_id` toujours absent (décision confirmée au Lot 4).**
Thierry a tranché explicitement (Lot 4) : garder la corrélation approchée
par `client_id` plutôt qu'ajouter la colonne maintenant. Écart déjà
documenté deux fois (A5, A6 Lot 1) et revu ici sans changement. **À
reconsidérer** si le volume de rendez-vous grandit au point que
l'approximation par client devient trompeuse (plusieurs dossiers actifs
pour un même client).

**7. `rendez_vous` marquée obsolète, pas supprimée (D3, migration 054).**
0 ligne, un seul lecteur trouvé dans tout le code (déjà corrigé, point 3
ci-dessus). Écritures bloquées (policies `INSERT`/`UPDATE` retirées),
lecture conservée, `COMMENT ON TABLE` posé. **Suppression de la table**
possible seulement sur autorisation explicite de Thierry (D3) — non
demandée, non faite ici.

**8. Pièces jointes sur messages/notes reportées (décision confirmée au Lot 5).**
`demande_messages`/`demande_notes` n'ont aucune colonne ni bucket
d'attachement. Thierry a tranché : reporter, 0 message et 0 note réels à
ce jour. Bucket équivalent déjà existant à réutiliser comme modèle
(`demande-documents`, voir `app/api/demandes/[id]/documents/route.ts`).
**À construire** quand un besoin réel se présente, probablement avec P11.

**9. Notification client/staff (messages) reste couplée en dur à Resend.**
La feuille de route demande une "architecture prête pour e-mail, SMS et
WhatsApp via P11, sans dépendance dure à un fournisseur" — le code actuel
(`app/api/demandes/[id]/messages/route.ts`) appelle Resend directement,
sans couche d'abstraction. Non corrigé ici : P11 n'existe pas encore, et
construire une abstraction de canal sans un deuxième fournisseur réel à
brancher serait de la sur-ingénierie. **À faire en P11**, au moment où
SMS/WhatsApp deviennent réels.

**10. Page Notifications (Lot 6) accessible seulement par URL directe, aucun point d'entrée dans l'interface.**
Décision prise pendant la présentation du Lot 6 : ne pas toucher
`DashboardShell.tsx` (gelé) pour ajouter un lien "Voir toutes" dans la
cloche. Les 4 pages (`/dashboard/{client,agent,admin,super-admin}/
notifications`) existent et fonctionnent mais ne sont reliées à rien.
Même situation que le constat A3 #1 (bascule de navigation réelle prévue
sur A3-A7). **À faire** : ajouter le lien dans `NotificationBell.tsx`
(pas dans `DashboardShell.tsx` lui-même) ou une entrée de menu quand la
navigation réelle sera branchée.

**11. Délais moyens et dossiers en retard non construits en Performance CRM (Lot 7).**
Vérifié avant de coder, pas supposé : `demande_status_history` a 0 ligne
réelle (aucune transition de statut n'y a jamais été journalisée, malgré
des changements de statut réels — voir `docs/AUDIT_CRM.md` §4), et
`demandes.deadline` (colonne P3) n'est renseigné sur aucune des 16
demandes réelles, aucune route n'y écrivant. Afficher "0 en retard"
aurait été un faux zéro (§I.6, test 3 — "pas encore mesurable" n'est pas
un zéro). **À construire** quand `deadline` sera réellement saisi lors de
la création/qualification d'un dossier (à decider dans une phase
ultérieure) et/ou quand `demande_status_history` sera réellement
alimenté (P6 candidat, déjà noté en P3 #1).

---

## A7 — RH rhabillé (05/09/2026)

**1. Rhabillage dans le nouveau shell reporté, décision confirmée par Thierry.**
Les 20 pages RH utilisent toutes `DashboardShell.tsx` (gelé). Le nouveau
shell d'A3 (`lib/admin-nav.ts`) n'a jamais quitté sa démo isolée sur
`/dashboard/design-system` — aucune page réelle n'a basculé dessus depuis
A3. Migrer le RH aurait été la première bascule réelle du nouveau shell,
sur 20 fichiers d'un coup. **À faire** dans une phase séparée, dédiée à
la bascule de navigation, quand le nouveau shell aura fait ses preuves.

**2. Délais moyens RH non construits, décision confirmée par Thierry.**
Volumes réels vérifiés avant de coder : 5 employés, 0 congé, 0 fiche de
paie, 0 tâche d'onboarding, 0 évaluation. Aucun processus RH n'a
d'historique réel exploitable — un délai moyen aurait été un chiffre sur
un dénominateur nul (§I.6). **À construire** quand du volume réel
existera sur au moins un de ces processus.

**3. `taches` limitée aux tâches liées à un dossier (`demande_id`), pas de vue "Mes tâches" transverse.**
Portée volontairement minimale : onglet "Tâches" sur la fiche dossier
uniquement. `taches.demande_id` est nullable (une tâche autonome, non
liée à un dossier, est possible dans le schéma) mais aucune UI ne la
crée pour l'instant. **À construire** si un besoin de tâches RH
autonomes (hors dossier) se présente.

**4. Un seul compte staff réel existe (`tkankou@gmail.com`, super_admin) — "Charge de travail" et RLS `taches` non testées sur un vrai agent.**
Confirmé par requête : aucun compte `agent`/`admin` actif n'existe en
base à ce jour (même constat que A3 #2). La nouvelle colonne "Charge de
travail" sur `/dashboard/super-admin/stats-agents` affichera donc 0 pour
tous tant qu'aucun agent réel n'a de dossier assigné. **À vérifier**
quand un premier compte agent réel sera créé.

---

## P6-0 — Convergence des colonnes `payments`, étapes 1 à 4 (05/09/2026)

**1. ~~`PaymentForm.tsx` très probablement cassé depuis le 04/05/2026.~~ Corrigé en étape 4, lot 4.1.**
Le trigger `payments_check_transition` exigeait `client_id`/`dossier_id`
non nuls à l'insertion, incompatible avec `PaymentForm.tsx` (schéma
français, aucun des deux champs). **Résolu** : `client_id`/`dossier_id`
ne sont plus exigés ; `calculate_payment_status()` dérive désormais aussi
`status`/`amount`/`amount_xaf`/`method` depuis les colonnes françaises, à
l'écriture. Non testé par une écriture réelle (règle : jamais de test
d'écriture sur la table la plus sensible sans autorisation explicite) —
vérifié par lecture du trigger et trace d'exécution manuelle, y compris
l'ordre d'exécution des triggers (voir point 6). **À confirmer** par
Thierry en testant une fois le bouton "Nouveau paiement" en conditions
réelles.

**2. ~~Paiement par lien public ne crée jamais de ligne `payments`.~~ Corrigé en étape 4, lot 4.2.**
La colonne `montant` (inexistante) est remplacée par le vrai schéma
français complet (`montant_total`, `montant_recu`, `mode_paiement`,
`client_id`, `demande_id`/`dossier_id` quand connus). Le statut
`"complete"` (également invalide, jamais dans l'enum `payment_status`)
est retiré — dérivé automatiquement par le trigger du lot 4.1.

**3. ~~`app/dashboard/agent/page.tsx` interroge `payments.montant`.~~ Corrigé en étape 4, lot 4.2.**
3 occurrences (paiements du mois, de l'année, leaderboard) toutes
corrigées vers `montant_recu`.

**4. `payments_log_event()` ne connaît pas le nouveau statut `partial`.**
Le `CASE` du trigger qui type l'événement dans `payment_events` ne couvre
que `paid/failed/validated/refunded/voided` ; une transition vers
`partial` tombe dans la branche `ELSE 'note_updated'` — pas incorrect,
mais moins précis. Sans conséquence pratique (`payment_events` reste un
journal d'audit, pas une source de vérité affichée). **À affiner** si le
détail des transitions vers `partial` devient utile un jour.

**5. `client_id`/`dossier_id` restent NULL sur les 3 paiements réels après le backfill (étape 2).**
Assumé délibérément : la feuille de route ne demande `NOT NULL` que sur
`status`/`amount` à cette étape, et ces 3 lignes sont explicitement
grandfathered (`metadata.legacy=true`). **À traiter en étape 4** si un
rattachement rétroactif à un client/dossier réel est possible et utile.

**6. Bug trouvé et corrigé pendant l'écriture du lot 4.1 : ordre d'exécution des triggers Postgres.**
Postgres exécute les triggers `BEFORE` de même type par ordre alphabétique
de leur nom. `payments_transition_check` (préfixe `p`) s'exécutait avant
`trg_payments_calculate_status` (préfixe `t`) — il aurait donc toujours vu
`amount`/`method` vides sur un INSERT et continué de lever une exception,
rendant le lot 4.1 inopérant sans ce correctif. Renommé en
`trg_payments_transition_check` pour s'exécuter après. **Leçon** :
toujours vérifier l'ordre relatif des triggers `BEFORE` sur une même
table avant d'en ajouter ou modifier un.

**7. `payment_method` complété avec `card`, `other`, `express_union` (lots 4.1-4.2).**
L'enum partagé entre `mode_paiement` et `method` n'avait pas de
traduction pour "carte" (autre que `stripe`, trop spécifique au paiement
en ligne), "autre", ni de valeur du tout pour `express_union` (service
mobile local RCA, distinct de `western_union` — voir CLAUDE.md, 6
méthodes officielles). Découvert en préparant la correction du paiement
par lien public.

**8. `dossier_id` et `demande_id` restent deux colonnes distinctes pointant vers `demandes` — redondance non résolue.**
Même constat qu'A5 (DETTE #1). Le lot 4.2 renseigne les deux avec la même
valeur (`paymentLink.demande_id`) plutôt que de trancher laquelle
supprimer — cette consolidation reste un chantier séparé, plus large que
P6-0.

**9. Lot 4.3 : ~15 fichiers migrés vers `status`/`method` (canoniques), `montant_total`/`montant_recu`/`devise` non touchés (décision confirmée).**
`app/api/search/route.ts`, `lib/monthly-report-data.ts`,
`components/dashboard/{MonthlyReportGenerator,PaymentsManager,
PaymentReceipt,FinancialDashboard,PaymentForm,AgentDetailView}.tsx`,
`app/dashboard/{super-admin/stats-agents/[id],super-admin,super-admin/
clients/[id],client,client/demandes/[id],client/paiements}/page.tsx`.
Plusieurs lectures de `statut` se sont révélées **mortes** (sélectionnées
mais jamais affichées) : retirées du `select()` plutôt que renommées,
notamment dans `MonthlyReportGenerator.tsx`, `AgentDetailView.tsx`,
`app/dashboard/super-admin/page.tsx` et la page dossier client. Vérifié
par `grep` exhaustif sur tous les `.from("payments")` du dépôt : aucune
lecture de `statut`/`mode_paiement` ne subsiste (hors tables distinctes —
`demandes`, `expenses`, `transferts`, `appointments`, `payment_links`,
`payslips` ont leurs propres colonnes `statut` homonymes, légitimes,
non touchées).

**10. Doublon de type `Payment` : `app/dashboard/super-admin/clients/[id]/page.tsx` a sa propre interface locale, distincte de `components/dashboard/PaymentForm.tsx`.**
Les deux ont été étendues séparément avec `status` (canonique) — pas
unifiées, pour ne pas élargir le périmètre de P6-0 à une refactorisation
de types. **À unifier** si un troisième point de duplication apparaît.

**11. Étape 5 (test de réconciliation) : le test littéral de la feuille de route ne s'applique plus, corrigé et documenté ici plutôt que silencieusement réinterprété.**
Le test tel qu'écrit compare `sum(amount)` à `sum(montant_total)` —
attendu à 0. Vérifié réel : écart de **-400 000 XAF** sur avril 2026, non
corrigible et non souhaitable : `montant_total` (prix dû) et `amount`
(montant reçu) sont deux notions distinctes depuis la décision de l'étape
4 point 9 ("garder `montant_total` comme colonne légitime"). Un écart
entre les deux est le comportement correct dès qu'un paiement est
partiel. **Test corrigé, celui qui fait réellement foi** :
`sum(amount)` vs `sum(montant_recu)` — écart **0** confirmé.

**12. "Page Caisse" ne partage aucune donnée avec `payments` — la comparer à `payments` était une prémisse erronée du texte de la feuille de route.**
Vérifié en lisant le code : `/dashboard/{agent,super-admin}/caisse`
affiche `quick_sales`, une table distincte (ventes rapides au comptoir),
jamais combinée à `payments` dans `FinancialDashboard.tsx`. P6-0 ne
touche pas `quick_sales` — aucune convergence n'était possible ni
nécessaire ici. Le seul export CSV réel touchant des paiements de dossier
(`AgentStats.tsx`) a été vérifié : coïncide au franc près avec le calcul
SQL brut (400 000 XAF).

**Clôture P6-0 confirmée par Thierry (05/09/2026)** sur la base du test
corrigé (point 11) et de la clarification sur "Caisse" (point 12).
