# MISSION CLAUDE CODE — REFONTE FORMULAIRE /demande/complet

> **Document de gouvernance stricte pour Claude Code**
> Projet : Nexus RCA
> Auteur : Thierry Kankou
> Objectif : Transformer le formulaire marketing actuel en VRAI portail de soumission de dossier administratif

---

## CONTEXTE

Le formulaire actuel `/demande/complet` est un formulaire marketing.
Il doit être REMPLACÉ par un VRAI portail de soumission de dossier administratif,
inspiré des formulaires IRCC Canada, Schengen, et portails consulaires.

L'URL `/demande/complet` reste la même.
On REMPLACE le contenu, pas l'URL.

---

## INTERDICTIONS ABSOLUES

❌ NE PAS coder avant d'avoir terminé l'audit (Phase 1)
❌ NE PAS proposer de wizard "moderne" type SaaS
❌ NE PAS utiliser des questions marketing ("parlez-nous de vous", "votre projet", etc.)
❌ NE PAS toucher au logo, aux couleurs (#0C1C40 + #FF6600), aux polices
❌ NE PAS créer de dossier `{a,b,c}` dans `app/` (route group bug connu)
❌ NE PAS modifier les variables Vercel
❌ NE PAS supprimer le fichier existant avant validation explicite de Thierry
❌ NE PAS exécuter de SQL pendant l'audit
❌ NE PAS faire de `npm install` pendant l'audit

---

## PHASE 1 — AUDIT OBLIGATOIRE (à livrer AVANT tout code)

Tu dois explorer et lister :

### 1.1 Structure Supabase
- Schéma actuel de la table `demandes` (toutes les colonnes)
- Schéma de la table `clients`
- Schéma de la table `profiles`
- Politiques RLS sur ces 3 tables
- Buckets Supabase Storage existants
- Fonctions SQL custom (ex: `find_available_agent`)

### 1.2 Authentification
- Comment fonctionne `lib/auth.ts` (helper `requireProfile`)
- Logique de création de compte client (où, comment)
- Logique de login existante dans `/login`
- Gestion des sessions Supabase

### 1.3 Pages et composants existants
- Lecture COMPLÈTE de `app/demande/complet/page.tsx` actuel
- Composants UI réutilisables dans `components/ui/`
- Composants formulaire existants
- Helpers TypeScript dans `types/index.ts`

### 1.4 Logique métier actuelle
- API routes existantes pour les demandes (`app/api/`)
- Génération de référence (pattern `XXX-YYYY-NNNNNN`)
- Système d'envoi d'emails Resend (templates existants)
- Workflow actuel après soumission

### 1.5 Espace client (Nexus Connect)
- Comment les demandes apparaissent dans `/dashboard/client/demandes`
- Affichage du détail d'une demande
- Possibilité actuelle d'ajouter des documents après soumission

---

## PHASE 2 — PROPOSITION (à livrer APRÈS audit, AVANT code)

Après l'audit, tu proposes à Thierry :

### 2.1 Architecture finale
- Liste des fichiers à créer (chemins exacts)
- Liste des fichiers à modifier (chemins exacts)
- Liste des fichiers à PRÉSERVER tels quels

### 2.2 Migration SQL
- Nouvelles colonnes à ajouter à `demandes`
- Nouvelle table `demande_documents` (schéma complet)
- Nouvelle table `demande_sections` si nécessaire
- Politiques RLS pour les nouvelles tables
- Bucket Storage `dossiers-clients` (config + RLS)

### 2.3 Flux UX (à valider par Thierry)
- Étape 0 : Choix "Déjà client" / "Nouveau client"
- Étape 1-6 : Sections du formulaire (voir spécifications ci-dessous)
- Soumission finale + redirection
- Notification email Resend au client + au super_admin

### 2.4 Mapping des données
- Tableau : champ formulaire → colonne SQL
- Champs dynamiques selon service (visa/études/business/admin)

### 2.5 Stratégie d'upload
- Documents uploadés vers Supabase Storage
- Possibilité d'ajouter des documents APRÈS soumission depuis Nexus Connect
- Pas de blocage si documents incomplets

⚠️ **ATTENDRE LE "GO" EXPLICITE DE THIERRY AVANT PHASE 3.**

---

## PHASE 3 — CODE (uniquement après validation Phase 2)

### 3.1 Structure du formulaire (impérative)

#### ÉTAPE 0 — Identification du demandeur

Choix radio :
- ⚪ Je suis déjà client Nexus RCA → redirige vers `/login` puis revient au formulaire
- ⚪ Je suis un nouveau demandeur → continue le formulaire

#### SECTION 1 — IDENTIFICATION DU DEMANDEUR

Champs (tous obligatoires sauf indication) :
- Nom complet *
- Sexe (Masculin / Féminin / Autre) *
- Date de naissance *
- Nationalité * (select pays)
- Pays de résidence actuel *
- Ville de résidence *
- Adresse complète *
- Téléphone / WhatsApp *
- Email *
- Situation matrimoniale (Célibataire / Marié(e) / Divorcé(e) / Veuf(ve)) *
- Profession actuelle *
- Employeur / établissement (optionnel)
- Niveau d'études (Aucun / Primaire / Secondaire / Bac / Bac+2 / Bac+3 / Bac+5 / Doctorat) *

#### SECTION 2 — TYPE DE DEMANDE

- Service demandé (select) *
  - Visa & e-Visa
  - Études à l'étranger
  - Billet d'avion & Hôtels
  - Incubateur & Financement
  - Recouvrement de documents
  - Transferts d'argent
  - Autre service administratif
- Catégorie de demande * (dynamique selon service)
- Pays concerné * (select)
- Type de procédure *
- Date prévue du projet ou déplacement *
- Avez-vous déjà effectué cette démarche auparavant ? (OUI/NON) *
- Numéro de dossier existant (si applicable, conditionnel)

#### SECTION 3 — INFORMATIONS SPÉCIFIQUES (DYNAMIQUE)

**Si Service = Visa :**
- Type de passeport (Ordinaire / Diplomatique / Service)
- Numéro du passeport
- Date d'expiration du passeport
- Pays déjà visités (multi-select ou textarea)
- Refus de visa antérieur ? (OUI/NON)
- Si OUI : Pays du refus + Date approximative du refus
- Personne invitante ? (OUI/NON) + nom si oui
- Motif du voyage (Tourisme / Affaires / Études / Médical / Famille / Autre)
- Durée prévue du séjour (en jours)

**Si Service = Études :**
- Dernier diplôme obtenu
- Domaine d'études
- Niveau recherché (Licence / Master / Doctorat / Formation pro)
- Établissement ciblé (texte libre)
- Admission déjà obtenue ? (OUI/NON)
- Passeport disponible ? (OUI/NON)
- Niveau linguistique (FR/EN/Autre + niveau)
- Besoin de bourse ? (OUI/NON)

**Si Service = Business / Incubateur :**
- Nom de l'entreprise/projet
- Secteur d'activité
- Pays d'activité
- Stade du projet (Idée / Prototype / Lancé / En croissance)
- Type d'accompagnement recherché
- Société enregistrée ? (OUI/NON)

**Si Service = Administratif / Recouvrement :**
- Type de document demandé
- Organisme concerné
- Document déjà disponible ? (OUI/NON)
- Date limite si applicable

#### SECTION 4 — DOCUMENTS

Catégories d'upload (zone de drop par catégorie) :
1. Pièce d'identité
2. Passeport
3. Diplômes
4. Documents financiers
5. Documents administratifs
6. Lettre d'invitation
7. Photos d'identité
8. Documents complémentaires

Pour chaque catégorie afficher :
- Statut (vide / X fichier(s) uploadé(s))
- Nom des fichiers + taille
- Bouton supprimer
- Validation visuelle (icône check vert quand au moins 1 fichier)

⚠️ **AUCUNE catégorie n'est bloquante.** Le client peut soumettre sans uploader.

Message d'info affiché : *"Vous pourrez ajouter ou compléter vos documents après soumission depuis votre espace Nexus Connect."*

#### SECTION 5 — INFORMATIONS COMPLÉMENTAIRES

UN SEUL textarea :
- **Label** : "Informations complémentaires relatives à votre demande"
- **Placeholder** : "Précisez ici toute information utile au traitement de votre dossier (numéros de référence, contacts antérieurs, contraintes particulières, etc.)"
- **Optionnel**

#### SECTION 6 — VALIDATION

3 cases à cocher obligatoires :
- ☐ Je certifie l'exactitude des informations fournies
- ☐ J'autorise Nexus RCA à traiter mon dossier
- ☐ J'accepte d'être contacté par Nexus RCA concernant ma demande

Bouton final : `Soumettre la demande complète`

### 3.2 Design (respect strict charte Nexus)

- Background : blanc cassé / gris très clair (`bg-slate-50`)
- Cards de section : fond blanc, border subtile, ombre très légère
- Titre principal : `text-3xl` à `text-4xl` MAX, `font-display`
- En-tête de section : numéro dans cercle bleu marine + titre `font-display`
- Champs : style administratif (labels au-dessus, pas flottants)
- Boutons : bleu marine `#0C1C40`, accent orange `#FF6600` pour le bouton final
- Pas d'animations gadget
- Pas d'emojis dans les labels
- Pas de gradients flashy
- Esthétique : papier officiel, sobre, propre, dense en information

### 3.3 Flux technique

1. Client remplit le formulaire (state local React)
2. Auto-save brouillon en localStorage (au cas où)
3. Au clic "Soumettre" :
   - Validation Zod côté client
   - POST `/api/demandes/complete`
   - Si nouveau client : création auth Supabase + profile + client
   - Insert dans `demandes` avec toutes les données structurées
   - Upload documents vers Supabase Storage (bucket `dossiers-clients/{demande_id}/{categorie}/`)
   - Insert dans `demande_documents` (un row par fichier)
   - Génération référence `DEM-YYYY-NNNNNN`
   - Email Resend au client (accusé de réception avec numéro de dossier)
   - Email Resend au super_admin (notification nouveau dossier)
   - Redirection vers `/dashboard/client/demandes/{id}` (espace Nexus Connect)

### 3.4 Côté Nexus Connect

Dans `/dashboard/client/demandes/[id]` :
- Affichage complet du dossier (toutes sections)
- Section documents avec possibilité d'AJOUTER des documents complémentaires
- Statut du dossier (Reçu / En analyse / Documents requis / En traitement / Validé / Rejeté)
- Historique des échanges (si table messages existe, sinon prévoir hook futur)

---

## PHASE 4 — RÉCAP FINAL

À la fin, livrer :
- Liste exhaustive des fichiers créés
- Liste exhaustive des fichiers modifiés
- SQL exact de la migration (à exécuter manuellement)
- Variables d'environnement à ajouter (s'il y en a)
- Commande git de commit
- Checklist de tests à faire avant push prod

---

## RÈGLES NON NÉGOCIABLES

1. **PAS de code** avant fin de Phase 1 + 2
2. Si tu as un doute, tu **DEMANDES**, tu n'inventes pas
3. Si un fichier n'existe pas, tu le **DIS**, tu ne supposes pas
4. Tu **PRÉSERVES** tout l'existant qui n'est pas dans le scope
5. Tu **RESPECTES** la charte Nexus à 100%
6. Tu utilises **UNIQUEMENT** `lucide-react` pour les icônes
7. Tu utilises **UNIQUEMENT** TypeScript strict (pas de `any`)
8. Tu utilises **Zod** pour la validation côté serveur

---

## INSTRUCTION DE DÉMARRAGE

Lis intégralement ce document.

**Ne code RIEN pour le moment.**

Commence uniquement par la **Phase 1 — Audit obligatoire**.

Livre-moi le rapport d'audit complet, structuré section par section (1.1 à 1.5).

J'attends ton rapport avant de te donner le **GO** pour la Phase 2.

---

*Fin du brief.*
