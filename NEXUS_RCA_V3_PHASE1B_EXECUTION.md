# NEXUS RCA — PHASE 1b : EXÉCUTION
**Amendement 5** · 5 septembre 2026 · GO donné par Thierry, avec trois corrections

---

## A. TROIS CORRECTIONS AVANT DE LANCER

### A.1 L'ordre coupe le service des clients actuels

Ton point 2 (retrait de la recherche publique par référence) arrive **avant** que les liens actifs aient reçu leur nouvelle URL. Neuf liens existent, dont certains sont probablement en attente de paiement, déjà envoyés par WhatsApp ou par e-mail. Au moment où l'ancienne route cesse de servir, ces clients tombent sur une page morte, sans savoir pourquoi, et sans moyen de payer.

**Et on ne peut pas rediriger `/payer/<reference>` vers `/payer/<token>`** : la redirection publierait la correspondance référence → jeton, et un énumérateur récupérerait tous les jetons en incrémentant le compteur. Ce serait annuler le correctif en le déployant.

La séquence correcte :

1. Ajouter la colonne et générer les jetons (le service continue normalement).
2. Produire la liste des liens **actifs et impayés** avec leur nouvelle URL — c'est un livrable pour toi, pas pour le code.
3. **Tu renvoies les nouvelles URLs aux clients concernés.** Étape humaine, hors code.
4. *Ensuite seulement*, l'ancienne route est neutralisée : elle renvoie une page sobre « Ce lien a été remplacé. Contactez votre conseiller. » avec la référence affichée pour que le client puisse la citer — et aucune donnée personnelle, aucune possibilité de déclarer un paiement.

### A.2 Le SQL de backfill a besoin de trois choses de plus

Ta requête est correcte, mais elle échoue si elle est exécutée seule.

- `gen_random_bytes` vient de **pgcrypto**, qui vit dans le schéma `extensions` sur Supabase et n'est pas dans le `search_path` par défaut. Il faut `extensions.gen_random_bytes(32)`, après avoir vérifié que l'extension est bien activée.
- Il faut un **`DEFAULT` sur la colonne**, sinon tout nouveau lien créé par le code existant naîtra sans jeton et le `NOT NULL` fera échouer l'insertion.
- L'ordre est contraignant : `ADD COLUMN` (avec DEFAULT) → backfill → index unique → `SET NOT NULL`. Poser `NOT NULL` avant le backfill échoue sur les 9 lignes existantes.

### A.3 Le remplacement de la policy e-mail peut couper des clients

Sur `payment_links`, la policy de propriété jointe sur l'e-mail sert probablement à des lignes dont `client_id` est vide. Passer à `client_id = auth.uid()` sans vérifier fait perdre l'accès à ces clients dans leur espace connecté.

Donc : compter d'abord les lignes à `client_id IS NULL`, tenter un rattachement par correspondance stricte d'e-mail **une fois, en migration**, puis basculer la policy. Le rattachement se fait en base une fois pour toutes ; il ne reste pas dans la policy.

---

## B. PROMPT D'EXÉCUTION

