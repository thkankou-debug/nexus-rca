# Dictionnaire des métriques — cahier des charges §13

> Chaque indicateur affiché dans les espaces d'administration : définition,
> source réelle, statuts inclus/exclus, champ de date, portée, route de
> détail. Fuseau : les dates « du jour » sont calculées sur la date locale
> du serveur (UTC sur Vercel) — l'alignement strict `Africa/Bangui` (§8.5)
> reste un chantier ouvert, signalé dans docs/AUDIT_CDC.md.
> Règle transverse (§13/§I.6) : pas de faux zéro (une donnée non mesurable
> affiche une explication), pas de % sans 30 j d'historique et dénominateur
> ≥ 20, agrégats par table source (aucune jointure multiplicatrice).

Statuts terminaux de dossier (exclus des indicateurs « actifs ») :
`termine, complete, refuse, annule, archive`.

## Vue d'ensemble (`/dashboard/vue-ensemble`, super_admin/admin)

| Indicateur | Définition + requête | Détail |
|---|---|---|
| À affecter | `demandes` : `agent_id IS NULL` ET `statut NOT IN (terminaux)` ; date : aucune (stock) | `/dashboard/dossiers` |
| En attente du client | `demandes.statut IN (en_attente, documents_demandes, dossier_incomplet, incomplet, devis_envoye, paiement_attente)` | `/dashboard/dossiers` |
| En traitement | `demandes.statut IN (en_cours, en_traitement, traitement, qualification, etude_faisabilite, devis_accepte, transmis_partenaire, decision_recue)` | `/dashboard/dossiers` |
| Répartition par étape | 6 buckets mappant les 21 valeurs de l'enum (mapping documenté dans la page) | — |
| Paiements à examiner | `payment_links.statut = 'paiement_declare'` | `/dashboard/super-admin/paiements/en-attente` |
| Échéances dépassées | `demandes.deadline < current_date` ET non terminal | onglet « En retard » du tableau |
| RDV de l'agence | `appointments.rdv_date = current_date` | liste inline |

Portée : agence entière ; `is_test` de la ligne = `is_test` du consultant
(règle L2). Le tableau « Dossiers à superviser » partage exactement les
mêmes lignes que les compteurs (même fetch, même instant — R19 par
construction sur cet écran).

## Trésorerie (`/dashboard/tresorerie`, daf/admin/super_admin)

| Indicateur | Définition | Détail |
|---|---|---|
| Encaissé (jour/7j/mois) | `payments.status='validated'`, somme `montant_recu`, date : `date_paiement` | panneau « Paiements à valider » (flux) |
| Ventes comptoir (mois) | `quick_sales`, somme `montant_total`, date : `created_at` | `/dashboard/accueil/recus` (par poste) |
| Décaissements (mois) | `expenses.statut='valide'`, somme `montant`, date : `created_at` | panneau « Dépenses » |
| Position nette | encaissé validé + ventes comptoir − dépenses validées (formule affichée à l'écran ; PAS un bénéfice comptable — FIN-06) | — |
| Paiements à valider | `payments.reconciled_at IS NOT NULL` ET `status NOT IN (validated, refunded, voided)` ET non legacy | liste inline avec action |
| Rapprochements soumis | `caisse_sessions.status='a_cloturer'` | liste inline avec action |
| Commissions à valider | `commissions.status='calculee'` | liste inline avec action |
| Créances par ancienneté | `echeanciers.status != 'paye'` ET `due_date < current_date`, buckets 1-30/31-60/61-90/91+ jours d'âge (`current_date - due_date`) | reste dû par client (jointure factures→clients, somme par client) |
| À échoir | idem, `due_date >= current_date` | — |

## Pilotage DG (`/dashboard/pilotage`, dg/super_admin)

| Indicateur | Définition | Note d'honnêteté |
|---|---|---|
| Dossiers entrés (mois) | `demandes.created_at >= début du mois` | — |
| Dossiers clos (mois) | statut terminal ET `updated_at` dans le mois | Approximation étiquetée à l'écran (l'historique de transitions démarre le 12/09 — voir DemandesManager §7.2) |
| Encaissé validé | comme Trésorerie | l'historique antérieur à la chaîne est hors chaîne (dit à l'écran) |
| Reste à encaisser | somme `echeanciers.amount` non payés | — |
| Évolution 12 mois | dossiers par mois de `created_at` ; encaissé par mois de `date_paiement` (validated) | — |
| Taux de succès par pôle | `termine+complete / (termine+complete+refuse)` ; « — » si dénominateur 0 | jamais 0 % sur dénominateur nul |
| Délai moyen | **NON AFFICHÉ** | `demande_status_history` vide avant le 12/09 ; à construire quand l'historique aura du volume |
| Sans mouvement 15 j | non terminal ET `updated_at < now()-15j` | liste des 8 plus anciens |
| Instructions non exécutées | `instructions.author_id = moi` ET `status='envoyee'` ; en retard si `due_date < current_date` | `/dashboard/instructions` |

