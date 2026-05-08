# MISSION CLAUDE CODE — REFONTE NEXUS CONNECT (ESPACE CLIENT)

> **Document de gouvernance stricte pour Claude Code**
> Projet : Nexus RCA
> Auteur : Thierry Kankou
> Objectif : Transformer l'espace client actuel en un VRAI portail premium de suivi de dossiers, inspiré IRCC Canada / MyService Canada

---

## ⚠️ PRÉ-REQUIS

Cette mission s'exécute **APRÈS** la mission de refonte du formulaire `/demande/complet`.
Si la refonte du formulaire n'est pas encore en production, **STOP** — me prévenir avant de commencer.

---

## CONTEXTE

L'espace client actuel (`/dashboard/client/*`) présente plusieurs problèmes critiques :

❌ Les cartes "Mes dossiers" sur le dashboard NE SONT PAS cliquables
❌ La page `/dashboard/client/demandes` est plate, sans interaction
❌ Aucune timeline / suivi visuel de l'évolution du dossier
❌ Aucun affichage du conseiller assigné
❌ Aucune possibilité d'ajouter des documents après soumission
❌ Aucune communication client ↔ conseiller
❌ Format de référence incohérent (`A8291DE4` au lieu de `DEM-2026-XXXXXX`)
❌ Statuts trop simplistes ("NOUVEAU" / "EN COURS")

L'espace doit devenir un VRAI portail premium type **portail consulaire IRCC**, **MyService Canada**, ou **France-Visas**.

---

## INTERDICTIONS ABSOLUES

