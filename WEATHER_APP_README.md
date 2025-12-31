# ☀️ Application Météo Inspirante

Une application météo moderne et inspirante avec une interface glassmorphism, des animations immersives et des recommandations d'activités personnalisées.

## ✨ Fonctionnalités

### 🎨 Design Ultra-Moderne
- **Interface Glassmorphism** : Effets de verre dépoli élégants avec transparence
- **Dégradés Animés** : Arrière-plan qui change selon les conditions météo
- **Animations Fluides** : Transitions douces et effets de survol
- **Design Responsive** : Parfaitement adapté aux mobiles et tablettes

### 🌦️ Effets Météo Immersifs
- **Particules Animées** :
  - Gouttes de pluie qui tombent lors de la pluie
  - Flocons de neige qui virevoltent par temps neigeux
- **Arrière-plans Dynamiques** :
  - Ciel bleu ensoleillé pour temps clair
  - Nuages gris pour temps couvert
  - Teintes sombres pour les orages

### 💭 Citations Inspirantes
Citations motivantes qui changent selon la météo :
- **Soleil** : Citations positives et énergiques
- **Pluie** : Messages apaisants et réfléchis
- **Nuages** : Pensées sur la persévérance
- **Neige** : Réflexions sur la beauté et l'unicité
- **Orage** : Messages sur la résilience

### 🎯 Recommandations d'Activités
Suggestions d'activités personnalisées selon :
- La condition météorologique actuelle
- La température
- L'environnement (intérieur/extérieur)

### 📊 Informations Météo Complètes
- **Température actuelle** avec ressenti
- **Humidité** et **vent**
- **Lever et coucher du soleil**
- **Pression atmosphérique** et **visibilité**
- **Prévisions sur 5 jours** avec températures min/max

### 🔍 Fonctionnalités de Recherche
- **Géolocalisation automatique** : Détecte votre position
- **Recherche de ville** : Trouvez la météo de n'importe quelle ville
- **Bouton de localisation** : Retour rapide à votre position

## 🚀 Comment Utiliser

### Accéder à l'application
1. Démarrez le serveur de développement :
   ```bash
   cd pizzawoluwe-admin
   npm run dev
   ```

2. Ouvrez votre navigateur et allez à :
   ```
   http://localhost:3000/weather
   ```

### Première utilisation
1. **Autoriser la géolocalisation** (recommandé) pour obtenir la météo de votre position
2. Ou **rechercher une ville** en utilisant la barre de recherche

### Navigation
- **🔍 Rechercher** : Entrez un nom de ville et appuyez sur Entrée
- **📍 Ma position** : Cliquez pour revenir à votre localisation
- **Cartes météo** : Explorez les différentes informations affichées

## 🔧 Configuration API (Optionnel)

Par défaut, l'application utilise des **données simulées** pour une démonstration immédiate.

Pour utiliser des **données réelles** :

1. Créez un compte gratuit sur [OpenWeatherMap](https://openweathermap.org/api)
2. Obtenez une clé API
3. Créez un fichier `.env.local` dans `pizzawoluwe-admin/` :
   ```env
   OPENWEATHER_API_KEY=votre_clé_api_ici
   ```
4. Redémarrez le serveur

## 🎨 Personnalisation

### Modifier les citations
Éditez le fichier : `src/components/weather/InspirationQuote.tsx`

### Changer les recommandations d'activités
Éditez : `src/components/weather/ActivitySuggestions.tsx`

### Ajuster les couleurs et animations
Modifiez : `src/styles/globals.css`

## 📱 Responsive Design

L'application s'adapte automatiquement :
- **Mobile** : Interface verticale optimisée
- **Tablette** : Grille 2 colonnes
- **Desktop** : Mise en page complète avec toutes les informations

## 🌈 Conditions Météo Supportées

- ☀️ **Clear** (Ciel dégagé)
- ☁️ **Clouds** (Nuageux)
- 🌧️ **Rain** (Pluie)
- ⛈️ **Storm** (Orage)
- ❄️ **Snow** (Neige)
- 🌫️ **Mist/Fog** (Brume/Brouillard)

## 🛠️ Technologies Utilisées

- **Next.js 14** - Framework React
- **TypeScript** - Typage fort
- **Tailwind CSS** - Styling utilitaire
- **OpenWeatherMap API** - Données météo (optionnel)

## 📝 Notes Techniques

### Architecture des Composants
```
app/weather/page.tsx          → Page principale
src/components/weather/
  ├── WeatherCard.tsx          → Carte météo principale
  ├── ForecastCard.tsx         → Prévisions journalières
  ├── WeatherBackground.tsx    → Arrière-plan animé
  ├── InspirationQuote.tsx     → Citations motivantes
  └── ActivitySuggestions.tsx  → Recommandations
app/api/weather/route.ts       → API backend
```

### Performance
- **Géolocalisation** : Fallback sur Paris si refusée
- **Données simulées** : Disponibles hors ligne
- **Animations optimisées** : Utilisation de CSS pour les performances
- **Images légères** : Emojis natifs au lieu d'images

## 🎉 Profitez de votre Météo Inspirante !

Cette application transforme la simple consultation de la météo en une expérience inspirante et visuellement captivante. Que le soleil brille ou que la pluie tombe, trouvez toujours une raison de sourire ! ✨
