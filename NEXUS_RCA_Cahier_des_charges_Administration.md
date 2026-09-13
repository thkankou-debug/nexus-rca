# NEXUS RCA
## Cahier des charges — Administration, espaces métiers, CRM et caisse

Version 1.0 • 12 septembre 2026

Décideur : Thierry F. Kankou

Objet : concevoir une plateforme administrative intégrée, avec un espace de travail adapté à chacun des 11 profils de la capture, un centre de pilotage et des circuits de communication et de décision dans les deux sens de la hiérarchie.

Statut : spécification cible à valider. Ce document décrit les comportements attendus ; il ne certifie pas leur présence dans le dépôt ou dans un déploiement. La rédaction n’autorise ni migration ni modification du site. L’exécution reste soumise à la boucle de présentation et de GO par phase de la feuille de route V3.

## Sommaire

1. Finalité et règles de réussite
2. Périmètre et articulation avec la V3
3. Organisation et circulation de l’information
4. Interface commune et centre de pilotage
5. Les 11 espaces métiers
6. Matrice des responsabilités et permissions
7. CRM partagé et cycle de vie des dossiers
8. Accueil, POS et journée de caisse
9. Finance et validation
10. Consignes, alertes, escalades et collaboration
11. Documents, rendez-vous et ressources humaines
12. Catalogue des services, contenus et partenaires
13. Indicateurs et chiffre honnête
14. Architecture fonctionnelle et données
15. Sécurité et confidentialité
16. Réseau, performances et accessibilité
17. Raccordement réel et déploiement
18. Recette et critères d’acceptation
19. Plan de livraison et arbitrages

## 1. Finalité et règles de réussite

NEXUS RCA doit disposer d’un outil de travail quotidien : accueillir une personne, retrouver son identité, ouvrir son dossier, facturer une prestation, recevoir son paiement, orienter son dossier, exécuter la prestation, suivre les délais et rendre compte à la direction.

Les tableaux de bord sont des vues personnalisées sur les mêmes objets métier. Un dossier ne doit pas être recopié dans une base par rôle. Une décision prise à un niveau supérieur doit être retrouvée dans le dossier concerné et dans la liste d’actions de son exécutant.

EX-01 — Chaque action attendue possède un responsable identifié, une échéance lorsqu’elle est nécessaire, un statut et un accès au dossier source.

EX-02 — Chaque indicateur ouvre la liste exacte qui le compose, avec les mêmes filtres, droits et période de référence.

EX-03 — Un écran opérationnel met d’abord en évidence les actions à réaliser. Les grandes bannières de bienvenue, scores sans définition, illustrations décoratives et courbes sans utilité sont exclus.

EX-04 — Une fonctionnalité n’est livrée que lorsqu’elle est raccordée à une route réelle, utilisable par son rôle, autorisée côté serveur et base, et visible sur la prévisualisation remise à Thierry.

EX-05 — Les remontées d’information et les instructions descendantes sont tracées. Une notification lue n’équivaut ni à une acceptation ni à une exécution.

EX-06 — La réception habilitée est le seul point d’encaissement humain au comptoir. Les agents de traitement, le comptable et les responsables ne doivent pas recevoir directement un paiement de client par leur interface.

## 2. Périmètre et articulation avec la V3

Les 11 profils visibles sur la capture sont : Super-admin, Admin, DG, DAF, Comptable, Chef de service, Accueil & caisse, Agent, Modérateur, Partenaire et Client. Chacun dispose d’un espace métier défini ci-dessous.

La V3 initiale définit neuf rôles staff et un portail client. Le présent besoin ajoute explicitement l’espace Accueil & caisse. Son identifiant technique proposé est `reception_cashier`, à confirmer après audit de l’enum et des permissions ; aucun rôle existant ne doit être supprimé ni transformé implicitement.

Ce cahier des charges complète la V3. Toute divergence de droits est explicitée au §6 et soumise à validation avant implémentation. Les décisions D1 à D8 restent applicables, y compris celles qui attendent encore un arbitrage documenté.

Sont inclus : identité client, réception, dossiers, documents, tâches, rendez-vous, messages, notes internes, devis, factures, paiements, caisse, dépenses, validation, reporting, utilisateurs, ressources humaines existantes, contenus, partenaires et audit.

Les huit pôles officiels structurent le catalogue : Visa et mobilité ; Digitalisation et technologie ; Financement et incubation ; Accompagnement business ; Réseau international ; Études internationales ; Assurance et voyage ; Services administratifs. Chaque pôle peut contenir plusieurs prestations. Le nombre de pôles n’est pas le nombre de services vendus.

Les prestations, tarifs, pièces requises et formulaires doivent provenir du catalogue réel, réconcilié avec les pages existantes. Aucune nouvelle prestation commerciale ou tarification n’est inventée par le développement.

Ne sont pas inclus sans cadrage distinct : moteur bancaire, opérations réglementées de change ou de transfert, paie complète, promesse d’intelligence artificielle décisionnelle, remplacement d’un logiciel comptable réglementaire. Les prestations éventuellement concernées utilisent un circuit dédié après validation de leurs exigences.

## 3. Organisation et circulation de l’information

### 3.1 Responsabilité et autorisation sont deux notions différentes

Le Super-admin gouverne les accès et les paramètres. Le DG dirige l’activité et arbitre. L’Admin coordonne les opérations. Le DAF pilote le contrôle financier. Les chefs de service dirigent le traitement. Le comptable prépare et rapproche. L’accueil reçoit, ouvre les dossiers et encaisse. Les agents réalisent les prestations. Le modérateur gère les contenus autorisés. Les partenaires et clients restent dans leurs périmètres externes.

La hiérarchie ne doit pas être implémentée par un rang donnant automatiquement tous les droits des niveaux inférieurs. Un DG n’a pas automatiquement le droit de modifier un rôle ; un chef de service n’a pas automatiquement le droit de valider une caisse.

L’organigramme nominatif, les responsables de service et les délégations sont administrables. Les circuits suivants constituent la cible proposée ; les titulaires restent à désigner.

| Flux | Émetteur | Destinataire | Résultat attendu |
| --- | --- | --- | --- |
| Difficulté de traitement | Agent | Chef de service | Arbitrage, aide, réaffectation ou escalade |
| Blocage interservices | Chef de service | Admin, puis DG si nécessaire | Décision avec responsable et échéance |
| Écart de caisse | Accueil & caisse | DAF ; comptable pour rapprochement | Analyse et décision financière tracées |
| Anomalie comptable | Comptable | DAF | Retour motivé ou validation |
| Risque majeur | Admin ou DAF | DG ; Super-admin si incident d’accès | Arbitrage ou mesure de protection |
| Priorité opérationnelle | DG | Admin et responsables concernés | Consignes déclinées en tâches |
| Affectation | Admin ou Chef de service | Agent désigné | Acceptation et suivi du dossier |
| Retour financier | DAF | Comptable ou Accueil & caisse | Correction identifiable, sans effacement |
| Demande de pièce | Agent | Client concerné | Dépôt, contrôle et reprise du traitement |
| Retour partenaire | Partenaire | Responsable du dossier | Vérification avant décision interne |

