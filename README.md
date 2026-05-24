# MediSys - Frontend (React)

Application web de gestion hospitalière. Interface utilisateur connectée à un API Gateway qui redirige vers les microservices. Interface en français, thème bleu/blanc avec support dark/light.

## Stack technique

- **Framework** : React 19
- **Build tool** : Vite 8
- **Styling** : Tailwind CSS 4
- **Icons** : Lucide React
- **Routing** : React Router DOM 7
- **HTTP** : Axios
- **State** : Context API

## Structure du projet

```
frontend/
├── .env                          # VITE_API_URL = URL du Gateway
├── package.json
├── src/
│   ├── App.jsx                   # Point d'entrée React (Router + AuthProvider)
│   ├── main.jsx                  # Mount React
│   ├── index.css                 # Styles Tailwind
│   │
│   ├── api/
│   │   ├── axios.js              # Instance Axios (baseURL, interceptor JWT, auto-logout 401)
│   │   ├── userApi.js            # authAPI (login, registerAdmin) + usersAPI (CRUD)
│   │   ├── hospitalApi.js        # hospitalsAPI + liste SPECIALTIES (24 spécialités)
│   │   ├── patientApi.js         # patientsAPI (CRUD)
│   │   └── consultationApi.js    # consultationsAPI (CRUD)
│   │
│   ├── context/
│   │   └── AuthContext.jsx       # Contexte auth : user, token, mustChangePassword, login/logout
│   │
│   ├── components/
│   │   ├── ProtectedRoute.jsx    # Garde de route (auth, mustChangePassword, permissions)
│   │   ├── SearchableSelect.jsx  # Autocomplete avec saisie libre (pour les hôpitaux)
│   │   └── layout/
│   │       ├── AppLayout.jsx     # Layout principal (Sidebar + Navbar + contenu)
│   │       ├── Navbar.jsx        # Barre du haut (user, thème, déconnexion)
│   │       └── Sidebar.jsx       # Navigation latérale (rôles, responsive)
│   │
│   ├── pages/
│   │   ├── Landing.jsx           # Page d'accueil publique
│   │   ├── Login.jsx             # Formulaire de connexion
│   │   ├── ChangePassword.jsx    # Changement de mot de passe avec force meter
│   │   ├── Dashboard.jsx         # Tableau de bord (rôle, recherche user, actions rapides)
│   │   ├── Users/
│   │   │   ├── UserList.jsx      # Liste des utilisateurs (recherche, filtre, CRUD)
│   │   │   ├── CreateUser.jsx    # Création (nom, email, password, rôle, hôpital, spécialité)
│   │   │   └── EditUser.jsx      # Modification (pré-rempli)
│   │   ├── Patients/             # Pages patients (à implémenter)
│   │   └── Consultations/        # Pages consultations (à implémenter)
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx         # Configuration des routes
│   │
│   └── utils/
│       └── roleHelpers.js        # ROLES, labels, badges, permissions
```

## Scripts disponibles

```bash
npm run dev       # Lance le serveur de développement Vite
npm run build     # Build de production
npm run preview   # Prévisualisation du build
npm run lint      # Vérification ESLint
```

## Variables d'environnement

```env
VITE_API_URL=https://api-getway-tv5u.onrender.com   # URL du Gateway
```

Tous les appels API passent par cette URL. Le frontend ne contacte jamais directement les microservices.

## Endpoints API consommés

Via le Gateway (`/api/users/*` → user-service) :

| Méthode | Endpoint | Page |
|---------|----------|------|
| POST | `/api/users/login` | Login |
| POST | `/api/users/register` | CreateUser |
| GET | `/api/users/users?role=&search=` | UserList |
| GET | `/api/users/users/:id` | EditUser |
| PUT | `/api/users/users/:id` | EditUser |
| DELETE | `/api/users/users/:id` | UserList |
| POST | `/api/users/change-password` | ChangePassword |
| GET | `/api/users/hospitals?search=` | CreateUser, EditUser |

## Fonctionnalités

- **Authentification JWT** avec stockage localStorage et interceptor Axios
- **Trois rôles** avec interfaces différentes (ADMIN, MEDECIN, ACCUEIL)
- **Routes protégées** : redirection si non connecté, changement de mot de passe forcé
- **Barre de recherche** d'utilisateurs (dashboard et liste)
- **Force meter** pour le mot de passe (5 règles visuelles)
- **Sélection d'hôpital** avec autocomplete + saisie libre
- **24 spécialités médicales** pour les médecins
- **Thème dark/light** avec persistance
- **Sidebar responsive** (menu hamburger sur mobile)
- **Déconnexion automatique** sur 401
- **Interface 100% en français**

## Architecture

```
React App → VITE_API_URL (Gateway) → /api/users/* → user-service
                                   → /api/patients/* → patient-service
                                   → /api/consultations/* → consultation-service
```
