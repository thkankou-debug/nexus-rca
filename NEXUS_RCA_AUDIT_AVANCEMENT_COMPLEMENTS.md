# NEXUS RCA — COMPLÉMENTS À LA COMMANDE D'AUDIT D'AVANCEMENT
8 septembre 2026 · À joindre à la demande de Thierry, sans la remplacer

La commande est complète et correctement cadrée. Cinq compléments, dont deux limites à déclarer avant de commencer plutôt qu'à découvrir dans le rapport.

---

## A. DEUX LIMITES À DÉCLARER D'EMBLÉE

### A.1 L'exécutant ne voit pas les écrans

Le point 7 demande des captures des pages déployées avec un verdict de conformité visuelle. **Claude Code n'a pas de navigateur : il ne peut pas voir un rendu.** Il peut lire le code, récupérer le HTML servi, vérifier quelles classes et quels tokens sont appliqués — mais il ne peut pas juger « conforme » ou « non conforme » visuellement.

Conséquence à assumer : la conformité visuelle est établie **par inspection du code** (quel composant est rendu, quels tokens, quelles couleurs en dur) et **par les captures de Thierry**, pas par l'exécutant. Tout verdict visuel qui ne s'appuie sur aucune de ces deux sources doit être marqué « non vérifiable ».

C'est important : sans cette précaution, le rapport contiendra des appréciations esthétiques inventées, exactement le type d'affirmation non prouvée qui a mené à cet audit.

### A.2 L'exécutant audite ses propres déclarations

C'est le même acteur qui a coché « ✅ terminée » sans rendre les récapitulatifs. L'audit doit donc être **entièrement documentaire** :

- toute mention « terminé » cite un chemin de fichier, une ligne, un SHA de commit et le déploiement qui le sert ;
- toute mention « fonctionne » cite une sortie de commande collée en clair ;
- tout ce qui ne peut être prouvé va en « non déterminée », jamais en « probablement fait ».

Aucun renvoi à un compte-rendu antérieur comme preuve. Un compte-rendu est ce qu'on audite, pas ce avec quoi on audite.

---

## B. UNE HYPOTHÈSE À TESTER EN PREMIER

Plutôt qu'un balayage aveugle des neuf causes possibles du point 6, commencer par celle-ci, qui explique à elle seule l'essentiel de l'écart constaté :

> **Hypothèse : `/dashboard/super-admin` est une page héritée, antérieure à la V3, toujours servie — et le shell d'administration d'A3 n'a jamais été construit.**

Indices convergents sur la capture : la barre latérale ne contient que « Tableau de bord », « Retour au site » et « Déconnexion ». Ni Dossiers, ni Clients, ni Rendez-vous, ni Finances, ni RH. Aucun des six groupes de navigation prévus. Aucun fil d'Ariane. Palette hors charte — bleu vif, violet, orange, vert, jaune, rose sur un même bloc.

Vérifications directes :
1. Lister tous les fichiers `app/dashboard/**/page.tsx` : combien de tableaux de bord distincts existent, un par rôle ou un seul ?
2. `A3` a-t-elle produit un `AdminShell` ? S'il existe, quels fichiers l'importent réellement ?
3. `A2` a-t-elle produit `components/admin/ui/` ? Quels composants sont importés ailleurs que dans la page vitrine ?
4. Les tokens d'A1 sont-ils dans `tailwind.config.ts` et **utilisés** ? Compter les couleurs en dur (`bg-[#...]`, `blue-600`, `violet-*`) dans `app/dashboard/**`.

Si l'hypothèse se confirme, la conclusion est simple et non dramatique : **A1 et A2 ont produit des composants que personne n'utilise, et A3 n'existe pas.** Le travail n'est pas perdu, il n'est pas raccordé. Cela change complètement le plan de rattrapage — raccorder plutôt que refaire.

---

## C. TROIS VÉRIFICATIONS ABSENTES DE LA COMMANDE

**C.1 Quelle branche sert la production ?**
`www.nexusrca.com` est-il sur `main`, intact, pendant que toute la V3 vit sur `v3/integration-v3` ? Si oui, c'est une **bonne** nouvelle qui explique beaucoup : rien de la V3 n'est en ligne, et les écrans jugés non conformes ne sont vus que par Thierry sur une prévisualisation. À établir en premier, car cela change le niveau d'urgence de tout le reste.

**C.2 La numérotation des migrations.**
L'audit P0 recensait les migrations 018 à 032. Le rapport du 7 septembre mentionne une migration **072**. Quarante numéros d'écart. Soit quarante migrations ont été créées en deux jours, soit la numérotation a changé de convention, soit des numéros sont sautés. Établir la liste réelle des fichiers, la liste réelle des migrations appliquées en base, et la différence entre les deux — c'est le cœur du point 9, et c'est la même dette de traçabilité que le trou 001-017.

**C.3 Le tableau d'avancement, ligne par ligne.**
Pour chacune des lignes marquées « ✅ terminée » : quelle preuve existe, et à quelle date. Le rapport propose la correction ; Thierry la valide. Les lignes P1a-bis, P1b, P1c, A1 et A2 sont les premières concernées.

---

## D. DEUX PRÉCISIONS DE MÉTHODE

**D.1 Le point 3 limite mécaniquement le point 10.**
Interdire toute opération de test signifie que la quasi-totalité des parcours sortira en « vérifié uniquement dans le code ». C'est cohérent et prudent, mais il faut le dire : **la couverture fonctionnelle de cet audit sera structurellement faible.**

Pour la lever sans risque, une seule autorisation suffirait : **un compte de test par rôle et une fiche client de test**, créés une fois, identifiés comme tels, jamais mêlés aux données réelles. C'est la même solution que pour le lien de paiement de P1b. Décision de Thierry, à prendre ou non — mais le rapport doit indiquer ce qu'elle débloquerait.

**D.2 Pas de pourcentage global, même expliqué.**
Le point 4 demande d'expliquer la méthode de tout pourcentage. Le plus simple est de n'en donner aucun : les phases n'ont ni le même poids ni la même durée, et « 40 % du projet » ne veut rien dire quand P2 vaut dix fois A7. Un décompte par état — terminée, partielle, non commencée — suffit et ne prête pas à confusion.

---

## E. CE QUE L'AUDIT NE DOIT PAS DEVENIR

Une justification pour tout refaire. Le point 11 le dit déjà ; il vaut la peine d'être répété, parce que la tentation sera forte devant un écran non conforme. **La distinction qui structure le plan de rattrapage :**

1. **Fait, à raccorder** — le code existe mais n'est importé nulle part (probablement A1 et A2).
2. **Fait, à déployer** — le code est sur une branche non fusionnée.
3. **Jamais commencé** — probablement A3, et tout ce qui en dépend.
4. **Fait mais à reprendre** — et là seulement, avec justification écrite.

Un écran non conforme parce que le shell n'existe pas relève du 3, pas du 4. Le composant qu'il devait afficher, lui, relève peut-être du 1.