### 3.2 Interconnexion attendue

Une ouverture de dossier à l’accueil apparaît dans le CRM, dans la file du service destinataire et dans les agrégats autorisés. Le client voit une version publique de son suivi lorsque son compte est relié.

Un paiement enregistré au comptoir apparaît dans le dossier, la session de caisse, le rapprochement comptable et le contrôle du DAF, avec un statut explicite. Il ne devient pas un revenu définitivement validé par simple propagation entre écrans.

Une consigne du DG crée une instruction suivie. L’Admin peut la répartir en tâches ; les responsables et agents rendent compte ; le DG voit l’avancement et les blocages. Les accusés de réception sont individuels, y compris lorsque le destinataire initial est un service.

Les remontées sont agrégées pour éviter de notifier toute la direction à chaque clic. Les incidents critiques disposent d’un circuit immédiat. La consultation ascendante reste filtrée par la confidentialité : les données RH privées ne remontent pas dans un tableau financier général.

## 4. Interface commune et centre de pilotage

### 4.1 Shell réellement partagé

Un shell commun fournit la navigation, le fil d’Ariane, la recherche, les notifications, le profil, le service actif et les préférences. Son contenu est calculé côté serveur à partir des permissions effectives.

Six groupes de navigation sont conservés : Pilotage, Activité, Finances, Organisation, Contenus et Système. Seuls les modules fonctionnels et autorisés sont affichés. Le portail client et l’espace partenaire utilisent une navigation simplifiée adaptée à leurs usages.

La barre latérale mesure 240 px, repliable à 64 px. La barre supérieure contient le contexte, la recherche globale, les notifications et le menu utilisateur. Les résultats de recherche, suggestions et compteurs sont eux-mêmes filtrés par les droits.

Les écrans proposent des vues enregistrées, filtres, tri, pagination, colonnes configurables, densité mémorisée et export autorisé. L’export reprend le périmètre filtré, sa date de référence et les restrictions de données sensibles.

### 4.2 Composition du tableau de bord

Chaque espace présente un titre métier, les actions prioritaires, une table de travail, les échéances du jour et les alertes. Les détails s’ouvrent dans une fiche ou un panneau sans perdre les filtres de la liste.

Les blocs se chargent indépendamment. Les états suivants sont obligatoires : chargement, aucune donnée, donnée indisponible, accès refusé, erreur récupérable, envoi en cours et succès confirmé. Une erreur de chargement ne produit jamais un faux zéro.

### 4.3 Identité visuelle

Bleu nuit pour la navigation et les textes structurants ; blanc et ivoire pour les surfaces ; or discret pour l’action principale avec texte bleu nuit. Une seule action principale or par écran. Les erreurs, attentes et succès ont leurs propres couleurs sémantiques.

Typographie sans-serif unique dans l’administration, chiffres tabulaires, graisse maximale 600. Lignes de tableau 44 px ou 36 px. Rayons de 6 px pour les éléments interactifs et 8 px pour les conteneurs. Ombres réservées aux éléments flottants. Aucun globe, dégradé décoratif, bannière de couverture ou animation d’entrée dans les écrans de gestion.

Les statuts utilisent un point et un libellé lisible sur fond neutre. Les notes internes portent une mention permanente « Interne — invisible au client ».

## 5. Les espaces métiers

### 5.1 Super-admin — Gouvernance et contrôle global

Mission : administrer la plateforme, les habilitations, les règles transversales et les exceptions autorisées.

Page d’entrée : « Centre de pilotage ». Blocs : décisions en attente, activité globale, risques et incidents, état des circuits de validation. Filtres : période, service, agence réellement configurée et responsable.

Écrans : vue d’ensemble ; opérations ; utilisateurs et accès ; organigramme ; délégations ; audit ; paramètres ; supervision des intégrations ; finance selon permissions ; contenus et catalogue.

Actions : attribuer ou retirer un rôle, suspendre un compte, configurer les circuits et seuils, consulter les actions sensibles, traiter une exception justifiée. Une modification de ses propres droits ou une dérogation doit être particulièrement visible dans l’audit.

Remontées : incidents majeurs, anomalies d’accès, validations exceptionnelles et synthèses autorisées. Descente : règles, délégations et décisions assorties d’un responsable.

Limites : aucune suppression de journal ou de paiement ; aucune réécriture invisible d’une opération clôturée ; pas d’encaissement ordinaire au comptoir. Un éventuel accès de secours est distinct, temporaire et audité.

Recette : une modification de permission est effective sur la page, l’action serveur et la base ; son auteur et sa justification sont retrouvables.

### 5.2 Admin — Direction des opérations

Mission : coordonner les équipes et la qualité de service au quotidien.

Page d’entrée : « Pilotage des opérations ». Blocs : dossiers non affectés, urgences, retards, blocages interservices ; table des dossiers à arbitrer ; agenda collectif.

Écrans : dossiers globaux ; clients ; files de réception ; affectations ; tâches ; rendez-vous ; communications ; organisation autorisée ; rapports opérationnels.

Actions : qualifier une demande, affecter ou réaffecter, définir une priorité, corriger un parcours autorisé avec motif, adresser une consigne, relancer, vérifier l’exécution et remonter un risque au DG.

Remontées : chefs de service, accueil et incidents transversaux. Descente : affectations et priorités vers les équipes. Les consignes du DG restent reliées à leurs tâches d’exécution.

Limites : aucune attribution de rôle, validation de paiement ou clôture de caisse par défaut. Les pouvoirs de devis et facturation prévus par la V3 sont conservés uniquement s’ils sont explicitement accordés.

Recette : la réaffectation déplace immédiatement le dossier dans la file du nouvel agent et retire l’accès de l’ancien si aucun autre droit ne le justifie.

### 5.3 DG — Direction générale

Mission : suivre les résultats, arbitrer les priorités et contrôler l’exécution des décisions.

Page d’entrée : « Direction générale ». Blocs : activité et délais, synthèse financière autorisée, risques majeurs, décisions attendues et instructions non exécutées.

Écrans : rapports consolidés ; synthèses par service ; dossiers à risque ; arbitrages ; instructions ; suivi des objectifs définis ; audit autorisé.

Actions : fixer une priorité, demander une analyse, rendre un arbitrage, adresser une instruction au responsable compétent, consulter les éléments justificatifs autorisés, valider un devis dans le périmètre prévu.

Remontées : rapports de l’Admin et du DAF, escalades des circuits. Descente : instructions à ces responsables, avec suivi des tâches déléguées. Une instruction directe à un agent informe son responsable et ne lui confère aucun droit supplémentaire.

Limites : pas de réception de paiement, de changement de rôle ni de modification comptable par simple position hiérarchique. Les synthèses RH ne donnent pas automatiquement accès aux pièces privées.

