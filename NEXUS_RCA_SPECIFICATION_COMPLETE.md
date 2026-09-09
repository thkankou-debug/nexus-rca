# NEXUS RCA — SPÉCIFICATION COMPLÈTE DE LA PLATEFORME
**Document d'exécution. Toutes les décisions sont prises. Aucune question ouverte.**
8 septembre 2026 · Décideur : Thierry F. Kankou · Exécutant : Claude Code

---

# PARTIE 0 — DÉCISIONS DÉFINITIVES

Ces points ne sont plus à discuter. Ils sont tranchés, ils s'appliquent partout.

| # | Décision |
|---|---|
| 1 | Identité : **bleu nuit `#021030` · ivoire `#F5F3F0` · or `#B99760`**. Texte bleu nuit sur bouton or. L'orange disparaît de toute la plateforme, sauf du logo, conservé tel quel |
| 2 | Finance : colonnes canoniques **`status`, `amount`, `method`**. Les colonnes héritées restent en base, ne sont jamais lues |
| 3 | Le dossier, c'est **`demandes`**. Aucune table `dossiers` n'est créée |
| 4 | La personne, c'est **`clients`**. `profiles` est le compte d'authentification, relié par `clients.profile_id` |
| 5 | Les rendez-vous, c'est **`appointments`**. `rendez_vous` est morte, conservée en base, jamais lue ni écrite |
| 6 | La source de vérité des services, c'est **la table `services`**. `lib/services.ts` est supprimé. `SERVICES_COMPLETS` en est dérivé à l'exécution |
| 7 | Présence : **Bangui (siège) · Canada (bureau) · Europe (représentation)**. Formulation identique partout |
| 8 | Images : **aucune photo de stock**. Les Unsplash sont retirées et non remplacées tant qu'une photo réelle et autorisée n'existe pas. Texte seul entre-temps |
| 9 | Comptes de test autorisés, préfixe `TEST_`, indicateur `is_test`, exclus de tout compteur et export |
| 10 | Aucun chiffre sans requête réelle. Aucune variation en pourcentage sous 30 jours d'historique et 20 unités de dénominateur |
| 11 | Aucune permission garantie par le masquage d'un bouton. RLS + serveur + interface, les trois |
| 12 | `main` reste figé jusqu'à validation explicite. Tout vit sur `v3/integration-v3` |

---

# PARTIE 1 — LE PRINCIPE D'ARCHITECTURE

## 1.1 Une seule application, pas six

Aujourd'hui `app/dashboard/admin`, `app/dashboard/super-admin` et `app/dashboard/agent` contiennent chacun leurs propres pages pour les mêmes objets : demandes, dossiers, paiements. Trois fois le même écran, trois fois la même logique, trois divergences futures. C'est la cause première du désordre.

**Cible : un jeu de modules unique, sous `app/dashboard/`, filtré par permission.**

```
app/dashboard/
  layout.tsx              → AdminShell (navigation calculée côté serveur)
  page.tsx                → Vue d'ensemble, composée selon le rôle
  dossiers/               → un seul module, vues enregistrées
  clients/
  rendez-vous/
  taches/
  finances/
  rh/
  equipe/
  contenus/
  systeme/
```

Il n'y a **plus** de `super-admin/`, `admin/`, `agent/`. Un DAF et un agent ouvrent `/dashboard/dossiers` : ils voient la même page, avec des données et des actions différentes selon leurs permissions. C'est le RBAC qui différencie, jamais l'URL.

**Migration :** les anciennes routes redirigent en 301 vers les nouvelles, puis sont supprimées une fois qu'aucun lien n'y renvoie.

## 1.2 Le shell

`AdminShell` est le layout de `/dashboard`. Toutes les pages passent par lui, sans exception.

**Barre latérale**, 260 px, repliable à 64 px, six groupes repliables. Logo Nexus, nom et rôle de l'utilisateur en pied. Les compteurs affichent ce qui réclame une action **de cet utilisateur**, jamais un total.

