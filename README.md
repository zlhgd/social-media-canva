# Social Media Visual Composer

🎨 Un outil simple et efficace pour créer des visuels optimisés pour Instagram, Facebook et LinkedIn.

## Technologies

- **Next.js 15** - Framework React moderne
- **React 19** - Bibliothèque UI
- **Material-UI (MUI)** - Composants UI
- **TypeScript** - Typage statique

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

## Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Scripts disponibles

```bash
npm run dev      # Démarrer le serveur de développement
npm run build    # Construire pour la production
npm run start    # Démarrer le serveur de production
npm run lint     # Vérifier le code avec ESLint
```

## Structure du projet

```
src/
├── app/
│   ├── globals.css      # Styles globaux
│   ├── layout.tsx       # Layout principal
│   └── page.tsx         # Page principale
├── components/
│   ├── CanvasEditor.tsx       # Éditeur principal avec canvas
│   ├── ImageUploader.tsx      # Zone d'upload d'images
│   ├── PlatformConfigPanel.tsx # Configuration des dimensions
│   ├── PreviewsPanel.tsx      # Aperçus par plateforme
│   ├── TextControls.tsx       # Contrôles de texte
│   └── ThemeRegistry.tsx      # Provider du thème MUI
├── lib/
│   └── theme.ts         # Configuration du thème MUI
└── types/
    └── index.ts         # Types TypeScript
```

## Utilisation

1. Ouvrez l'application dans votre navigateur
2. Importez une image (glisser-déposer, coller, ou sélectionner)
3. Ajustez le zoom et la position de l'image
4. Optionnellement, ajoutez du texte avec les contrôles disponibles
5. Téléchargez les visuels optimisés pour chaque plateforme

## Licence

MIT License