Recette : le DG ouvre une instruction et retrouve destinataires, accusés, tâches, preuves, retard éventuel et décision de clôture.

### 5.4 DAF — Contrôle financier

Mission : vérifier les encaissements, dépenses, soldes, rapprochements et clôtures.

Page d’entrée : « Contrôle financier ». Blocs : paiements à contrôler, sessions soumises, écarts, remboursements et échéances. Table des validations avec lien vers les pièces.

Écrans : caisses ; paiements ; dépenses ; devis et factures ; rapprochements ; remboursements ; commissions ; rapports et exports financiers.

Actions : approuver ou rejeter avec motif, demander une correction, valider une facture selon droits, autoriser une dépense ou un remboursement, valider une clôture et transmettre une anomalie au DG.

Remontées : caisse et comptable. Descente : décisions de contrôle et demandes de correction. La vue client/dossier est limitée aux besoins du contrôle ; les autorisations V3 existantes doivent être réconciliées explicitement.

Limites : ne valide jamais une opération qu’il a lui-même saisie. Ne remplace pas la caissière au comptoir. Aucun ajustement de solde direct sans opération justificative.

Recette : une approbation concurrente ou répétée ne produit qu’une seule décision ; l’auto-validation est refusée côté serveur et base.

### 5.5 Comptable — Préparation et rapprochement

Mission : rapprocher les pièces et préparer les dossiers financiers à valider.

Page d’entrée : « Comptabilité ». Blocs : transactions non rapprochées, justificatifs manquants, retours du DAF et échéances.

Écrans : journal des paiements en lecture métier ; rapprochements ; dépenses à préparer ; pièces ; brouillons de factures selon habilitation ; exports ; suivi des demandes au DAF.

Actions : pointer les références, joindre un justificatif, proposer une correction ou une régularisation, préparer une dépense et soumettre le dossier au DAF. Une écriture de régularisation reste distincte d’un encaissement au comptoir.

Remontées : anomalies et dossiers prêts vers le DAF. Descente : retours du DAF dans une file de corrections assignées.

Limites : aucun encaissement client, aucune validation finale de paiement, remboursement ou clôture. Ne dispose pas par défaut des notes internes de traitement ou du dossier RH des employés.

Recette : une opération non rapprochée est identifiable ; son rapprochement n’en modifie ni le montant ni la preuve d’origine.

### 5.6 Chef de service — Supervision métier

Mission : distribuer la charge et garantir le traitement des dossiers de son service.

Page d’entrée : « Mon service ». Blocs : dossiers à affecter, dossiers bloqués, échéances et capacité des agents ; table du portefeuille du service.

Écrans : dossiers du service ; affectations ; documents à contrôler ; tâches ; agenda ; communications ; rapports du service ; instructions reçues.

Actions : affecter dans son service, changer une priorité, vérifier une pièce dans son habilitation, autoriser une transition permise, demander une correction, traiter un blocage et escalader à l’Admin.

Remontées : rapports des agents et difficultés de traitement. Descente : tâches, affectations, délais et retours documentaires.

Limites : pas d’accès automatique aux autres services, aux caisses ou aux permissions. Un transfert hors service passe par le circuit de coordination autorisé.

Recette : le chef retrouve les dossiers de son service et reçoit un refus sur un identifiant appartenant à un service non autorisé.

### 5.7 Accueil & caisse — Réception et POS

Mission : recevoir les visiteurs, identifier les clients, ouvrir les dossiers, orienter et assurer l’encaissement au comptoir.

Page d’entrée : « Accueil & caisse ». Avant ouverture : état de caisse et formulaire de fonds initial. Après ouverture : comptoir POS, client actif, ticket, règlements et file d’accueil.

Écrans : comptoir POS ; clients ; ouverture et orientation des dossiers ; rendez-vous ; reçus ; journal de sa caisse ; ouverture et comptage de session ; demandes de correction.

Actions : rechercher ou créer une fiche client, éviter les doublons, ouvrir un dossier, sélectionner une prestation réelle, charger une facture existante, encaisser, délivrer un reçu, enregistrer une arrivée, transmettre au service et soumettre la clôture.

Remontées : arrivée et dossier vers le service ; paiements et écarts vers la finance. Descente : tarifs publiés, pièces requises, consignes d’accueil et retours du DAF.

Limites : pas de tarif libre hors autorisation, d’auto-validation, de suppression de paiement, de réouverture silencieuse de caisse, de consultation générale des notes internes ou de modification d’un résultat métier.

Recette : l’encaissement est refusé avant ouverture de session et pour tout utilisateur non habilité ; le paiement et son reçu restent retrouvables après interruption réseau.

### 5.8 Agent — Traitement des dossiers

Mission : exécuter les prestations affectées, communiquer avec le client et rendre compte.

Page d’entrée : « Mon espace de travail ». Blocs : actions urgentes, pièces reçues à vérifier, tâches et rendez-vous ; table des dossiers affectés.

Écrans : mes dossiers ; documents ; messages ; notes internes ; tâches ; agenda ; instructions ; mes informations RH autorisées.

Actions : consulter et traiter un dossier affecté, demander une pièce, envoyer un message, ajouter une note interne, modifier un statut permis, préparer un devis si habilité, signaler un blocage et documenter le travail réalisé.

Remontées : progression, besoin d’aide et blocage vers le chef. Descente : affectations, instructions et retours. Les paiements sont consultables seulement dans la mesure utile au dossier.

Limites : aucun encaissement, validation financière, réaffectation libre ou accès à tous les clients. Aucun changement de statut incompatible avec la machine à états.

Recette : une pièce reçue du client apparaît dans le dossier affecté ; l’agent ne peut ni voir un dossier étranger ni marquer payé un dossier.

### 5.9 Modérateur — Contenus et publications

Mission : maintenir les contenus autorisés et préparer les publications.

Page d’entrée : « Contenus ». Blocs : brouillons, demandes de correction, contenus à vérifier et publications programmées si la fonction existe.

Écrans : contenus du site ; FAQ ; médias ; témoignages ; pages de prestations selon droits ; demandes de validation éditoriale.

Actions : rédiger, corriger, soumettre, publier lorsqu’une permission explicite l’autorise. Une donnée institutionnelle modifiée perd sa vérification en base.

Remontées : propositions et besoins de preuve vers le valideur éditorial désigné. Descente : retours et directives éditoriales.

Limites : aucun accès automatique au CRM, à la finance, aux notes internes ou aux tarifs sensibles. Aucun faux avis, partenaire, bureau ou membre d’équipe.

Recette : un champ institutionnel renseigné mais non vérifié ou non publié n’apparaît pas sur le site.

### 5.10 Partenaire — Collaboration externe contrôlée

Mission : traiter les éléments expressément partagés par NEXUS.

Page d’entrée : « Espace partenaire ». Blocs : dossiers partagés, actions attendues, échéances et messages autorisés.

Écrans : dossiers partagés ; pièces partagées ; demandes de complément ; dépôt de résultat ; échanges ; commissions uniquement si contrat et habilitation le prévoient.

