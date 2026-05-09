# MISSION CLAUDE CODE — REFONTE COMPLÈTE DE LA GESTION DES DOSSIERS

> **Document de gouvernance stricte pour Claude Code**
> Projet : Nexus RCA
> Auteur : Thierry Kankou
> Mission : Refondre l'espace client (Nexus Connect) ET les espaces staff (agent / admin / super_admin) avec un système de catégorisation par dossier et une assignation d'agent fonctionnelle.

---

## ⚠️ PRÉ-REQUIS

Cette mission s'exécute **APRÈS** la refonte du formulaire `/demande/complet` (déjà en production).

Si tu vois que le formulaire actuel n'a PAS les nouvelles colonnes (sexe, date_naissance, nationalite, service_demande, etc.), **STOP** — me prévenir avant de commencer.

---

## CONTEXTE

L'écosystème actuel de gestion des dossiers présente des problèmes critiques :

### 🔴 Côté Client (Nexus Connect)
- Les cartes "Mes dossiers" sur le dashboard NE SONT PAS cliquables
- La page `/dashboard/client/demandes` est plate, sans interaction
- Aucune timeline / suivi visuel de l'évolution du dossier
- Aucun affichage du conseiller assigné
- Aucune possibilité d'ajouter des documents après soumission
- Aucune communication client ↔ conseiller
- Format de référence incohérent

### 🔴 Côté Staff (agent / admin / super_admin)
- Dashboard en désordre : impossible de retrouver rapidement un dossier
- AUCUNE catégorisation par service (visa, études, billets, etc.)
- AUCUN système d'assignation d'agent fonctionnel (bug `assigne_a` identifié)
- Pas de vue par catégorie de dossier
- Pas de spécialisation des agents

### 🎯 Objectif
Transformer cet écosystème en un VRAI portail de gestion administrative, type **portail consulaire IRCC**, **MyService Canada**, ou **France-Visas**, avec :
- Un espace client premium (Nexus Connect)
- Des dashboards staff organisés par catégorie de dossier
- Un système d'assignation d'agent par admin/super_admin
- Une spécialisation des agents par catégorie
- Des notifications email aux agents spécialistes

---

## INTERDICTIONS ABSOLUES

