# Tests — démonstration et présentation

Proposition de refonte non officielle. Tests réalisés en local uniquement (http://127.0.0.1:8765), sans publication et sans contact avec l'entreprise.

## 1. Méthode

- **Outil** : `_tools/test_safe.js` (Node 22, puppeteer-core, Chrome installé sur le poste, mode sans fenêtre).
- **Mesures de sécurité appliquées par le script** :
  - toute requête hors de `http://127.0.0.1:8765/` est bloquée (les images `data:` intégrées sont autorisées) ;
  - les liens `tel:` et `mailto:` ne sont jamais déclenchés : un écouteur bloque leur clic, et les requêtes vers ces schémas sont annulées ;
  - le bouton du formulaire de préparation de message (contact) est testé avec une copie modifiée de `site.js`, servie au seul navigateur de test : `window.location.href =` y est remplacé par une simple mémorisation de l'adresse. Aucune messagerie ne s'ouvre et rien n'est envoyé.
- **Ancien script** : `_tools/test_ancien_NE_PAS_LANCER.js.txt` déclenchait réellement le lien mailto. Il est conservé pour trace, renommé, et ne doit pas être lancé.
- **Résultats bruts** : `livrables/captures/resultats-tests.json`. Captures d'écran : `livrables/captures/*.png`.

## 2. Résultats : 444 contrôles réussis sur 444

| Domaine | Contrôles | Contenu |
|---|---|---|
| Démo, 8 pages × 3 largeurs (1440, 1280, 390 px) | 144 | page servie (200/304), images chargées, attribut alt présent, pas de débordement horizontal, aucune erreur JS ni ressource manquante, aucune requête externe |
| Démo, contrôles par page (1440 px) | 40 | ancres internes, `tel:` = +33608319250, `mailto:` = contact@ideedeco-peintre.fr, balise noindex, mention « non officielle » |
| Démo, liens internes et ancres entre pages | 168 | chaque lien interne répond, chaque ancre visée existe sur la page cible |
| Menu et clavier | 7 | menu mobile à 390 px (aria-expanded, focus, Échap rend le focus), 7 pages principales dans le menu, Mentions en pied de page, menu bureau à 1440 px, lien « aller au contenu » au premier Tab |
| Réalisations | 12 | 6 filtres (nombre de fiches, compteur, aria-pressed, adresse #), visionneuse (ouverture et légende, flèche droite, Échap), boutons annotations et photos, filtre ouvert par l'adresse `#sols` |
| Préparation de message (contact) | 5 | adresse mailto construite avec sujet et corps, message « Rien n'a été envoyé », page inchangée, aucun faux message de succès |
| Présentation à 1600 × 900 | 53 | 22 diapositives ; touches →, ←, Fin, Début, PageSuiv., Espace ; boutons précédent/suivant ; barre de progression ; sommaire (ouverture, 22 entrées, clic, bouton fermer, Échap) ; bouton plein écran présent ; images et 17 images de fond ; ancres ; noindex ; mention « non officielle » ; liens vers la démo ; ouverture directe par `#comparaison` ; aucune erreur |
| Présentation, autres formats | 15 | 1280 × 720, 1024 × 768 et 1366 × 768 en mode diapositive ; 768 × 1024, 390 × 844 et 844 × 390 (téléphone en largeur) en mode lecture ; pas de débordement ; le compteur suit le défilement en mode lecture |

Seul lien externe présent : la page Facebook de l'entreprise, relevée mais non suivie.

Vérification visuelle complémentaire (captures relues) : réalisations à 1440 px, menu et contact à 390 px, présentation à 844 × 390, diapositives « Tests », « À confirmer » et « Images » à 1600 × 900 (contenu entier visible, bas du contenu à 804 px sur 900).

## 3. Corrections issues des tests

- **Présentation sur téléphone tenu en largeur (844 × 390)** : la barre de commandes masquait le contenu. Le mode lecture s'active désormais aussi quand la hauteur est inférieure ou égale à 560 px.
- **Page de présentation introuvable (erreur 404 signalée)** : la page `presentation/index.html` est générée et servie (200).
- **Script de test** : quatre fausses erreurs du premier passage venaient du script, pas du site (images `data:` comptées comme externes, réponses 304 en cache, image vide de la visionneuse fermée, lien Mentions cherché dans le menu au lieu du pied de page). Le script a été corrigé.

## 4. Non testé

- Vrais téléphones et tablettes : seules des tailles d'écran ont été simulées dans Chrome.
- Autres navigateurs : Safari, Firefox, Edge, navigateurs mobiles.
- Lecteur d'écran et audit d'accessibilité complet (contrastes mesurés, ordre de lecture, WCAG).
- Vitesse, Lighthouse et référencement : rien n'a été mesuré.
- Ouverture réelle d'une messagerie ou d'un appel par les liens `tel:` / `mailto:` et par le formulaire de préparation de message (volontairement non déclenchée).
- Passage effectif en plein écran : seule la présence du bouton est vérifiée, le mode sans fenêtre ne l'exécute pas.
- `prefers-reduced-motion` : présent dans le code, non vérifié par le script.
- Hébergement, HTTPS, protection d'accès : rien n'est publié.

## 5. Relancer les tests

```sh
cd ~/ideedeco-refonte && python3 -I -m http.server 8765 --bind 127.0.0.1   # dans un terminal
cd ~/ideedeco-refonte/_tools && node test_safe.js                          # dans un autre
```