**Barre supérieure** : fil d'Ariane à gauche ; à droite recherche globale ⌘K, bouton d'action rapide, centre de notifications, menu profil.

**Recherche globale ⌘K** : cherche dans dossiers (référence, nom du client), clients (nom, e-mail, téléphone), factures et devis (numéro), employés. Résultats groupés par type, filtrés par les permissions du demandeur. Navigation au clavier.

**Bouton d'action rapide** : nouveau dossier · nouveau client · nouveau rendez-vous · nouvelle dépense · nouveau devis. La liste s'adapte aux permissions.

---

# PARTIE 2 — NAVIGATION ET PERMISSIONS

## 2.1 Les modules

| Groupe | Module | Route | Permission d'accès |
|---|---|---|---|
| **Pilotage** | Vue d'ensemble | `/dashboard` | tout membre du personnel |
| | Rapports | `/dashboard/rapports` | `finance.report.read` |
| **Activité** | Dossiers | `/dashboard/dossiers` | `dossier.read.*` |
| | Clients | `/dashboard/clients` | `client.read` |
| | Rendez-vous | `/dashboard/rendez-vous` | `rdv.read` |
| | Tâches | `/dashboard/taches` | `tache.read` |
| **Finances** | Vue d'ensemble | `/dashboard/finances` | `finance.report.read` |
| | Devis et factures | `/dashboard/finances/factures` | `facture.read` |
| | Paiements | `/dashboard/finances/paiements` | `paiement.read` |
| | Dépenses | `/dashboard/finances/depenses` | `depense.read` |
| | Caisse | `/dashboard/finances/caisse` | `caisse.read` |
| | Commissions | `/dashboard/finances/commissions` | `commission.read` |
| **Organisation** | Ressources humaines | `/dashboard/rh` | `rh.read` |
| | Équipe et accès | `/dashboard/equipe` | `rh.user.create` |
| | Partenaires | `/dashboard/partenaires` | `cms.partenaire.write` |
| **Contenus** | Services et tarifs | `/dashboard/contenus/services` | `cms.service.write` |
| | Pages et textes | `/dashboard/contenus/pages` | `cms.content.write` |
| | FAQ | `/dashboard/contenus/faq` | `cms.faq.write` |
| | Communications | `/dashboard/communications` | `message.read` |
| **Système** | Notifications | `/dashboard/notifications` | tout membre du personnel |
| | Journal d'audit | `/dashboard/systeme/audit` | `audit.read` |
| | Paramètres | `/dashboard/systeme/parametres` | `settings.write` |

Un module dont l'utilisateur n'a pas la permission **n'apparaît pas dans le menu et sa route renvoie 403 côté serveur**. Le menu est calculé sur le serveur ; la liste complète ne part jamais dans le HTML.

## 2.2 Ce que voit chaque rôle

| Module | super_admin | admin | dg | daf | chef_service | agent | comptable | rh | moderateur | partenaire |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Vue d'ensemble | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Rapports | ✓ | ✓ | ✓ | ✓ | service | — | ✓ | — | — | — |
| Dossiers | tous | tous | tous | tous | service | siens | — | — | — | partagés |
| Clients | ✓ | ✓ | ✓ | ✓ | service | siens | — | — | — | — |
| Rendez-vous | ✓ | ✓ | ✓ | — | service | siens | — | — | — | — |
| Tâches | ✓ | ✓ | ✓ | — | service | siennes | — | — | — | — |
| Finances | ✓ | ✓ | lecture | ✓ | — | — | saisie | — | — | — |
| Caisse | ✓ | — | lecture | ✓ | — | — | saisie | — | — | — |
| Commissions | ✓ | ✓ | lecture | ✓ | — | siennes | — | — | — | siennes |
| RH | ✓ | ✓ | lecture | — | — | — | — | ✓ | — | — |
| Équipe et accès | ✓ | ✓ | — | — | — | — | — | ✓ | — | — |
| Contenus | ✓ | ✓ | — | — | — | — | — | — | ✓ | — |
| Communications | ✓ | ✓ | ✓ | — | service | siennes | — | — | ✓ | — |
| Journal d'audit | ✓ | ✓ | ✓ | — | — | — | — | — | — | — |
| Paramètres | ✓ | — | — | — | — | — | — | — | — | — |

