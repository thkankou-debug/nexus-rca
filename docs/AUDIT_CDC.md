# Audit de conformité — Cahier des charges Administration (v1.0, 12/09/2026)

> Lot 1 du plan de livraison (§19.1) : état de réalisation exigence par
> exigence, vérifié contre le dépôt réel (branche `v3/integration-v3`,
> commit de référence : voir git log du jour) et la base Supabase active
> (`yyoptsxdoekbmibkwikj`). Classement §17.1 : **Livré** (raccordé à une
> route réelle) · **Partiel** · **Absent** · **Bloqué-AR** (attend un
> arbitrage AR-01→AR-07) · **Non vérifiable**.
>
> Ce document est l'inventaire de départ ; il sera tenu à jour lot par lot.

## Synthèse

| Domaine | État global |
|---|---|
| §4 Shell commun, centre de pilotage | **Livré** (recherche, notifications, repli 240/64 câblés ce jour) — écarts typographiques §4.3 à arbitrer |
| §5 Espaces métiers (11 profils) | **10/11 livrés** (modérateur + partenaire livrés le 12/09) · agent **partiel** (espace classique fonctionnel, non rhabillé) |
| §6 Permissions | **Partiel** — matrice §6.1 largement en place ; exclusivité d'encaissement §6.2 **Bloqué-AR-01** |
| §7 CRM et cycle de vie | **Partiel** — identité/fiche/étapes livrées ; file d'accueil, acceptation d'affectation absents |
| §8 POS et caisse | **Partiel** — cœur livré ; monnaie/mouvements/état « correction demandée » absents (schéma) |
| §9 Finance | **Partiel** — chaîne déclaré→rapproché→validé livrée ; affectations/remboursements/remises absents |
| §10 Instructions et escalades | **Livré (noyau, 12/09)** — instructions + accusés individuels + avancement/blocage + clôture + notifications ; escalade quotidienne des retards livrée (cron idempotent, 12/09) ; circuits paramétrés (AR-02) et outbox restent à faire |
| §11 Documents / RDV / RH | **Partiel** |
| §12 Catalogue / contenus | **Partiel** — catalogue servi ; frais de tiers **Bloqué-AR-04** |
| §13 Indicateurs | **Livré (12/09)** — docs/METRIQUES.md (définitions, sources, statuts, portées) |
| §15 Sécurité | **Partiel** — RLS+assertPermission systématiques sur le neuf ; audit non effaçable à durcir côté DB |
| §16 Réseau/accessibilité | **Non vérifié** (aucune mesure faite au sens §16) |

---

## §1 Règles de réussite

