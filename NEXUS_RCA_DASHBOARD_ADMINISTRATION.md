# NEXUS RCA — DASHBOARD ADMINISTRATION
## Un CRM organisé en espaces métiers

9 septembre 2026 · Spécification dédiée · Complète `NEXUS_RCA_SPECIFICATION_COMPLETE.md`

---

# PARTIE 1 — LE PRINCIPE

## 1.1 Une application, dix espaces métiers

**Une seule application d'administration.** Une route racine, un shell, un design system. Ce qui change d'un métier à l'autre :

1. **L'écran d'accueil** — chaque métier arrive sur son poste de travail, pas sur un tableau de bord générique.
2. **Les modules visibles** — calculés côté serveur à partir des permissions effectives.
3. **Les lignes visibles** — par RLS : toute l'agence, un service, ou ses propres dossiers.
4. **Les actions disponibles** — par `assertPermission()`, jamais par masquage d'un bouton.

**Ce qui ne change jamais :** les composants, la palette, les tableaux, les badges de statut, les formulaires. Un agent et un DAF ouvrant la liste des dossiers voient la même interface, peuplée différemment.

C'est ce qui distingue un espace métier d'un dashboard séparé. Dix dashboards séparés, c'est dix codes à maintenir et neuf occasions de diverger. Dix espaces métiers, c'est un code et dix configurations.

## 1.2 La règle d'entrée

À la connexion, l'utilisateur est redirigé vers **l'écran d'accueil de son métier**, pas vers une vue d'ensemble commune :

| Métier | Écran d'accueil |
|---|---|
| Super-admin | Vue d'ensemble — supervision agence |
| Admin | Vue d'ensemble — opérations |
| Directeur général | Pilotage — décision |
| DAF | Trésorerie |
| Comptable | Saisie du jour |
| **Accueil & caisse** | **Comptoir POS** |
| Responsable de service | Mon service |
| Agent | Ma journée |
| RH | Effectif et paie |
| Modérateur | Contenus à modérer |
| Partenaire | Dossiers partagés |

---

# PARTIE 2 — LES DIX ESPACES

## 2.1 Super-admin — supervision de l'agence

**Écran d'accueil : Vue d'ensemble.** La maquette fournie est validée dans sa structure.

- **À traiter** — À affecter · En attente du client · En traitement. Trois compteurs, chacun ouvrant la liste filtrée.
- **Dossiers à superviser** — onglets À affecter / Prioritaires / En retard / Tous, avec recherche, filtres service, statut, agent, et action directe « Examiner ».
- **Répartition par étape** — Réception · Qualification · Documents · Traitement · Décision · Clôture.
- **Aujourd'hui** — rendez-vous de l'agence, activité récente.
- **Alertes et validations** — paiements à examiner, dossiers sans agent, documents à vérifier, échéances dépassées.

**Modules complets :** tous, sans exception, plus Paramètres, Journal d'audit avec export, Employés et accès, attribution des rôles, suppression de dossiers, imports.

**Correction à apporter à la maquette :** le libellé « Systenus » dans la barre latérale est une coquille — lire « Système ».

## 2.2 Admin — opérations

Même écran d'accueil que le super-admin, sans le bloc système.

**Fait au quotidien :** affecter et réaffecter · valider les transitions sensibles · valider devis et factures · superviser tous les services · arbitrer les escalades · consulter le journal d'audit.

**Ne fait pas :** paramètres système, attribution des rôles élevés, suppression de dossiers, imports.

## 2.3 Directeur général — pilotage

**Écran d'accueil : Pilotage.** Aucune saisie opérationnelle, uniquement lecture, validation et rapports.

- Situation du mois : dossiers entrés, clos, en cours · encaissé · reste à encaisser · dépenses · solde net.
- Évolution sur 12 mois, dès que l'historique le permet.
- Par service : volume, revenu, délai moyen, taux de succès pour chacun des huit pôles.
- Par agent : charge, dossiers clos, délai moyen, dossiers en retard.
- Ce qui bloque : hors délai, sans mouvement depuis 15 jours, paiements en retard.
- **À valider** : devis au-dessus du seuil, dépenses exceptionnelles, décisions RH.