Actions : accuser réception, demander un complément, déposer un document ou un avis, indiquer une décision partenaire. Le retour ne clôt pas automatiquement le dossier NEXUS.

Remontées : avis et pièces vers le responsable interne. Descente : mission, délai et périmètre partagé. Les liens et fichiers deviennent inaccessibles après révocation du partage.

Limites : aucun accès à tous les clients, aux notes internes, aux marges, à la caisse ou aux documents non partagés.

Recette : la révocation d’un partage bloque la route, l’API et le téléchargement, même si une ancienne URL est conservée.

### 5.11 Client — Suivi et démarches

Mission : suivre ses dossiers, fournir les pièces et réaliser les actions demandées.

Page d’entrée : « Mon espace NEXUS ». Blocs : actions attendues, progression, prochain rendez-vous et situation de règlement explicite.

Écrans : mes dossiers ; documents ; devis ; factures et reçus ; paiements ; rendez-vous ; messages ; notifications ; profil.

Actions : déposer une demande, téléverser une pièce, corriger un document, accepter un devis selon le circuit, consulter un reçu, réserver ou demander un rendez-vous et échanger avec son conseiller.

Remontées : demandes, pièces et messages vers l’équipe autorisée. Descente : suivi public, demandes de complément, décisions publiables et confirmations financières.

Limites : seulement ses données ; aucune note interne, consigne administrative, information RH ou pièce d’un autre client. Une déclaration de paiement ne vaut pas confirmation de paiement.

Recette : un changement d’identifiant dans une URL ou une requête directe est refusé. L’interface est prioritairement conçue pour le téléphone mobile.

## 6. Matrice des responsabilités et permissions

### 6.1 Modèle de permission

Chaque permission décrit une ressource, une action et une portée : tous les dossiers autorisés, service, dossiers affectés, partage explicite ou propriété client. L’appartenance à une agence, lorsqu’elle existe, constitue une limite supplémentaire.

Les habilitations sont garanties par RLS, par vérification serveur et par filtrage d’interface. Le serveur ne fait pas confiance à un rôle, un montant ou un identifiant de client fourni par le navigateur.

Les permissions nouvelles proposées couvrent notamment : ouverture et soumission de session de caisse, encaissement comptoir, rapprochement, validation de clôture, émission et accusé d’instruction, escalade et partage. Leurs noms techniques doivent être harmonisés avec `role_permissions` et `user_permissions` après audit, sans créer de synonymes concurrents.

| Opération sensible | Exécutant cible | Contrôle ou validation | Restriction |
| --- | --- | --- | --- |
| Attribuer un rôle | Super-admin | Traçabilité et contrôle des délégations | Ni Admin ni DG par défaut |
| Ouvrir une session | Accueil & caisse habilité | Fonds et poste enregistrés | Une session active par poste et opérateur |
| Recevoir un paiement comptoir | Accueil & caisse habilité | Circuit de validation financière | Session ouverte obligatoire |
| Confirmer un paiement en ligne | Intégration serveur vérifiée | Rapprochement et contrôles métier | Aucun clic utilisateur ne simule la confirmation |
| Rapprocher une transaction | Comptable | DAF pour exceptions | Ne change pas la transaction d’origine |
| Valider un paiement | DAF ou Super-admin habilité | Contrôle de séparation des tâches | Interdit à son propre saisisseur |
| Préparer une clôture | Accueil & caisse | Comptable pour rapprochement si requis | Comptage conservé |
| Valider une clôture | DAF ou Super-admin habilité | Contrôle des écarts | Jamais le préparateur lui-même |
| Rembourser | Accueil pour espèces ; exécution serveur pour canal intégré | Autorisation préalable DAF ou Super-admin | Opération liée à l’original, plafond du remboursable |
| Affecter un dossier | Admin ; Chef dans son service | Historique et motif de réaffectation | Respect du service et des droits |
| Changer une étape | Agent affecté, Chef ou Admin selon transition | Règles de la machine à états | Retour arrière privilégié et motivé |
| Partager à un partenaire | Responsable explicitement habilité | Périmètre et durée du partage | Pièces sélectionnées, notes exclues |
| Publier un contenu | Modérateur ou responsable habilité | Vérifications éditoriales requises | Donnée institutionnelle vérifiée et publiée |

### 6.2 Changements explicites par rapport à la V3

La V3 accorde `paiement.record` à plusieurs rôles. La nouvelle exclusivité de la réception exige de séparer l’encaissement comptoir de la préparation comptable, de l’import de transactions et des paiements en ligne. Retirer un bouton ne suffit pas : toutes les routes d’encaissement existantes doivent être inventoriées puis protégées.

Le droit de clôture final du DAF ou du Super-admin reste distinct de l’ouverture et du comptage effectués par la caissière. La phrase « fermer la caisse » dans l’interface doit préciser s’il s’agit de soumettre le comptage ou de valider définitivement la session.

La V3 mentionne un droit de suppression de dossier pour le Super-admin mais interdit toute suppression de données en V3. L’interface livrée propose l’archivage ; la suppression physique demeure désactivée.

Un remplaçant temporaire de la réception nécessite une délégation nominative, bornée dans le temps et enregistrée. L’agent ordinaire n’acquiert jamais ce pouvoir automatiquement lors d’une absence.

## 7. CRM partagé et cycle de vie des dossiers

### 7.1 Identité et réception

CRM-01 — Rechercher avant création par téléphone, e-mail, nom et référence. Afficher les correspondances possibles ; ne pas fusionner automatiquement.

CRM-02 — Conserver une identité personne canonique dans `clients`, selon D7 à confirmer, reliée à `profiles` si la personne possède un compte. Une personne sans compte peut être reçue et avoir un dossier.

CRM-03 — Enregistrer l’origine, le besoin, les coordonnées disponibles, le responsable et le service. L’absence d’e-mail ne doit pas empêcher une réception physique lorsque la prestation ne l’exige pas.

CRM-04 — La fiche client rassemble les dossiers, rendez-vous, documents autorisés, communications, devis, factures et paiements. Chaque onglet applique ses propres droits, y compris dans le payload serveur.

CRM-05 — Les fusions sont proposées à un humain, traçables et réversibles sans suppression de la fiche absorbée. Les divergences d’identité doivent être résolues avant rattachement sensible.

### 7.2 Dossier et étapes

`demandes` reste la table dossier. La conversion d’une entrée qualifiée en dossier actif est une étape du même parcours, jamais la création d’une table parallèle `dossiers`.

La fiche comporte : référence, client canonique, prestation, service, responsable, priorité, statut, échéance, pièces, devis, factures, paiements, rendez-vous, messages, notes internes et historique.

Les étapes cibles reprennent la V3 : réception, qualification, documents demandés ou dossier incomplet, étude, devis envoyé, devis accepté, paiement attendu, traitement, transmission partenaire, décision reçue, terminé/refusé/annulé, puis archivé. Les valeurs exactes de l’enum sont alignées avant migration.

