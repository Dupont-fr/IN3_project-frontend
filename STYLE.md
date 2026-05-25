# Guide de Style — MediSys Frontend

## Stack technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| Tailwind CSS | 4.3.0 | Framework CSS utilitaire |
| @tailwindcss/vite | 4.3.0 | Plugin Vite pour Tailwind |
| Lucide React | 1.16.0 | Librairie d'icônes |
| Inter | — | Police principale (Google Font) |

**Aucune librairie de composants** (shadcn/ui, Material UI, etc.) n'est utilisée. Tous les composants sont codés à la main avec Tailwind CSS.

---

## Palette de couleurs

### Primaire (Bleu) — Défini dans `src/index.css`

```
primary-50:  #eff6ff
primary-100: #dbeafe
primary-200: #bfdbfe
primary-300: #93c5fd
primary-400: #60a5fa
primary-500: #3b82f6
primary-600: #2563eb    ← Couleur principale des boutons et liens
primary-700: #1d4ed8    ← Hover des boutons
primary-800: #1e40af
primary-900: #1e3a8a    ← Dégradés du fond
```

### Rôles utilisateur (badges)

| Rôle | Fond (clair) | Texte (clair) | Fond (dark) | Texte (dark) |
|------|-------------|---------------|-------------|---------------|
| ADMIN | `bg-purple-100` | `text-purple-800` | `bg-purple-900` | `text-purple-200` |
| MEDECIN | `bg-blue-100` | `text-blue-800` | `bg-blue-900` | `text-blue-200` |
| ACCUEIL | `bg-green-100` | `text-green-800` | `bg-green-900` | `text-green-200` |

### États (alertes et notifications)

| État | Fond | Bordure | Texte |
|------|------|---------|-------|
| Erreur | `bg-red-50` | `border-red-200` | `text-red-700` |
| Succès | — | — | `text-green-600` |
| Info | `bg-blue-50` | `border-blue-200` | `text-blue-700` |
| Attention | `bg-yellow-50` | `border-yellow-200` | `text-yellow-700` |

---

## Police

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

Définie dans `src/index.css` sur le `body`.

### Tailles de police

| Classe | Usage |
|--------|-------|
| `text-xs` (0.75rem) | En-têtes de tableau, métadonnées, pied de page, textes secondaires |
| `text-sm` (0.875rem) | **Corps principal** — labels, inputs, cellules, boutons, descriptions |
| `text-lg` (1.125rem) | Sous-titres de section ("Actions rapides") |
| `text-xl` (1.25rem) | Logo sidebar, titres de pages secondaires |
| `text-2xl` (1.5rem) | **Titres de pages** — Tableau de bord, Utilisateurs, etc. |
| `text-4xl` (2.25rem) | Titre principal de la Landing Page |
| `text-6xl` (3.75rem) | Titre Landing sur écrans moyens+ (`md:text-6xl`) |

---

## Arborescence des fichiers de style

```
frontend/
├── index.css                          ← UNIQUE fichier CSS du projet
│   ├── @import "tailwindcss"          ← Import Tailwind
│   ├── @custom-variant dark           ← Définition du mode dark
│   ├── @theme { ... }                 ← Palette primary-50 à primary-900
│   └── body { font-family: 'Inter'... }
│
├── src/
│   ├── components/
│   │   ├── SearchableSelect.jsx       ← Style du dropdown avec suggestions
│   │   ├── ProtectedRoute.jsx         ← Pas de style (composant logique)
│   │   └── layout/
│   │       ├── AppLayout.jsx          ← Layout global (sidebar + navbar + contenu)
│   │       ├── Navbar.jsx             ← Barre supérieure (user, thème, logout)
│   │       └── Sidebar.jsx            ← Navigation latérale (liens, rôle actif)
│   │
│   ├── pages/
│   │   ├── Landing.jsx                ← Page publique (dégradé, hero, cartes features)
│   │   ├── Login.jsx                  ← Page connexion (dégradé, carte centrée)
│   │   ├── ChangePassword.jsx         ← Changement mot de passe (force meter)
│   │   ├── Dashboard.jsx              ← Tableau de bord (recherche, stats, actions)
│   │   ├── Users/
│   │   │   ├── UserList.jsx           ← Tableau utilisateurs (recherche, filtre)
│   │   │   ├── CreateUser.jsx         ← Formulaire création
│   │   │   └── EditUser.jsx           ← Formulaire édition
│   │   ├── Patients/                  ← Pages Patients (à implémenter)
│   │   └── Consultations/             ← Pages Consultations (à implémenter)
│   │
│   └── utils/
│       └── roleHelpers.js             ← Classes Tailwind pour les badges de rôles
```

---

## Où modifier le style pour chaque page

| Page | Fichier | Sections de style |
|------|---------|-------------------|
| **Landing** | `pages/Landing.jsx` | Hero (dégradé `bg-gradient-to-br`), cartes features (`backdrop-blur`), CTA button |
| **Login** | `pages/Login.jsx` | Fond dégradé, carte centrée (`shadow-2xl`, `rounded-2xl`) |
| **ChangePassword** | `pages/ChangePassword.jsx` | Force meter (5 barres), liste de validation, carte centrée |
| **Dashboard** | `pages/Dashboard.jsx` | Barre de recherche, cartes stats, grille actions rapides |
| **UserList** | `pages/Users/UserList.jsx` | Barre recherche, filtre rôle, tableau, badges rôles |
| **CreateUser** | `pages/Users/CreateUser.jsx` | Formulaire, SearchableSelect, select spécialité |
| **EditUser** | `pages/Users/EditUser.jsx` | Formulaire pré-rempli, SearchableSelect |
| **Navbar** | `components/layout/Navbar.jsx` | Barre supérieure, bouton thème, menu logout |
| **Sidebar** | `components/layout/Sidebar.jsx` | Navigation, lien actif, responsive mobile |
| **SearchableSelect** | `components/SearchableSelect.jsx` | Input de recherche, dropdown suggestions, option "Utiliser" |
| **Badges** | `utils/roleHelpers.js` | `ROLE_BADGES` (classes Tailwind pour chaque rôle) |
| **Palette globale** | `index.css` | `@theme` (primary-50 à 900) |
| **Commun à tous les inputs** | Partout | Pattern : `focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none` |

---

## Motifs récurrents

### Carte / Conteneur de formulaire
```html
<div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
```

### Input standard
```html
<input class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
```

### Bouton primaire
```html
<button class="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50">
```

### Bouton secondaire (Annuler)
```html
<button class="px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
```

### Badge de rôle
```html
<span class="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
  Médecin
</span>
```

### Titre de page
```html
<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Titre</h1>
<p class="text-sm text-gray-500 mt-1">Sous-titre</p>
```

---

## Breakpoints responsive

| Breakpoint | Usage |
|------------|-------|
| `sm:` (640px) | Grille stats 3 colonnes, grille actions 2 colonnes, barre recherche + filtre en ligne |
| `md:` (768px) | Sidebar visible, text-6xl sur Landing |
| `lg:` (1024px) | Grille features 4 colonnes |

---

## Dark mode

Activé par classe `.dark` sur la balise `<html>`, togglée depuis la Navbar.

```css
@custom-variant dark (&:where(.dark, .dark *));
```

Tous les composants ont leur équivalent dark via le préfixe `dark:`. Voir le tableau dans la section "Où modifier le style" pour les classes dark de chaque élément.

### Cas particuliers
- Les alertes rouges (`bg-red-50`) et jaunes (`bg-yellow-50`) n'ont **pas** de variante dark explicite
- Les badges de rôle ont leurs propres classes dark dans `roleHelpers.js`
