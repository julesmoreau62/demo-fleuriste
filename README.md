# Démo fleuriste — Atelier Pivoine

Page de démonstration de la formule **Essentiel** de [Moreau Digital](https://moreaudigital.fr) : un site vitrine d'une page pour une fleuriste **fictive** à Hesdin (62).

En ligne : https://julesmoreau62.github.io/demo-fleuriste/

## Ce que montre la page

- Ouvert ou fermé en direct (heure de Paris), pause déjeuner comprise, jour courant surligné dans les horaires
- Livraison du jour en direct : temps restant avant 14 h, ou prochaine tournée
- Les occasions (anniversaire, mariage, deuil, pour le plaisir) et le bouquet de la semaine
- Un bouquet à composer : taille, tons, options, aperçu dessiné et prix en direct, commande envoyée par SMS prérempli
- Les fleurs de saison, avec la saison en cours mise en avant
- Horaires, adresse, carte Google Maps, itinéraire et appel en un geste
- Barre d'actions fixe sur mobile
- Données structurées `Florist` (schema.org) pour Google et les assistants IA

## Technique

HTML, CSS et un peu de JavaScript, sans outil de compilation ni image : les fleurs sont dessinées en SVG. Publié avec GitHub Pages depuis la branche `main`.

Pour la voir en local :

```bash
python -m http.server 8080
```

## Avertissements

- Commerce, adresse et personnes fictifs. Le numéro (03 53 01 52 16) appartient à une plage réservée par l'ARCEP aux œuvres de fiction.
- La page est en `noindex` pour ne pas être référencée.
