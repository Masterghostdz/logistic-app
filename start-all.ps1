# Installe les dépendances
npm install

# Crée le dossier uploads si besoin
if (!(Test-Path -Path "uploads")) {
  New-Item -ItemType Directory -Path "uploads"
}

# Démarre le serveur d'upload local en arrière-plan
Start-Process powershell -ArgumentList "npm run start:upload-server"

# Démarre le serveur Vite (frontend)
Start-Process powershell -ArgumentList "npm run dev"
