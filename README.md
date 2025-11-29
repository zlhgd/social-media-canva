# Social Media Visual Composer

🎨 Un outil simple et efficace pour créer des visuels optimisés pour Instagram, Facebook et LinkedIn.

## Fonctionnalités

- **Import d'images** : Glissez-déposez, collez (Ctrl+V), ou sélectionnez une image depuis votre ordinateur
- **Cadres de prévisualisation** : Visualisez les trois cadres superposés représentant les dimensions idéales pour chaque plateforme
- **Dimensions configurables** : Ajustez les dimensions pour chaque plateforme selon vos besoins
- **Manipulation d'image** : Déplacez et redimensionnez (zoom) l'image pour obtenir le cadrage parfait
- **Aperçus en temps réel** : Voyez instantanément le résultat pour chaque plateforme
- **Textes incrustés** : Ajoutez du texte avec personnalisation complète (police, taille, couleur, contour, gras, italique)
- **Téléchargement** : Téléchargez individuellement ou tous les formats en un clic

## Dimensions par défaut

| Plateforme | Largeur | Hauteur | Ratio |
|------------|---------|---------|-------|
| Instagram  | 1080px  | 1080px  | 1:1   |
| Facebook   | 1200px  | 630px   | ~1.9:1|
| LinkedIn   | 1200px  | 627px   | ~1.9:1|

## Utilisation

1. Ouvrez `index.html` dans votre navigateur
2. Importez une image (glisser-déposer, coller, ou sélectionner)
3. Ajustez le zoom et la position de l'image
4. Optionnellement, ajoutez du texte avec les contrôles disponibles
5. Téléchargez les visuels optimisés pour chaque plateforme

## Technologies

- HTML5 Canvas
- CSS3 (Variables CSS, Grid, Flexbox)
- JavaScript Vanilla (ES6+)
- Google Fonts

## Installation

Aucune installation requise ! Ouvrez simplement `index.html` dans un navigateur moderne.

```bash
# Pour un serveur de développement local (optionnel)
npx serve .
# ou
python -m http.server 8000
```

## Compatibilité

- Chrome (recommandé)
- Firefox
- Safari
- Edge

## Licence

MIT License