**Séparation des tâches, non négociable** : le `comptable` saisit, le `daf` valide. L'`agent` demande, le `chef_service` approuve. Personne ne valide ce qu'il a saisi.

---

# PARTIE 3 — LA VUE D'ENSEMBLE, RÔLE PAR RÔLE

Une seule route `/dashboard`. Le contenu est composé de blocs, chaque bloc conditionné par une permission. Aucun chiffre sans requête. Aucun bloc décoratif.

## 3.1 Blocs disponibles

| Bloc | Contenu | Source | Permission |
|---|---|---|---|
| **À traiter** | nouvelles demandes non assignées · en attente du client · en traitement · en retard | `demandes`, une requête agrégée | `dossier.read.*` |
| **Pipeline** | compte par statut, chaque étape cliquable | `demandes` | `dossier.read.*` |
| **Aujourd'hui** | rendez-vous du jour · activité des 15 derniers événements | `appointments`, `demande_status_history`, `payments` | `rdv.read` |
| **Alertes** | dossiers hors délai · paiements en retard · documents rejetés sans relance · dossiers sans agent depuis 48 h | requêtes dédiées | `dossier.read.*` |
| **Mes tâches** | tâches ouvertes de l'utilisateur, triées par échéance | `taches` | `tache.read` |
| **Trésorerie** | encaissé sur la période · en attente · dépenses validées · solde de caisse | `payments`, `expenses`, `caisse_sessions` | `finance.report.read` |
| **Validations en attente** | devis à valider · factures à valider · dépenses à valider · paiements à valider | tables concernées | permission de validation correspondante |
| **Charge par agent** | dossiers ouverts par agent, délai moyen de traitement | `demandes` | `dossier.read.all` ou `.service` |
| **Performance par service** | dossiers reçus, terminés, délai moyen, revenus | `demandes` + `payments` | `finance.report.read` |
| **RH** | absences du jour · contrats arrivant à échéance · paie du mois | module RH | `rh.read` |
| **Équipe** | comptes actifs, comptes désactivés, dernières connexions | `profiles` | `rh.user.create` |

## 3.2 Composition par rôle

**Super-administrateur** — À traiter · Alertes · Pipeline · Trésorerie · Validations en attente · Charge par agent · Performance par service · Équipe · Aujourd'hui.

**Administrateur** — À traiter · Alertes · Pipeline · Trésorerie · Validations en attente · Charge par agent · Aujourd'hui.

**Directeur général** — Alertes · Performance par service · Trésorerie · Pipeline · Charge par agent · RH. Lecture seule sur la finance : le DG constate, il ne saisit pas.

**Responsable financier (DAF)** — Trésorerie · Validations en attente (devis, factures, dépenses, paiements) · Encaissements du jour · Impayés par ancienneté · Performance par service. Aucun bloc RH.

**Comptable** — Saisies du jour · Pièces manquantes · Paiements à rapprocher · Dépenses en attente de validation. Aucun bloc de validation : il n'en a pas le droit.

**Responsable de service** — À traiter (son service) · Alertes (son service) · Charge de ses agents · Pipeline de son service · Aujourd'hui.

**Agent** — Mes dossiers à traiter · Mes tâches · Mes rendez-vous du jour · Mes messages non lus · Mes dossiers en retard. Rien d'autre : un agent n'a pas besoin d'un tableau de bord de direction.

**RH** — Absences du jour · Contrats à échéance · Paie du mois · Onboarding en cours · Évaluations à mener.

**Modérateur** — Contenus à vérifier · Témoignages en attente · Messages signalés.

