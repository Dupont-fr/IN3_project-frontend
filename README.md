# MediSys — IN3_project-frontend

Application web de gestion hospitalière MediSys. Interface utilisateur React connectée à l'API Gateway.

## Stack

- **Framework** : React 19
- **Build** : Vite 8
- **Styling** : Tailwind CSS 4
- **Icons** : Lucide React
- **Routing** : React Router DOM 7
- **HTTP** : Axios
- **State** : Context API (Auth, Theme, Notifications)
- **i18n** : react-i18next (FR/EN)
- **PDF** : jsPDF + jspdf-autotable
- **WebSocket** : socket.io-client

## Démarrage

```bash
cp .env.example .env
npm install
npm run dev
```

Port par défaut : `5173`

## Variables d'environnement

| Variable | Description | Défaut |
|---|---|---|
| `VITE_API_URL` | URL du Gateway | `http://localhost:5000` |
| `VITE_SOCKET_URL` | URL WebSocket (consultations-service) | `http://localhost:3003` |

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualisation du build |
| `npm run lint` | Vérification ESLint |

## Fonctionnalités

- **Authentification** : login, forgot-password, change-password
- **Dashboard** : statistiques par rôle (admin, médecin, accueil)
- **Gestion des utilisateurs** : CRUD, filtres par rôle
- **Gestion des patients** : CRUD, doublons, activation/désactivation, antécédents
- **Consultations** : création, prise en charge, modification, transfert inter-hôpitaux
- **Examens** : suivi des examens en attente avec statuts
- **Notifications** : système temps réel (WebSocket + API) avec navigation par type
- **PDF** : génération de comptes-rendus de consultation (examens, statuts, transferts)
- **Dark mode** : thème clair/sombre persisté (localStorage)
- **Responsive** : layout adapté mobile/tablette/desktop
- **i18n** : français et anglais (600+ clés par langue)
- **Pages publiques** : landing page, login, forgot-password avec navbar minimaliste

## Structure

```
src/
├── api/              # Appels API (axios, userApi, patientApi, consultationApi, hospitalApi)
├── components/       # Composants réutilisables
│   ├── layout/       # AppLayout, PublicLayout, Navbar, Sidebar
│   ├── Loader.jsx
│   ├── ProtectedRoute.jsx
│   └── SearchableSelect.jsx
├── context/          # Contextes React (AuthContext, ThemeContext, NotificationContext)
├── hooks/            # Hooks personnalisés
├── pages/            # Pages
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── ForgotPassword.jsx
│   ├── ChangePassword.jsx
│   ├── Dashboard.jsx
│   ├── Users/        # UserList, CreateUser, EditUser, UserDetail
│   ├── Patients/     # PatientList, CreatePatient, EditPatient, PatientDetail
│   └── Consultations/ # ConsultationList, CreateConsultation, ConsultationDetail
├── routes/           # Configuration des routes (AppRoutes)
├── utils/            # Utilitaires (roleHelpers)
└── i18n.js           # Configuration i18next (FR/EN)
```

## Dépôts liés

| Service | Dépôt |
|---|---|
| Gateway | [Dupont-fr/api-getway](https://github.com/Dupont-fr/api-getway) |
| User-service | [Dupont-fr/Hospital](https://github.com/Dupont-fr/Hospital) |
| Patient-service | [Dupont-fr/patient-service](https://github.com/Dupont-fr/patient-service) |
| Consultation-service | [Dupont-fr/consultations-service](https://github.com/Dupont-fr/consultations-service) |
| Statistic-service | [Dupont-fr/Statistique-service](https://github.com/Dupont-fr/Statistique-service) |