Toute transition est validée côté serveur, avec permission, préconditions et auteur. Une étape demandant un paiement vérifie l’état financier réel. Une absence de pièce bloque uniquement les transitions déclarées comme dépendantes de cette pièce.

Un retour arrière est réservé aux rôles autorisés, avec motif. Chaque transition écrit dans l’historique et dans l’audit. La chronologie affiche un seul événement métier lisible même si plusieurs mécanismes techniques l’ont enregistré.

### 7.3 Affectation et suivi

Les files distinguent réception, non affectés, mes dossiers, service, urgents, en retard, terminés et archivés. Le responsable du dossier et l’exécutant d’une tâche peuvent être différents.

Une affectation déclenche une action à accepter. En cas d’absence ou de non-acceptation, une règle d’escalade administrable alerte le responsable. Une réaffectation conserve le motif et le transfert des tâches ouvertes.

La file d’accueil enregistre arrivée, motif, prise en charge et orientation. Une estimation d’attente ne s’affiche que si elle repose sur une méthode et des données disponibles.

## 8. Accueil, POS et journée de caisse

### 8.1 Ouverture du matin

CAI-01 — Authentifier nominativement la personne habilitée. Aucun compte partagé « caisse ».

CAI-02 — Sélectionner le poste réel, constater l’absence de session déjà active, saisir le fonds d’ouverture compté et, si nécessaire, le détail des coupures.

CAI-03 — Créer la session avec opérateur, date métier de Bangui, horodatage serveur et fonds initial. Les règles relatives à une session précédente non régularisée sont paramétrées et validées avant mise en service.

CAI-04 — Bloquer les encaissements tant que l’ouverture n’est pas confirmée par le serveur. Un affichage local « ouvert » ne suffit pas.

### 8.2 Comptoir POS

Le comptoir présente trois zones : client et dossier ; catalogue ou facture à régler ; ticket et paiement. La sélection du client reste visible pendant toute l’opération.

Le catalogue affiche les prestations actives, la base du tarif et la devise. Les frais NEXUS, débours éventuels et sommes destinées à des tiers sont distingués ; l’intégralité encaissée n’est pas automatiquement le revenu de NEXUS.

Le ticket contient référence de brouillon, client, dossier si nécessaire, lignes de prestations, quantités, prix validés, remises autorisées, total, acomptes déjà affectés et reste dû. Charger une facture existante ne doit pas créer une seconde créance.

Les prix sont contrôlés côté serveur. Une prestation sur devis ne devient pas encaissable sans montant approuvé dans le circuit. Toute remise requiert une permission, un motif et, au-delà du seuil retenu, une validation.

Le brouillon peut être mis en attente, repris ou abandonné sans mouvement financier. Un ticket réglé ne peut plus être effacé ni modifié comme un brouillon.

### 8.3 Encaissement et justificatifs

Pour les espèces : montant reçu, montant affecté et monnaie rendue sont distincts. Le contrôle interdit un rendu négatif ou un paiement supérieur au remboursable/recevable sans circuit d’avance prévu. Les règles d’arrondi sont explicites ; les montants XAF ne sont pas calculés en flottants approximatifs.

Pour un paiement électronique : la référence et l’état de confirmation sont visibles. Une preuve déposée ou une déclaration manuelle reste « à vérifier » tant que le mécanisme autorisé ne l’a pas confirmée. La carte n’est proposée que si un terminal ou fournisseur réellement configuré la prend en charge.

Les paiements partiels et règlements mixtes disposent d’affectations distinctes liées à la même créance. Chaque transaction conserve son moyen de paiement et sa preuve. Le total affecté ne dépasse pas le montant restant sans traitement explicite d’un trop-perçu.

CAI-05 — Un double clic, une nouvelle tentative après délai réseau ou un webhook répété ne crée jamais deux paiements. Une clé d’idempotence permet de retrouver le résultat initial.

CAI-06 — Le reçu possède une référence unique, date, caisse, opérateur, client, objet, montant, moyen, affectation et reste dû pertinent. L’impression et le PDF reprennent la transaction enregistrée. Une réimpression est identifiable et ne crée aucun paiement.

CAI-07 — Si l’impression échoue après enregistrement, l’écran propose de réimprimer le reçu existant. Une preuve d’enregistrement ou de réception d’espèces n’affiche pas abusivement une validation financière encore en attente.

### 8.4 Mouvements et contrôle pendant la journée

Les entrées et sorties hors vente utilisent des types spécifiques avec justificatif et autorisation. Le fonds initial n’est pas un chiffre d’affaires. Les remboursements sont des mouvements compensatoires liés à l’opération d’origine ; aucune ligne initiale n’est effacée.

Solde théorique espèces = fonds initial + espèces encaissées − monnaie rendue + entrées autorisées − remboursements espèces − sorties autorisées. Si les encaissements sont stockés nets de monnaie rendue, cette dernière n’est pas soustraite une seconde fois. La convention est unique et documentée.

Le solde physique inclut les espèces effectivement reçues même si leur contrôle financier est en attente. Leur statut de validation est affiché séparément. Les règlements électroniques ne gonflent jamais le tiroir-caisse.

### 8.5 Fin de journée

La caissière termine ou met en attente les opérations, compte les espèces par coupure, saisit le montant réel et explique l’écart. L’application conserve la première soumission, ses pièces et toute correction ultérieure.

États métier proposés : non ouverte, ouverte, comptage soumis, correction demandée, clôturée. Après soumission, de nouveaux encaissements dans cette session sont bloqués. Un retour pour correction autorise uniquement les éléments explicitement demandés ; il ne déverrouille pas les paiements historiques.

Le comptable rapproche les éléments si le circuit le prévoit. Le DAF ou Super-admin habilité valide la clôture. L’écart n’est jamais absorbé automatiquement par une écriture artificielle.

Le rapport distingue fonds, recettes, sorties, moyens électroniques, espèces théoriques et comptées, écart, justificatifs, opérateur et valideur. Les horaires stockés sont normalisés ; les journées métier sont calculées en `Africa/Bangui`.

## 9. Finance et validation

FIN-01 — Utiliser exclusivement `payments.status`, `payments.amount` et `payments.method` après convergence P6-0. D6 fixe les valeurs canoniques de statut avant le backfill. Les colonnes héritées sont conservées, documentées et synchronisées selon la migration validée.

FIN-02 — Distinguer une commande de prestation, une facture, une transaction de paiement, une affectation à une facture et un mouvement de caisse. Leurs identifiants et états ne sont pas interchangeables.

FIN-03 — Numéroter devis, factures et reçus par séquence robuste ; aucune numérotation par comptage de lignes. Conserver les documents déjà émis.

FIN-04 — Contrôler les remboursements partiels et successifs contre le montant réellement remboursable, sous verrou transactionnel. L’autorisation porte sur une version et un montant déterminés ; changer le montant invalide l’approbation.

