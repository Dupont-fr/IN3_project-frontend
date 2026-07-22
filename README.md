# MediSys — IN3_project-frontend

Application web de gestion hospitalière MediSys. Interface utilisateur React connectée à l'API Gateway.

## Stack

- **Framework** : React 19
- **Build** : Vite 8
- **Styling** : Tailwind CSS 4
- **Icons** : Lucide React
- **Routing** : React Router DOM 7
- **HTTP** : Axios
- **State** : Context API

## Démarrage

```bash
cp .env.example .env
npm install
npm run dev
```

Port par défaut : `5173`

## Variables d'environnement

| Variable | Description |
|---|---|
| `VITE_API_URL` | URL du Gateway (ex: `http://localhost:5000`) |

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualisation du build |
| `npm run lint` | Vérification ESLint |

## Structure

```
src/
├── api/              # Appels API (axios, userApi, hospitalApi, patientApi, consultationApi)
├── components/       # Composants réutilisables (ProtectedRoute, Loader, SearchableSelect, layout)
├── context/          # Contextes React (AuthContext)
├── pages/            # Pages (Landing, Login, Dashboard, Users, Patients, Consultations, Historique...)
├── routes/           # Configuration des routes
└── utils/            # Utilitaires (roleHelpers)
```

## Dépôts liés

| Service | Dépôt |
|---|---|
| Gateway | [Dupont-fr/api-getway](https://github.com/Dupont-fr/api-getway) |
| User-service | [Dupont-fr/Hospital](https://github.com/Dupont-fr/Hospital) |
| Patient-service | [Dupont-fr/patient-service](https://github.com/Dupont-fr/patient-service) |
| Consultation-service | [Dupont-fr/consultations-service](https://github.com/Dupont-fr/consultations-service) |
| Statistic-service | [Dupont-fr/Statistique-service](https://github.com/Dupont-fr/Statistique-service) |