**Partenaire** — Dossiers qui lui sont partagés · Décisions attendues de lui · Ses commissions.

## 3.3 Règles de rendu

Chaque compteur est **cliquable** et ouvre la liste filtrée qui contient exactement ce nombre de lignes. C'est le test de vérité : si le compteur dit 24 et la liste 19, le compteur est faux.

Chaque bloc a son squelette de chargement à la forme du contenu, son état vide rédigé, son état d'erreur avec cause et bouton réessayer. Les blocs se chargent **indépendamment** : aucun ne retarde les autres.

Aucun dégradé, aucune animation d'entrée, aucune ombre décorative, aucun chiffre en très grand corps. Une seule action or par écran.

---

# PARTIE 4 — LE CRM COMPLET

## 4.1 Module Dossiers

**Une seule page**, `/dashboard/dossiers`, avec des vues enregistrées en onglets : Boîte de réception · Mes dossiers · Actifs · Urgents · En retard · En attente client · Terminés · Archivés. Chaque utilisateur peut créer et enregistrer ses propres vues.

**Trois présentations** commutables : liste, Kanban sur la machine à états, calendrier par échéance.

**Tableau** : référence · client · service · statut · priorité · agent · date limite · montant. Tri, recherche, filtres (service, statut, agent, priorité, période, pôle), sélection multiple, pagination, choix des colonnes, densité confortable ou compacte, export CSV.

**Actions groupées** : affecter à un agent · changer le statut · définir la priorité · exporter. Chacune vérifiée côté serveur, tracée dans `audit_log`, avec confirmation nommant le nombre d'éléments.

**Fiche dossier** — en-tête : référence, client, service, statut, priorité, agent, date de création, échéance avec le nombre de jours restants. Barre de progression sur les étapes.

Onglets : **Résumé** (données de la demande, coordonnées, origine) · **Documents** (fournis, demandés, manquants, validés, rejetés avec motif) · **Messages** (échanges avec le client) · **Notes internes** (jamais visibles du client, repère visuel permanent) · **Paiements** (devis, factures, versements, reste dû) · **Rendez-vous** · **Tâches** · **Historique** (chaque changement, qui, quand, ancienne et nouvelle valeur).

Panneau d'actions fixe : changer le statut · demander un document · envoyer un message · enregistrer un paiement · créer un devis · planifier un rendez-vous · créer une tâche · réaffecter · archiver.

**Machine à états** — transitions déclarées dans un objet typé, validées côté serveur, chacune écrivant dans `demande_status_history` **et** `audit_log` :

```
nouvelle_demande → qualification
   ├→ documents_demandes ⇄ dossier_incomplet → etude_faisabilite → devis_envoye
   │     ├→ devis_accepte → paiement_attente → traitement
   │     └→ refuse
   └→ annule
traitement → transmis_partenaire → decision_recue → { termine | refuse }
{termine | refuse | annule} → archive
```

Retour arrière réservé à `admin` et `super_admin`, motif obligatoire.

## 4.2 Module Clients — fiche 360°

**Liste** : nom, type (prospect ou client), origine du contact, service principal, nombre de dossiers, montant total, dernier contact, agent référent. Filtres et export.

**Fiche client**, onglets : **Identité** (coordonnées, origine, pôle d'intérêt, agent référent, compte lié) · **Dossiers** (tous ses dossiers, tous statuts) · **Rendez-vous** · **Communications** · **Documents** · **Finance** (devis, factures, paiements, solde restant) · **Notes internes** · **Chronologie** (tous les événements de la relation, dans l'ordre).

**Boîte de réception des entrées** : `contacts`, `contact_demandes`, `appointment_requests` et les demandes du site convergent dans une file unique. Pour chaque entrée : qualifier, prioriser, affecter, rattacher à une fiche client existante ou en créer une, puis convertir en dossier — ce qui est un **changement d'étape**, pas un changement de table.

