# NEXUS RCA — NON-CONFORMITÉ P10
**Rejet de l'implémentation du 7 septembre 2026** · À traiter avant toute reprise du site public

---

## A. LE PROBLÈME DE PROCESSUS, AVANT CELUI DU RENDU

**P10 n'aurait pas dû être développée.** La feuille de route la place en avant-dernière position, avec P8 (le CMS et la table `services`) comme préalable, et A1 (les tokens) comme fondation. Aucun GO n'a été donné pour P10 ; la dernière consigne était explicitement « intègre ces décisions **sans démarrer de phase supplémentaire** ».

Ce qui s'est passé est la démonstration exacte de ce que la boucle d'exécution existe pour empêcher : sans tokens définis (A1), le développeur invente les couleurs ; sans `services` (P8), la grille des pôles est écrite en dur ; sans validation de maquette, le visuel de couverture est improvisé. Le résultat n'est récupérable qu'en le refaisant.

**Décision : le travail P10 réalisé est mis de côté, pas corrigé.** Il sera refait après A1, A2 et P8. La branche est conservée pour référence, jamais fusionnée dans `main`.

---

## B. ÉCARTS CONSTATÉS, POINT PAR POINT

| # | Attendu (maquette approuvée) | Livré | Gravité |
|---|---|---|---|
| 1 | Or patiné, sourd, institutionnel | **Jaune vif saturé**, proche d'un jaune primaire | Rédhibitoire |
| 2 | Bleu nuit profond, presque noir | **Bleu roi lumineux**, saturé | Rédhibitoire |
| 3 | Composition photographique sobre (globe nocturne, dossier, plume) | **Globe 3D plat et schématique**, registre infographique | Rejeté |
| 4 | Serif éditorial de titrage | **Sans-serif condensée grasse**, registre presse populaire | Rédhibitoire |
| 5 | Titre sur deux lignes équilibrées | Césure en trois lignes déséquilibrées, « ambitions. » isolé | Majeur |
| 6 | Menu « **Expertises** » | « Services » | Mineur mais normatif |
| 7 | CTA principal « **Soumettre une demande** » partout (E2) | « Présenter mon projet » dans la couverture | Violation de décision |
| 8 | Bouton or à libellé bleu nuit (E1) | Libellé sombre sur jaune vif, contraste non mesuré | À mesurer |
| 9 | Fond de couverture avec voile et zone de sécurité (E6) | Texte posé directement sur aplat, sans traitement | Majeur |

Les points 1, 2 et 4 suffisent à eux seuls : **l'identité livrée n'est pas celle qui a été validée.** Le jaune et le bleu roi produisent un registre d'alerte ou de grande distribution, à l'opposé du cabinet international recherché.

---

## C. CAUSE RACINE : LES TOKENS N'EXISTENT PAS

Personne n'a écrit les valeurs. En l'absence de tokens, un développeur prend les couleurs les plus proches de la bibliothèque par défaut — le jaune et le bleu de Tailwind — et le résultat est mécaniquement celui-ci. **Ce n'est pas une faute de goût, c'est une conséquence de A1 non livrée.**

### Correctif : extraire les valeurs de la maquette approuvée

La maquette validée est le fichier de référence. Les couleurs ne se choisissent pas, elles s'en **échantillonnent** :

- fond de couverture (zone la plus sombre, en haut à gauche)
- fond de couverture (dégradé, zone médiane)
- or du titre « nous structurons vos ambitions »
- or du bouton principal
- or des petites capitales
- ivoire du bandeau de réassurance
- bleu nuit du texte courant sur fond clair
- gris du texte secondaire

Chaque valeur est relevée en hexadécimal, nommée, inscrite dans `tailwind.config.ts` et dans la couche sémantique de A1. **Aucune couleur de la bibliothèque par défaut n'est utilisée pour la marque.** Ce relevé est le premier livrable de A1, avant tout composant.

Repère utile : l'or institutionnel est un or **désaturé et assombri** — il tire vers le bronze, pas vers le jaune. Le bleu nuit est un bleu **très sombre et peu saturé** — il tire vers le noir bleuté, pas vers le bleu roi. Si une couleur paraît lumineuse à l'écran, elle est fausse.

---

## D. LE VISUEL DE COUVERTURE

Le globe livré est rejeté. Mais la maquette d'origine ne peut pas non plus être publiée telle quelle : c'est une image générée, et E4 interdit de la présenter comme photographie institutionnelle.

**Trois voies, à trancher par Thierry, pas par le développeur :**

1. **Photographie réelle** — Bangui, les bureaux, l'équipe, une situation professionnelle réelle. Avec autorisation écrite des personnes identifiables. C'est la voie qui porte le plus devant un partenaire institutionnel.
2. **Composition graphique institutionnelle sobre** — typographie, filets, texture discrète, aucun objet figuratif. Honnête, réalisable tout de suite, et sans risque de sembler prétendre à ce qui n'existe pas.
3. **Photographie sous licence** — banque d'images professionnelle, licence commerciale conservée, sur un sujet qui ne prétend pas représenter Nexus RCA (paysage, architecture, matière).

**Ce qui est exclu dans tous les cas** : globe illustré, planisphère à connexions lumineuses, icônes 3D, mise en scène de bureaux ou de collaborateurs qui n'existent pas.

Tant que la voie n'est pas choisie, **la couverture reste un aplat bleu nuit typographique**. Un aplat sobre est neutre ; un mauvais visuel est un message.

---

## E. PROMPT DE REMISE EN ORDRE

```
ARRÊT DU TRAVAIL SUR P10.

1. La branche du site public n'est pas fusionnée. Elle est conservée pour
   référence uniquement. Ne pas essayer de corriger l'existant : il sera refait.

2. Revenir à la feuille de route et reprendre la boucle : présenter la phase
   courante, attendre le GO, ne rien écrire avant.

3. La phase courante est P1a-bis, puis P1b, P1c. A1 et A2 sont parallélisables.

4. En entrée de A1, premier livrable avant tout composant :
   - échantillonner les couleurs de la maquette approuvée (liste en section C
     de ce document), une valeur hexadécimale par entrée ;
   - les inscrire dans tailwind.config.ts sous des noms de marque explicites ;
   - construire la couche sémantique par-dessus (--surface, --accent,
     --on-accent, --text-primary, etc.) ;
   - mesurer et consigner tous les couples de contraste, états actif, survol
     et focus compris, avec le verdict WCAG AA ;
   - présenter le tableau des couleurs et des ratios à Thierry avant de coder
     le moindre composant.

5. Aucune couleur de la bibliothèque Tailwind par défaut n'est employée pour
   la marque. Si un token manque, on le demande, on ne l'invente pas.

6. Interdiction de toucher au site public tant que A1, A2 et P8 ne sont pas
   livrées et validées.
```

---

## F. CE QUE CET ÉPISODE CONFIRME

La règle « présenter avant d'exécuter » n'est pas une formalité administrative. Ici, elle aurait coûté une réponse de dix lignes — « je propose de développer la page d'accueil, voici les couleurs et le visuel que je compte utiliser » — et aurait évité une journée de travail à jeter.

**À ajouter dans CLAUDE.md en P1c** : aucune couleur, aucune police, aucun visuel de marque n'est choisi par l'exécutant. Ces valeurs proviennent des tokens ; en leur absence, le travail s'arrête et la question est posée.
