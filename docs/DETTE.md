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

---

## P6 — Finance (05/09/2026)

**1. Les 8 tables (`devis`, `devis_lignes`, `factures`, `facture_lignes`, `echeanciers`, `categories_compta`, `caisse_sessions`, `commissions`) existent depuis P3, 0 ligne, aucun trigger, aucune UI.**
Confirmé par requête avant de proposer un plan. Ce n'est pas une
extension (comme A6/A7), c'est une construction complète. RLS déjà posée
(1 à 3 policies par table, conforme à la règle P3 "RLS dans la même
migration que la table").

**2. `payments.reference` est généré par un hash aléatoire (`md5(random())`), pas par une séquence Postgres.**
Trouvé en vérifiant le précédent existant avant de construire la
numérotation `DEV-YYYY-NNNNNN`/`FAC-YYYY-NNNNNN` demandée par P6. Ce
n'est pas cassé (unique, fonctionne), mais ce n'est pas non plus le
modèle attendu pour les nouveaux documents. **Non modifié** — hors
périmètre P6 (D1 ne demande pas de renuméroter les paiements existants).
Les nouvelles séquences pour devis/factures/reçus seront construites
proprement, sans lien avec ce précédent.

**3. Lot 1a (D5, migration PDF) : `QuickSalesManager.tsx` migré de jsPDF vers pdf-lib, en réutilisant le patron déjà éprouvé de `payment-links/[reference]/verify/route.ts`. Vérifié visuellement par Thierry — OK.**
`sanitizeForPdf()` extraite en utilitaire partagé, renommé
`lib/pdf-layout.ts` au lot 1b une fois `drawText()`/`drawFilledRect()`
ajoutées (2ᵉ fichier utilisant le même patron).

**4. Lot 1b (D5) : `AgentStats.tsx` migré de jsPDF vers pdf-lib, en réutilisant `lib/pdf-layout.ts`.**
Même structure que le lot 1a (bandeau, en-tête, tableau paginé, pied de
page). **Non vérifié visuellement** — interrompu par la pause Vercel du
site en production (05/09/2026) avant que Thierry ait pu tester ; à
confirmer en cliquant sur "Export PDF" depuis
`/dashboard/super-admin/stats-agents` dès que le site est de nouveau
accessible.

**5. Lot 1c (D5) : `QuickSaleForm.tsx` migré de jsPDF vers pdf-lib (47 appels), le plus complexe des 5 fichiers D5 à cette date.**
Format spécifique (ticket de caisse 80mm × 200mm, coordonnées en
millimètres converties en points via `MM_TO_PT`), alignement centré sur
la quasi-totalité du texte, retour à la ligne manuel (`wrapText`,
équivalent de `splitTextToSize`), trait pointillé (`drawDashedLine`),
et 3 sorties distinctes (téléchargement, impression via fenêtre
`window.open`, email en base64) — contre une seule sortie
(téléchargement) dans les lots 1a/1b. `lib/pdf-layout.ts` étendu en
conséquence (`align: "center"`, `wrapText`, `drawDashedLine`,
`uint8ArrayToBase64`, `MM_TO_PT`), de façon additive — aucune régression
sur les lots 1a/1b déjà écrits. **Non vérifié visuellement** — à
confirmer par Thierry sur les 3 sorties (bouton "Imprimer", bouton
"PDF", bouton "Email") depuis une vente rapide existante
(`/dashboard/{agent,super-admin}/caisse`).

**6. Lot 1d (D5) : `PaymentReceipt.tsx` migré de jsPDF vers pdf-lib (93 appels) — reçu envoyé à de vrais clients.**
pdf-lib n'a pas d'équivalent natif à `roundedRect` de jsPDF (utilisé 2
fois : encadré date/statut, bloc montants avec bordure). **Décision
Thierry : coins carrés**, plutôt qu'un chemin SVG non testable
visuellement avant validation — écart visuel mineur assumé (rayon
d'origine 2-3mm). Couleurs historiques `#0C1C40`/`#FF6600` conservées
telles quelles (écart connu documenté dans CLAUDE.md, non touché).
`lib/pdf-layout.ts` étendu : `drawLine()` (variante pleine de
`drawDashedLine`), bordure optionnelle sur `drawFilledRect()`, et
`mm()` promu en export partagé (retiré de `QuickSaleForm.tsx`, qui le
définissait localement au lot 1c — 3ᵉ fichier à en avoir besoin après
`PaymentReceipt.tsx`, `MonthlyReportGenerator.tsx` probablement aussi).
1 fichier reste à migrer (`MonthlyReportGenerator.tsx` — 233 appels,
le plus gros des 5). **Non vérifié visuellement** — à confirmer par
Thierry sur les 3 sorties (bouton "Reçu PDF", "Imprimer", "Envoyer par
email") depuis un paiement existant, avec attention particulière car ce
document part chez de vrais clients.

**7. Lot 1e (D5) : `MonthlyReportGenerator.tsx` migré de jsPDF vers pdf-lib (233 appels, 5 pages) — dernier fichier D5, migration terminée.**
`sanitizeForPdf` étendue (`—`/`–`, `•`, `⚠`, `✓`, `·` → équivalents
ASCII) : ces symboles n'étaient couverts par aucune règle existante et
tombaient dans le filtre final `[^\x20-\x7E]` → `"?"`. **Corrige aussi
rétroactivement** les références vides (`"—"`) des lots 1c
(`QuickSaleForm.tsx`) et 1d (`PaymentReceipt.tsx`), qui affichaient
`?` au lieu du tiret — trouvé en écrivant ce lot, avant toute
vérification visuelle des lots précédents. **Bug pré-existant porté
tel quel** (décision Thierry, pas de correction demandée) : sur la
page 5 (créances), si le tableau déborde sur une page supplémentaire,
`pageNum` n'est jamais incrémenté et `totalPages` reste figé à 5 —
l'en-tête afficherait deux fois "Page 5/5" au lieu de "Page 5/5" puis
"Page 6/5". Coins carrés sur les 2 blocs arrondis (cohérent avec la
décision du lot 1d). **`jspdf` n'est plus importé nulle part dans le
code** (les 5 fichiers D5 sont migrés) — la dépendance `jspdf` dans
`package.json` pourrait être retirée, **non fait** (hors du plan
présenté pour ce lot, à valider explicitement par Thierry). **Non
vérifié visuellement** — à confirmer par Thierry sur les 3 sorties et
les 5 pages depuis `/dashboard/super-admin/rapports`.

**8. Numérotation par séquence Postgres — `devis`, `factures`, `payments` (migration 059).**
`devis`/`factures` (créées en P3, 0 ligne) n'avaient aucun générateur de
référence : ajouté (`DEV-`/`FAC-YYYY-NNNNNN`), même patron que
`appointments`/`payment_links` déjà en place. **Décision Thierry
(06/09/2026)** : "reçu" (`REC-YYYY-NNNNNN`) = le préfixe de
`payments.reference` pour les **nouveaux** paiements, remplaçant le
préfixe `PAY-` + suffixe aléatoire (`md5(random())`) — un reçu étant
concrètement le PDF généré depuis une ligne `payments`
(`PaymentReceipt.tsx`). Les 3 paiements réels existants gardent leur
référence `PAY-` actuelle, non renumérotée (`COMMENT ON COLUMN`
documentant l'écart). Vérifié par insertions de test dans une
transaction annulée (`ROLLBACK`) : `devis`/`factures`/`payments`
toujours à 0/0/3 lignes après coup — aucune donnée réelle touchée. Les
séquences ont avancé de quelques valeurs à cause de ces tests
(`devis_ref_seq`=5, `factures_ref_seq`=4, `payments_ref_seq`=4) : sans
conséquence, un trou dans une séquence est normal et attendu (c'est
tout l'intérêt d'une vraie séquence par rapport à `count(*)+1`).
`jspdf` n'est plus importé nulle part dans le code depuis le lot 1e —
la dépendance a été retirée de `package.json` sur demande explicite de
Thierry (06/09/2026), `npm uninstall jspdf` (23 paquets retirés). Pas de CRUD devis/factures
construit à ce stade (lots suivants de P6), pas de câblage
`audit_log` (s'applique aux futures actions de création/édition, pas
à l'infrastructure de numérotation).

**9. Lot Devis (06/09/2026) : CRUD, cycle de vie, PDF — `devis.validate` toujours non branché.**
Migration 060 : `devis.create`/`devis.send` ajoutées à `role_permissions`
pour `agent`/`chef_service`/`admin`/`dg`/`daf` (absentes de l'extrait §P2,
comme `devis.validate` l'était avant la 043b). Toutes les transitions de
statut (`brouillon → envoye → accepte/refuse/expire`) passent par
`devis.send` — `devis.validate` (seedée en 043b pour `admin`/`dg`/`daf`)
reste non branchée : `devis.status` n'a pas d'état "validé" distinct dans
le schéma (migration 045), il n'y a donc pas de transition à y accrocher.
**À trancher** si un jour un contrôle interne avant envoi (ex. montant
au-delà d'un seuil) doit gater l'envoi séparément de la création —
ajouterait un état ou une vérification supplémentaire, hors périmètre de
ce lot. Un agent ne peut créer/modifier un devis que sur ses propres
dossiers (vérifié via `demandes.agent_id`, pas de portée dédiée dans la
permission). PDF généré côté serveur (`pdf-lib`, patron de
`payment-links/[reference]/verify/route.ts`) : **vérifié visuellement par
Thierry le 06/09/2026 — OK**. Pas de
portail client sur les devis en V3 (P9 non fait) : `accepte`/`refuse`
sont enregistrés par le staff qui rapporte la décision transmise par le
client hors plateforme (téléphone, email), pas une acceptation en ligne.

**10. Lot Factures (06/09/2026) : CRUD, cycle de vie, PDF, pont depuis un devis accepté — `payee` toujours manuelle.**
Migration 061 : `facture.create` (agent/chef_service/comptable/admin/dg/
daf) et `facture.cancel` (admin/daf) ajoutées à `role_permissions` —
`facture.validate` (admin/daf) était déjà seedée en 043b. Séparation des
tâches : `facture.create` couvre la saisie du brouillon, `facture.validate`
gère `brouillon → validée` **et** `validée → payée`, `facture.cancel` gère
`→ annulée` (accessible depuis `brouillon`/`validée`, jamais depuis
`payée`). La transition `→ payée` est **manuelle** dans ce lot : aucun
rapprochement automatique avec `payments` — une facture peut donc être
marquée payée sans qu'une ligne `payments` correspondante existe. **À
corriger** quand les échéanciers/le rapprochement (reste de P6) seront
construits : soit dériver `payee` d'un paiement réel enregistré, soit au
minimum l'exiger comme précondition. Génération de facture depuis un devis
`accepte` : copie des lignes au moment de la génération (pas de lien vivant
— une modification ultérieure du devis ne se répercute pas sur la facture
déjà créée, comportement voulu pour une facture qui doit rester stable une
fois émise). Email client uniquement à la validation (`validee`), pas à la
création du brouillon, même logique que `devis.send` pour les devis (voir
entrée 9). PDF **vérifié visuellement par Thierry le 06/09/2026 — OK**.

**11. Lot Caisse — sessions (06/09/2026) : ouverture/clôture, solde théorique dérivé de `quick_sales`, aucune permission à seeder.**
Premier lot de P6 qui n'a nécessité aucune migration : `caisse.write`
(agent/admin) et `caisse.close` (daf uniquement, super_admin court-circuite
toujours) étaient déjà seedées en 043b, exactement conformes à la matrice
officielle §P2 (`caisse.close` : super_admin + daf, personne d'autre — pas
même `admin`). Conséquence assumée : un agent qui ouvre sa session ne peut
pas la clôturer lui-même tant qu'aucun compte `daf` réel n'existe (seul
`tkankou@gmail.com`, super_admin, le peut aujourd'hui) — même situation que
A7 #4 (un seul compte staff réel). Solde théorique = fonds initial +
`quick_sales.montant_total` où `mode_paiement = 'especes'` depuis
l'ouverture, **même source que la page Caisse existante** qui n'affiche que
`quick_sales` (voir P6-0 #12) — aucune donnée `payments` mélangée,
volontairement, pour ne pas contredire cette décision déjà actée. Écart
(`discrepancy`) calculé et stocké à la clôture, jamais recalculé après
coup. Pas de rapprochement avec `payments` (paiements par carte/mobile
money/virement enregistrés en espèces resteraient hors du calcul) : **à
étendre** si un jour la caisse doit couvrir plus que les ventes rapides.
Aucun PDF pour ce lot (contrairement à devis/factures) : une clôture de
session est un contrôle interne, pas un document client — décision
proportionnée, à revoir si un besoin d'export/impression apparaît.

**12. Lot Catégories comptables + Commissions (06/09/2026) : saisie manuelle confirmée par Thierry, aucune formule automatique.**
Migration 062 : `commission.read`/`commission.validate` (dans l'énumération
§P2 mais jamais seedées — 0 ligne avant cette migration) complétées pour
`admin`/`dg`/`daf`/`comptable` (lecture) et `admin`/`dg`/`daf` (validation).
`commission.create` **n'existe pas** dans l'énumération officielle
(seulement read/validate) : ajoutée par nécessité pour `admin`/`daf`, même
traitement que `devis.create`/`facture.create` avant elle. **Décision
confirmée par Thierry (06/09/2026)** : pas de calcul automatique par
pourcentage — le schéma ne porte aucun taux configurable par agent ou
service, un admin/daf saisit manuellement montant et taux (`rate`, simple
champ informatif, non recalculé). Cycle de vie `calculee → validee →
payee`, permission unique `commission.validate` pour les deux transitions
(même logique que `facture.validate`, voir entrée 10). `categorie_compta.
write` **non plus dans l'énumération officielle** : traité comme un
paramétrage proche d'`agency_settings`, réservé `admin` (migration 062).
Catégories jamais supprimées (seulement actif/inactif) — une catégorie
pourrait déjà être référencée ailleurs un jour (aucune table ne la
référence encore, cette lot ne branche `categories_compta` à aucune autre
table : c'est une liste de référence seule, prête pour un futur
rapprochement dépenses/revenus). Aucun PDF (même raisonnement que les
sessions caisse, entrée 11).

**13. Lot Échéanciers (06/09/2026) : planification sur facture validée/payée, reste dû dérivé, aucune migration.**
`echeancier.*` **n'existe pas** dans l'énumération officielle §P2 : traité
comme un sous-objet de `facture` (même statut que `facture_lignes`, qui n'a
pas non plus de permission propre). Création d'une échéance gérée par
`facture.create` (mêmes acteurs que la facture parente) ; marquage "payée"
par `paiement.record` (admin/comptable/daf) — un agent peut planifier une
échéance sur son dossier mais pas la marquer payée lui-même, séparation des
tâches cohérente avec le reste de P6. Aucune migration necessaire (2ᵉ lot
de P6 dans ce cas, après Sessions caisse) : les deux permissions
réutilisées étaient déjà seedées pour les bons rôles. Le total des
échéances d'une facture est plafonné à son montant (calcul du "reste à
échéancer", vérifié côté serveur à la création). `en_retard` recalculé en
écriture différée à chaque lecture de la liste (comparaison `due_date` vs
date du jour), pas par un cron — suffisant tant que l'affichage passe par
cette route, **à revoir** si un jour un job planifié doit lire ce statut
sans passer par l'API (rapports automatisés, notifications d'échéance
proche). Pas de lien automatique avec `payments` : marquer une échéance
payée n'enregistre aucune ligne `payments` correspondante (même limite que
la transition `payee` des factures, entrée 10) — **à unifier** si un jour
le rapprochement complet (dernière tranche de P6) relie les trois.

**14. Lot Rapprochement + exports CSV (06/09/2026) : découverte structurelle — `factures` n'a aucune colonne ni FK vers `payments`.**
Vérifié avant de construire la page `/dashboard/super-admin/rapprochement` :
`factures` porte `devis_id`, `demande_id`, `client_record_id` — rien vers
`payments`. Contrairement à `echeanciers.facture_id` (vraie FK, exploitée
ici), un rapprochement facture ↔ paiement encaissé n'est **pas mesurable**
aujourd'hui — §I.6 règle 3 appliquée : affiché comme une limite explicite
dans l'interface, jamais comme un zéro silencieux. Le rapprochement livré
compare ce qui est mécaniquement vérifiable : factures payées vs total de
leurs échéances payées (anomalie si incomplet), écarts de sessions de
caisse clôturées, commissions dues vs payées par agent. **À étendre** si un
jour `payments.demande_id`/`dossier_id` (déjà repérés non fiables sur les
paiements réels, voir A5 DETTE #1) sont fiabilisés au point de permettre un
vrai lien facture ↔ paiement.

Export CSV ajouté aux 5 managers P6 (`Devis`, `Factures`, `Commissions`,
`Echeanciers`, `CaisseSessions`) via `lib/csv-export.ts`, nouveau et non
partagé avec l'export CSV déjà existant d'`AgentStats.tsx` (même patron
BOM+guillemets, dupliqué volontairement pour ne pas toucher un fichier qui
marche — CLAUDE.md). Exports basés sur la liste déjà chargée et filtrée à
l'écran : aucune route serveur supplémentaire, aucune permission nouvelle.

**Rapports journaliers et annuels non construits.** Le texte de P6 demande
"rapports journaliers, mensuels, annuels" — seul le mensuel existe
(`MonthlyReportGenerator.tsx` + cron, antérieur à V3). `lib/monthly-report-
data.ts` est structurellement couplé au mois (`monthBoundsFor`,
`aggregateMonth`) : un rapport journalier/annuel demanderait de généraliser
l'agrégateur à une plage de dates arbitraire, plus l'UI et la mise en page
PDF associées — un chantier à part entière, pas une extension mineure de ce
lot. **Non fait**, à confirmer avec Thierry avant de l'entreprendre.

---

## P8 — CMS et contenus (06/09/2026)

**1. Inventaire réel des pages `/services/*` : 12, pas 7 comme l'affirmait la feuille de route.**
Vérifié avant toute migration (`ls app/services/`) : administratif,
assurance, billets, bourses, change, digitalisation, etudes, financement,
nexus-ia, tcf, transfert, visa. Le chiffre "7" du corps de phase P10/E3
était obsolète. Table de correspondance slug → pôle officiel présentée et
confirmée par Thierry (06/09/2026) :
- `etudes` et `bourses` restent deux services distincts malgré le
  chevauchement thématique ("Études au Canada" dans les deux) — même pôle
  Études internationales, aucune fusion, aucune redirection.
- `billets` → Assurance et voyage ; `change`/`transfert` → Réseau
  international.
- `nexus-ia` → catégorie `transverse`, hors des 8 pôles officiels (page
  transverse, pas un pôle métier).
- Pôle **Accompagnement business** volontairement sans service à ce jour :
  aucune des 12 pages réelles n'y correspond. Pas de ligne inventée pour
  combler — à peupler quand une offre réelle existera pour ce pôle.

**2. `lib/services.ts` (liste statique, consommée par le fallback `/services/[slug]` et probablement la grille d'accueil) omet `assurance` et `etudes` — 10 entrées sur 12 pages réelles.**
Découvert pendant l'inventaire. Non corrigé dans ce lot : `lib/services.ts`
reste la source lue par le public en attendant que P10 branche les pages
publiques sur la table `services` (déjà peuplée, cette phase). **À faire
en P10** : remplacer `lib/services.ts` par une lecture de `services`,
supprimant du même coup cet écart.

**3. Écart d'URLs entre CLAUDE.md et les routes réelles, découvert et non corrigé (hors périmètre P8).**
CLAUDE.md liste `/services/incubateur`, `/services/billet-avion-hotel` et
`/nexus-ia` comme titres officiels frozen — les routes réelles sont
`/services/financement`, `/services/billets` et `/services/nexus-ia`. Les
*titres* correspondent exactement (vérifié texte à l'écran), seules les
*URLs* de CLAUDE.md sont fausses. **À corriger dans CLAUDE.md** (simple
mise à jour de documentation, aucune redirection nécessaire puisque les
URLs réelles n'ont pas changé) — signalé, non fait ici pour rester dans le
périmètre de la migration de données.

**4. `is_verified`/`is_published` ajoutées à `agency_settings`, `temoignages`, `partenaires` (migration 063) — les trois tables étaient à 0 ligne, aucun backfill à risque.**
Vérifié avant migration : aucun consommateur public ne lit encore ces
tables (témoignages/partenaires affichés sur la page d'accueil sont
actuellement en dur dans les composants — le branchement au CMS est P10).
`temoignages.verifie`/`temoignages.status` et la policy publique d'origine
conservés en commentaire "legacy", remplacés par `is_verified`/
`is_published` comme seule source de vérité pour l'affichage public
(nouvelle policy). `partenaires` n'avait aucune notion de vérification
avant P8 — toute donnée future y passera par le nouveau mécanisme dès la
création (`is_verified`/`is_published` à `false` par défaut).

**5. Trigger de réinitialisation de `is_verified` écrit par table (3 fonctions dédiées), pas un mécanisme générique.**
Choix délibéré : une fonction générique aurait dû introspecter les colonnes
pertinentes dynamiquement (fragile, moins lisible). Chaque trigger
(`reset_agency_settings_verification`, `reset_temoignage_verification`,
`reset_partenaire_verification`) liste explicitement les colonnes dont la
modification déclenche la réinitialisation, à l'exclusion de
`is_verified`/`is_published`/`status` eux-mêmes (éviter qu'un simple
changement de statut ne déclenche une boucle ou une réinitialisation
non désirée).

**6. `services` peuplée (12 lignes réelles) mais `documents_requis`, `dossier_etapes`, `pays_destinations`, `bureaux`, `faq`, `partenaires`, `temoignages`, `contenus_site`, `agency_settings` restent à 0 ligne et sans écran d'administration.**
Ce lot construit uniquement l'écran "Services et tarifs" (le plus
explicitement demandé, et celui qui débloque le rattachement CRM/filtrage
mentionné par P8). **À construire** dans des lots suivants, un par un
(même découpage que P6) : FAQ, Partenaires, Témoignages, Pays &
destinations, Bureaux, Informations institutionnelles (`agency_settings`
avec le mécanisme `is_verified`/`is_published`), Contenus de page
(`contenus_site`, textes et CTA).

**7. `cms.service.write`/`cms.faq.write`/`cms.partenaire.write` seedées ensemble (migration 064) avant que les 3 écrans correspondants n'existent tous.**
Seule `cms.service.write` est utilisée par ce lot. Même pratique que 043b
(P2) : anticiper le seed plutôt que fragmenter les migrations de
permissions phase par phase. `cms.content.write` (déjà seedée en 043b)
reste pour `contenus_site`, non touchée.

**8. Délai indicatif (`delai_indicatif`) laissé `NULL` sur les 12 services créés.**
Aucune valeur consolidée et vérifiée n'existe aujourd'hui par service —
les pages publiques mentionnent des délais ponctuels dans leur copy
marketing (ex. "e-visa 48-72h selon destination"), pas une valeur unique
fiable par service. Inventer une valeur aurait violé la règle du chiffre
honnête (§I.6). Le champ est éditable dans le nouvel écran "Services et
tarifs" — à renseigner par Thierry quand une valeur fiable existera.

**9. Changement d'adresse Nexus RCA (06/09/2026) : "Relais Sica, vers Hôpital Général" → "Croisement Marabena, Route de l'Aéroport, PO.BOX 1204", 21 fichiers corrigés.**
Adresse fournie directement par Thierry. `grep -r "Relais Sica"` a trouvé
21 fichiers : source unique `lib/contact.ts` (corrigée en premier), plus
20 duplications en dur — CLAUDE.md, README, 5 templates email (`app/api/
{contact,payments/send-receipt,appointments/send-confirmation}/route.ts`,
`lib/rh/payslip-email.ts`), 5 générateurs PDF (`app/api/{devis,factures}/
[id]/pdf/route.ts`, `app/api/payment-links/[reference]/verify/route.ts`,
`components/dashboard/PaymentReceipt.tsx`, `lib/rh/{payslip-pdf,contract-
pdf}.ts` — dont la clause légale "Siège social" du contrat de travail),
`lib/whatsapp-templates.ts`, `components/{home/WhyTrust,auth/AuthLayout,
NexusAIChat,payment/PaymentPageClient}.tsx`, `app/dashboard/super-admin/
parametres/page.tsx` (valeurs par défaut d'un écran non branché à
`agency_settings`), `messages/{fr,en}.json`. Chaque fichier gardait son
propre format (avec/sans accents pour les PDF ASCII-safe, texte complet ou
raccourci selon le contexte) — pas de mécanisme central pour ces 20
duplications, corrigées une par une. **À corriger structurellement** :
brancher ces 20 endroits sur `lib/contact.ts` (ou `agency_settings` une
fois P8 terminé) pour qu'un futur changement d'adresse ne redemande pas
cette même chasse.

Une ligne réelle ajoutée à `bureaux` (migration 065, 0 ligne avant) avec
la nouvelle adresse complète — première donnée réelle de cette table,
prête pour l'écran d'administration Bureaux à venir.

**10. Écart CLAUDE.md non corrigé : URLs `/services/incubateur`/`/services/billet-avion-hotel`/`/nexus-ia` sont fausses (voir aussi P8 #3) — signalé une seconde fois car pertinent au changement d'adresse dans le même fichier.**

**11. Lot Témoignages + Partenaires (06/09/2026) : workflow vérifier → publier, aucune permission dédiée pour les témoignages.**
`temoignage.*` n'existe pas dans l'énumération §P2 (contrairement à
`partenaire`, couvert par `cms.partenaire.write`) : traité comme du
contenu générique, gated par `cms.content.write` (déjà seedée admin/
moderateur en 043b, aucune migration nécessaire pour ce lot). Règle
appliquée strictement côté serveur (`PATCH .../[id]`, pas seulement dans
l'interface) : impossible de passer `is_published=true` si `is_verified`
n'est pas déjà `true` (ou passé `true` dans la même requête) — sans ce
garde-fou serveur, l'ordre "vérifier avant de publier" ne serait qu'une
convention d'interface, contournable par un appel direct à l'API.
Suppression autorisée sur les deux tables (aucune autre table ne
référence `temoignages.id`/`partenaires.id`). `logo_url`/`site_url` de
`partenaires` acceptent une URL en texte libre, saisie par l'admin — pas
de téléversement de fichier ni de suivi de provenance/droits d'usage
(section "Médias" du texte P8) dans ce lot : hors périmètre, à construire
séparément si un vrai flux d'upload de logos devient nécessaire.

**12. Upload de logo partenaires (06/09/2026, demande explicite de Thierry) : bucket dédié, pas de suivi de provenance/droits.**
Migration 066 : bucket `partenaires-logos` (public — logos affichés sur le
site public, pas de donnée privée — 2 Mo max, PNG/JPEG/WebP/SVG),
écriture réservée `admin`/`super_admin` via policy storage. Route `/api/
partenaires/[id]/logo` (POST upload, DELETE suppression) — nécessite un
partenaire déjà créé (pas d'upload à la volée pendant la création, le
formulaire de création n'a pas encore d'`id` à ce moment). L'ancien
fichier est supprimé du bucket après confirmation du nouveau (remplacement
propre, pas d'accumulation). Écrire dans `logo_url` déclenche le trigger
de réinitialisation de `is_verified` (migration 063) comme toute autre
modification — un nouveau logo doit être revérifié avant republication.
**Toujours pas de suivi de provenance/preuve de droits d'usage** (section
"Médias" du texte P8) : l'admin est seul responsable de vérifier qu'il a
le droit d'utiliser le logo qu'il téléverse — aucun contrôle technique ne
l'impose. À construire séparément si ce contrôle devient nécessaire.

**13. Lots Pays & destinations + Bureaux (06/09/2026) : ni l'un ni l'autre n'a de permission dédiée dans l'énumération §P2 — gérés par cms.content.write, aucune migration nécessaire.**
Même traitement que les témoignages (entrée 11) : `pays_destinations` et
`bureaux` ne sont pas dans la liste officielle des ressources CMS
(`cms.service.write`/`cms.content.write`/`cms.faq.write`/
`cms.partenaire.write`), traités comme du contenu générique. Pas de
mécanisme `is_verified`/`is_published` sur ces deux tables (contrairement
à `agency_settings`/`temoignages`/`partenaires`, migration 063) : le texte
P8 ne les cite pas explicitement dans la liste "témoignages et
partenaires" qui justifie ce mécanisme — simple `status` actif/inactif,
suffisant pour une liste de pays ou une fiche bureau (pas de risque de
"faux partenaire"/"faux témoignage" ici). Suppression autorisée sur les
deux tables (aucune autre table ne référence leurs id). Le bureau de
Bangui inséré en migration 065 apparaît directement dans le nouvel écran
Bureaux, aucune donnée supplémentaire à saisir.

**14. Lot Informations institutionnelles (06/09/2026) : `agency_settings` réservée super_admin, aucune ligne pré-remplie, aucune migration nécessaire.**
Écran `/dashboard/super-admin/informations-institutionnelles` réservé
`super_admin` uniquement (`requireProfile(["super_admin"])`) — cohérent
avec la RLS déjà en place depuis P3 ("Super admin manages
agency_settings", migration 046) : même `admin` ne peut qu'y lire, jamais
y écrire. `agency_settings.valeur` (jsonb) structurée en `{ label, texte }`
— un enregistrement = un champ institutionnel, avec `is_verified`/
`is_published` (déjà ajoutées en migration 063). Workflow identique aux
témoignages/partenaires : créer en brouillon → vérifier → publier,
publication bloquée côté serveur sans vérification préalable. **0 ligne
créée par ce lot** (vérifié après coup) : la liste des 11 champs suggérés
par le texte P10/E8 (dénomination juridique, RCCM, mentions légales...)
n'est qu'une aide d'interface (`datalist` HTML + bandeau informatif),
**aucune valeur inventée** — Thierry doit lui-même créer et renseigner
chaque champ réel, la règle "aucune donnée de remplissage" (§I.2 #5)
s'applique aussi à des faits juridiques que je n'ai aucune source fiable
pour deviner (numéro RCCM, numéro fiscal, etc.). `cle` généré
automatiquement par slugification du libellé à la création (ex.
"Numéro RCCM" → `numero_rccm`), non modifiable ensuite pour ne pas casser
un futur lien de lecture publique par clé (P10).

**15. Lot Contenus de page (06/09/2026) : dernier lot de P8, pas de workflow vérifier→publier, aucune migration.**
`contenus_site.contenu` (jsonb) structuré en `{ texte }` — un
enregistrement = un bloc de texte, regroupé par `section` (une page ou une
zone du site public = une section, plusieurs blocs). Contrairement aux
témoignages/partenaires/informations institutionnelles, **pas** de
mécanisme `is_verified`/`is_published` ici : le texte P8 ne le demande pas
pour cette table (seuls "témoignages et partenaires" sont cités
explicitement, et "chaque champ institutionnel" désigne `agency_settings`).
Un texte de page est un choix éditorial, pas une affirmation vérifiable
comme un numéro RCCM ou un témoignage client — `cms.content.write`
(admin/modérateur) suffit, cohérent avec la permission déjà utilisée pour
cette table dans l'énumération §P2. `cle` non modifiable après création
(même raison que `agency_settings`, entrée 14) : une future page publique
qui lit par clé ne doit pas se retrouver avec une clé qui a changé sous
elle. **0 ligne créée** — écran livré vide, aucun texte du site public
copié ou deviné dans ce lot (les pages publiques restent alimentées par
leur code React tel quel jusqu'à ce que P10 les branche sur cette table).

**P8 — CMS et contenus : tous les lots prévus par le texte de la phase sont livrés** (Services et tarifs, FAQ, Témoignages, Partenaires, Pays & destinations, Bureaux, Informations institutionnelles, Contenus de page). Le branchement des pages publiques sur ces tables (remplacer le contenu en dur par une lecture `services`/`contenus_site`/etc.) reste le travail de P10, pas de P8 — P8 construit l'administration, P10 consomme.

---

## P10 — Site public (06/09/2026)

**1. Lot 1 (couleur + CTA) : trois décisions tranchées par Thierry avant tout code.**
Présentation obligatoire faite avant d'écrire une ligne (règle du §P10),
deux écarts réels découverts par rapport à la maquette/au texte de la
feuille de route :
- A1 avait livré la *structure* des tokens sémantiques (`--brand`, etc.)
  mais jamais changé leur *valeur* pour le site public — `--brand` restait
  littéralement l'orange (`249 115 22`), pas l'or que D8/la maquette
  demandent. **Confirmé par Thierry** : passage à l'or.
- La maquette elle-même utilise deux libellés de CTA différents ("Présenter
  mon projet" au hero, "Soumettre une demande" à la navbar), et 6 libellés
  distincts existaient déjà en usage réel sur les 12 pages `/services/*`
  (voir grep `hero_cta_primary` dans les namespaces i18n). **Confirmé par
  Thierry** : harmonisation sur "Soumettre une demande" partout (texte
  officiel de la feuille de route, pas celui de la maquette).
- Droits d'usage des 2 photos réelles (`public/team/*.jpg`) : **confirmés
  obtenus par Thierry** — utilisables pour E4/E8 dans un lot futur.
- Pas de maquette mobile fournie : Thierry a validé que je dérive la
  version responsive moi-même à partir de la maquette desktop + des règles
  E5/E6 déjà écrites, à montrer avant intégration finale (pas fait dans ce
  lot, qui ne touche que la navbar/hero/footer partagés).

**2. Or mesuré : `#C9A227` (clair) / `#D4AF37` (sombre), contraste texte bleu nuit sur bouton or = 8,25:1 (AA large marge).**
Calcul WCAG fait avant d'écrire le CSS (formule de luminance relative,
plusieurs candidats testés). Confirmé aussi : l'or en texte sur fond blanc/
ivoire tombe à 2,1-2,4:1, sous le seuil AA — **jamais utilisé ainsi**,
conforme à la règle déjà écrite dans la feuille de route ("l'or est une
couleur d'accent, jamais une couleur de petit texte"). Nouveau token
`--on-brand` ajouté (constant, toujours bleu nuit `#02071F`, ne s'inverse
pas avec le thème clair/sombre contrairement à `ink`) — ce token était
prévu dans le texte original d'A1 (`--on-accent`) mais n'avait jamais été
implémenté ; comblé ici sous le nom `on-brand` pour cohérence avec la
famille `brand`/`brand-hover`/`brand-subtle` déjà en place.

**3. Portée réelle du lot : Navbar, PublicHero, Footer (fond navy partout, donc l'or est sûr partout) — 41 occurrences d'orange requalifiées une par une, aucun remplacement global.**
Chaque occurrence a été regardée individuellement (pas de `sed`) : les
textes/liens posés sur fond **blanc** (dropdown des services dans la
navbar, 3 endroits) ont été requalifiés vers un ton **bleu nuit**, pas
l'or, parce que l'or en texte sur blanc échoue le contraste AA (point 2).
Tout ce qui est posé sur fond **navy** (hero, footer, panneau mobile,
badges, glows décoratifs) est passé à `bg-brand`/`text-brand`/`text-on-
brand`. Un hover de bouton icône (menu mobile, sur fond blanc en mode
"scrolled") a été laissé en bleu nuit plutôt qu'en or pour la même raison
de contraste, avec son ombre associée neutralisée.

**4. CTA harmonisés au-delà de la portée initialement annoncée : nexus-connect, rendez-vous, NexusAIChat, namespace `About`.**
En vérifiant le rendu réel, j'ai trouvé 5 autres endroits avec l'ancien
libellé "Ouvrir un dossier" (texte en dur ou clé i18n `About.cta_primary`)
non prévus dans la présentation initiale (qui ne visait que
Navbar/Hero/Footer). Corrigés pour ne pas laisser une harmonisation à
moitié faite — **texte uniquement**, aucune couleur touchée dans ces
fichiers (hors périmètre couleur de ce lot). `DashboardShell.tsx` conserve
son "Ouvrir un dossier (formulaire complet)" dans la palette de commandes
(⌘K) : c'est une entrée d'outillage admin, pas le CTA public visé par la
règle E2, et le fichier est gelé (CLAUDE.md).

**5. Vérification visuelle incomplète — limite d'outillage, pas un doute sur le code.**
`chromium-cli`/Playwright non installés dans cet environnement. Tentative
de vérification par `curl` sur le serveur de dev : le HTML récupéré ne
contenait aucune balise `<nav>` ni `<svg>` malgré un code 200 et du texte
français réel — signe d'une particularité de sérialisation RSC/App Router
avec une requête `curl` brute (pas reproduite avec un vrai navigateur),
non résolue dans le temps imparti. **`npm run build` (production) a
réussi** (exit 0) séparément, ce qui valide la syntaxe et la génération
statique. **À faire par Thierry avant tout lot P10 suivant** : ouvrir la
preview dans un vrai navigateur et confirmer visuellement que l'or
s'affiche comme attendu sur la navbar, le hero et le footer, desktop et
mobile.

**Incident pendant l'exécution : corruption `.next` par exécution concurrente de `build` et `dev`.**
J'ai lancé `npm run build` et `npm run dev` en parallèle sur le même
dossier `.next`, provoquant une erreur "Cannot find module './7285.js'"
(module webpack introuvable) sur le serveur de dev. Non lié au code changé
— artefact de deux process Next.js écrivant le même répertoire de build en
même temps. Résolu en arrêtant et relançant `next dev` seul. **Leçon** :
ne jamais lancer `build` et `dev` simultanément sur le même dépôt.

**6. Lot 2 : grille des 8 piliers (`ServicesGrid.tsx`) branchée sur `services` pour le contenu, mise en page/icônes/tons/tags restent en dur — décision confirmée par Thierry.**
`ServicesGrid.tsx` est un bento-layout bespoke (1 carte héros + 2
verticales + 2 horizontales + 3 simples), pas une simple liste : icône,
couleur de ton (8 tons distincts, "anti-uniformité" voulue), tags et
position bento sont des choix de design absents du schéma `services`
(nom, catégorie, description, tarif, délai, statut, ordre). Décision :
titre/description/lien dynamiques pour les 6 piliers qui ont une ligne
réelle (`visa`, `digitalisation`, `financement`, `etudes`, `assurance`,
`administratif` — requête par `slug`, pas par `categorie`, pour éviter
tout problème de correspondance de chaîne accentuée), reste (icône, ton,
tags, position) figé dans le composant.

**Deux piliers restent en dur, sans ligne `services` correspondante :**
"Accompagnement business" (le pôle officiel est vide, aucune page réelle
ne lui correspond, voir P8 DETTE #1) et "Réseau international" (décrit la
présence de bureaux Bangui/Europe/Canada, un sujet différent des services
réels `change`/`transfert` que P8 a rattachés à ce pôle). **Ni l'un ni
l'autre n'est un "faux contenu"** — ce sont des affirmations déjà
existantes avant ce lot, non vérifiées ni remises en cause ici. **À
trancher dans un lot séparé** : soit créer un vrai service "Accompagnement
business", soit remplacer la carte "Réseau international" par les
services `change`/`transfert` réels, soit assumer ces deux cartes comme
du contenu institutionnel distinct des piliers-services.

Couleurs de `ServicesGrid.tsx` (8 tons, dont un `orange` explicite pour la
carte Visa) **non touchées** dans ce lot — hors périmètre du lot 2
(contenu, pas couleur) et probablement incompatible avec la règle "une
seule action or par écran" si les 8 tons devenaient tous dorés — à statuer
séparément si une recoloration de cette grille est un jour demandée.

**7. Rejet et mise de côté de la suite du chantier homepage (07/09/2026) — voir `NEXUS_RCA_P10_NON_CONFORMITE.md` à la racine.**
Après le lot 2 ci-dessus, une session suivante a poursuivi P10 (nouvelle
navbar, hero 2 colonnes, TrustBar, pages Ressources, globe illustré) sans
qu'un GO explicite n'ait été redonné pour cette suite précise. Thierry a
rejeté le résultat le 07/09 : couleurs trop saturées (jaune vif, bleu roi)
au lieu de l'or patiné/bleu nuit sourd attendu, visuel de couverture
(globe illustré) catégoriquement refusé, police du titre non conforme,
CTA "Présenter mon projet" en couverture alors que la décision E2 fixe
"Soumettre une demande" partout.

**Décision : ce travail est mis de côté, pas corrigé.** Conservé sur la
branche `p10-rejete-2026-09-07` (jamais fusionnée) pour référence. La
table de suivi (§I.5) reflète cet état. Le site public ne sera repris
qu'après :
1. un ré-échantillonnage réel des couleurs depuis la maquette approuvée
   (valeurs hexadécimales relevées directement sur l'image, pas choisies
   "à l'œil" ni recalculées par script — c'était l'erreur du lot 1 de ce
   même chantier, voir entrée P10 #2 ci-dessus : l'or "mesuré" avait été
   *calculé* pour un contraste AA, jamais *échantillonné* sur la maquette,
   d'où l'écart de teinte constaté),
2. une décision de Thierry (pas de l'exécutant) sur la voie visuelle de
   couverture : photo réelle autorisée, composition graphique
   institutionnelle sans photo, ou photo sous licence sur sujet non
   représentatif — jamais un globe illustré ni une mise en scène de bureau
   inventée.

**Correction factuelle apportée à `NEXUS_RCA_P10_NON_CONFORMITE.md`** :
le document recommande de reprendre la boucle à partir de P1a-bis : à la
vérification du tableau §I.5, P1a-bis, P1b, P1c, A1 et A2 sont déjà
marquées "terminée" (05/09/2026). Le vrai manque n'est pas l'absence de
ces phases mais le fait que la *structure* des tokens A1 (`--brand`,
`--surface`, etc.) a été livrée sans que ses *valeurs* pour le site
public aient jamais été formellement réchantillonnées sur la maquette
approuvée ni présentées à validation — d'où la dérive de teinte. La
correction porte donc sur les valeurs de tokens A1, pas sur un rejeu
complet de P1a-bis→A2.

**Complément du 07/09/2026 — Étape 1 (E1-E4) livrée puis E3 exécuté.**
`docs/P10_LIVRABLES.md` : contrastes mesurés, audit CTA réel, migration
072 (`is_featured`/`display_order`). Pages `accompagnement-business` et
`reseau-international` livrées avec du contenu réel validé par Thierry,
aucun texte inventé — les 8 pôles officiels ont maintenant tous une
page. Premier élément du gabarit factorisé que P10 réclamait :
`components/services/ServiceBody.tsx` (paragraphes + liste de
prestations), réutilisé par les deux pages au lieu d'un `*Form.tsx` dédié
de 1200+ lignes par service — anti-pattern déjà identifié sur les 12
pages existantes, volontairement non touchées dans ce lot (chantier
séparé, plus large).

Découverte en construisant : le CTA de chaque page ne pointe pas vers un
nouveau formulaire, mais vers le formulaire générique déjà existant
`/demande/complet?service=...`, qui acceptait déjà ce paramètre sans
modification. `lib/demande-complete-form.ts` avait une troisième
taxonomie de services, codée en dur (`SERVICES_COMPLETS`, 7 entrées),
distincte à la fois de la table `services` (8 pôles, P8) et des dossiers
`app/services/*` (12 pages). Complété (ajout de 2 entrées + leurs
catégories, reprises mot pour mot du contenu validé), rien retiré.
Reste en dette : cette taxonomie à 3 endroits distincts n'est pas
résolue architecturalement, seulement complétée au point nécessaire.

Migration 073 : `description` des 2 lignes `services` mises à jour pour
rester cohérentes avec le contenu des pages. `tsc`/`lint`/`build` : 0
erreur. Vérifié en direct (`curl` sur le serveur de développement) : les
deux pages répondent 200 et affichent le contenu réel attendu.

**Rejet de la maquette mobile du hero, amendement M1-M10 (08/09/2026).**
La maquette présentée le 07/09 (Artifact HTML, cadre d'iPhone simulé,
trois cercles "Europe / Bangui / Canada" reliés par des traits pour
représenter le réseau international) n'est pas approuvée :
1. M2 — les trois cercles suggèrent une implantation (bureau ou
   représentation) en Europe et au Canada qui n'est pas confirmée,
   exactement ce que la consigne donnée pour le contenu de la page
   `reseau-international` interdisait déjà pour le texte (pas pour le
   visuel — l'incohérence n'avait pas été vue).
2. M10 — un cadre d'iPhone simulé sur un artifact desktop n'est pas une
   vérification mobile recevable : il faut une URL consultable sur un
   téléphone réel, testée à 360/390/430 px, dans les deux langues, avec
   Lighthouse en profil mobile.
Ne pas réutiliser cette maquette telle quelle pour le hero mobile réel —
nouvelle proposition à construire conforme à M1-M10, voir
NEXUS_RCA_FEUILLE_DE_ROUTE_V3.md, section P10.

**M6/M7/M8 livrés (08/09/2026), M2 toujours bloqué.**
Sélecteur de langue porté à 44×44 px minimum (M6). Formulaire public
générique (`DemandeFormComplete.tsx`) : tous les champs passaient en
`text-sm` (14px), sous le seuil qui déclenche le zoom automatique de
Safari iOS au focus — corrigé en `text-base` (16px) sur les quatre
composants de champ partagés, `inputMode`/`autoComplete` déduits du
type, champ téléphone qui ne déclarait pas `type="tel"` corrigé (M7/M8).
Header public fixe (`Navbar.tsx`) : `pt-[env(safe-area-inset-top)]`
ajouté — `viewport-fit=cover` était déjà posé dans `app/layout.tsx` mais
rien ne compensait l'encoche sur un header `fixed top-0`.

Déjà conformes, vérifiés sans modification : `Hero.tsx` n'utilise ni
`h-screen` ni `100vh` (M8) ; sauvegarde automatique en `localStorage` du
formulaire de demande déjà en place (M7, "erreur réseau n'efface jamais
la saisie") ; ratio de longueur FR/EN du titre du hero (56 vs 48
caractères, ratio 1,17) et du sous-titre dans la tolérance ±30 % (M9).

**Trouvé en vérifiant M6, pas cherché : un vrai bouton de bascule
clair/sombre (`ThemeToggle.tsx`) est exposé sur la Navbar publique**
(desktop et mobile), seul endroit où il est utilisé dans tout le dépôt.
Il fonctionne réellement (classe `.dark` posée sur `<html>`, tokens
`--surface`/`--ink` basculent). C'est une contradiction directe avec
l'interdit explicite d'A1 : *"Interdits — ... mode sombre en V3"*.
**Non retiré ici** : c'est une fonctionnalité déjà utilisable par de
vrais visiteurs, la retirer est une décision de Thierry, pas une
correction de bug silencieuse — voir aussi la règle de prudence
production de CLAUDE.md.

M2 (direction visuelle de la couverture) reste l'unique blocage réel
avant de construire le visuel du hero mobile — sans réponse de Thierry,
aucune image n'est ajoutée (E4, "aucun contenu inventé").

**Décisions reçues et exécutées (08/09/2026) : bascule retirée, bug plus profond trouvé et corrigé au passage.**
`ThemeToggle` retiré de la Navbar publique (desktop + mobile), composant
supprimé (seul consommateur). En vérifiant sa suppression, découverte
d'un mécanisme plus large et non lié à ce bouton : `app/layout.tsx`
appliquait `.dark` sur `<html>` via un script "no-flash" lisant la
préférence système du visiteur, **sur toutes les pages, y compris
publiques**, indépendamment de tout bouton visible. Impact réel et
immédiat sur le travail du jour : `bg-surface-ivory` (clair `#F5F3F0`,
sombre brun `#3B2E09`) combiné à du texte navy fixe rendait les cartes
de prestations d'`accompagnement-business`/`reseau-international`
illisibles pour tout visiteur avec le mode sombre système activé.
Corrigé : le script est limité à `location.pathname.startsWith('/dashboard')`
— comportement de `DashboardShell.tsx` (admin) inchangé, site public
neutralisé. `lib/theme.ts` conservé tel quel (toujours consommé par
l'admin, hors décision du jour qui ne portait que sur le public).

M2 tranché : pas d'image pour l'instant, fond navy sobre — aucun
composant de couverture à construire, le hero mobile reste sur son
dégradé navy existant.

## P1c — Revérification (07/09/2026)

**1. 32 clés étrangères sans index couvrant, sur les 42 corrigées en P1c d'origine.**
Vérifié en direct par requête sur `pg_constraint`/`pg_index` : le correctif
initial (index sur 42 FK) a bien fonctionné, mais des tables créées par
des phases postérieures (P3, P6, P8) n'ont jamais reçu leurs propres
index de clé étrangère. Dette purement additive (aucune régression,
aucun risque), reportée sciemment sur décision de Thierry (07/09) — à
traiter dans un lot dédié performance/dette technique, pas avant A1.

## A1 — Tokens couleur, valeurs réechantillonnées (07/09/2026)

**1. Or/navy passés de "calculé pour un contraste AA" à "échantillonné puis validé".**
Le lot 1 de P10 (06/09) avait *calculé* un or (`#C9A227`/`#D4AF37`) pour
respecter un ratio de contraste, sans jamais le comparer à la maquette
approuvée — d'où la dérive de teinte qui a fait rejeter P10. Corrigé :
`--brand`/`--brand-hover`/`--brand-subtle`/`--on-brand` portent maintenant
`#B99760` (or, échantillonné sur le bouton de la maquette, un aplat large)
et `#021030` (navy, échantillonné sur le texte). Un seul or dans toute la
plateforme, clair et sombre confondus — voir
`NEXUS_RCA_A1_TOKENS_VALIDATION.md` pour la méthode complète et les 4
corrections apportées à l'échantillonnage initial (échelle navy dérivée
et non prélevée sur photo, gris secondaire dérivé et non prélevé, un seul
or, états/sémantiques manquants).

**2. `--danger`/`--warning`/`--success`/`--info` ajoutés — n'existaient pas avant.**
Distincts des 6 `--status-*` (badges de cycle de vie d'une demande,
déjà en place) : ce sont des sémantiques génériques pour alertes/toasts.
`--warning` est un rouge-orangé (`#C2410C` clair / `#FB923C` sombre),
volontairement éloigné de l'or — décision de Thierry (option 1, 07/09) :
un ambre classique se confondrait avec l'accent or "action principale".
Contrastes mesurés : danger 4,83:1, warning 5,18:1 sur fond clair ; les
deux passent AA. `--success`/`--info` reprennent les valeurs déjà
mesurées de `--status-success`/`--status-progress` plutôt que d'inventer
une 4ᵉ nuance de vert/bleu sans raison.

**3. Explicitement hors périmètre de ce lot, pas oublié :**
- Passage des surfaces `--surface`/`--surface-elevated` de blanc à ivoire
  (changement visuel large sur tout l'admin, pas demandé dans le GO de
  ce lot).
- Gris secondaire dérivé de la famille navy pour le texte du site public
  (calculé et vérifié ≥ AA pendant ce lot — `#525E7A`, 5,85:1 sur ivoire —
  mais pas encore câblé dans un token, le site public utilise des classes
  Tailwind littérales `text-slate-*`, pas la couche sémantique `--ink`).
- États actif/désactivé de `--brand` (seul le survol existe pour l'instant).

**4. Complément du 07/09/2026 : surface ivoire du site public créée, migration or terminée sur `Hero.tsx`/`FinalCTA.tsx`.**
Demandé explicitement par Thierry au titre d'A1 (pas de P10), en réponse
au rapport `docs/P10_LIVRABLES.md`. `--surface-ivory` (`#F5F3F0`, valeur
du jeu de palette déjà validé par Thierry, pas une teinte inventée pour
ce token) ajoutée dans `globals.css` et `tailwind.config.ts`
(`surface.ivory`). Comble le point ci-dessus ("surfaces ivoire vs blanc
... site public"), le point admin reste hors périmètre. Contrastes
mesurés : navy dessus 18,01:1, ink-muted 6,84:1 (OK) ; or dessus 2,48:1
(échec — l'or reste interdit en texte/icône sur ivoire, uniquement en
fond de bouton plein).

`Hero.tsx` et `FinalCTA.tsx` : tous les `nexus-orange-*` requalifiés un
par un vers `bg-brand`/`text-brand`/`border-brand` (Navbar.tsx/Footer.tsx
l'étaient déjà depuis un lot antérieur, Hero/FinalCTA étaient restés en
retard). Boutons CTA principaux : `bg-brand`/`text-on-brand` (6,84:1),
`hover:bg-brand-hover` (5,37:1), `focus-visible:ring-focus` avec
`ring-offset-2` sur `nexus-blue-950` (anneau seul seul sur l'or : 1,73:1,
insuffisant — d'où l'offset vers le fond navy de la section, 4,19:1, qui
résout le problème). `FinalCTA.tsx` : libellé "Soumettre mon dossier" →
"Soumettre une demande" (E2), même route `/demande/complet` que les
autres CTA principaux.

**5. Bug réel trouvé en finissant la migration, pas cherché : `rgba(201,162,39,*)` (l'or *rejeté* `#C9A227`) encore écrit en dur dans des `box-shadow`/SVG de `Navbar.tsx` (4 occurrences) et `PublicHero.tsx` (utilisé par 13 pages publiques).**
La correction du 07/09 (entrée #1 ci-dessus) avait remplacé la valeur
dans `globals.css`/`tailwind.config.ts` et toutes les classes `bg-brand`/
`text-brand`, mais pas les chaînes `rgba(...)` codées en dur dans les
effets de lueur — invisibles à un grep sur `bg-brand`. J'ai reproduit
cette même valeur fausse par copie dans `Hero.tsx`/`FinalCTA.tsx` avant
de m'en apercevoir. Corrigé partout vers `rgba(185,151,96,*)` (`#B99760`,
la valeur validée) ; grep de contrôle sur `201,\s*162,\s*39`, `C9A227` et
`D4AF37` : 0 occurrence restante dans tout le dépôt. Profité du même
passage pour ajouter le `focus-visible` manquant sur le CTA de
`PublicHero.tsx` (même traitement que `Hero.tsx`/`FinalCTA.tsx`), absent
sur les 13 pages qui l'utilisent jusqu'ici.

`tsc`/`lint`/`build` : 0 erreur sur les deux commits. Pas de vérification
visuelle en navigateur possible dans cet environnement (aucun outil
d'automatisation navigateur disponible) — vérification faite par calcul
WCAG sur les valeurs réelles utilisées dans le code, et par lecture du
HTML rendu (`curl` sur le serveur de développement), pas à l'œil.

## P9 — Audit de confidentialité du portail client (07/09/2026)

**1. Diagnostic fonctionnel : 4 manques réels sur les 13 points attendus, pas un portail entier.**
Lecture complète des pages `/dashboard/client/*` existantes. Fonctionnent
réellement : suivi d'avancement (`Timeline`, `demande_status_history`),
téléversement + documents manquants (`DocumentsManager.tsx`, upload/
téléchargement/suppression réels), suivi des paiements, rendez-vous,
échange conseiller (messages + WhatsApp), notifications, protection IDOR
en code. **Manquent réellement** : consultation/acceptation d'un devis
(aucune UI, aucune route client), factures/reçus téléchargeables par le
client (texte "Reçus disponibles" décoratif, aucun lien), documents
officiels délivrés par l'agence (le bouton PDF actuel produit un
récapitulatif de dossier, pas une attestation), demandes de correction
structurées (traité hors système par WhatsApp aujourd'hui).

**2. Bug réel trouvé par l'audit, pas dans la liste de départ : `payments.client_id` NULL empêchait un vrai client de voir ses propres paiements.**
La policy RLS `payments_select` n'autorise un client qu'via
`client_id = auth.uid()` (`payments.client_id` référence `profiles.id`,
vérifié par la contrainte FK). Le code des pages client filtre pourtant
par `client_email`, une colonne que cette policy ne connaît pas — RLS
s'applique indépendamment du filtre de la requête et bloquait la ligne
avant même que le filtre par e-mail n'ait un effet. Sur les 3 paiements
réels, 1 avait un e-mail correspondant à un profil existant
(`bfkankou@gmail.com`) mais `client_id` jamais renseigné.
**Corrigé** : migration 068, backfill idempotent (email → profil existant
uniquement, jamais un lien inventé). Les 2 paiements restants sans
`client_id` n'ont aucun profil correspondant (personne n'a de compte pour
ces e-mails) — `client_id` reste `NULL` à raison, aucune fuite ni bug là.
Même vérification faite sur `payment_links` (policy identique) : 2 lignes
sans `client_id`, aucune n'a de profil correspondant non plus — rien à
corriger, la route de création (`app/api/payment-links/create/route.ts`)
fait déjà la recherche par e-mail correctement pour tout nouveau lien.

**3. Points vérifiés sûrs par l'audit (pas supposés) :**
- `select("*")` sur 4 pages client (`demandes`, `demandes/[id]`,
  `page.tsx`, `paiements`) : aucune fuite aujourd'hui, chaque champ
  traversant une frontière `"use client"` est nommé explicitement.
  Pattern fragile à long terme (même motif que la fuite `payment_links`
  de P1b) — à resserrer en `select("colonnes précises")` si ces pages
  sont retouchées, pas fait ici (hors périmètre du bug signalé).
- `demande_notes` : RLS confirmée `admin`/`super_admin` uniquement, sur
  toutes les commandes — protection base, pas seulement applicative.
- `app/api/demandes/[id]/{documents,messages}` : `service_role` utilisé
  mais avec un contrôle de propriété réel en code, qui bloque
  effectivement la réponse (`if (!access.ok)` / `if (!isStaff && !isOwner)`).
- `demandes` : RLS (`client_id = auth.uid()` ou e-mail) redondante avec le
  contrôle en code — défense en profondeur réelle, pas juste applicative.

**4. Prérequis confirmé pour construire "consultation/acceptation d'un devis" (pas un bug, la fonctionnalité n'existe pas encore) :**
`devis` n'a aujourd'hui qu'une policy `is_staff` — aucun accès client.
`client_record_id` (vers `clients`, cohérent avec D7) est bien renseigné
sur le devis réel existant. La policy à écrire lors de la construction de
cette fonctionnalité : jointure `clients.profile_id = auth.uid()`.

**5. IDOR réelle trouvée et corrigée (Lot 0, 07/09/2026) : `/api/devis/[id]/pdf` et `/api/factures/[id]/pdf` n'avaient aucun contrôle pour le rôle `client`.**
Trouvée en préparant le Lot 1 de P9 (accès devis pour le client), pas en
cherchant une faille spécifiquement. Les deux routes ne restreignaient
que le rôle `agent` (à ses dossiers assignés) ; un `client` authentifié
pouvait télécharger le devis ou la facture de n'importe qui en devinant
un UUID — aucune vérification de propriété du tout pour ce rôle.
**Corrigé** : ajout de la jointure `client_record_id → clients.profile_id
= auth.uid()`, refus 403 sinon, pour tout rôle qui n'est ni staff
(`admin`/`super_admin`) ni `agent` (déjà couvert). Vérifié en direct sur
la base que le compte client réel (`yatolamarie04@gmail.com`, lié au
devis existant via `clients.profile_id`) continue de passer le contrôle
— aucune régression sur le seul cas réel existant. `tsc`/`lint`/`build` :
0 erreur.

**6. Lot 1 livré : consultation et acceptation d'un devis par le client (07/09/2026).**
Migration 069 : policies `SELECT` client sur `devis`/`devis_lignes`
(jointure `client_record_id → clients.profile_id = auth.uid()`, cohérente
avec D7 et avec le Lot 0). Même faille IDOR que le Lot 0 trouvée et
corrigée au passage sur `GET /api/devis/[id]` (aucun contrôle client
avant ce lot). Nouvelle route `POST /api/devis/[id]/accept`, distincte de
`/api/devis/[id]/status` (réservée staff, `assertPermission("devis.send")`,
rapporte une décision transmise hors ligne) : réservée au rôle `client`,
vérifie la propriété, refuse hors statut "envoye", et fige un instantané
(montant, devise, lignes triées) dans `audit_log` avec IP et user-agent —
pas un simple booléen. La protection contre une modification silencieuse
après acceptation existait déjà : `PATCH /api/devis/[id]` refuse toute
édition hors statut "brouillon" (donc "envoye" et "accepté" sont déjà
couverts, aucun changement nécessaire).

Page `/dashboard/client/devis` non reliée à `DashboardShell.tsx` (gelé) —
même situation déjà documentée en A6 #10 (notifications) : lien ajouté
depuis la fiche dossier existante (`demandes/[id]/page.tsx`, bloc
"Actions"), pas de nouvelle entrée de menu.

**Non testé de bout en bout, documenté plutôt que caché** : le seul devis
réel de la base est encore au statut "brouillon" (jamais transmis) — il
n'apparaît donc pas sur les pages client (comportement voulu). Impossible
de tester l'acceptation en conditions réelles sans faire passer ce devis
en "envoye", ce qui modifierait une donnée réelle sans qu'on me l'ait
demandé. Logique vérifiée par lecture de code + policies RLS confirmées
en base, pas par un parcours utilisateur complet.

**7. Lot 2 livré : factures et reçus téléchargeables par le client (07/09/2026).**
Migration 070 : policies `SELECT` client sur `factures`/`facture_lignes`
(même schéma que devis, migration 069). Même IDOR trouvée et corrigée
sur `GET /api/factures/[id]` (aucun contrôle client avant ce lot).

Nouvelle route `GET /api/payments/[id]/receipt` : génère le reçu à la
demande (pdf-lib, même patron que les routes devis/factures), aucun
fichier stocké, vérifie la propriété (`payments.client_id` **ou**
`clients.profile_id` — les deux colonnes coexistent, voir entrée #2
ci-dessus) avant de générer quoi que ce soit. Remplace, pour le
téléchargement self-service, le flux existant qui ne fait qu'envoyer un
PDF déjà généré par e-mail (`send-receipt/route.ts`, conservé pour le
staff, inchangé sauf durcissement ci-dessous).

**Durcissement trouvé au passage, hors périmètre initial du lot mais adjacent et à faible risque** :
`POST /api/payments/send-receipt` n'avait **aucun contrôle de rôle** —
n'importe quel utilisateur authentifié (y compris un client) pouvait
faire envoyer, par le compte Resend de Nexus, le reçu de n'importe quel
paiement vers **n'importe quelle adresse e-mail** (`recipient_email` est
un paramètre libre du corps de la requête). Restreint au staff
(`agent`/`admin`/`super_admin`) — le téléchargement self-service du
client passe maintenant par la nouvelle route ci-dessus, qui n'envoie
rien par e-mail et n'accepte pas de destinataire arbitraire.

Pages `/dashboard/client/factures` (liste) et `/factures/[id]` (détail +
PDF), lien "Reçu PDF" ajouté par ligne sur `/dashboard/client/paiements`
(statuts `paid`/`validated`/`partial` uniquement). Liens ajoutés depuis
la fiche dossier existante, même précédent que le Lot 1 (pas de
modification de `DashboardShell.tsx`).

`tsc`/`lint`/`build` : 0 erreur.

**8. Lot 3 livré : documents officiels délivrés par l'agence (07/09/2026).**
Migration 071 : colonne `demande_documents.uploaded_by_role` ('client' |
'agence'), décision de Thierry — pas de 5ᵉ mécanisme/table. Backfill
honnête : l'unique document existant a été vérifié (uploadé par un
`super_admin`) et marqué 'agence', pas supposé 'client' par défaut.

La valeur est posée par `POST /api/demandes/[id]/documents` d'après le
**rôle réel de l'appelant au moment de l'upload**, jamais fournie par le
client — aucun champ du formulaire ne la contrôle, impossible à
falsifier depuis le portail client. Comme `DocumentsManager.tsx` est déjà
utilisé sur une page accessible à `agent`/`admin`/`super_admin` (pas
seulement `client`), un membre du staff qui uploade un document depuis
cette même page produit automatiquement un document "officiel" — aucune
nouvelle interface d'upload à construire pour le staff.

Affichage : nouvelle section "Documents officiels de Nexus RCA" séparée
des pièces fournies par le client ("Mes documents"), téléchargement
seul, **aucun bouton de suppression** pour ce type. Contrôle posé aussi
côté serveur (`DELETE /api/demandes/[id]/documents`) : un rôle `client`
qui tenterait de supprimer un document `uploaded_by_role = 'agence'` par
appel direct à l'API (en contournant l'absence de bouton) est refusé
403 — pas seulement caché côté interface.

`tsc`/`lint`/`build` : 0 erreur.

**9. Lot 4 livré : clôture manuelle d'une demande de correction sans document (07/09/2026), P9 terminée.**
Investigation avant code (correction d'une estimation antérieure "0 code
nécessaire") : `demande_documents_requests` couvrait déjà la création
d'une demande de correction en texte libre (`RequestDocumentModal.tsx` →
`POST /api/demandes/[id]/documents-requests`, `type_document` en saisie
libre avec suggestions, pas un select fermé) et son affichage au client
(`DocumentsManager.tsx`, auto-résolution si un document correspondant est
téléversé). **Manquait réellement** : aucun moyen de refermer une demande
non résolue par un nouveau document (ex. correction traitée par téléphone
ou WhatsApp) — ni bouton, ni route API, seule une modification directe en
base pouvait la sortir de "en_attente".

Corrigé : `PATCH /api/demandes/[id]/documents-requests/[requestId]`
(staff uniquement, vérifié côté serveur par le rôle réel, pas par
l'absence de bouton), limité aux transitions `en_attente` → `fourni` ou
`annule` (409 si la demande est déjà refermée, 404 si `requestId` n'
appartient pas au `demande_id` fourni). Aucune nouvelle table, aucune
nouvelle colonne — réutilise le CHECK `('en_attente','fourni','annule')`
déjà en place. Boutons "Résolu"/"Annuler" ajoutés dans
`DocumentsManager.tsx`, visibles uniquement si `isStaff` (nouveau prop,
`false` par défaut côté client, `true` passé explicitement par
`StaffDossierDetail.tsx`).

`tsc`/`lint`/`build` : 0 erreur. **P9 (Portail client) est maintenant
terminée** — les 13 points attendus sont couverts.
