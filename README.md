# Démo fleuriste — Atelier Pivoine

Page de démonstration de la formule **Essentiel** de [Moreau Digital](https://moreaudigital.fr) : un site vitrine d'une page pour une fleuriste **fictive** à Hesdin (62).

En ligne : https://julesmoreau62.github.io/demo-fleuriste/

## L'idée

Une affiche botanique plutôt qu'un gabarit : un bouquet vu du dessus en formes découpées, qui éclot à l'arrivée et tourne quand on descend, de très grandes lettres étroites, et des étiquettes « à la machine » pour les prix et les horaires. Chaque bloc reprend un objet de la boutique.

## Ce que montre la page

- **La pancarte de la porte** : OUVERT ou FERMÉ en direct (heure de Paris), avec la petite horloge « on revient à 14 h » pendant la pause
- **Les bouquets par occasion** : anniversaire, mariage, deuil, merci, pour soi, entreprises, avec les prix de départ
- **L'almanach** : les fleurs de chaque mois (le mois en cours mis en avant) et la prochaine fête des fleurs avec son compte à rebours (Toussaint, Noël, Saint-Valentin, grands-mères, muguet, fête des mères, décalée si elle tombe à la Pentecôte)
- **Le numéro en très grand** et la livraison du jour en direct (commande avant midi)
- **Les horaires en frise** : la journée de 8 h à 20 h, le jour courant et une aiguille sur l'heure actuelle
- **Un plan simplifié**, puis le vrai plan Google Maps seulement si on le demande (rien n'est envoyé à Google avant), l'itinéraire et l'appel en un geste
- **Une capsule sous le pouce** sur mobile : l'état de la boutique et le bouton Appeler
- Données structurées `Florist` (schema.org) pour Google et les assistants IA

Le tout reste dans le périmètre Essentiel : une page, la présentation du commerce, les horaires, l'adresse et la carte, le contact en un geste. Pas de formulaire ni de commande en ligne.

Des **vraies photos** se mêlent aux dessins, en collage : une pastille « Composé ce matin » sur le bouquet de la vitrine, l'arche et le médaillon de l'atelier, et une photo pour chaque occasion, avec une fleur découpée posée sur le coin. Que des mains et des bouquets : aucun visage, puisque Léa est fictive.

## Technique

HTML, CSS et un peu de JavaScript, sans outil de compilation : les fleurs dessinées sont des symboles SVG, recolorés par variables CSS (`--c1`, `--c2`, `--c3`). Les photos sont en WebP dans `photos/`, chargées au fil du défilement. Sans JavaScript, la page reste complète. Les animations s'arrêtent si le téléphone demande moins de mouvement.

Polices hébergées sur place, sous licence SIL OFL : Archivo (largeur variable, pour les grandes lettres) et Martian Mono (étiquettes). Publié avec GitHub Pages depuis la branche `main`.

Pour la voir en local :

```bash
python3 -m http.server 8080
```

## Avertissements

- Commerce, adresse et personnes fictifs. Le numéro (03 53 01 52 16) appartient à une plage réservée par l'ARCEP aux œuvres de fiction.
- La page est en `noindex` pour ne pas être référencée.
- Photos libres de droit, licence [Unsplash](https://unsplash.com/fr/licence) : Viktoriia Yatsentiuk (vitrine et atelier), Matthew Nevins Bell (anniversaire), Namupang (mariage), Arno Senoner (deuil), Alina Karpenko (merci), Polina Zimenkova (pour soi), Jason Leung (entreprises).