Rapports mensuels, trimestriels, annuels en PDF avec l'en-tête institutionnel. Export Excel des données sous-jacentes.

## 2.4 DAF — trésorerie

**Écran d'accueil : Trésorerie.**

- Solde de caisse par devise · encaissements du jour, semaine, mois · décaissements · position nette.
- **Créances par ancienneté** : 0-30, 30-60, 60-90, +90 jours, avec relances envoyées et reste dû par client.
- **À valider** : paiements saisis par le comptable ou la caissière · dépenses · notes de frais · commissions · **rapprochements de caisse soumis**.
- Dépenses par catégorie comptable, avec justificatifs.
- Revenus par service, par mode de paiement, par agent.
- Sessions de caisse : ouvertes, fermées, écarts, historique des clôtures.

**Valide, ne saisit pas.** Clôture définitive de la caisse, rapprochements, relances, exports comptables.

## 2.5 Comptable — saisie

**Écran d'accueil : Saisie du jour.**

- Paiements et dépenses saisis aujourd'hui, en attente de validation.
- À saisir : justificatifs reçus non traités, paiements déclarés par les clients non rapprochés.
- Mouvements de la session en cours.

**Saisit, ne valide pas.** Ne clôture pas la caisse, ne modifie pas une facture validée, ne supprime rien.

## 2.6 Accueil & caisse — le poste physique

**Rôle à créer : `accueil_caisse`.** Il n'existe pas dans les neuf rôles actuels et ne peut être confondu ni avec le comptable — qui ne reçoit pas de public — ni avec l'agent — qui ne manipule pas d'espèces. C'est le rôle le plus exposé de l'agence : il touche l'argent liquide et il crée les fiches clients.

Cet espace fait l'objet de la partie 3 entière.

## 2.7 Responsable de service — mon service

Périmètre limité à son service, appliqué en RLS.

- Mon service aujourd'hui : nouvelles demandes non assignées, en cours, en retard, rendez-vous du jour.
- Mes agents : charge de chacun, dossiers en retard, disponibilité, absences en cours.
- À arbitrer : transitions sensibles demandées, réaffectations, escalades.
- Performance du service : délai moyen, taux de clôture dans les délais, volume par prestation.

## 2.8 Agent — ma journée

Uniquement ses dossiers affectés.

- Ma journée : mes rendez-vous, mes tâches échues et du jour, mes dossiers urgents.
- Mes dossiers : à traiter · en attente de documents · en attente de paiement · en retard.
- Mes messages : messages clients non lus, par dossier.
- Mes chiffres : dossiers clos ce mois, délai moyen, en cours. **Sans classement comparatif avec les autres agents** — un tableau de performance nominatif s'affiche au responsable, pas à l'intéressé.

Traite ses dossiers, change les statuts autorisés, demande et valide des documents, envoie des messages, planifie des rendez-vous, saisit un paiement reçu sans le valider, rédige des notes internes, crée des tâches.

## 2.9 RH — effectif et paie

- Effectif : employés actifs, entrées, sorties, absences du jour.
- À traiter : demandes de congés, fiches de paie à valider, onboarding en cours, évaluations à conduire.
- Charge et performance de l'équipe, calculée depuis les dossiers, jamais saisie à la main.

Modules : employés, paie, congés et absences, onboarding, évaluations, documents RH.

**Cloisonnement strict :** un employé ne voit que ses propres documents RH. Le RH ne voit ni les dossiers clients ni la finance de l'agence.

## 2.10 Modérateur et partenaire

**Modérateur** — contenus du site, FAQ, témoignages à vérifier, avis, messages publics. Aucun accès à la finance, aux RH ni aux dossiers.

**Partenaire** — uniquement les dossiers explicitement partagés avec lui, en lecture, plus le dépôt d'une décision. **Jamais les notes internes, jamais la finance, jamais les autres dossiers.**

---

# PARTIE 3 — ESPACE ACCUEIL & CAISSE

Les trois écrans proposés sont justes et couvrent le parcours réel. Voici la spécification complète.

## 3.1 La règle d'ordre

**Aucun encaissement sans session de caisse ouverte.** L'écran Comptoir POS affiche le bouton d'encaissement désactivé tant que la session n'est pas ouverte, avec le motif visible. Ce n'est pas une préférence : sans fonds d'ouverture déclaré, aucun rapprochement du soir n'est possible, et un écart ne peut être ni détecté ni justifié.

