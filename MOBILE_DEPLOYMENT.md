
# Guide de Déploiement Mobile - Logigrine

## Configuration Capacitor

Votre application Logigrine est maintenant configurée pour fonctionner comme une application mobile native Android/iOS grâce à Capacitor.

## Étapes de Déploiement

### 1. Export vers GitHub
1. Cliquez sur le bouton "Export to Github" dans Lovable
2. Créez un nouveau repository GitHub pour votre projet
3. Clonez le repository sur votre machine locale

### 2. Installation des Dépendances
```bash
cd votre-projet-logigrine
npm install
```

### 3. Ajout des Plateformes Natives
```bash
# Pour Android
npx cap add android

# Pour iOS (optionnel, nécessite macOS)
npx cap add ios
```

### 4. Build de l'Application
```bash
npm run build
```

### 5. Synchronisation avec les Plateformes
```bash
# Synchronise les fichiers web avec les projets natifs
npx cap sync
```

### 6. Ouverture dans l'IDE Natif

#### Pour Android:
```bash
npx cap run android
```
Ou ouvrir manuellement dans Android Studio:
```bash
npx cap open android
```

#### Pour iOS (macOS uniquement):
```bash
npx cap run ios
```
Ou ouvrir manuellement dans Xcode:
```bash
npx cap open ios
```

## Fonctionnalités Mobiles Ajoutées

### 🎯 Interface Optimisée Mobile
- Header mobile adaptatif
- Navigation par drawer/sidebar mobile
- Cartes optimisées pour le tactile
- Contrôles zoom personnalisés

### 📍 Géolocalisation Native
- Accès au GPS du dispositif
- Suivi de position en temps réel
- Permissions de localisation gérées automatiquement

### 📱 Fonctionnalités Natives
- Écran de démarrage (splash screen)
- Barre de statut configurée
- Détection de plateforme (Android/iOS/Web)
- Performance optimisée pour mobile

## Configuration de Développement

### Hot Reload
L'application est configurée pour utiliser le hot reload depuis Lovable. L'URL de développement est automatiquement configurée dans `capacitor.config.ts`.

### Variables d'Environnement
Pour la production, vous devrez configurer vos propres variables d'environnement et mettre à jour l'URL du serveur dans `capacitor.config.ts`.

## Génération APK pour Android

### En Mode Debug:
```bash
cd android
./gradlew assembleDebug
```
L'APK sera généré dans: `android/app/build/outputs/apk/debug/`

### En Mode Release:
1. Configurez la signature dans `android/app/build.gradle`
2. Générez l'APK signé:
```bash
cd android
./gradlew assembleRelease
```

## Prérequis Système

### Pour Android:
- Java Development Kit (JDK) 11+
- Android Studio
- Android SDK

### Pour iOS:
- macOS
- Xcode 14+
- iOS SDK

## Structure des Fichiers Ajoutés

```
src/
├── components/
│   ├── MobileHeader.tsx          # Header optimisé mobile
│   ├── MobileSidebar.tsx         # Sidebar/drawer mobile
│   ├── MobileLayout.tsx          # Layout responsive wrapper
│   └── MobileOpenStreetMap.tsx   # Carte optimisée mobile
├── services/
│   └── mobileService.ts          # Service pour fonctionnalités natives
├── capacitor.config.ts           # Configuration Capacitor
└── MOBILE_DEPLOYMENT.md          # Ce guide
```

## Support et Troubleshooting

### Problèmes Courants:
1. **Permissions refusées**: Vérifiez les permissions dans les paramètres du téléphone
2. **App ne se lance pas**: Vérifiez que tous les plugins sont installés avec `npx cap sync`
3. **Hot reload ne fonctionne pas**: Vérifiez que les devices sont sur le même réseau

### Logs de Débogage:
```bash
# Android
npx cap run android --livereload --external

# iOS
npx cap run ios --livereload --external
```

## Ressources Utiles
- [Documentation Capacitor](https://capacitorjs.com/docs)
- [Guide Android Development](https://developer.android.com/guide)
- [Guide iOS Development](https://developer.apple.com/documentation/)

Votre application Logigrine est maintenant prête pour le déploiement mobile! 🚀