- EX-01 (responsable/échéance/statut/lien) — **Partiel** : vrai pour dossiers, paiements, sessions ; faux pour « instructions » (absentes).
- EX-02 (indicateur → liste exacte) — **Partiel** : compteurs Vue d'ensemble/Trésorerie/Pilotage ouvrent des listes, mais sans garantie « même instant de référence » formalisée (R19 non recetté).
- EX-03 (actions d'abord, pas de décor) — **Livré** sur les nouveaux espaces (aucune bannière, aucun score inventé).
- EX-04 (fonction = route réelle + rôle + serveur + préversion) — **Livré** comme méthode depuis L3 ; vérifié pour les 8 espaces raccordés.
- EX-05 (traçabilité montée/descente) — **Absent** pour les instructions ; **Livré** pour caisse/paiements (audit_log).
- EX-06 (réception seul point d'encaissement humain) — **Livré (AR-01 validé par Thierry le 12/09)** : bouton retiré des pages caisse agent/super-admin + policies INSERT quick_sales agent/admin supprimées (migration 082) ; POS accueil inchangé. Anciennement : aujourd'hui `paiement.record` est aussi accordée à admin/comptable/daf (P2) et les pages caisse agent/super-admin (`QuickSaleForm`) encaissent. Routes d'encaissement inventoriées : POST `/api/accueil/pos` (accueil) ; insert direct `quick_sales` via `QuickSaleForm.tsx` (agent/admin/super-admin, RLS) ; `PaymentForm.tsx` (staff) ; liens de paiement publics (déclaration client, vérification staff). Retirer ces canaux = changement de droits réels → GO explicite requis.

## §4 Interface commune

- Shell partagé calculé côté serveur — **Livré** (`getEffectiveNav`, ModuleAdminShell/AccueilShell).
- 6 groupes de navigation — **Livré** (modules non fonctionnels absents, pas grisés).
- Barre 240 px repliable 64 px — **Livré** (12/09).
- Recherche globale filtrée par droits — **Livré** pour agent/admin/super_admin (route `/api/search` existante) ; **Partiel** : portées daf/dg/comptable/chef non couvertes par la route (extension = décision de portée, à instruire avec §6).
- Notifications — **Livré** (cloche câblée sur `notifications` réelle, marquage lu global). Renvoi vers l'objet source : dépend du champ `link` renseigné par l'émetteur.
- Vues enregistrées/filtres/export — **Partiel** : présents sur Dossiers (L3) ; densité mémorisée et colonnes configurables non branchées sur les nouveaux écrans.
- États obligatoires (§4.2) — **Partiel** : vide/chargement/succès systématiques ; « accès refusé » et « erreur récupérable » non uniformisés bloc par bloc.
- §4.3 identité : navy/ivoire/or, une action or par écran, statuts point+libellé — **Livré**. Écart à arbitrer : le cahier demande « typographie sans-serif unique, graisse max 600 » alors que l'admin utilise Syne (titres) + Plus Jakarta (corps) et des graisses 700 héritées — **contradiction apparente avec les maquettes validées** (titres display). → à trancher (voir Décisions ci-dessous).
- Rayons 6/8 px, lignes 44/36 px — **Partiel** : rayons conformes (tokens xs=6px, sm=8px) ; hauteurs de lignes non auditées écran par écran.

## §5 Espaces (résumé par profil)

| Profil | Route | État | Écarts principaux vs §5 |
|---|---|---|---|
| Super-admin | `/dashboard/vue-ensemble` | **Livré** | Organigramme, délégations, « décisions en attente » (instructions) absents ; suspension de compte via RH existant |
| Admin | `/dashboard/vue-ensemble` | **Livré** | « Files de réception » absentes ; consignes (instructions) absentes |
| DG | `/dashboard/pilotage` | **Livré** | Instructions + suivi d'exécution absents ; rapports PDF non raccordés au rôle |
| DAF | `/dashboard/tresorerie` | **Livré** | Remboursements absents (AR-04) ; « correction demandée » sur session absente |
| Comptable | `/dashboard/compta` | **Livré** | File « retours du DAF » absente (dépend des états de correction) |
| Chef de service | `/dashboard/mon-service` | **Livré** | Portée = pôle (demandes.service_id vide partout — documenté) ; « instructions reçues » absentes |
| Accueil & caisse | `/dashboard/accueil` | **Livré** | File d'accueil livrée (12/09) ; remises/tarif contrôlé serveur : voir §8 (AR-04) |
| Agent | `/dashboard/agent` (classique) | **Partiel** | Pas encore rhabillé dans le nouveau shell ; « instructions » absentes ; le reste existe (dossiers, docs, messages, notes, RH) |
| Modérateur | `/dashboard/moderation` | **Livré (12/09)** | Hub + contenus/FAQ/témoignages (réutilise P8, API gardées cms.*) ; médias et pages de prestations restent côté admin |
| Partenaire | `/dashboard/partenaire` | **Livré (12/09)** | Dossiers partagés + retours (accusé/avis/décision/complément, table partner_returns 086) avec notification au responsable ; révocation du partage bloque page/API/dépôt ; l affichage des retours dans la fiche dossier staff reste à raccorder |
| Client | `/dashboard/client` | **Livré** (V3/P9) | Acceptation de devis en ligne absente (décision P6 : hors V3) |

- Identifiant technique du rôle : `accueil_caisse` (migration 077) au lieu de `reception_cashier` proposé — **décision déjà prise** (document Dashboard Administration §3.5) ; à confirmer comme définitif (AR-01).

## §6 Permissions

- Modèle ressource.action.portée + RLS + serveur + UI — **Livré** comme architecture (P2 + has_permission + assertPermission). Écart assumé documenté : la portée fine de plusieurs nouveaux écrans est appliquée côté application (service-role après garde), pas en RLS (DETTE, lots Accueil/Finance).
- Séparation des opérations sensibles (tableau §6.1) — **Livré** pour : ouverture session, encaissement (session obligatoire), rapprochement, validation paiement (≠ saisisseur, trigger), soumission/validation de clôture (≠ préparateur), affectation, transitions. **Absent** : remboursements, remises, partage partenaire (écran), publication (partielle), délégations.
- §6.2 exclusivité de l'encaissement — **Bloqué-AR-01** (voir EX-06).
- Suppression de dossier — conforme : aucune suppression physique dans les écrans livrés.
- Délégation nominative bornée — **Absent** (AR-02/AR-05).

## §7 CRM

- CRM-01 recherche avant création + doublons non fusionnés auto — **Livré** (409 + candidats).
- CRM-02 identité canonique `clients` reliée à `profiles` — **Livré** (personne sans compte : oui).
- CRM-03 réception sans e-mail — **Livré** (e-mail optionnel).
- CRM-04 fiche 360° par onglets avec droits — **Livré** (fiche A6 + vue réception restreinte).
- CRM-05 fusion humaine traçable réversible — **Livré** (A6 Lot 3).
- §7.2 machine à états serveur, historique — **Partiel** : transitions gardées par rôle (routes status) mais `demande_status_history` n'est pas alimentée (défaut connu, A6 #11) → l'exigence « chaque transition écrit dans l'historique » est **non satisfaite**, chantier prioritaire du Lot 4.
- §7.3 : files réception/mes dossiers/service/urgents — **Livré** (vues L3). Acceptation d'affectation + escalade sur non-acceptation — **Absent** (dépend de l'objet tâche/instruction). File d'accueil physique — **Livré (12/09)** : reception_visits (migration 085), arrivée → prise en charge → orientée/partie, tracée dans l'audit.

## §8 POS et caisse

- CAI-01 nominatif — **Livré**. CAI-02/03 fonds + session unique par opérateur — **Livré** (poste physique non modélisé : AR-05). Date métier Africa/Bangui — **Partiel** : horodatage serveur UTC ; les « journées » utilisent la date locale du serveur, pas un calcul Bangui explicite.
- CAI-04 blocage serveur sans session — **Livré** (vérifié + testé).
- Trois zones POS, client visible, catalogue réel, facture existante — **Partiel** : zones livrées ; « charger une facture existante » **Absent** (lien facture↔POS inexistant, cf. §9).
- Frais NEXUS vs débours/tiers — **Bloqué-AR-04** (aucune catégorie « frais de tiers » en base ; décision produit).
- Prix contrôlés serveur / remises à permission — **Partiel** : montants validés serveur (>0, lignes bornées) mais prix libre saisi par la caissière assumé tant que le catalogue est « sur devis » ; l'« encaissement libre » livré à la demande explicite de Thierry (11/09) est en tension avec « pas de tarif libre hors autorisation » → à cadrer en AR-04. Remises : **Absent**.
- Brouillon en attente / abandon — **Absent** (le ticket vit en mémoire du navigateur uniquement).
- Espèces : monnaie rendue distincte — **Partiel** : calculée et imprimée sur le reçu, mais non stockée ; convention actuelle : montants stockés nets (documentée), donc pas de double soustraction.
- CAI-05 idempotence — **Livré (12/09)** : ticket_key/ligne_index (migration 084), rejeu ou double clic renvoie le résultat initial (vérifié en SQL : contrainte UNIQUE + course concurrente).
- CAI-06/07 reçu unique, réimpression — **Livré (12/09)** : écran /dashboard/accueil/recus (tickets regroupés par clé, réimpression DUPLICATA reconstruite depuis la base, aucun nouvel encaissement).
- §8.4 entrées/sorties/remboursements typés — **Absent** (schéma à proposer).
- §8.5 états de session — **Partiel** : non ouverte/ouverte/soumise/clôturée livrés ; « correction demandée » **Absent** (schéma + circuit).

## §9 Finance

- FIN-01 canoniques status/amount/method — **Livré** (P6-0), colonnes héritées synchronisées ; D6 à confirmer formellement (AR-03).
- FIN-02 distinction commande/facture/transaction/affectation/mouvement — **Partiel** : devis/factures/paiements/échéanciers distincts ; **affectation de paiement à une créance absente** (pas de table d'affectation ; reste dû calculé par agrégats).
- FIN-03 séquences — **Livré** (DEV-/FAC-/REC-).
- FIN-04 remboursements — **Absent** (AR-04 préalable).
- FIN-05 validations avec demandeur/valideur/motif — **Livré** (paiements, dépenses, sessions, commissions ; motif obligatoire au rejet de dépense).
- FIN-06/07 rapports distinguant les natures, concordance — **Partiel** : conventions affichées à l'écran (validé vs comptoir vs dépenses) ; concordance croisée export/écrans non recettée.

## §10 Instructions, escalades

- **Absent en totalité** : pas d'objet instruction, pas d'accusés, pas de circuits d'escalade paramétrés, pas de boîte d'envoi transactionnelle. Les briques existantes : messages dossier, notes internes, tâches liées au dossier, notifications. → C'est le plus gros chantier nouveau du cahier ; il exige des tables (instructions, destinataires, accusés, file de réception, outbox) à proposer une par une (§14.2) avant toute migration.

## §11 Documents / RDV / RH

- DOC-01/02 — **Partiel→Livré (12/09)** : statut de contrôle reçu/vérifié/rejeté/remplacé (migration 087) + actions Vérifier/Rejeter (motif obligatoire, agent affecté/chef/admin) dans la fiche dossier ; versions multiples et liens temporaires restent à faire.
- RDV-01/02 — **Livré** (appointments canonique, portées par rôle, `rendez_vous` gelée) ; conflits de créneau non détectés.
- RH-01/02 — **Livré** (module RH existant, cloisonnement) ; absences alimentent Mon service ; délégations : **Absent** (AR-02).

## §12 Catalogue / contenus / partenaires

- Catalogue pôles/prestations/tarifs — **Livré** (P8, écran Services et tarifs). Historisation des tarifs sur documents émis — **Livré** par construction (copie des lignes).
- Frais de tiers / débours — **Bloqué-AR-04**.
- Contenus institutionnels vérifiés/publiés + trigger de révocation — **Livré** (P8).
- Fiche partenaire + règles de partage — **Partiel** (tables présentes, écrans absents).

## §13 Indicateurs

- Chiffre honnête (pas de faux zéro, pas de % sans historique) — **Livré** comme règle appliquée partout.
- Dictionnaire des métriques avec requêtes — **Absent** (livrable 6 à produire).
- Dédoublonnage des agrégats — **Livré** sur les écrans neufs (agrégations par table source, sans jointures multiplicatrices).

## §15 Sécurité (écarts saillants)

- SEC-03 service_role serveur + permission reconstruite — **Livré** (patron systématique des routes neuves).
- SEC-05 audit riche — **Partiel** : auteur/rôle/action/entité/valeurs oui ; motif pas toujours ; masquage des champs sensibles non implémenté.
- SEC-06 audit non modifiable par les rôles applicatifs — **Non vérifiable ici** : à durcir par policy DB explicite (aucun écran n'y touche, mais la garantie base n'a pas été prouvée).
- SEC-02 MFA rôles privilégiés — **Absent** (mécanisme à retenir).

## §16–§18

- Tests responsive 360→1440, mesures p95, WCAG AA — **Non vérifié** (aucune mesure outillée réalisée ; à planifier avec AR-07).
- §17 preuves de raccordement — **Partiel** : routes/commits/URL fournis à chaque lot ; captures desktop+mobile systématiques non archivées.
- §18 : R04, R07 (session), R12 (auto-validation), R13 (écart) déjà exercés ; les 24 scénarios formels avec preuves datées restent à dérouler en recette dédiée.

---

## Décisions attendues de Thierry (bloquantes pour les lots concernés)

1. **AR-01** — Exclusivité de l'encaissement comptoir : confirmer le retrait des canaux d'encaissement hors réception (pages caisse agent/super-admin, `PaymentForm`) et l'identifiant `accueil_caisse`.
2. **AR-02 / AR-05** — Titulaires, suppléants, délégations, poste(s) de caisse physique, procédure de remplacement de la réceptionniste.
3. **AR-03** — Confirmer D6 (statuts financiers canoniques actuels) et D7 (personne canonique `clients`) comme définitifs.
4. **AR-04** — Moyens de paiement actifs, politique de remise, remboursement, trop-perçu, avances, « frais de tiers », et statut de l'« encaissement libre » (autorisé tel quel, plafonné, ou soumis à permission).
5. **AR-06** — Portées de lecture DG/DAF/Admin/RH + règles de partage partenaire.
6. **AR-07** — Objectifs de reprise, profil réseau de test, critères de bascule production.
7. **Typographie §4.3** — trancher entre « sans-serif unique graisse ≤600 » (texte du cahier) et les titres display des maquettes validées (état actuel du site).

## Prochains lots proposés (dans l'ordre du cahier, §19.1)

- **Lot 4 (parcours vertical)** : alimentation réelle de `demande_status_history` à chaque transition + file d'accueil (arrivées) + acceptation d'affectation — puis **objet Instruction** (§10) avec ses tables proposées une à une.
- **Lot 5 (caisse/finance)** : clé d'idempotence POS, écran « Reçus » avec réimpression, état « correction demandée » de session, affectations de paiement — les points AR-04 en dépendent.
- **Lot 6** : dictionnaire des métriques + recette R01→R24 outillée avec preuves.
