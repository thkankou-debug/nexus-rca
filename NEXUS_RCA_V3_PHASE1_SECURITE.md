# NEXUS RCA — PHASE 1 : SÉCURITÉ
**Amendement 3 au Blueprint V3** · 5 septembre 2026
Après lecture de `docs/RLS_ETAT_REEL.md` et `docs/ECARTS_SCHEMA_TYPES.md`

---

## A. LE CLASSEMENT DES URGENCES EST À INVERSER

La baseline conclut que `payment_links` est le point à traiter en premier, et range l'auto-élévation de rôle sur `profiles` en « à vérifier en P1 ». **C'est l'inverse.**

### A.1 Le vrai point critique : `profiles`

```
Policy « Users can update own profile » — UPDATE — USING (auth.uid() = id)
```

Postgres n'applique pas de restriction de colonne sur un `UPDATE` couvert par RLS. Cette policy autorise donc un utilisateur à écrire **n'importe quelle colonne de sa propre ligne**, `role` compris. S'il n'existe pas de trigger `BEFORE UPDATE` qui bloque le changement de `role`, alors :

```
PATCH /rest/v1/profiles?id=eq.<son_propre_id>   { "role": "super_admin" }
```

suffit à faire de n'importe quel client inscrit un super-administrateur.

**Et tout le reste du système de sécurité repose sur cette colonne.** `is_staff()`, `is_admin()`, `get_user_role()` lisent `profiles.role`. Les 128 policies de la base s'appuient sur ces fonctions. Le middleware et `requireProfile()` lisent la même colonne. Si `role` est auto-modifiable, **les 40 tables sont ouvertes en écriture à quiconque crée un compte** — la fuite `payment_links` devient un détail à côté.

Ce n'est pas encore confirmé : il faut vérifier s'il existe un trigger de protection. Mais c'est une requête, pas une phase. **À vérifier dans l'heure, pas « en P1 ».**

### A.2 `payment_links` : le rapport a sous-estimé la portée

Le rapport décrit une fuite en **lecture**. Il note séparément que l'UPDATE est « ouverte si statut encore modifiable ou si staff ». Les deux mis ensemble donnent autre chose : un tiers lit la table entière, récupère **toutes les références**, et se sert de cette policy UPDATE pour modifier des liens de paiement qui ne le concernent pas. La lecture ouverte transforme une policy d'écriture « scopée par référence connue » en écriture ouverte, puisque plus aucune référence n'est secrète.

C'est un problème d'intégrité financière, pas seulement de confidentialité.

---

## B. PHASE 1a — CORRECTIF IMMÉDIAT (prompt pour Claude Code)

Périmètre volontairement étroit : trois failles, rien d'autre. Pas de refactorisation, pas de nettoyage, pas de performance.