```
PHASE 1b — DURCISSEMENT. Ordre imposé, ne pas réordonner.

MIGRATION 034 — jeton public
1. Vérifier que pgcrypto est activé (schéma extensions). Sinon, l'activer.
2. ALTER TABLE payment_links
     ADD COLUMN public_token text
     DEFAULT encode(extensions.gen_random_bytes(32), 'hex');
3. UPDATE payment_links
     SET public_token = encode(extensions.gen_random_bytes(32), 'hex')
     WHERE public_token IS NULL;
4. CREATE UNIQUE INDEX payment_links_public_token_key ON payment_links(public_token);
5. ALTER TABLE payment_links ALTER COLUMN public_token SET NOT NULL;
6. Vérifier : aucun jeton NULL, aucun doublon, 9 jetons distincts de 64 caractères.
   Aucune policy ne doit exposer public_token à anon.

LIVRABLE POUR THIERRY (avant toute neutralisation de l'ancienne route)
Tableau des liens actifs et impayés : référence, client, montant, statut,
nouvelle URL /payer/<token>. C'est lui qui renvoie les liens. STOP ici et
attends sa confirmation que c'est fait avant de passer à la suite.

ROUTES
7. /payer/[token] : nouvelle route, service_role, recherche par égalité exacte
   sur public_token. Payload public strictement limité à :
   reference, service, description, montant, devise, statut, client_nom,
   expires_at. RETIRER numero_transaction, verified_at et client_email.
8. POST /api/payment-links/[token]/declare : la déclaration passe désormais par
   le jeton. Conserver toute la validation métier existante (expiration, statut
   modifiable, méthode). Ajouter : refus si le lien est déjà vérifié, pour qu'une
   déclaration ne puisse pas en écraser une autre.
9. /payer/[reference] : ne renvoie plus aucune donnée personnelle et ne permet
   plus de déclarer. Page neutre affichant la référence et invitant à contacter
   son conseiller. AUCUNE redirection vers l'URL à jeton — cela publierait la
   correspondance et annulerait le correctif.

POLICIES
10. Compter les payment_links avec client_id IS NULL. Les rattacher par
    correspondance exacte d'e-mail avec profiles, une fois, en migration.
    Rendre compte du nombre rattaché et du nombre restant orphelin.
11. Remplacer la policy « client propriétaire » par client_id = (select auth.uid()).
    Aucune jointure sur l'e-mail ne subsiste, ici ni ailleurs : chercher le motif
    dans les 128 policies et signaler toute autre occurrence sans la corriger.

DURCISSEMENT
12. SET search_path = public sur les 13 fonctions SECURITY DEFINER.
13. REVOKE EXECUTE FROM anon, authenticated sur les fonctions de trigger
    (assign_demande_to_agent, auto_link_*, find_available_agent,
    notify_specialist_agents). Conserver is_staff, is_admin, get_user_role si
    des policies en dépendent.
14. Rate-limiting sur les 7 endpoints publics, y compris la nouvelle route
    declare à jeton. Fenêtre glissante par IP.

TESTS — à exécuter et à coller en clair
a) SET ROLE anon; SELECT count(*) FROM payment_links;  → doit refuser.
b) Énumération par référence : GET /payer/PAY-LINK-2026-000001 à 000012.
   Aucune ne doit renvoyer de donnée personnelle.
c) Énumération par jeton : 20 jetons aléatoires de 64 caractères → 404.
d) POST declare avec une référence au lieu d'un jeton → refus.
e) POST declare deux fois sur un lien déjà vérifié → second refusé.
f) Non-régression : un lien réel, ouvert par son jeton, s'affiche et permet une
   déclaration complète de bout en bout.
g) Le payload réseau de /payer/[token] ne contient ni numero_transaction, ni
   verified_at, ni client_email — vérifier la réponse brute, pas l'écran.

RENDU
Migrations appliquées · policies finales de payment_links et profiles en texte
intégral · fichiers modifiés · sorties réelles des 7 tests · nombre de liens
rattachés en étape 10.
```

---

## C. RESTE DÛ DE LA PHASE 1a

Deux éléments manquent toujours au compte-rendu précédent et doivent arriver avec celui-ci :

1. **Le verdict brut sur `profiles`** — « auto-élévation possible » ou « déjà bloquée par X ». Si elle était possible, ajouter la vérification : un compte a-t-il changé de rôle sans raison légitime ? Les 20 profils se contrôlent à la main en cinq minutes.
2. **La policy UPDATE de `payment_links`**, avant et après, en texte lisible. La ligne du tableau précédent était tronquée.

---

*Le point 3 de la séquence (renvoi des liens aux clients) t'appartient. Rien ne se neutralise avant que tu confirmes l'avoir fait.*