FIN-05 — Chaque validation possède demandeur, valideur distinct, décision, motif, version de l’objet et date. Un rejet réouvre une action de correction ; il ne supprime pas la demande initiale.

FIN-06 — Les rapports distinguent encaissements, montants validés, facturation, créances, remboursements, dépenses et fonds de tiers. « Solde net » n’est jamais présenté comme bénéfice sans définition comptable validée.

FIN-07 — Les totaux du dossier, de la caisse, du tableau financier et de l’export concordent à filtres, devise, date de référence et définition identiques. Les montants de devises différentes ne sont pas additionnés sans conversion documentée.

## 10. Consignes, alertes, escalades et collaboration

### 10.1 Quatre objets distincts

Un message est un échange. Une note interne est une observation confidentielle. Une tâche est un travail attribué. Une instruction est une décision à prendre en charge puis à exécuter. Une notification signale leur existence et renvoie vers l’objet source.

Une instruction comporte : référence, auteur et rôle au moment de l’émission, sujet, contenu, destinataires, responsable principal, priorité, échéance, confidentialité, pièces, liens métier et demande éventuelle d’accusé de réception.

États proposés : brouillon, envoyée, reçue, prise en charge, en cours, bloquée, soumise au contrôle, clôturée ou annulée avec motif. Les accusés individuels ne sont pas remplacés par un unique statut global lorsqu’il existe plusieurs destinataires.

### 10.2 Montée des informations

Un agent remonte un blocage depuis son dossier en précisant cause, impact, action déjà tentée et décision attendue. Le chef traite ou escalade. L’Admin arbitre les enjeux interservices ; le DG reçoit les arbitrages majeurs selon la règle configurée.

Une anomalie financière suit le circuit DAF, indépendamment de la chaîne opérationnelle. Un incident d’accès suit le circuit Super-admin ou responsable sécurité désigné. Les destinataires ne sont pas choisis uniquement selon un rang.

Les délais d’escalade, plages de service et remplaçants sont configurables ; aucun délai contractuel fictif n’est imposé. À chaque escalade : auteur, niveau, motif, date et destinataire sont conservés.

### 10.3 Descente des décisions

Une décision du responsable crée des tâches liées, avec exécutants et échéances. Les exécutants peuvent accepter, demander clarification, signaler un blocage et fournir une preuve. La clôture appartient à la personne habilitée à vérifier l’exécution.

Une consigne ne contourne pas une permission ou une règle financière. Une instruction demandant un remboursement produit une demande dans le circuit financier, pas un paiement automatique.

### 10.4 Livraison fiable

Les événements métier sont persistés avec leur source. Un mécanisme de boîte d’envoi transactionnelle, ou équivalent garantissant l’absence de perte, permet de diffuser les notifications après validation de l’opération.

Les traitements sont idempotents, relancés en cas d’échec et supervisables. Un échec d’e-mail ne transforme pas un paiement réussi en paiement échoué. Les messages externes indiquent une information minimale et renvoient vers l’espace sécurisé.

E-mail, SMS et WhatsApp restent des canaux optionnels activés uniquement si configurés. La boîte interne est utilisable sans fournisseur externe. Les notifications ne doivent jamais transporter des notes internes à un client ou partenaire.

## 11. Documents, rendez-vous et ressources humaines

DOC-01 — Chaque pièce possède propriétaire, dossier, type, auteur, date, version, visibilité et statut de contrôle. Vérifier type réel, taille et innocuité du fichier avant sa diffusion. Les documents sensibles utilisent un stockage privé et des liens temporaires autorisés.

DOC-02 — Conserver les versions et les motifs de rejet. Les demandes de documents indiquent la pièce attendue, l’échéance éventuelle et le destinataire. L’interface distingue reçu, vérifié, rejeté et remplacé.

RDV-01 — Utiliser `appointments` comme source canonique. Gérer client, dossier, agent, lieu ou canal, date, durée, arrivée, report, annulation et absence. Détecter les conflits de créneau ; conserver les reports dans l’historique.

RDV-02 — L’accueil voit les arrivées utiles à sa mission ; le client voit ses rendez-vous ; le chef voit ceux de son service. La table héritée `rendez_vous` est migrée progressivement sans suppression en V3.

RH-01 — Réutiliser congés, absences et évaluations existants. Un agent accède à ses propres éléments ; le responsable consulte seulement ceux nécessaires à sa mission. Les pièces sensibles ne sont pas exposées par le CRM.

RH-02 — Une absence alimente les alertes d’affectation et les délégations validées. Elle ne transfère pas automatiquement des droits financiers. Aucun classement de performance n’est affiché sans définition et données suffisantes.

## 12. Catalogue des services, contenus et partenaires

Le catalogue possède pôles, prestations, description, tarif ou devis, disponibilité, pièces et étapes de traitement. Toute modification de tarif est datée ; les factures et tickets historiques conservent les conditions effectivement appliquées.

L’interface CRM filtre par pôle et prestation. Les catégories du catalogue n’ajoutent pas automatiquement autant d’entrées au menu principal.

Les pages de service existantes, formulaires spécialisés et URL doivent être inventoriés avant modification. Les nouvelles pages et redirections suivent P8/P10, sans suppression de prestation utile.

Les contenus institutionnels exigent valeur renseignée, vérifiée et publiée. Toute modification révoque la vérification par trigger. Les médias conservent provenance et droits ; les personnes identifiables nécessitent une autorisation de publication référencée.

La fiche partenaire décrit l’organisme réel, les interlocuteurs, les services concernés et les règles de partage. Un rôle partenaire ne constitue ni un contrat commercial ni une autorisation d’utiliser son logo.

## 13. Indicateurs et chiffre honnête

Chaque indicateur possède une définition écrite, une source, les statuts inclus/exclus, un champ de date, un fuseau, une portée de permission et une route de détail. Le dictionnaire des métriques est livré avec les requêtes réelles.

| Indicateur | Définition cible | Vérification |
| --- | --- | --- |
| Dossiers non affectés | Dossiers actifs autorisés sans responsable | Liste filtrée identique |
| Dossiers en retard | Échéance dépassée, hors états finaux/archivés | Même instant de référence et mêmes statuts |
| À traiter par moi | Objets ouverts exigeant une action de cet utilisateur | Ne pas confondre total visible et action attendue |
| Pièces à vérifier | Versions reçues non encore contrôlées, dans le périmètre | Une même version n’est comptée qu’une fois |
| Paiements à contrôler | Transactions dans les états canoniques de contrôle | D6 préalable ; liste financière correspondante |
| Espèces théoriques | Fonds et mouvements physiques de la session | Rapprochement au journal de caisse |
| Reste dû | Créances exigibles moins affectations nettes selon règles validées | Avoirs et remboursements traités explicitement |
| Instructions en retard | Instructions non clôturées à échéance dépassée | Responsable et échéance visibles |
| Délai de traitement | Durée entre deux événements nommés | Définir pauses et jours calendaires/ouvrés |

Un total global doit se dédupliquer par identifiant métier avant agrégation : les jointures sur documents, messages ou paiements ne multiplient pas les dossiers.