## Mon service (`/dashboard/mon-service`, chef_service/super_admin)

Périmètre : `demandes.service_id = mon service` OU `categorie_dossier ∈`
pôle du service (`POLE_TO_CATEGORIES`, lib/demande-categories.ts —
service_id prioritaire, vide sur toutes les lignes au 12/09).

| Indicateur | Définition |
|---|---|
| Non assignées | périmètre ∧ actif ∧ `agent_id IS NULL` |
| Hors délai | périmètre ∧ actif ∧ `deadline < current_date` |
| RDV du jour | `appointments.rdv_date = current_date` ∧ `agent_id ∈ agents du service` (appointments n'a pas de service_id — approximation étiquetée) |
| Charge par agent | actifs du périmètre par `agent_id` |
| Absent aujourd'hui | `leave_requests` approuvées couvrant `current_date` pour les agents du service |

## Saisie du jour (`/dashboard/compta`, comptable/daf/admin/super_admin)

| Indicateur | Définition |
|---|---|
| Paiements saisis aujourd'hui | `payments.created_at >= minuit` (tous états) |
| À rapprocher | `payments.reconciled_at IS NULL` ∧ `status NOT IN (validated, refunded, voided)` ∧ non legacy |
| Déclarations clients | `payment_links.statut='paiement_declare'` |
| Dépenses saisies aujourd'hui | `expenses.created_at >= minuit` |

## Poste de réception (`/dashboard/accueil`, accueil_caisse/admin/super_admin)

| Indicateur | Définition |
|---|---|
| Fonds d'ouverture | `caisse_sessions.opening_balance` (session ouverte/soumise de l'opérateur) |
| Espèces encaissées | `quick_sales.mode_paiement='especes'` de l'opérateur depuis `opened_at`, somme `montant_total` (stockés NETS de monnaie rendue — convention §8.4 unique, pas de double soustraction) |
| Paiements électroniques | idem, `mode_paiement != 'especes'` — jamais dans le tiroir |
| Espèces théoriques | fonds d'ouverture + espèces encaissées (même calcul que `lib/caisse-server.ts`, source unique submit/close) |
| Dossiers à orienter | `demandes` actif ∧ `agent_id IS NULL` ∧ statut d'entrée (`nouveau, nouvelle_demande, qualification`) |
| File d'accueil | `reception_visits.status IN (en_attente, en_charge)` |

## Instructions (`/dashboard/instructions`, tout le staff)

| Indicateur | Définition |
|---|---|
| Reçues actives | `instruction_recipients.recipient_id = moi` ∧ instruction `envoyee` ∧ mon état ≠ `terminee` |
| En retard (badge) | instruction `envoyee` ∧ `due_date < current_date` |
| Escalade (cron quotidien) | mêmes critères, 1 relance max/jour (marqueur audit_log `instruction.escalade`) |