## 3.2 Écran 1 — Comptoir POS

**Étape 1 · Client.** Recherche par nom, téléphone ou référence. **La recherche précède toujours la création** — c'est la première barrière contre les doublons, et l'accueil est l'endroit où ils se créent. Si aucun résultat, création d'une fiche `clients`, avec détection de similitude sur téléphone normalisé et e-mail avant enregistrement.

**Étape 2 · Prestations.** Catalogue alimenté par la table `services`, jamais codé en dur. Recherche, filtres par pôle. Chaque prestation porte son tarif ou la mention « sur devis ». Le ticket accepte plusieurs lignes, avec quantité.

*Trois points à traiter :* les prestations affichées dans la maquette — Visa & e-Visa, Billets & hôtels, Assurance voyage, TCF & études, Services administratifs, Impression & scan, Digitalisation, Nexus IA — doivent chacune exister comme ligne de `services` avec son tarif. « Impression & scan » et « Nexus IA » n'appartiennent à aucun des huit pôles officiels : soit elles y sont rattachées, soit un pôle « Services de proximité » est créé. Et « Frais de tiers » doit être une catégorie distincte du chiffre d'affaires — ce n'est pas un revenu de l'agence mais un débours refacturé, et le confondre fausse tous les rapports.

**Étape 3 · Dossier.** Deux cas, tous deux nécessaires :
- **Rattaché à un dossier** — la prestation entre dans le parcours du client, apparaît dans sa fiche et dans le suivi du dossier.
- **Vente au comptoir** — impression, scan, prestation immédiate sans suivi. Utiliser la table `quick_sales` existante, ne pas créer un dossier vide pour chaque photocopie.

Le choix est explicite, jamais implicite.

**Étape 4 · Paiement.** Espèces, Mobile Money, Carte. Montant reçu et monnaie à rendre calculée. **Paiement partiel** avec reste dû reporté sur la facture du dossier. Chargement d'une facture existante pour encaissement.

**Après encaissement :** génération du reçu au format 80 mm, impression, et enregistrement immédiat du mouvement dans la session de caisse.

**Un point de sécurité :** les paiements électroniques exigent une confirmation vérifiée avant d'être comptés comme encaissés. Un Mobile Money annoncé n'est pas un Mobile Money reçu. Statut « déclaré » jusqu'à confirmation, « encaissé » après. Seul l'encaissé entre dans les totaux.

**Orientation du dossier.** Service destinataire et agent disponible, avec affectation selon les règles du service. La caissière oriente, elle ne traite pas.

## 3.3 Écran 2 — Journée de caisse

La séparation matin / soir de la maquette est la bonne lecture du métier.

**Ouverture.** Sélection de la caisse, saisie du **fonds compté** — distinct des encaissements — et observation libre. Une seule session ouverte à la fois par caisse.

**Contrôle pendant la journée.** Fonds d'ouverture · encaissements en espèces · entrées autorisées · sorties autorisées · espèces théoriques. Les paiements hors espèces sont affichés séparément et **ne sont pas inclus dans le tiroir** — la maquette le précise, c'est juste et c'est la source d'erreur la plus fréquente.

**Rapprochement du soir.** Comptage par coupure : 10 000, 5 000, 2 000, 1 000, 500, puis les pièces. Sous-totaux automatiques. Espèces comptées contre espèces théoriques, écart calculé, justification obligatoire si l'écart n'est pas nul.

**Soumission au responsable.** La caissière soumet, elle ne clôture pas. La validation finale appartient au DAF ou à l'admin. Tout écart, sa justification et sa validation partent dans `audit_log`.

**Journal des mouvements.** Heure, référence, dossier, mode, entrée, sortie, statut, reçu. Filtres Tous / Espèces / Mobile Money / Carte. Export.

## 3.4 Écran 3 — Fiche client de réception

Vue restreinte de la fiche client 360°, adaptée au comptoir : coordonnées · dossiers du client avec agent et prochaine étape · documents reçus à l'accueil avec scan et téléversement · demande de pièce · ouverture et orientation d'un dossier · situation des paiements — facturé, réglé, reste à régler · historique de réception · accès direct au POS et aux reçus.