Aucune variation en pourcentage sans au moins 30 jours d’historique et un dénominateur d’au moins 20, conformément à la V3. Une donnée non mesurable affiche une explication, pas zéro. Aucun score de satisfaction sans source.

Une liste dynamique et son compteur partagent un instant ou une version de référence lors de la recette. L’arrivée d’une nouvelle transaction ne doit pas être confondue avec une erreur de calcul.

## 14. Architecture fonctionnelle et données

### 14.1 Réutilisation obligatoire

Réutiliser les tables existantes appropriées : `profiles`, `clients`, `demandes`, historiques de statut, documents, demandes de pièces, `demande_messages`, `demande_notes`, `appointments`, `payments`, `payment_links`, `expenses`, `notifications` et tables RH.

Les tables de devis, factures, tâches, caisse, audit et configuration prévues dans la V3 sont vérifiées dans le schéma réel avant toute création. Le nom français d’un module d’interface n’impose pas une nouvelle table française. Toute nouvelle table V3 suit la nomenclature anglaise retenue.

### 14.2 Extensions à instruire après audit

Les besoins logiques non couverts peuvent exiger des structures pour : postes et sessions de caisse, lignes de ticket, affectations de paiement, mouvements et comptages, validations, instructions et destinataires, accusés, délégations, file de réception et boîte d’événements.

Ce sont des concepts à rapprocher de l’existant, pas une liste de migrations déjà autorisées. Pour chacun : propriétaire, clés étrangères, cardinalités, index, contraintes, RLS, rétention et stratégie de backfill doivent être proposés.

### 14.3 Intégrité et concurrence

Une transaction atomique garantit l’enregistrement cohérent des objets financiers liés. Des contraintes uniques préviennent les doublons de références et sessions actives. Des verrous ou contrôles de version empêchent deux encaissements simultanés de consommer le même reste dû.

Les données contrôlées ne sont pas réécrites après validation. Les corrections passent par un événement ou une version explicite. Les traitements techniques et les actions serveur partagent un identifiant de corrélation pour éviter les doublons d’audit affichés.

Les fichiers appliqués en base sont committés dans le même mouvement. Les migrations sont additives, avec RLS activée dès création, et aucune suppression de données existantes.

## 15. Sécurité et confidentialité

SEC-01 — Refus par défaut. Vérifier permission et portée sur lectures, mutations, recherches, exports, fichiers, notifications et abonnements aux événements.

SEC-02 — Comptes nominatifs, désactivation immédiate, révocation des sessions et contrôle des délégations expirées. Authentification renforcée exigée pour les rôles privilégiés et actions sensibles selon le mécanisme retenu.

SEC-03 — Les accès `service_role` restent exclusivement serveur. Une route l’utilisant reconstitue explicitement le contrôle de permission ; elle ne transforme pas cet accès en accès universel pour l’utilisateur.

SEC-04 — Les liens de paiement publics utilisent des jetons non énumérables et un payload limité. Les références séquentielles n’exposent pas de données personnelles et ne redirigent pas vers le jeton secret.

SEC-05 — L’audit conserve auteur, rôle au moment de l’action, action, entité, horodatage, motif et changements pertinents. Masquer les champs sensibles dans les différences ; journaliser les téléchargements sensibles et exports.

SEC-06 — Aucun rôle applicatif, y compris Super-admin, ne peut modifier ou effacer l’audit. Cela ne constitue pas une inviolabilité contre l’administrateur d’infrastructure ; les sauvegardes et contrôles d’exploitation doivent aussi être définis.

SEC-07 — Les partages et URL de pièces expirent ou sont révocables. La connaissance d’un identifiant n’accorde aucun accès.

SEC-08 — Sauvegardes et restauration testées, secrets hors code, journaux d’erreurs sans données confidentielles, surveillance des échecs de paiement et de notification. Les objectifs de reprise et de perte maximale admissible sont validés avant production.

## 16. Réseau, performances et accessibilité

L’administration est conçue d’abord pour l’ordinateur ; le portail client d’abord pour le téléphone. Tester les fonctions clés à 360, 390, 768, 1280 et 1440 px, sans défilement horizontal de page. Sur mobile, les tableaux deviennent des cartes ou vues de détail conservant les informations nécessaires.

La saisie tolère une connexion instable : formulaires préservés, erreurs explicites, nouvelle tentative sûre et confirmation serveur identifiable. Les données sensibles ne sont pas mises en cache sans politique validée.

Le POS ne confirme aucun paiement hors connexion. Après coupure, il vérifie d’abord si la transaction a réussi avant de proposer une nouvelle tentative. Un éventuel mode caisse hors ligne exigerait un projet distinct de synchronisation et de contrôle.

Chaque bloc se charge séparément, avec pagination serveur. La mention « en temps réel » n’apparaît que si le mécanisme existe et fonctionne. Sinon, afficher la dernière actualisation et un contrôle de rafraîchissement.

Cibles de recette proposées : résultat initial exploitable sous 3 secondes sur le profil réseau de test convenu ; retour visuel immédiat d’une action ; mesures au 95e percentile sur un volume représentatif. Le réseau, appareil, volume et protocole sont enregistrés ; aucun résultat n’est déclaré sans mesure.

Respecter WCAG AA : contrastes mesurés, focus visible, clavier utilisable, libellés de champs, messages d’erreur associés et absence d’information portée uniquement par la couleur. Les zones tactiles essentielles visent au moins 44 × 44 px. Respecter `prefers-reduced-motion`.

## 17. Raccordement réel et déploiement

### 17.1 Audit de départ

Inventorier les routes de chaque rôle, leurs layouts, le shell importé, les composants, sources de données, permissions, migrations et tests. Classer chaque exigence : livré et raccordé ; réalisé mais isolé ; partiel ; absent ; bloqué ; non vérifiable.

Le constat antérieurement rapporté d’un `AdminShell` limité à la vitrine doit être revérifié dans le dépôt actuel. Ni une ancienne capture ni un compte-rendu ne remplace cette vérification.

### 17.2 Preuve de raccordement

Pour chaque espace livré : route réelle, rôle de test, layout et shell importés, capture desktop et mobile, parcours exécuté, commit, URL de prévisualisation et version déployée. Une page de design system ne constitue pas la livraison de l’espace métier.

Vérifier les caches et versions de déploiement avant de conclure que le design ne change pas. Documenter séparément code en branche, code déployé, migration appliquée et base effectivement utilisée.

La prévisualisation n’implique pas une base isolée : identifier explicitement le projet Supabase de chaque environnement avant migration. Ne jamais supposer qu’une branche de prévisualisation protège les données de production.

### 17.3 Passage en production

Conserver branche par phase, tag de sauvegarde, tests et validation de Thierry sur l’URL. Ne pas basculer plusieurs phases sous un seul GO. Maintenir une stratégie de retour applicatif compatible avec les migrations additives.