```
PHASE 1a — CORRECTIF DE SÉCURITÉ IMMÉDIAT

Périmètre strict : 3 correctifs. Ne touche à rien d'autre, même si tu vois mieux à faire.

────────── ÉTAPE 1 — VÉRIFIER (lecture seule, avant tout correctif) ──────────

1. Sur profiles, lister les triggers et les contraintes :
   SELECT tgname, pg_get_triggerdef(oid) FROM pg_trigger
   WHERE tgrelid = 'public.profiles'::regclass AND NOT tgisinternal;

   Existe-t-il un trigger qui empêche la modification de `role` par son
   propriétaire ? Rends un verdict binaire, sans nuance :
   - « AUTO-ÉLÉVATION BLOQUÉE par <nom du trigger> »  ou
   - « AUTO-ÉLÉVATION POSSIBLE — aucune protection trouvée »

2. Vérifier quels rôles Postgres ont réellement le GRANT SELECT sur payment_links :
   SELECT grantee, privilege_type FROM information_schema.role_table_grants
   WHERE table_name = 'payment_links';

3. Lire le code de la page publique /payer/[reference] et de ses routes API :
   quelles colonnes de payment_links sont réellement affichées au client
   non authentifié ? Liste-les. C'est le contrat minimal à préserver.

STOP. Présente ces trois résultats avant d'écrire quoi que ce soit.

────────── ÉTAPE 2 — CORRIGER (après mon GO sur l'étape 1) ──────────

Migration 033_hotfix_securite.sql, additive, sans DROP de table ni de colonne.

A. profiles — bloquer l'élévation de privilège
   Trigger BEFORE UPDATE : si NEW.role IS DISTINCT FROM OLD.role et que
   l'appelant n'est pas super_admin, lever une exception. Le trigger doit être
   SECURITY DEFINER avec SET search_path = public, et tolérer les mises à jour
   faites par service_role (webhooks, scripts d'administration).
   Ne pas supprimer la policy « Users can update own profile » : la garder
   permet à l'utilisateur de modifier son nom et son téléphone, ce qui est
   légitime. C'est le trigger qui protège la seule colonne sensible.

B. payment_links — refermer la lecture publique
   1. Supprimer la policy « Public can read payment_links by reference ».
   2. REVOKE SELECT ON payment_links FROM anon;
   3. Créer une route API serveur GET /api/payment-links/[reference] qui, avec
      la clé service_role, sélectionne UNIQUEMENT les colonnes nécessaires à
      l'affichage de la page de paiement (celles listées en étape 1.3), par
      égalité exacte sur la référence. notes_staff et toute colonne interne ne
      doivent JAMAIS sortir de cette route.
   4. Rebrancher /payer/[reference] sur cette route.
   5. Vérifier ensuite, en anon, que GET /rest/v1/payment_links?select=* renvoie
      bien 0 ligne, et que /payer/<une référence valide> fonctionne toujours.
   Le correctif n'est terminé que si les deux sont vrais en même temps.

C. payment_links — resserrer l'UPDATE
   La policy UPDATE ne doit plus être atteignable par anon. La déclaration de
   paiement par le client passe par la route serveur existante, pas par un
   UPDATE direct depuis le navigateur.

────────── ÉTAPE 3 — RENDRE COMPTE ──────────
Tableau avant/après par policy, résultat des deux tests de l'étape 2.B.5,
et confirmation qu'aucune autre table n'a été touchée.
```

---

## C. PHASE 1b — DURCISSEMENT (après 1a)

| # | Correctif | Détail |
|---|---|---|
| 1 | `search_path` des `SECURITY DEFINER` | `ALTER FUNCTION … SET search_path = public` sur les 13 fonctions recensées. Sans risque, à faire d'un bloc |
| 2 | Fonctions de trigger exposées en RPC | `REVOKE EXECUTE … FROM anon, authenticated` sur `assign_demande_to_agent`, `auto_link_*`, `find_available_agent`, `notify_specialist_agents`. Ce sont des triggers : personne n'a besoin de les appeler en RPC. Garder l'exécution pour `is_staff`, `is_admin`, `get_user_role` si les policies en dépendent |
| 3 | Rate-limiting | Les 7 endpoints publics de l'audit P0. Fenêtre glissante par IP, en base ou en mémoire. Le plus exposé est `payment-links/[reference]/declare` |
| 4 | `gen_demande_ref()` | Passer de `MAX(...)+1` à une vraie séquence Postgres, **en conservant le format `DEM-YYYY-NNNNNN`**. Initialiser la séquence au max actuel |
| 5 | ESLint | Configuration Strict, puis correction des erreurs. Le Definition of Done devient enfin vérifiable |
| 6 | Performance des policies | Les 118 `auth_rls_initplan` : `auth.uid()` → `(select auth.uid())`. Même fichier que les correctifs RLS, donc même passe. Les 42 clés étrangères sans index : ajouter les index, c'est purement additif |
| 7 | Nettoyage | Les 3 fichiers `.backup.*` |

---

## D. RECTIFICATIONS DE MON BLUEPRINT

La baseline invalide deux points que j'avais écrits sans voir la base.