**Ce que la réception ne voit pas :** les notes internes, la marge, le détail financier de l'agence, les autres services. Le bandeau « Accès limité aux informations nécessaires » de la maquette est exact et doit être appliqué en RLS, pas seulement écrit.

**La réception collecte, le service compétent valide.** Un document déposé à l'accueil arrive au statut « reçu », jamais « validé ».

## 3.5 Permissions du rôle `accueil_caisse`

```
client.read · client.create · client.update.contact
dossier.read.limited · dossier.create · dossier.orient
document.upload · document.request
paiement.record · caisse.session.open · caisse.reconcile.submit
rdv.create · rdv.read
```

**Explicitement refusées :** `paiement.validate` · `caisse.close` · `note_interne.read` · `finance.report.read` · `dossier.status.change` · `facture.validate`.

Séparation des tâches : celle qui encaisse ne valide pas, et ne clôture pas sa propre caisse.

---

# PARTIE 4 — CE QUI EST COMMUN

## 4.1 Navigation

Six groupes repliables, identiques pour tous, filtrés par permission :

**Pilotage** — Vue d'ensemble · Rapports
**Activité** — Dossiers · Clients · Rendez-vous · Tâches
**Finances** — Comptoir POS · Session de caisse · Caisse et transactions · Devis et factures · Dépenses · Commissions
**Organisation** — Ressources humaines · Employés et accès · Partenaires
**Contenus** — Services et tarifs · Communications · Documents
**Système** — Notifications · Journal d'audit · Paramètres

Un module dont le métier n'a pas la permission n'apparaît pas. Pas de grisé, pas de « bientôt disponible ».

## 4.2 Modules uniques, pas de duplication par rôle

**Un seul module Dossiers** pour les dix métiers, avec des vues enregistrées : Boîte de réception · Mes dossiers · À affecter · Prioritaires · En retard · En attente client · Terminés · Archivés.

Idem pour Clients, Rendez-vous, Paiements. La séparation par rôle se fait par les permissions et la RLS, jamais par des pages parallèles.

## 4.3 Chaîne de validation, de bout en bout

```
Caissière encaisse          → paiement « déclaré »
Comptable saisit et rapproche → paiement « à valider »
DAF valide                    → paiement « encaissé »
Caissière soumet le rapprochement → session « à clôturer »
DAF ou admin clôture          → session « clôturée »
DG consulte                   → rapport consolidé
```

Chaque flèche est une permission distincte et une ligne d'`audit_log`. Aucun rôle ne franchit deux étapes.

## 4.4 Ce qui vaut pour tous les écrans

Données réelles uniquement — les zones grises des maquettes sont la bonne pratique en attendant, à condition que le bandeau « Maquette · Données non connectées » disparaisse le jour de la mise en service. Chaque compteur mène à une liste contenant exactement ce nombre de lignes. Palette bleu nuit, ivoire, or — une seule action or par écran. Skeleton au chargement, état vide rédigé, erreur avec cause et remède. Toute action sensible confirmée et tracée.

---

# PARTIE 5 — ORDRE DE CONSTRUCTION

1. **Rôle `accueil_caisse`** ajouté au RBAC, avec ses permissions et ses refus explicites.
2. **Module Dossiers unique** — fusion des trois versions dupliquées, vues enregistrées, raccordement au shell. C'est le patron que tous les modules suivants reprennent.
3. **Module Clients unique**, avec la fiche 360° et sa vue restreinte de réception.
4. **Espace Accueil & caisse** — session de caisse d'abord, POS ensuite. Dans cet ordre : sans session, le POS ne peut pas encaisser.
5. **Espaces DAF et Comptable** — chaîne de validation complète.
6. **Espaces DG et Responsable de service** — lecture et arbitrage, sur des modules qui existent enfin.
7. **Espace RH** — raccordement du module existant au shell.
8. **Vue d'ensemble super-admin et admin** — en dernier. Un tableau de bord ne peut pointer que vers des modules qui existent.

Chaque étape : présentée avant écriture, testée sur les dix rôles avec les comptes `TEST_`, déployée en prévisualisation, validée avant la suivante.