**Dédoublonnage** : à chaque rattachement, détection par e-mail normalisé et téléphone au format international. La fusion est **proposée à un humain, jamais automatique**, tracée dans `audit_log`, sans suppression de la fiche absorbée.

## 4.3 Module Rendez-vous

Vue calendrier (jour, semaine, mois) et vue liste. Chaque rendez-vous relié au client, au dossier et à l'agent. Statuts : demandé, confirmé, honoré, annulé, absent. Confirmation et rappel automatiques via le centre de notifications. Créneaux d'indisponibilité par agent. Historique complet.

## 4.4 Module Tâches

Tâches liées à un client, à un dossier ou libres. Responsable, priorité, échéance, statut. Vues : mes tâches, tâches de mon service, tâches en retard. Rappels. Relances client suivies comme des tâches, avec leur historique.

## 4.5 Module Communications

Fil unifié des `demande_messages`, par dossier et par client. Auteur, horodatage, pièces jointes, accusé de lecture. Modèles de message réutilisables. Architecture prête pour e-mail, SMS et WhatsApp via des adaptateurs d'une interface commune, inactifs tant que les fournisseurs ne sont pas configurés.

**Les notes internes sont un objet distinct**, dans une table distincte, avec une RLS distincte, et un repère visuel permanent. Jamais dans le même fil.

---

# PARTIE 5 — FINANCE

## 5.1 Devis

Création depuis un dossier, lignes libres ou issues du catalogue `services`, remise, validité, conditions. Statuts : brouillon, envoyé, accepté, refusé, expiré. Envoi au client dans son portail. **L'acceptation fige un instantané** du devis — montants, lignes, conditions — avec horodatage, identité, IP et ligne d'audit. Un devis accepté n'est plus modifiable. Numérotation `DEV-YYYY-NNNNNN` par séquence Postgres.

## 5.2 Factures

Générées depuis un devis accepté ou créées directement. Statuts : brouillon, validée, partiellement payée, payée, annulée. Échéancier possible. Reste dû calculé, jamais saisi. Relances automatiques à l'approche et au dépassement de l'échéance. Validation réservée au DAF et au super-administrateur. Annulation par avoir, jamais par suppression. Numérotation `FAC-YYYY-NNNNNN`.

## 5.3 Paiements

Enregistrement multi-méthodes : espèces, Orange Money, MTN, virement, Stripe, Express. Paiements partiels. Rapprochement avec les factures. Séparation stricte saisie / validation. Aucune suppression, jamais, pour aucun rôle. Numérotation `REC-YYYY-NNNNNN` pour les reçus.

## 5.4 Dépenses et caisse

Dépenses par catégorie comptable, avec justificatif, saisie par l'agent, validation par le DAF. Sessions de caisse : ouverture avec fonds initial, mouvements, solde théorique, solde réel compté, écart justifié, clôture. La clôture est irréversible et tracée.

## 5.5 Commissions

Barème par agent ou partenaire, par service ou par montant. Calcul automatique à l'encaissement, validation manuelle, état de paiement. Chaque bénéficiaire voit les siennes.

## 5.6 Rapports

Journalier, mensuel, annuel, et période personnalisée. Contenu : encaissements par méthode et par service, dépenses par catégorie, solde net, impayés par ancienneté, performance par agent et par service. Export CSV et PDF.

**Tout montant provient de `amount`, tout statut de `status`.** Un même mois donne le même total sur le tableau de bord, dans le rapport, dans la page caisse et dans l'export. C'est le critère d'acceptation.

## 5.7 Documents PDF

**Un composant d'en-tête unique** pour les six familles de documents, alimenté par `agency_settings` : logo Nexus RCA, dénomination juridique, forme, RCCM, numéro fiscal, adresse, coordonnées. Pied de page avec pagination et mentions légales.

Généré avec `pdf-lib`, **police embarquée couvrant les diacritiques français** — « Généré le », « Dépenses », « Réglé », sans exception. Test de recette : un document contenant `é è ê à ç ù û ô ï` sort intact.

