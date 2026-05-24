Prompt de génération – Frontend global (React) – Gestion des utilisateurs & rôles

Tu es un ingénieur frontend senior spécialisé en React.js et en intégration avec des architectures microservices.

Ta mission est de générer une application frontend complète en React, connectée à un API Gateway, avec un focus particulier sur la gestion des utilisateurs, de l’authentification et des rôles.

🔗 Contexte global

L’application frontend communique uniquement avec un API Gateway déjà existant.

Toutes les requêtes passent par :

/api/users → user-service
/api/patients → patient-service
/api/consultations → consultation-service

👉 Le frontend ne doit JAMAIS appeler directement les microservices.

🎯 Objectif

Créer une interface utilisateur permettant :

l’authentification (login)
la gestion des utilisateurs (admin)
l’accès différencié selon les rôles
la navigation vers les modules patients et consultations
👥 Gestion des rôles

Le système contient 3 rôles :

🔹 Administrateur
Accès complet
Peut créer des utilisateurs
Peut voir tous les modules
🔹 Médecin
Accès aux consultations
Accès aux dossiers patients
Accès limité à la gestion utilisateur
🔹 ServiceAccueil
Peut créer un patient
Peut rechercher un patient
Accès très limité
🔐 Gestion des accès (frontend)

Le frontend doit :

stocker le token JWT (localStorage ou context)
protéger les routes
afficher des interfaces différentes selon le rôle

Exemple :

if (user.role === "ADMIN") → afficher dashboard admin
if (user.role === "MEDECIN") → afficher consultations
if (user.role === "ACCUEIL") → afficher module patient uniquement
⚙️ Technologies imposées
React.js (avec hooks)
React Router
Axios pour les appels API
Context API (ou Redux si nécessaire)
📡 API à consommer
POST /api/users/login
POST /api/users/register
GET /api/users
etc.

👉 Toutes les requêtes passent par le Gateway (URL configurable)

📁 Structure du projet attendue

frontend/
│
├── src/
│ ├── api/
│ │ ├── axios.js
│ │ └── userApi.js
│ │
│ ├── components/
│ │ ├── Navbar.jsx
│ │ ├── Sidebar.jsx
│ │ └── ProtectedRoute.jsx
│ │
│ ├── pages/
│ │ ├── Login.jsx
│ │ ├── Dashboard.jsx
│ │ │
│ │ ├── Users/
│ │ │ ├── UserList.jsx
│ │ │ ├── CreateUser.jsx
│ │ │ └── EditUser.jsx
│ │ │
│ │ ├── Patients/
│ │ │ └── (placeholder)
│ │ │
│ │ └── Consultations/
│ │ └── (placeholder)
│ │
│ ├── context/
│ │ └── AuthContext.jsx
│ │
│ ├── routes/
│ │ └── AppRoutes.jsx
│ │
│ ├── utils/
│ │ └── roleHelpers.js
│ │
│ └── App.jsx
│
├── .env.example
├── package.json

🔐 Fonctionnalités attendues
Authentification
Page Login
Stockage du token
Redirection après login
Gestion des utilisateurs (Admin)
Liste des utilisateurs
Création utilisateur
Modification utilisateur
Protection des routes

Créer un composant :

ProtectedRoute

Qui :

vérifie si l’utilisateur est connecté
vérifie son rôle
bloque l’accès si non autorisé
📦 Contenu attendu

Générer :

Structure complète du projet React
Configuration Axios (baseURL = Gateway)
Pages principales (Login, Dashboard)
Context d’authentification
Gestion du token JWT
Composant ProtectedRoute
Exemple de gestion des rôles
Fichier .env exemple
🔄 Contraintes
Code simple et compréhensible
UI basique (pas besoin de design avancé)
Bien commenter les parties importantes
Ne pas surcharger avec des librairies inutiles
🔗 Intégration avec le backend

Toutes les requêtes doivent passer par :

REACT_APP_API_URL

Exemple :

https://api-gateway.onrender.com

🎁 Bonus (optionnel)
Gestion des erreurs globales
Notifications (toast)
Refresh token
🎯 Résultat attendu

Une application frontend fonctionnelle permettant :

de se connecter
de gérer les utilisateurs
de naviguer selon les rôles
de s’intégrer facilement avec les autres microservices
