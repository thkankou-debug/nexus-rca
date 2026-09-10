Enchaîne L2 puis L3. Présente chaque lot avant de l'écrire, attends le GO, teste, commit, récapitule.

═══════════════════════════════════════════════════════════
LOT L2 — COMPTES DE TEST
═══════════════════════════════════════════════════════════

OBJECTIF
Rendre les neuf rôles testables de bout en bout. Sans ces comptes, tout
lot suivant sera livré « vérifié uniquement dans le code » — c'est ce qui
a produit la situation actuelle.

MIGRATION — indicateur is_test
Ajouter `is_test boolean NOT NULL DEFAULT false` sur : profiles, clients,
demandes, payments, payment_links, expenses, appointments, employees.
Additif, aucune valeur existante modifiée.

Créer un index partiel sur chaque table : WHERE is_test = false.

FILTRAGE — la partie qui compte
Toute requête d'agrégation, de rapport, de compteur, de tableau de bord et
d'export exclut is_test = true PAR DÉFAUT. Un dossier de test qui gonfle
une statistique est un chiffre faux, exactement ce qu'on combat.

Implémentation : une fonction utilitaire unique côté serveur, appliquée
partout. Pas de filtre recopié à la main dans chaque requête — recense les
requêtes d'agrégation existantes et fais-les toutes passer par elle.

Un interrupteur « Afficher les données de test », visible uniquement pour
super_admin, permet de les voir quand c'est utile. Désactivé par défaut,
non mémorisé entre les sessions.

COMPTES À CRÉER — un par rôle
TEST_superadmin · TEST_admin · TEST_dg · TEST_daf · TEST_chefservice ·
TEST_agent · TEST_comptable · TEST_moderateur · TEST_partenaire
Plus TEST_client pour le portail client.

Adresses e-mail sur un domaine qui ne peut pas recevoir de courrier réel.
Mots de passe générés, transmis à Thierry hors dépôt, jamais committés.
TEST_chefservice et TEST_agent rattachés à un service réel, pour que les
portées `.service` et `.own` soient réellement exercées.

JEU DE DONNÉES DE TEST — minimal et suffisant
1 fiche client TEST_, 3 dossiers couvrant trois statuts distincts dont un
en retard et un en attente de documents, 1 rendez-vous, 1 lien de paiement
à 100 FCFA, 1 dépense en attente de validation, 1 message client, 1 note
interne. Tous marqués is_test = true.

TEST DE PAIEMENT — en suspens depuis le 7 septembre
Sur le lien de paiement TEST_ uniquement, exécuter enfin le test (f) de
P1b, de bout en bout : affichage par jeton → déclaration → statut modifié →
refus de la seconde déclaration. Coller les sorties réelles. Ne jamais
exécuter ce test sur un lien client.

ENVOIS RÉELS
Aucun e-mail, SMS ou WhatsApp n'est émis vers un compte TEST_. Vérifier le
point de sortie des envois et court-circuiter sur is_test.

LIVRABLES
docs/COMPTES_TEST.md : rôle, identifiant, service de rattachement, date.
Aucun mot de passe.
Récapitulatif : sorties des tests, liste des requêtes d'agrégation passées
par le filtre, confirmation que les compteurs du tableau de bord sont
inchangés avec les données de test présentes.

CRITÈRE D'ACCEPTATION
Se connecter avec chacun des dix comptes, ouvrir le tableau de bord, et
constater qu'aucun compteur n'a bougé par rapport à avant la création du
jeu de test.

═══════════════════════════════════════════════════════════
LOT L3 — MODULE DOSSIERS UNIQUE
═══════════════════════════════════════════════════════════

PRINCIPE
Ne câble pas AdminShell sur les pages existantes. app/dashboard/admin,
super-admin et agent ont chacun leurs propres pages pour demandes,
dossiers et paiements. Les envelopper dans un nouveau shell fige la
duplication au lieu de la retirer.

L3 fusionne d'abord, raccorde ensuite, sur UN SEUL module pilote :
Dossiers. C'est le plus utilisé, il existe en trois exemplaires, et il
porte les vues enregistrées qui remplacent précisément la séparation par
rôle. Une fois le patron prouvé sur lui, les modules suivants s'enchaînent.