Palette bleu nuit, ivoire, or. Aucun orange. L'or est un filet ou un aplat, jamais du texte sur blanc. Rendu vérifié en niveaux de gris.

**Reçu de caisse en 80 mm** en plus du A4 : colonne unique, chiffres à chasse fixe, logo monochrome, sans aplat, longueur variable. Le reçu thermique est une copie de courtoisie ; la pièce qui fait foi est le PDF conservé.

**Les documents déjà émis ne sont jamais régénérés.**

---

# PARTIE 6 — RESSOURCES HUMAINES

Employés (fiche, contrat, poste, service, ancienneté) · comptes et rôles · affectation aux services · absences et congés avec soldes et validation · paie et bulletins · onboarding avec modèles de tâches · évaluations par période · documents RH · charge de travail et délai moyen de traitement par agent · historique des affectations.

Le module existe déjà et fonctionne. **Il est rhabillé dans le shell unique, pas réécrit.** On y ajoute les tâches, l'historique d'affectation, et le branchement de la charge de travail sur des données réelles.

---

# PARTIE 7 — CONTENUS ET SITE PUBLIC

## 7.1 Administration des contenus

Le super-administrateur gère sans toucher au code : services et pôles (description, tarif ou « sur devis », documents demandés, délais, étapes, `is_featured`, `display_order`) · pays et destinations · FAQ · partenaires · témoignages vérifiés · bureaux · informations institutionnelles · textes et appels à l'action du site.

**Chaque champ institutionnel porte `is_verified` et `is_published`.** Il ne s'affiche que si les trois conditions sont réunies : renseigné, vérifié, publié. Toute modification de valeur remet `is_verified` à `false`, par trigger en base.

## 7.2 Site public — mobile d'abord

**Conception mobile en premier**, la version bureau en découle. Largeurs de contrôle 360, 390, 430 px, en français et en anglais.

Page d'accueil : en-tête compact (logo, menu, langues) · hero éditorial avec « Soumettre une demande » comme action principale et « Découvrir nos expertises » en secondaire · engagements vérifiables · **les huit pôles, tous affichés, issus de la table `services`** · méthode · contact · pied de page avec les mentions légales.

Une page par service, sur un gabarit unique alimenté par `services` — la factorisation des 14 pages actuelles est le chantier central. Formulaires : libellés visibles, champs à 16 px minimum pour éviter le zoom iOS, `dvh` plutôt que `vh`, `safe-area-inset`, cibles tactiles de 44 px, brouillon local contre la perte de saisie, erreurs compréhensibles, confirmation explicite.

Image de couverture : 250 Ko maximum, AVIF avec repli WebP, recadrage mobile distinct. Lighthouse ≥ 90 sur les quatre axes, mesuré en profil mobile.

## 7.3 Portail client

Suivi d'avancement et étapes · téléversement · documents manquants et demandes de correction · consultation et acceptation des devis · factures et reçus téléchargeables par route serveur · suivi des paiements et reste dû · rendez-vous · échange avec son conseiller · notifications · documents officiels délivrés · historique.

**Aucune note interne, aucune donnée administrative sensible.** Testé en changeant l'identifiant dans l'URL sur chaque écran.

---

# PARTIE 8 — SÉCURITÉ ET TRAÇABILITÉ

RLS sur les 40 tables, sans exception. `assertPermission()` en première ligne de chaque action mutante. `<Can>` pour le confort visuel seulement. Rôle dans `profiles.role`, protégé par trigger contre l'auto-élévation. Fonctions `SECURITY DEFINER` à `search_path` fixé. Rate-limiting sur tous les endpoints publics. Liens de paiement par jeton aléatoire, jamais par référence.

**`audit_log` immuable** : aucune policy `UPDATE` ni `DELETE`, pour aucun rôle, y compris `super_admin`. Alimenté sur les changements de statut, les affectations, les validations financières, les modifications de rôle, les fusions de fiches, les suppressions, les exports. Contenu : utilisateur, rôle au moment de l'action, action, entité, identifiant, ancienne et nouvelle valeur, horodatage, IP, agent utilisateur. Champs sensibles masqués dans les diffs.

