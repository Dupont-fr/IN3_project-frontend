import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS, ROLE_PERMISSIONS } from '../utils/roleHelpers'
import { usersAPI } from '../api/userApi'
import { Users, Hospital, ClipboardList, UserPlus, Search, FileText, UserCog, Eye } from 'lucide-react'

const roleActions = {
  ADMIN: {
    stats: [
      { label: 'Utilisateurs', value: '--', icon: Users, color: 'bg-purple-500' },
      { label: 'Patients', value: '--', icon: Hospital, color: 'bg-green-500' },
      { label: 'Consultations', value: '--', icon: ClipboardList, color: 'bg-blue-500' },
    ],
    quick: [
      { to: '/users/create', icon: UserPlus, label: 'Créer un utilisateur', desc: 'Ajouter un médecin ou agent' },
      { to: '/users', icon: UserCog, label: 'Gérer les utilisateurs', desc: 'Modifier ou supprimer' },
      { to: '/patients', icon: Eye, label: 'Consulter les patients', desc: 'Lecture seule' },
      { to: '/consultations', icon: Eye, label: 'Consulter les dossiers', desc: 'Lecture seule' },
    ],
    welcome: 'Accès administrateur complet',
  },
  MEDECIN: {
    stats: [
      { label: 'Patients', value: '--', icon: Hospital, color: 'bg-green-500' },
      { label: 'Consultations', value: '--', icon: ClipboardList, color: 'bg-blue-500' },
    ],
    quick: [
      { to: '/patients/create', icon: UserPlus, label: 'Nouveau patient', desc: 'Enregistrer un patient' },
      { to: '/patients', icon: Search, label: 'Rechercher un patient', desc: 'Consulter les dossiers' },
      { to: '/consultations/create', icon: FileText, label: 'Nouvelle consultation', desc: 'Créer un dossier médical' },
      { to: '/consultations', icon: ClipboardList, label: 'Mes consultations', desc: 'Suivi des dossiers' },
    ],
    welcome: 'Espace Médecin - Soins & Consultations',
  },
  ACCUEIL: {
    stats: [
      { label: 'Patients', value: '--', icon: Hospital, color: 'bg-green-500' },
      { label: 'Consultations', value: '--', icon: ClipboardList, color: 'bg-blue-500' },
    ],
    quick: [
      { to: '/patients/create', icon: UserPlus, label: 'Nouveau patient', desc: 'Enregistrer un patient' },
      { to: '/patients', icon: Search, label: 'Rechercher un patient', desc: 'Modifier les informations' },
      { to: '/consultations', icon: Eye, label: 'Consulter les dossiers', desc: 'Lecture seule' },
    ],
    welcome: "Espace Accueil - Gestion des patients",
  },
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const config = roleActions[user?.roleUser] || roleActions.ACCUEIL
  const roleInfo = ROLE_LABELS[user?.roleUser] || user?.roleUser

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await usersAPI.getAll({ search: searchQuery })
        setSearchResults(res.data.data)
        setShowResults(true)
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
        <p className="text-gray-500 mt-1">Bienvenue, {user?.nameUser || 'Utilisateur'}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
            {roleInfo}
          </span>
          <span className="text-xs text-gray-400">{config.welcome}</span>
        </div>
      </div>

      <div ref={searchRef} className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un utilisateur dans le système..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {searchResults.map((u) => (
              <button
                key={u._id}
                type="button"
                onMouseDown={() => {
                  navigate(`/users/${u._id}/edit`)
                  setShowResults(false)
                  setSearchQuery('')
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 text-sm font-medium shrink-0">
                  {u.nameUser?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.nameUser}</div>
                  <div className="text-xs text-gray-500 truncate">{u.emailUser}</div>
                </div>
                <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  u.roleUser === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                  u.roleUser === 'MEDECIN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {ROLE_LABELS[u.roleUser] || u.roleUser}
                </span>
              </button>
            ))}
          </div>
        )}

        {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
          <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
            Aucun utilisateur trouvé pour "{searchQuery}"
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {config.stats.map((stat) => {
          const StatIcon = stat.icon
          return (
            <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                  <StatIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {config.quick.map((action) => {
            const ActionIcon = action.icon
            return (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
              >
                <ActionIcon className="w-6 h-6 text-primary-600" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{action.label}</div>
                  <div className="text-xs text-gray-500">{action.desc}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