**§3.3 — Numérotation.** J'avais proposé `NRCA-{ANNÉE}-{SERVICE}-{SÉQUENCE}`. **Abandonné.** Les formats en production (`DEM-`, `PAY-`, `PAY-LINK-`, `RDV-`, `CL-`, `DEP-`, `TR-`, `CR-`) restent tels quels. Une référence de dossier est un identifiant que le client garde, cite au téléphone, écrit sur un formulaire : on ne la change pas pour une question d'esthétique. Seul le *mécanisme* de `gen_demande_ref` est corrigé, pas son format.

**§8 — `audit_log`.** `payment_events` et `stripe_webhook_log` implémentent déjà exactement le patron demandé : lecture restreinte, aucune policy UPDATE ni DELETE, écriture par `service_role` uniquement. `audit_log` sera bâti sur ce patron plutôt que sur ma description générique.

---

## E. QUATRE DÉCISIONS QUI T'APPARTIENNENT

**1. `payments` : quelle paire de colonnes fait foi ?**
La table porte `statut` **et** `status`, `mode_paiement` **et** `method`, `montant_total` **et** `amount`, avec un enum `payment_status` à 11 valeurs mélangeant deux vocabulaires. C'est une migration de nomenclature abandonnée en cours de route. Tant que ce n'est pas tranché, **aucun rapport financier n'est fiable** : selon la colonne lue, deux écrans afficheront deux chiffres différents pour le même mois.

Ma recommandation : garder le vocabulaire **français** (`statut`, `mode_paiement`, `montant_total`), qui correspond au reste de la base et à la langue de travail. Procédure : audit des écritures réelles colonne par colonne → backfill de la colonne retenue → trigger de synchronisation temporaire → migration du code → suppression des colonnes anglaises **en V3.1 seulement**, jamais maintenant. À traiter en entrée de P6, avant toute ligne de code financier.

**2. `rendez_vous` (0 ligne) contre `appointments` (4 lignes) : deux tables pour un même objet.**
Recommandation : `appointments` + `appointment_requests` font foi, `rendez_vous` est marquée obsolète dans la documentation et retirée du code — **sans être supprimée** de la base. Une table vide ne coûte rien ; une suppression coûte cher si quelque chose y écrivait encore.

**3. Les tables à 0 ligne du parcours dossier.**
`demande_status_history`, `demande_messages`, `demande_notes`, `demande_documents_requests` sont vides alors que ce sont les briques du suivi de dossier. Soit le module n'est pas encore utilisé en conditions réelles, soit il ne fonctionne pas. **Tu es le seul à pouvoir le dire** : est-ce que tes agents utilisent aujourd'hui la messagerie et l'historique de dossier ? La réponse change complètement la Phase 4.

**4. Types TypeScript.**
12 tables sans type, dont `payments`. À régénérer via `generate_typescript_types` du connecteur Supabase, pas à écrire à la main — un type écrit à la main dérive dès la migration suivante. À faire une fois la décision n°1 tranchée, sinon on fige les colonnes en double dans les types.

---

## F. CE QUE LA BASELINE CHANGE DANS LE PLANNING

Bonne nouvelle réelle : **40 tables sur 40 avec RLS, 128 policies, et des patrons de qualité** — suppression bloquée sur `payments`, séparation agent/admin sur `expenses`, journaux immuables sur `payment_events`. Le trou de migrations 001-017 était un problème de traçabilité, pas de sécurité. Le blueprint tablait sur un pire scénario qui ne s'est pas réalisé.

Conséquence : **P1 est plus courte que prévu**, et A1/A2 (tokens et design system de la refonte admin) peuvent démarrer en parallèle dès maintenant — ils ne touchent ni la base ni les permissions.

**Ordre immédiat :** étape 1 de la Phase 1a (les trois vérifications, lecture seule) → tu me montres le verdict sur `profiles` → GO ou hotfix d'urgence selon le résultat.

---

*Rien d'autre ne démarre tant que le verdict sur l'auto-élévation de rôle n'est pas connu.*