---

# PARTIE 9 — ORDRE D'EXÉCUTION

Chaque lot : présentation du périmètre → GO → exécution → tests → commit et push → récapitulatif → arrêt.

| Lot | Contenu | Pourquoi ici |
|---|---|---|
| **L1** | `ServicesGrid.tsx` et `lib/services.ts` : couleurs, liens, suppression des Unsplash, lecture de `services`, formulation de la présence internationale | Court, isolé, visible immédiatement |
| **L2** | Comptes de test `TEST_` par rôle, fiche client de test, lien de paiement de test, indicateur `is_test` filtré partout. Exécution du test (f) de P1b | Débloque toute vérification ultérieure |
| **L3** | `AdminShell` sur `/dashboard` : layout unique, navigation par permissions, ⌘K, notifications, fil d'Ariane. Anciennes routes en redirection | Le socle de tout le reste |
| **L4** | Fusion des modules dupliqués : un seul `dossiers`, un seul `clients`, un seul `paiements`. Suppression des variantes par rôle | Réduire avant d'habiller |
| **L5** | Vue d'ensemble : blocs conditionnés par permission, composition par rôle, `PilotageHero` supprimé | Remplace le décoratif par l'opérationnel |
| **L6** | Module Dossiers complet : vues enregistrées, Kanban, fiche à onglets, actions groupées | Le cœur du métier |
| **L7** | Module Clients : fiche 360°, boîte de réception des entrées, dédoublonnage | Le CRM proprement dit |
| **L8** | Rendez-vous, Tâches, Communications | Complètent le CRM |
| **L9** | Finance : écrans manquants, rapports journalier et annuel, en-tête PDF unique, accents corrigés, reçu 80 mm | Ce que tu utilises tous les jours |
| **L10** | RH rhabillé, tâches, charge de travail réelle | Module existant, à raccorder |
| **L11** | Contenus : écrans CMS restants | Alimente le public |
| **L12** | Migration or : les 14 pages `services/*` et les 248 fichiers restants, par lots | Long, mécanique, sans risque |
| **L13** | Site public mobile d'abord : gabarit de page service, hero, huit pôles, formulaires, SEO, Lighthouse | Dépend du CMS |
| **L14** | Portail client : devis, factures, documents officiels, demandes de correction | Dépend de la finance |
| **L15** | Notifications multicanal | Dépend du reste |
| **L16** | Durcissement : tests des dix rôles, documentation, retrait de la vitrine, fusion vers `main` | Fin |

---

# PARTIE 10 — DÉFINITION DE « TERMINÉ »

Un lot n'est terminé que si **tous** ces points sont vrais :

1. `npx tsc --noEmit` sans erreur, sortie collée en clair.
2. `npm run lint` sans erreur, sortie collée.
3. `npm run build` en succès, sortie collée.
4. Chaque rôle concerné testé avec les comptes `TEST_`, résultats en tableau : ce qui est accessible, ce qui est refusé.
5. Chaque compteur affiché mène à une liste contenant exactement ce nombre de lignes.
6. `grep` sur `Math.random`, `fake`, `mock`, `demo`, `placeholder` dans le lot : zéro occurrence.
7. `grep` sur `nexus-orange` dans les fichiers du lot : zéro occurrence.
8. Checklist de non-régression repassée : authentification, parcours client, parcours agent, site public, page de paiement.
9. Récapitulatif rendu avec l'URL de prévisualisation.
10. Aucune migration destructive, aucune donnée supprimée, `main` intact.

**Une phase n'est pas terminée parce qu'un fichier existe.** Elle l'est quand Thierry a ouvert la page et l'a validée.

---

*Cette spécification remplace la feuille de route pour tout ce qu'elle couvre. Première action : L1.*