ÉTAPE 1 — INVENTAIRE (lecture seule, à présenter avant d'écrire)
Lister toutes les pages et routes API qui traitent des demandes/dossiers,
dans les trois espaces. Pour chacune : chemin, rôle, colonnes affichées,
filtres, actions disponibles, requête utilisée, composants propres.

Produire un tableau de convergence : fonctionnalité → présente dans quelle
version → conservée dans le module unique O/N.

RÈGLE ABSOLUE : aucune fonctionnalité présente dans une des trois versions
ne disparaît. Si une version admin permet une action que la version agent
n'a pas, elle devient une action conditionnée par une permission, pas une
action supprimée.

ÉTAPE 2 — LE MODULE UNIQUE
Route : /dashboard/dossiers
Une seule page, un seul composant de liste, un seul composant de fiche.

Vues enregistrées en onglets, chacune étant un filtre pré-appliqué :
  Boîte de réception (nouvelles, non assignées)
  Mes dossiers (assigned_to = utilisateur)
  Actifs · Urgents · En retard · En attente client · Terminés · Archivés
Chaque utilisateur peut créer et enregistrer ses propres vues.

Les rôles ne changent pas la page, ils changent :
  - les LIGNES visibles, par RLS (all / service / own)
  - les ACTIONS disponibles, par assertPermission()
  - les COLONNES sensibles, masquées si la permission manque
Un agent et un admin ouvrent la même URL et voient la même interface,
peuplée différemment.

Colonnes : référence · client · service/pôle · statut · priorité · agent ·
date limite · dernier mouvement. Tri, filtres, recherche, sélection
multiple, actions groupées, export, colonnes configurables, densité.

Fiche dossier à onglets : Résumé · Documents · Messages · Paiements ·
Rendez-vous · Tâches · Historique. Panneau d'actions latéral. Notes
internes avec repère visuel permanent, jamais visibles du client.

Actions, chacune derrière sa permission : changer le statut (transitions
validées côté serveur) · affecter et réaffecter · demander un document ·
valider ou rejeter un document avec motif · envoyer un message · enregistrer
un paiement · créer une tâche · archiver.

Chaque transition écrit dans demande_status_history ET audit_log.

ÉTAPE 3 — RACCORDEMENT DU SHELL
Ce module, et lui seul pour l'instant, est rendu dans AdminShell.
L'entrée « Dossiers » apparaît dans le groupe Activité de la barre
latérale, avec un compteur = ce qui réclame une action de cet utilisateur.
Les autres entrées de menu n'apparaissent pas tant que leur module n'est
pas migré. Une entrée qui ne mène nulle part n'existe pas.

ÉTAPE 4 — BASCULE SANS PERTE
Les trois anciennes pages restent en place et fonctionnelles jusqu'à
validation de Thierry sur la prévisualisation. Puis elles redirigent en 301
vers /dashboard/dossiers avec le filtre équivalent. Suppression seulement
après validation explicite. Aucune suppression groupée.

ÉTAPE 5 — TESTS, avec les comptes de L2
Tableau à neuf lignes, une par rôle :
  - le nombre de dossiers visibles correspond-il à la portée attendue ?
  - un changement d'identifiant dans l'URL sur un dossier hors portée est-il
    refusé CÔTÉ SERVEUR ?
  - les actions autorisées sont-elles présentes, les autres absentes ?
  - une action non autorisée appelée directement en API est-elle refusée ?
  - les notes internes sont-elles invisibles pour TEST_client et
    TEST_partenaire ?
Un rôle qui accède à ce qu'il ne devrait pas est un échec de lot.

Plus : le compteur du menu mène à une liste contenant exactement ce nombre
de lignes. tsc, lint, build, sorties collées.

CRITÈRE D'ACCEPTATION
Les neuf rôles ouvrent /dashboard/dossiers, chacun voit son périmètre
correct, aucune fonctionnalité des trois anciennes versions n'a disparu,
et le tableau des neuf rôles est vert sur toutes les lignes.

═══════════════════════════════════════════════════════════
APRÈS L3
L4 Clients · L5 Rendez-vous · L6 Finance · L7 RH · L8 Contenus.
Même patron à chaque fois : inventaire des versions dupliquées, module
unique, raccordement au shell, bascule sans perte, test des neuf rôles.
Le tableau de bord vient après, quand les modules qu'il pointe existent.
═══════════════════════════════════════════════════════════