L’ancienne page reste disponible jusqu’à validation de sa remplaçante, sans supprimer les protections serveur. Après bascule, le rôle arrive réellement sur le nouvel espace ; aucun ancien point d’entrée ne doit contourner les nouvelles règles.

## 18. Recette et critères d’acceptation

Les essais de sécurité et financiers utilisent un environnement isolé et des comptes de test contrôlés ; aucune transaction fictive n’est injectée dans les écrans de production. Les données de test ne deviennent pas du contenu de démonstration livré.

| ID | Parcours à vérifier | Résultat exigé |
| --- | --- | --- |
| R01 | Connexion de chacun des 11 profils | Route et menu correspondant aux droits réels |
| R02 | URL/API d’un rôle non autorisé | Refus serveur et base, sans fuite dans le payload |
| R03 | Client change l’identifiant du dossier | Refus ; documents et messages étrangers invisibles |
| R04 | Agent consulte un dossier non affecté | Refus sauf autre permission explicite |
| R05 | Chef consulte un autre service | Refus selon portée, y compris recherche/export |
| R06 | Accueil crée puis oriente un dossier | Même dossier visible dans la file du service |
| R07 | Encaissement sans session ou par agent ordinaire | Refus sans création de transaction |
| R08 | Double clic ou reprise après interruption | Une transaction et un reçu uniques |
| R09 | Deux encaissements concurrents sur un reste dû | Pas de suraffectation ni double consommation |
| R10 | Espèces et règlement électronique | Seules les espèces affectent le tiroir |
| R11 | Paiement partiel et règlement complémentaire | Reste dû cohérent dans dossier, caisse et export |
| R12 | Comptable ou saisisseur tente de valider | Refus de validation non autorisée ou de soi-même |
| R13 | Clôture avec écart | Motif requis, soumission tracée, validation distincte |
| R14 | Remboursements partiels répétés/concurrents | Somme limitée au montant remboursable |
| R15 | Instruction DG vers équipe puis compte-rendu | Accusés, tâches et preuve retrouvables au niveau DG |
| R16 | Blocage agent puis escalade | Chef, Admin ou DG selon circuit ; trace conservée |
| R17 | Partage partenaire puis révocation | Accès limité puis refus sur page, API et fichier |
| R18 | Message client et note interne | Deux circuits distincts ; aucune note dans le payload client |
| R19 | Chiffre puis clic vers la liste | Égalité exacte au même instant de référence |
| R20 | Tarif modifié après émission | Document historique inchangé |
| R21 | Connexion dégradée et échec d’impression | Résultat vérifiable ; réimpression sans nouvel encaissement |
| R22 | Désactivation de compte/délégation expirée | Accès et actions sensibles révoqués |
| R23 | Donnée institutionnelle modifiée | Vérification perdue ; publication bloquée |
| R24 | Déploiement du nouvel espace | Route réelle importe le nouveau shell, visible en ligne |

Pour chaque essai : préconditions, utilisateur/rôle, données autorisées, étapes, résultat attendu, résultat observé, preuve, date et commit. Un essai non réalisable est marqué non exécuté avec raison, jamais réussi par défaut.

Repasser intégralement la checklist V3 : authentification, isolation client, permissions agent, parcours publics et correspondance des compteurs. Joindre les sorties réelles de `npx tsc --noEmit`, `npm run lint` et `npm run build`.

La recette doit également couvrir toute cellule autorisée et interdite de la matrice effectivement implémentée. Les 24 scénarios ci-dessus constituent un minimum, pas un remplacement de cette couverture.

## 19. Plan de livraison et arbitrages

### 19.1 Ordre de travail proposé

Lot 1 — Audit des routes, schéma, droits et déploiements. Produire la cartographie et l’état de réalisation par exigence. Référence : audit V3, P1/P2 et C0.

Lot 2 — Réconciliation des permissions, de l’identité client et de la finance canonique. Résoudre les préalables P2, C0/P3 et P6-0 avant les écritures dépendantes.

Lot 3 — Design system et shell commun ; maquettes de chaque espace avec états vide, chargé, erreur et accès refusé. Référence A1/A2/A3 ; validation visuelle avant bascule.

Lot 4 — Parcours vertical prioritaire : accueil, dossier, orientation, traitement, instruction et remontée. Référence A5/A6 et notifications internes. Vérifier la visibilité entre espaces dès ce lot.

Lot 5 — POS, sessions, paiements, rapprochement et validation financière, après convergence P6-0 et schéma nécessaire. Référence P6 ; recette de concurrence et de clôture obligatoire.

Lot 6 — Pilotage Admin/DG/Super-admin, rapports et gestion des risques fondés sur les parcours réellement raccordés. Référence A4 ; aucun agrégat ne précède sa définition et sa source.

Lot 7 — Raccordement complet RH, contenus, partenaires et portail client selon leurs préalables V3. Référence A7/P8/P9/P11, puis durcissement P12.

Ces lots constituent un ordre logique proposé, pas une autorisation de contourner les phases de la feuille de route. L’état réel du dépôt détermine le premier travail nécessaire. Chaque phase conserve son GO, ses tests, son récapitulatif et sa validation.

### 19.2 Livrables attendus de l’exécutant

1. Audit de conformité exigence par exigence, avec preuves et blocages.
2. Organigramme fonctionnel et matrice exhaustive des permissions/portées.
3. Inventaire des routes et composants raccordés, plus maquettes validées.
4. Schéma cible réconcilié, migrations additives et types régénérés.
5. Espaces métier fonctionnels, circuits montants/descendants et centre de pilotage.
6. Dictionnaire des indicateurs avec requêtes et liens de détail.
7. Manuel de réception et de caisse, procédures de contrôle et de remplacement.
8. Cahier de recette exécuté, preuves par rôle et sorties techniques.
9. URLs, commits, versions et environnement de données de chaque livraison.
10. Guide d’exploitation, restauration, incidents et registre des décisions/reportés.

### 19.3 Décisions à valider avant implémentation concernée

AR-01 — Confirmer le profil technique Accueil & caisse et la séparation entre encaissement comptoir, préparation comptable et paiements en ligne. L’exclusivité fonctionnelle de la réception est déjà demandée.

AR-02 — Désigner les responsables, suppléants et valideurs ; définir les pouvoirs de délégation et les délais d’escalade. Aucune identité nominative n’est inventée.

AR-03 — Confirmer D7 pour la personne canonique et D6 pour les statuts financiers si aucun arbitrage ultérieur n’existe dans le projet.

AR-04 — Fixer les moyens de paiement réellement actifs, la politique de remise, remboursement, trop-perçu, avances et gestion des écarts.

AR-05 — Fixer les règles de succession des sessions, le poste de caisse physique, l’éventuel terminal/imprimante et la procédure de remplacement de l’unique réceptionniste.

AR-06 — Valider les portées de données DG/DAF/Admin/RH, les conditions de partage partenaire et les durées de conservation applicables.

AR-07 — Fixer les objectifs de reprise, les conditions de test réseau et les critères de bascule en production.