❌ NE PAS coder avant d'avoir terminé l'audit (Phase 1)
❌ NE PAS toucher au logo, aux couleurs (#0C1C40 + #FF6600), aux polices (Syne + Plus Jakarta Sans)
❌ NE PAS modifier l'espace agent ou super-admin (hors scope)
❌ NE PAS toucher aux variables Vercel
❌ NE PAS supprimer de fichiers existants sans validation explicite de Thierry
❌ NE PAS exécuter de SQL pendant l'audit
❌ NE PAS faire de `npm install` pendant l'audit
❌ NE PAS utiliser de phrases marketing ("votre projet", "votre parcours", etc.)
❌ NE PAS utiliser d'emojis dans les labels d'interface
❌ NE PAS créer de dossier `{a,b,c}` dans `app/` (route group bug connu)

---

## PHASE 1 — AUDIT OBLIGATOIRE

Tu dois explorer et lister :

### 1.1 Pages existantes à refondre
- Lecture COMPLÈTE de `app/dashboard/client/page.tsx`
- Lecture COMPLÈTE de `app/dashboard/client/demandes/page.tsx`
- Lecture COMPLÈTE de `app/dashboard/client/demandes/[id]/page.tsx` (si existe)
- Lecture des layouts utilisés (`app/dashboard/client/layout.tsx`, `DashboardShell`)

### 1.2 Structure Supabase actuelle
- Schéma table `demandes` (toutes les colonnes APRÈS la migration 018 du formulaire)
- Schéma table `demande_documents`
- Schéma table `appointments`
- Schéma table `payments`
- Schéma table `clients`
- Schéma table `profiles` (notamment colonnes agent : nom, email, photo)
- Politiques RLS sur toutes ces tables (ce que peut voir un client)

### 1.3 Composants UI réutilisables
- Composants existants dans `components/ui/`
- Composants dashboard dans `components/dashboard/`
- Composants Card, Badge, Button, Modal existants

### 1.4 Logique métier actuelle
- Comment le client voit ses demandes aujourd'hui
- Comment le client voit ses paiements aujourd'hui
- Comment le client voit ses RDV aujourd'hui
- Format actuel des références (DEM-YYYY-NNNNNN ou autre ?)

### 1.5 Système d'upload existant
- Comment l'upload fonctionne actuellement (bucket, RLS, helpers)
- Composant d'upload réutilisable existant ?

### 1.6 Affectation agent
- Comment un agent est-il affecté à un client/dossier actuellement ?
- Existe-t-il une colonne `agent_id` sur `demandes` ou via la table `clients` ?

⚠️ **NE PAS PASSER EN PHASE 2 SANS LE GO EXPLICITE DE THIERRY.**

---

## PHASE 2 — PROPOSITION D'ARCHITECTURE

Après l'audit, livrer à Thierry :

### 2.1 Architecture finale
- Liste des fichiers à créer (chemins exacts)
- Liste des fichiers à modifier (chemins exacts)
- Liste des fichiers à PRÉSERVER tels quels

### 2.2 Migration SQL (à valider AVANT exécution)
- Nouvelles colonnes à ajouter à `demandes` (statut détaillé, agent assigné, etc.)
- Nouvelle table `demande_status_history` (historique des changements de statut)
- Nouvelle table `demande_documents_requests` (documents demandés par le conseiller)
- Nouvelle table `demande_messages` (commentaires basiques client ↔ agent)
- Politiques RLS pour chaque nouvelle table
- Fonction SQL pour récupérer les étapes selon le service

### 2.3 Mapping des statuts par service
Tableau : service → 6 étapes spécifiques (voir spécifications Phase 3.2)

### 2.4 Wireframe textuel des pages
- Layout dashboard `/dashboard/client`
- Layout liste `/dashboard/client/demandes`
- Layout détail `/dashboard/client/demandes/[id]`

⚠️ **ATTENDRE LE "GO" EXPLICITE DE THIERRY AVANT PHASE 3.**

---

## PHASE 3 — CODE (uniquement après validation Phase 2)

### 3.1 Page `/dashboard/client` (Dashboard)

**Améliorations :**

1. **Cartes "Mes dossiers en cours" → CLIQUABLES**
   - Toute la carte est cliquable
   - Au hover : élévation subtile + curseur pointer
   - Clic → redirection vers `/dashboard/client/demandes/[id]`

2. **Affichage enrichi de chaque carte :**
   - Icône de service (lucide-react adaptée au service)
   - Titre du dossier
   - Service + Date de soumission
   - **Numéro de dossier visible** (DEM-2026-XXXXXX)
   - Badge de statut détaillé (couleur selon étape)
   - **Mini progress bar** indiquant l'avancement (% ou step actuel / 6)
   - Indicateur "X document(s) requis" si applicable (orange clignotant subtil)

3. **Conseiller assigné visible (si assigné) :**
   - Petite ligne en bas de la carte : "Conseiller : [Nom]"

### 3.2 Statuts détaillés par service (6 étapes par service)

**🛂 VISA & e-Visa**
1. Dossier reçu
2. Vérification documents
3. Documents complémentaires requis
4. Dépôt à l'ambassade / consulat
5. En attente décision consulaire
6. Visa délivré (ou ❌ Refusé)

**🎓 ÉTUDES**
1. Dossier reçu
2. Analyse du profil
3. Documents complémentaires requis
4. Candidature soumise à l'établissement
5. En attente d'admission
6. Admission obtenue (ou ❌ Refusée)

**✈️ BILLET D'AVION & HÔTELS**
1. Dossier reçu
2. Recherche d'options
3. Validation client
4. Réservation en cours
5. Confirmation fournisseur
6. Billets / Réservations délivrés

**💼 INCUBATEUR & FINANCEMENT**
1. Dossier reçu
2. Évaluation du projet
3. Documents complémentaires requis
4. Présentation au comité
5. En attente de décision
6. Accompagnement validé (ou ❌ Refusé)

**📜 RECOUVREMENT DE DOCUMENTS**
1. Dossier reçu
2. Identification de l'organisme
3. Pouvoirs / autorisations requis
4. Demande déposée
5. En attente de l'organisme
6. Document récupéré

**💰 TRANSFERTS D'ARGENT**
1. Dossier reçu
2. Vérification destinataire
3. Justificatifs requis
4. Transfert initié
5. En cours d'acheminement
6. Transfert reçu

**📝 AUTRE SERVICE ADMINISTRATIF**
1. Dossier reçu
2. En analyse
3. Documents requis
4. En traitement
5. En attente externe
6. Finalisé

**Couleurs des étapes :**
- Étape en cours : `nexus-orange-500` (#FF6600)
- Étapes franchies : `green-600`
- Étapes futures : `slate-300`
- Statut "Refusé" / "Annulé" : `red-600`

### 3.3 Page `/dashboard/client/demandes` (Liste)

**Améliorations :**

1. **Conserver les filtres existants** (Tous / En cours / Nouveaux / Terminés / Annulés)
2. **Cartes cliquables** (toute la card → détail dossier)
3. **Affichage enrichi par carte :**
   - Numéro de dossier en gros
   - Titre + Service + Catégorie
   - Statut détaillé avec icône
   - Mini progress bar (étape X / 6)
   - Date de soumission
   - Conseiller assigné (si applicable)
   - Nombre de documents joints
   - Badge orange "Action requise" si documents demandés non fournis

4. **Tri** : par date (récent / ancien) + par statut
5. **Recherche** : par numéro de dossier ou titre

### 3.4 Page `/dashboard/client/demandes/[id]` (Détail dossier)

**Layout : 2 colonnes sur desktop, empilé sur mobile**

#### Section A — En-tête (pleine largeur)
- Numéro de dossier (DEM-2026-XXXXXX) en grand
- Titre du dossier
- Service + Catégorie
- Date de soumission
- Bouton "Télécharger PDF du dossier" (en haut à droite)

#### Section B — Timeline visuelle (pleine largeur, sticky en haut)

**Composant Timeline horizontale :**
- 6 étapes alignées avec connecteurs entre elles
- Étape en cours : pastille orange + texte gras
- Étapes franchies : pastille verte avec ✓ + texte normal
- Étapes futures : pastille grise + texte gris
- Au-dessus de chaque étape : nom de l'étape
- En dessous : date de passage (si franchie)

**Sur mobile :** Timeline verticale (empilée)

#### Section C — Conseiller assigné (colonne droite)

Si conseiller assigné :
- Avatar (photo ou initiales)
- Nom complet
- Rôle ("Conseiller dossier")
- Email (cliquable, ouvre mailto:)
- Bouton "Prendre rendez-vous" → /dashboard/client/rdv/nouveau?conseiller=[id]

Si pas encore assigné :
- Message : "Un conseiller vous sera bientôt assigné."

#### Section D — Documents (colonne gauche, principale)

**Sous-section D1 — Documents fournis**

Liste des documents uploadés (groupés par catégorie) :
- Pièce d'identité (X fichiers)
- Passeport (X fichiers)
- Diplômes (X fichiers)
- ...

Pour chaque fichier :
- Nom + taille
- Date d'upload
- Bouton "Télécharger"
- Bouton "Supprimer" (uniquement si dossier statut = "Reçu")
- Badge "Validé" si conseiller a validé le doc

**Sous-section D2 — Documents demandés par le conseiller**

Si le conseiller a demandé des documents complémentaires :
- Liste des documents demandés (depuis `demande_documents_requests`)
- Pour chaque demande :
  - Type de document demandé
  - Description / précision du conseiller
  - Date de la demande
  - Bouton "Téléverser ce document" (zone d'upload)
  - Statut : "En attente" ou "Fourni"

Si rien demandé : afficher message info "Aucun document complémentaire requis pour le moment."

**Sous-section D3 — Ajouter d'autres documents**

Bouton "Ajouter un document" → ouvre modal :
- Sélection de la catégorie (pièce d'identité, passeport, etc.)
- Zone d'upload (drag & drop)
- Bouton "Envoyer"

#### Section E — Récapitulatif des informations soumises (colonne gauche)

**Composant accordéon** avec les 6 sections du formulaire :

Section repliable / dépliable :
- Section 1 — Identification du demandeur
- Section 2 — Type de demande
- Section 3 — Informations spécifiques
- Section 4 — Documents (lien vers section D)
- Section 5 — Informations complémentaires
- Section 6 — Validation (cases cochées au moment de la soumission)

Affichage en mode lecture seule (pas modifiable).

#### Section F — Messages / Commentaires (colonne droite)

**Composant simple type fil de commentaires :**

- Liste des messages (du plus récent au plus ancien)
- Pour chaque message :
  - Avatar + nom de l'auteur (client ou conseiller)
  - Date / heure
  - Contenu du message
- Au-dessus : textarea + bouton "Envoyer un message"
- Limite : 1000 caractères
- Pas de notifications email pour cette V1 (juste in-app)

#### Section G — Paiements liés à ce dossier (colonne droite)

Liste des paiements liés à cette demande :
- Référence paiement (PAY-LINK-2026-XXXXXX)
- Montant + devise
- Méthode (Orange Money, Virement, etc.)
- Statut (En attente / Validé / Refusé)
- Date

Si aucun paiement : "Aucun paiement enregistré pour ce dossier."

#### Section H — Actions rapides (colonne droite, en bas)

3 boutons :
1. **"Télécharger PDF du dossier"** (génère un PDF récapitulatif complet)
2. **"Prendre rendez-vous"** (redirige vers /dashboard/client/rdv/nouveau)
3. **"Contacter le conseiller"** (scroll vers section F messages)

### 3.5 Design (charte Nexus stricte)

- Background dashboard : `bg-slate-50` ou navy `bg-nexus-blue-950` (selon existant)
- Cards : fond blanc, border subtile `border-slate-200`, ombre légère
- Bordure orange `border-nexus-orange-500` sur les cards "Action requise"
- Titres sections : `font-display` (Syne)
- Numéros de dossier : `font-mono` pour le côté administratif
- Timeline : ligne horizontale avec pastilles colorées
- Boutons primaires : `bg-nexus-blue-950` text blanc
- Boutons d'action critique : `bg-nexus-orange-500`
- Pas d'animations gadget
- Responsive mobile-first
- Lucide-react UNIQUEMENT pour les icônes

### 3.6 Flux technique

**Page détail :**
1. Server Component qui récupère le dossier + documents + messages + paiements + conseiller
2. Vérification RLS : le client ne voit QUE ses propres dossiers
3. Composants client pour les interactions (upload, messages, accordéons)
4. Server Actions pour les actions (upload doc, envoyer message, supprimer doc)

**Upload document complémentaire :**
1. Client choisit la catégorie + sélectionne fichier
2. Server Action : upload vers Supabase Storage `demande-documents/{demande_id}/{categorie}/`
3. Insert dans `demande_documents` avec `categorie`, `uploade_par`, `taille_bytes`, etc.
4. Si c'était une demande du conseiller, marquer `demande_documents_requests.fourni = true`
5. Email Resend au conseiller : "Votre client a fourni un document"

**Envoi message :**
1. Client tape message + clic envoyer
2. Server Action : insert dans `demande_messages`
3. Email Resend au conseiller (notification)
4. Refresh de la liste de messages

**Génération PDF dossier :**
1. Server Action utilisant `pdf-lib`
2. Récupère toutes les infos du dossier
3. Génère PDF récapitulatif (toutes sections + liste documents)
4. ⚠️ **APPLIQUER `sanitizeForPdf()`** sur tous les textes (bug WinAnsi connu)
5. Retourne le PDF en téléchargement

---

## PHASE 4 — RÉCAP FINAL

À la fin, livrer :
- Liste exhaustive des fichiers créés
- Liste exhaustive des fichiers modifiés
- SQL exact de la migration (à exécuter manuellement APRÈS validation Thierry)
- Variables d'environnement à ajouter (s'il y en a)
- Commande git de commit
- Checklist de tests à faire avant push prod :
  - [ ] Cliquer sur une carte du dashboard → arrive sur le détail
  - [ ] Voir la timeline avec étape en cours
  - [ ] Uploader un document complémentaire
  - [ ] Envoyer un message
  - [ ] Télécharger le PDF du dossier
  - [ ] Vérifier sur mobile (responsive)
  - [ ] Vérifier qu'un autre client ne peut PAS voir ce dossier (RLS)

---

## RÈGLES NON NÉGOCIABLES

1. **PAS de code** avant fin de Phase 1 + 2
2. Si tu as un doute, tu **DEMANDES**, tu n'inventes pas
3. Si un fichier n'existe pas, tu le **DIS**, tu ne supposes pas
4. Tu **PRÉSERVES** tout l'existant qui n'est pas dans le scope (dashboard agent / super-admin INTOUCHABLES)
5. Tu **RESPECTES** la charte Nexus à 100%
6. Tu utilises **UNIQUEMENT** `lucide-react` pour les icônes
7. Tu utilises **UNIQUEMENT** TypeScript strict (pas de `any`)
8. Tu utilises la **validation maison** existante (cohérence avec le projet, pas de Zod)
9. Tu **APPLIQUES** `sanitizeForPdf()` sur TOUT texte inséré dans un PDF
10. Tu **TESTES** que la RLS fonctionne (un client ne voit pas les dossiers d'un autre client)

---

## INSTRUCTION DE DÉMARRAGE

Lis intégralement ce document.

**Ne code RIEN pour le moment.**

Commence uniquement par la **Phase 1 — Audit obligatoire**.

Livre-moi le rapport d'audit complet, structuré section par section (1.1 à 1.6).

J'attends ton rapport avant de te donner le **GO** pour la Phase 2.

---

*Fin du brief.*
