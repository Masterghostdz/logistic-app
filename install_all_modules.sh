#!/bin/bash
# Script pour installer tous les modules et plugins du projet logistic-app
#
# Utilisation :
#   bash install_all_modules.sh
#
# Ce script installe toutes les dépendances NPM, les dépendances de développement,
# et synchronise les plugins Capacitor pour Android/iOS.

echo "[1/3] Installation des dépendances principales (npm install) :"
npm install \
@capacitor-community/camera-preview \
@capacitor/android \
@capacitor/camera \
@capacitor/cli \
@capacitor/core \
@capacitor/device \                                    
@capacitor/geolocation \
@capacitor/ios \
@capacitor/splash-screen \
@capacitor/status-bar \
@hookform/resolvers \
@radix-ui/react-accordion \
@radix-ui/react-alert-dialog \
@radix-ui/react-aspect-ratio \
@radix-ui/react-avatar \
@radix-ui/react-checkbox \
@radix-ui/react-collapsible \
@radix-ui/react-context-menu \
@radix-ui/react-dialog \
@radix-ui/react-dropdown-menu \
@radix-ui/react-hover-card \
@radix-ui/react-label \
@radix-ui/react-menubar \
@radix-ui/react-navigation-menu \
@radix-ui/react-popover \
@radix-ui/react-progress \
@radix-ui/react-radio-group \
@radix-ui/react-scroll-area \
@radix-ui/react-select \
@radix-ui/react-separator \
@radix-ui/react-slider \
@radix-ui/react-slot \
@radix-ui/react-switch \
@radix-ui/react-tabs \
@radix-ui/react-toast \
@radix-ui/react-toggle \
@radix-ui/react-toggle-group \
@radix-ui/react-tooltip \
@tanstack/react-query \
@types/leaflet \
class-variance-authority \
clsx \
cmdk \
date-fns \
embla-carousel-react \
firebase \
framer-motion \
html2canvas \
input-otp \
leaflet \
lucide-react \
next-themes \
react \
react-day-picker \
react-dom \
react-hook-form \
react-resizable-panels \
react-router-dom \
recharts \
sonner \
tailwind-merge \
tailwindcss-animate \
vaul \
xlsx \
zod

echo "[2/3] Installation des dépendances de développement (npm install --save-dev) :"
npm install --save-dev \
@eslint/js \
@tailwindcss/typography \
@types/node \
@types/react \
@types/react-dom \
@vitejs/plugin-react-swc \
autoprefixer \
eslint \
eslint-plugin-react-hooks \
eslint-plugin-react-refresh \
globals \
lovable-tagger \
postcss \
tailwindcss \
ts-node \
typescript \
typescript-eslint \
vite

echo "[3/3] Synchronisation des plugins Capacitor (npx cap sync) :"
npx cap sync

echo "\n✅ Tous les modules et plugins sont installés !"