❌ NE PAS coder avant d'avoir terminé l'audit (Phase 1)
❌ NE PAS toucher au logo, aux couleurs (#0C1C40 + #FF6600), aux polices (Syne + Plus Jakarta Sans)
❌ NE PAS toucher au formulaire `/demande/complet` (vient d'être mis en prod)
❌ NE PAS toucher aux variables Vercel sans validation explicite
❌ NE PAS supprimer de fichiers existants sans validation explicite de Thierry
❌ NE PAS exécuter de SQL pendant l'audit
❌ NE PAS faire de `npm install` pendant l'audit
❌ NE PAS utiliser de phrases marketing
❌ NE PAS utiliser d'emojis dans les labels d'interface (sauf icônes lucide-react)
❌ NE PAS créer de dossier `{a,b,c}` dans `app/` (route group bug connu)
❌ NE PAS utiliser `toLocaleString("fr-FR")` dans un PDF (bug WinAnsi connu)

---

## PHASE 1 — AUDIT OBLIGATOIRE

Tu dois explorer et lister :

### 1.1 Pages client existantes
- `app/dashboard/client/page.tsx`
- `app/dashboard/client/demandes/page.tsx`
- `app/dashboard/client/demandes/[id]/page.tsx` (si existe)
- Layouts associés

### 1.2 Pages staff existantes
- `app/dashboard/agent/page.tsx`
- `app/dashboard/agent/demandes/page.tsx`
- `app/dashboard/agent/clients/page.tsx`
- `app/dashboard/admin/page.tsx`
- `app/dashboard/super-admin/page.tsx`
- Tous les layouts staff

### 1.3 Structure Supabase actuelle
- Schéma table `demandes` (toutes colonnes après migration formulaire)
- Schéma table `clients`
- Schéma table `profiles` (notamment colonnes agent : nom, email, photo, role)
- Schéma table `appointments`
- Schéma table `payments`
- Schéma table `demande_documents`
- Politiques RLS sur toutes ces tables
- Identifier le bug `assigne_a` (colonne mal nommée ou cassée)

### 1.4 Composants UI réutilisables
- `components/ui/`
- `components/dashboard/` (DashboardShell, etc.)
- Composants Card, Badge, Button, Modal existants

### 1.5 Logique d'assignation actuelle
- Comment un agent est-il (mal) assigné aujourd'hui ?
- Existe-t-il une fonction SQL `find_available_agent` ?
- Existe-t-il une UI pour assigner ?

### 1.6 Navigation et menus
- Sidebar / menu agent : que voit-il actuellement ?
- Sidebar / menu admin : que voit-il actuellement ?
- Sidebar / menu super_admin : que voit-il actuellement ?

### 1.7 Système d'emails Resend
- Templates existants
- Fonctions helper d'envoi d'email
- Variables d'environnement utilisées

⚠️ **NE PAS PASSER EN PHASE 2 SANS LE GO EXPLICITE DE THIERRY.**

---

## PHASE 2 — PROPOSITION D'ARCHITECTURE

Après l'audit, livrer à Thierry :

### 2.1 Architecture finale
- Liste exhaustive des fichiers à créer (chemins exacts)
- Liste exhaustive des fichiers à modifier (chemins exacts)
- Liste des fichiers à PRÉSERVER tels quels

### 2.2 Migration SQL complète
Un seul fichier de migration (numéro suivant disponible, ex: `019_refonte_dossiers.sql`) qui contient :
- Renommage `assigne_a` → `agent_id` (avec ALTER COLUMN propre)
- Ajout colonne `categorie_dossier` (ENUM ou TEXT) sur `demandes`
- Ajout colonne `current_step` (INT 1-6) sur `demandes`
- Ajout colonne `priorite` (TEXT : faible/normale/urgente) sur `demandes`
- Ajout colonne `specialites` (TEXT[]) sur `profiles` (pour agents spécialistes)
- Nouvelle table `demande_status_history` (id, demande_id, step, statut, changed_by, changed_at, notes)
- Nouvelle table `demande_documents_requests` (id, demande_id, type_attendu, description, demande_par, demande_le, statut, fourni_par_doc_id, fourni_le)
- Nouvelle table `demande_messages` (id, demande_id, auteur_id, contenu, created_at, lu_par_destinataire)
- Politiques RLS strictes pour chaque table
- Fonction SQL `auto_categorize_demande()` (trigger sur INSERT)
- Fonction SQL `notify_specialist_agents()` (trigger sur INSERT)

### 2.3 Mapping catégories ↔ services
Tableau complet :

| Catégorie | Services regroupés |
|---|---|
| `visa` | Visa & e-Visa |
| `etudes_bourses` | Études + Bourses + TCF + tests linguistiques |
| `billets_hotels` | Billets d'avion + Hôtels |
| `assurances` | Assurance voyage + Assurance santé + Assurance étudiante |
| `financement_incubateur` | Incubateur + Financement business |
| `digitalisation` | Sites web + Apps + Marketing digital |
| `recouvrement` | Recouvrement de documents administratifs |
| `transferts` | Transferts d'argent |
| `autres` | Tout le reste |

### 2.4 Mapping statuts par catégorie (6 étapes)

**🛂 VISA**
1. Dossier reçu
2. Vérification documents
3. Documents complémentaires requis
4. Dépôt à l'ambassade / consulat
5. En attente décision consulaire
6. Visa délivré (ou Refusé)

**🎓 ÉTUDES & BOURSES**
1. Dossier reçu
2. Analyse du profil
3. Documents complémentaires requis
4. Candidature soumise
5. En attente d'admission
6. Admission obtenue (ou Refusée)

**✈️ BILLETS & HÔTELS**
1. Dossier reçu
2. Recherche d'options
3. Validation client
4. Réservation en cours
5. Confirmation fournisseur
6. Billets / Réservations délivrés

**🛡️ ASSURANCES**
1. Dossier reçu
2. Analyse des besoins
3. Devis transmis
4. Validation client
5. Souscription en cours
6. Police d'assurance émise

**💼 FINANCEMENT & INCUBATEUR**
1. Dossier reçu
2. Évaluation du projet
3. Documents complémentaires requis
4. Présentation au comité
5. En attente de décision
6. Accompagnement validé (ou Refusé)

**💻 DIGITALISATION**
1. Dossier reçu
2. Cadrage du projet
3. Devis et contrat
4. Production en cours
5. Livraison et tests
6. Projet livré

**📜 RECOUVREMENT**
1. Dossier reçu
2. Identification de l'organisme
3. Pouvoirs / autorisations requis
4. Demande déposée
5. En attente de l'organisme
6. Document récupéré

**💰 TRANSFERTS**
1. Dossier reçu
2. Vérification destinataire
3. Justificatifs requis
4. Transfert initié
5. En cours d'acheminement
6. Transfert reçu

**📝 AUTRES**
1. Dossier reçu
2. En analyse
3. Documents requis
4. En traitement
5. En attente externe
6. Finalisé

### 2.5 Wireframe textuel des pages

#### Pages CLIENT
- Layout dashboard `/dashboard/client`
- Layout liste `/dashboard/client/demandes`
- Layout détail `/dashboard/client/demandes/[id]`

#### Pages STAFF (agent / admin / super_admin)
- Layout dashboard staff (cartes catégories + sidebar)
- Layout liste par catégorie `/dashboard/[role]/dossiers/[categorie]`
- Layout détail dossier staff `/dashboard/[role]/dossiers/[categorie]/[id]`
- Page assignation `/dashboard/[role]/dossiers/[id]/assigner` (admin/super_admin only)

⚠️ **ATTENDRE LE "GO" EXPLICITE DE THIERRY AVANT PHASE 3.**

---

## PHASE 3 — CODE (uniquement après validation Phase 2)

### 3.1 ESPACE CLIENT (NEXUS CONNECT)

#### A. Page `/dashboard/client` (Dashboard)

**Améliorations :**

1. **Cartes "Mes dossiers en cours" → CLIQUABLES**
   - Toute la carte cliquable
   - Hover : élévation subtile + curseur pointer
   - Clic → `/dashboard/client/demandes/[id]`

2. **Affichage enrichi de chaque carte :**
   - Icône lucide-react adaptée au service
   - Titre du dossier
   - Catégorie + Date de soumission
   - Numéro de dossier visible (DEM-2026-XXXXXX)
   - Badge de statut détaillé (couleur selon étape)
   - Mini progress bar (X / 6)
   - Indicateur "X document(s) requis" si applicable

3. **Conseiller assigné visible :**
   - Petite ligne en bas : "Conseiller : [Nom]"

#### B. Page `/dashboard/client/demandes` (Liste)

- Conserver les filtres existants (Tous / En cours / Nouveaux / Terminés / Annulés)
- Cartes cliquables (toute la card → détail)
- Affichage enrichi par carte (numéro, titre, statut, progress bar, conseiller, nb documents)
- Tri : par date + par statut
- Recherche : par numéro de dossier ou titre

#### C. Page `/dashboard/client/demandes/[id]` (Détail)

**Layout : 2 colonnes desktop, empilé mobile**

##### Section A — En-tête
- Numéro de dossier en grand
- Titre + Catégorie + Date de soumission
- Bouton "Télécharger PDF du dossier" (haut droite)

##### Section B — Timeline visuelle (sticky)
- 6 étapes alignées avec connecteurs
- Étape en cours : pastille orange + texte gras
- Étapes franchies : pastille verte ✓
- Étapes futures : pastille grise
- Date de passage si franchie
- Sur mobile : timeline verticale

##### Section C — Conseiller assigné (colonne droite)

Si assigné :
- Avatar (photo ou initiales)
- Nom complet + Rôle
- Email cliquable (mailto:)
- Bouton "Prendre rendez-vous"

Si pas assigné :
- Message : "Un conseiller vous sera bientôt assigné."

⚠️ Pas de WhatsApp agent (refusé par Thierry)

##### Section D — Documents (colonne gauche)

**D1 — Documents fournis** (groupés par catégorie : Pièce identité, Passeport, Diplômes, etc.)
- Pour chaque fichier : nom + taille + date upload + bouton télécharger
- Bouton supprimer (uniquement si statut = "Reçu")
- Badge "Validé" si conseiller a validé

**D2 — Documents demandés par le conseiller**
- Liste depuis `demande_documents_requests`
- Pour chaque demande : type + description + date + bouton "Téléverser"
- Statut : "En attente" ou "Fourni"

**D3 — Ajouter un document**
- Bouton "Ajouter un document" → modal
- Sélection catégorie + zone upload drag & drop

##### Section E — Récapitulatif des informations soumises (colonne gauche)

Composant accordéon :
- Section 1 — Identification
- Section 2 — Type de demande
- Section 3 — Informations spécifiques
- Section 4 — Documents (lien vers D)
- Section 5 — Informations complémentaires
- Section 6 — Validation

Mode lecture seule.

##### Section F — Messages (colonne droite)

- Liste des messages (récent → ancien)
- Avatar + nom auteur + date + contenu
- Au-dessus : textarea + bouton "Envoyer un message"
- Limite 1000 caractères
- Notifications email au conseiller (mais pas in-app pour V1)

##### Section G — Paiements liés (colonne droite)
- Filtrage par `payments.demande_id`
- Référence + montant + méthode + statut + date
- Si vide : "Aucun paiement enregistré pour ce dossier."

##### Section H — Actions rapides (colonne droite, bas)
1. Télécharger PDF du dossier
2. Prendre rendez-vous
3. Contacter le conseiller (scroll vers F)

---

### 3.2 ESPACE STAFF (AGENT / ADMIN / SUPER_ADMIN)

#### A. Dashboard staff (page principale)

**Layout :**

1. **En-tête** : salutation + résumé global (nb dossiers actifs, nb urgents, nb non assignés)

2. **9 GRANDES CARTES par catégorie** (grid responsive : 3x3 desktop, 1 colonne mobile)

Pour chaque carte :
- Icône lucide-react de la catégorie
- Nom de la catégorie (ex: "Dossiers Visa")
- Compteurs en gros :
  - Nombre de dossiers actifs
  - Nombre de nouveaux (non encore traités)
  - Nombre d'urgents
- Si l'agent est spécialiste de cette catégorie : badge orange "Votre spécialité"
- Toute la carte cliquable → `/dashboard/[role]/dossiers/[categorie]`
- Hover : élévation + bordure orange

3. **Sidebar enrichie** :
- Tableau de bord
- Mes dossiers (filtré par agent connecté)
- Dossiers Visa
- Dossiers Études & Bourses
- Dossiers Billets & Hôtels
- Dossiers Assurances
- Dossiers Financement
- Dossiers Digitalisation
- Dossiers Recouvrement
- Dossiers Transferts
- Autres dossiers
- Clients
- Paiements
- Rendez-vous
- (etc. selon role)

#### B. Page liste par catégorie `/dashboard/[role]/dossiers/[categorie]`

**Améliorations :**

1. **En-tête** : icône catégorie + titre + compteurs (actifs / nouveaux / urgents)

2. **Filtres avancés** :
- Par statut (toutes les 6 étapes)
- Par agent assigné (dropdown avec tous les agents)
- Par priorité
- Par date (cette semaine, ce mois, etc.)
- Par client (recherche)
- Non assignés (case à cocher)

3. **Table ou cards** (au choix de Claude Code, mais responsive) :
- Numéro dossier
- Client (nom + email)
- Service précis
- Catégorie
- Statut + progress bar (X/6)
- Agent assigné (avec photo/initiales)
- Date de soumission
- Priorité
- Bouton "Voir détail"
- Bouton "Assigner" (admin/super_admin only)

4. **Tri** : par date / par priorité / par statut

5. **Recherche** : par numéro dossier ou nom client

#### C. Page détail dossier staff `/dashboard/[role]/dossiers/[categorie]/[id]`

**Tout ce qu'a la page client +** :

1. **Bandeau staff en haut** :
- Sélecteur de statut (passer à l'étape suivante)
- Sélecteur de priorité
- Bouton "Assigner un agent" (admin/super_admin only)
- Bouton "Demander un document"

2. **Section "Demander un document au client"** :
- Modal avec :
  - Liste prédéfinie de types de documents (checkbox multi-select)
  - Champ "Précisions / contexte" (textarea libre)
  - Bouton "Envoyer la demande"
- À l'envoi : insert dans `demande_documents_requests` + email Resend au client

3. **Section messages : pleine fonctionnalité** (envoi + lecture, comme client)

4. **Historique du dossier (timeline complète)** :
- Tous les changements de statut avec date + auteur
- Toutes les demandes de documents avec date
- Tous les uploads avec date + auteur (client ou conseiller)

5. **Section "Notes internes" (admin/super_admin only)** :
- Notes non visibles par le client
- Pour collaboration entre staff

#### D. Page assignation `/dashboard/[role]/dossiers/[id]/assigner`

**Accessible uniquement à admin et super_admin.**

- En-tête : numéro dossier + catégorie + service
- Liste des agents disponibles avec :
  - Photo / initiales
  - Nom + email
  - Spécialités (badges)
  - Charge actuelle (nb dossiers actifs)
  - Bouton "Assigner ce dossier"
- À l'assignation :
  - Update `demandes.agent_id`
  - Insert dans `demande_status_history` (qui a assigné, quand)
  - Email Resend à l'agent assigné : "Nouveau dossier assigné"
  - Email Resend au client : "Un conseiller a été assigné à votre dossier"
  - Notification in-app pour l'agent (badge sur dashboard)

---

### 3.3 SYSTÈME D'ASSIGNATION ET DE NOTIFICATIONS

#### Workflow d'arrivée d'un nouveau dossier

1. Client soumet le formulaire `/demande/complet`
2. Trigger SQL `auto_categorize_demande()` :
   - Lit le `service_demande`
   - Détermine la `categorie_dossier` correspondante (mapping 2.3)
   - Update la ligne avec la catégorie
3. Trigger SQL `notify_specialist_agents()` :
   - Cherche tous les agents avec `'visa'` (par exemple) dans leurs `specialites`
   - Envoie un email Resend à chacun via Edge Function ou via API route appelée
4. Le dossier apparaît dans :
   - L'espace client du client
   - Le dashboard de la catégorie `/dashboard/[role]/dossiers/visa`
   - Avec statut "Non assigné" + badge orange

#### Workflow d'assignation manuelle

1. Admin/super_admin va dans la page liste de la catégorie
2. Clique sur "Assigner" sur une carte
3. Choisit un agent dans la liste (avec sa charge actuelle visible)
4. Confirme
5. Le système :
   - Update `agent_id` sur le dossier
   - Insert historique
   - Email à l'agent
   - Email au client

#### Spécialisation des agents

- Champ `specialites` sur table `profiles` (ARRAY de TEXT)
- Page de gestion des agents `/dashboard/super-admin/agents` :
  - Liste des agents
  - Bouton "Modifier les spécialités" pour chaque agent
  - Multi-select des 9 catégories
- Au login d'un agent, son dashboard met en avant ses dossiers de spécialité

---

### 3.4 DESIGN (charte Nexus stricte)

- Background dashboard : `bg-slate-50` (light) ou navy (selon existant)
- Cards : fond blanc, border `border-slate-200`, ombre légère
- Bordure orange `border-nexus-orange-500` sur cards "Action requise" / "Urgent" / "Non assigné"
- Titres sections : `font-display` (Syne)
- Numéros de dossier : `font-mono` pour le côté administratif
- Timeline : ligne horizontale avec pastilles colorées
- Boutons primaires : `bg-nexus-blue-950` text blanc
- Boutons d'action critique : `bg-nexus-orange-500`
- Pas d'animations gadget
- Responsive mobile-first
- Lucide-react UNIQUEMENT pour les icônes
- Pas d'emojis dans les labels

---

### 3.5 EMAILS RESEND À CRÉER

Templates à créer dans `lib/email/templates/` :

1. `agent-nouveau-dossier-specialite.tsx` — Notif aux agents spécialistes
2. `agent-dossier-assigne.tsx` — Notif à l'agent quand un admin l'assigne
3. `client-conseiller-assigne.tsx` — Notif au client quand un conseiller est assigné
4. `client-document-demande.tsx` — Notif au client quand le conseiller demande un document
5. `agent-message-client.tsx` — Notif à l'agent quand le client envoie un message
6. `agent-document-fourni.tsx` — Notif à l'agent quand le client a uploadé un doc demandé
7. `client-statut-change.tsx` — Notif au client à chaque changement d'étape

Chaque email doit utiliser :
- Logo Nexus en en-tête
- Couleurs charte (#0C1C40 + #FF6600)
- Lien direct vers le dossier concerné
- Footer avec coordonnées Nexus

---

## PHASE 4 — RÉCAP FINAL

À la fin, livrer :

### 4.1 Fichiers
- Liste exhaustive des fichiers créés (chemins exacts)
- Liste exhaustive des fichiers modifiés (chemins exacts)
- Liste des fichiers à PRÉSERVER (formulaire, dashboards inchangés)

### 4.2 Migration SQL
- Nom du fichier (ex: `019_refonte_dossiers.sql`)
- Contenu complet
- ⚠️ NE PAS L'EXÉCUTER — me le livrer pour validation

### 4.3 Variables d'environnement
- Liste des variables à ajouter sur Vercel (s'il y en a)

### 4.4 Commande git
```bash
git add .
git commit -m "feat: refonte complète gestion dossiers (client + staff) avec catégorisation et assignation"
git push
```

### 4.5 Checklist de tests à faire AVANT push prod

#### Tests client
- [ ] Dashboard : cartes cliquables → arrive sur le détail
- [ ] Détail : timeline affiche l'étape en cours
- [ ] Détail : peut uploader un document complémentaire
- [ ] Détail : peut envoyer un message
- [ ] Détail : peut télécharger le PDF du dossier
- [ ] Détail : voit le conseiller assigné (si assigné)
- [ ] Mobile : tout est responsive

#### Tests staff
- [ ] Dashboard agent : voit les 9 cartes de catégories
- [ ] Dashboard agent : voit ses spécialités mises en avant
- [ ] Liste catégorie : peut filtrer / trier / rechercher
- [ ] Détail staff : peut changer le statut
- [ ] Détail staff : peut demander un document
- [ ] Détail staff : peut envoyer un message
- [ ] Admin : peut assigner un agent à un dossier
- [ ] Super_admin : peut modifier les spécialités d'un agent

#### Tests système
- [ ] Nouveau dossier soumis → catégorie auto attribuée
- [ ] Nouveau dossier soumis → email aux agents spécialistes
- [ ] Assignation → email à l'agent + au client
- [ ] Message client → email à l'agent
- [ ] Document demandé par agent → email au client
- [ ] Document fourni par client → email à l'agent

#### Tests RLS (sécurité)
- [ ] Un client ne peut PAS voir les dossiers d'un autre client
- [ ] Un agent ne peut PAS voir les notes internes (sauf admin/super_admin)
- [ ] Un client ne peut PAS voir les notes internes
- [ ] Un agent NON assigné peut voir le dossier (lecture seule)
- [ ] Un agent assigné peut éditer le dossier

---

## RÈGLES NON NÉGOCIABLES

1. **PAS de code** avant fin de Phase 1 + 2
2. Si tu as un doute, tu **DEMANDES**, tu n'inventes pas
3. Si un fichier n'existe pas, tu le **DIS**, tu ne supposes pas
4. Tu **PRÉSERVES** tout l'existant qui n'est pas dans le scope
5. Le **formulaire `/demande/complet`** est INTOUCHABLE
6. Tu **RESPECTES** la charte Nexus à 100%
7. Tu utilises **UNIQUEMENT** `lucide-react` pour les icônes
8. Tu utilises **UNIQUEMENT** TypeScript strict (pas de `any`)
9. Tu utilises la **validation maison** existante (pas Zod)
10. Tu **APPLIQUES** `sanitizeForPdf()` sur TOUT texte inséré dans un PDF
11. Tu **TESTES** que la RLS fonctionne (notamment isolation client / staff)
12. Tu **NE TOUCHES PAS** au système de paiements existant
13. Tu **NE TOUCHES PAS** au système de RDV existant (sauf pour afficher dans le dossier)

---

## INSTRUCTION DE DÉMARRAGE

Lis intégralement ce document.

**Ne code RIEN pour le moment.**

Commence uniquement par la **Phase 1 — Audit obligatoire**.

Livre-moi le rapport d'audit complet, structuré section par section (1.1 à 1.7).

J'attends ton rapport avant de te donner le **GO** pour la Phase 2.

---

*Fin du brief.*
