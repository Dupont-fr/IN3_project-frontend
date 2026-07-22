import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS, ROLE_PERMISSIONS } from '../utils/roleHelpers'
import { usersAPI } from '../api/userApi'
import { statisticsAPI } from '../api/statisticsApi'
import { useTranslation } from 'react-i18next'
import { Users, Hospital, ClipboardList, UserPlus, Search, FileText, UserCog, Eye, BarChart3 } from 'lucide-react'

const roleActions = {
  ADMIN: {
    stats: [
      { labelKey: 'dashboard.stat_users', icon: Users, color: 'bg-purple-500' },
      { labelKey: 'dashboard.stat_hospitals', icon: Hospital, color: 'bg-blue-500' },
    ],
    quick: [
      { to: '/users/create', icon: UserPlus, labelKey: 'dashboard.quick_create_user', descKey: 'dashboard.quick_create_user_desc' },
      { to: '/users', icon: UserCog, labelKey: 'dashboard.quick_manage_users', descKey: 'dashboard.quick_manage_users_desc' },
      { to: '/hospitals/create', icon: Hospital, labelKey: 'dashboard.quick_add_hospital', descKey: 'dashboard.quick_add_hospital_desc' },
      { to: '/hospitals', icon: Eye, labelKey: 'dashboard.quick_manage_hospitals', descKey: 'dashboard.quick_manage_hospitals_desc' },
      { to: '/statistics', icon: BarChart3, labelKey: 'dashboard.quick_statistics', descKey: 'dashboard.quick_statistics_desc' },
    ],
    welcomeKey: 'dashboard.welcome_admin',
  },
  MEDECIN: {
    stats: [
      { labelKey: 'dashboard.stat_patients', icon: Hospital, color: 'bg-green-500' },
      { labelKey: 'dashboard.stat_consultations', icon: ClipboardList, color: 'bg-blue-500' },
    ],
    quick: [
      { to: '/patients/create', icon: UserPlus, labelKey: 'dashboard.quick_new_patient', descKey: 'dashboard.quick_new_patient_desc' },
      { to: '/patients', icon: Search, labelKey: 'dashboard.quick_search_patient', descKey: 'dashboard.quick_search_patient_desc' },
      { to: '/consultations/create', icon: FileText, labelKey: 'dashboard.quick_new_consultation', descKey: 'dashboard.quick_new_consultation_desc' },
      { to: '/consultations?mine=true', icon: ClipboardList, labelKey: 'dashboard.quick_my_consultations', descKey: 'dashboard.quick_my_consultations_desc' },
      { to: '/statistics', icon: BarChart3, labelKey: 'dashboard.quick_statistics', descKey: 'dashboard.quick_statistics_desc' },
    ],
    welcomeKey: 'dashboard.welcome_medecin',
  },
  ACCUEIL: {
    stats: [
      { labelKey: 'dashboard.stat_patients', icon: Hospital, color: 'bg-green-500' },
      { labelKey: 'dashboard.stat_consultations', icon: ClipboardList, color: 'bg-blue-500' },
    ],
    quick: [
      { to: '/patients/create', icon: UserPlus, labelKey: 'dashboard.quick_new_patient', descKey: 'dashboard.quick_new_patient_desc' },
      { to: '/patients', icon: Search, labelKey: 'dashboard.quick_search_patient', descKey: 'dashboard.quick_search_patient_desc' },
      { to: '/consultations', icon: Eye, labelKey: 'dashboard.quick_view_consultations', descKey: 'dashboard.quick_view_consultations_desc' },
      { to: '/statistics', icon: BarChart3, labelKey: 'dashboard.quick_statistics', descKey: 'dashboard.quick_statistics_desc' },
    ],
    welcomeKey: 'dashboard.welcome_accueil',
  },
}

export default function Dashboard() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const config = roleActions[user?.roleUser] || roleActions.ACCUEIL
  const roleInfo = ROLE_LABELS[user?.roleUser] || user?.roleUser

  const [stats, setStats] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.roleUser === 'ADMIN') {
          const res = await statisticsAPI.admin.overview()
          const d = res.data.data
          setStats({ totalDoctors: d.totalDoctors, totalHospitals: d.totalHospitals, totalPatients: d.totalPatients, totalConsultations: d.totalConsultations })
        } else {
          const res = await statisticsAPI.reception.today()
          setStats({ totalPatients: res.data.data.totalPatients, totalConsultations: res.data.data.totalConsultations })
        }
      } catch {
        setStats({})
      }
    }
    fetchStats()
  }, [user])

  const statValue = (key) => stats[key] ?? '--'

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
        <p className="text-gray-500 mt-1">{t('dashboard.welcome', { name: user?.nameUser || t('dashboard.welcome').split(',')[1]?.trim() || '' })}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
            {roleInfo}
          </span>
          <span className="text-xs text-gray-400">{t(config.welcomeKey)}</span>
        </div>
      </div>

      <div ref={searchRef} className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('dashboard.search_placeholder')}
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
            {t('dashboard.no_results', { query: searchQuery })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {config.stats.map((stat) => {
          const StatIcon = stat.icon
          return (
            <div key={stat.labelKey} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                  <StatIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.labelKey === 'dashboard.stat_users' ? statValue('totalDoctors') :
                     stat.labelKey === 'dashboard.stat_hospitals' ? statValue('totalHospitals') :
                     stat.labelKey === 'dashboard.stat_patients' ? statValue('totalPatients') :
                     stat.labelKey === 'dashboard.stat_consultations' ? statValue('totalConsultations') :
                     '--'}
                  </div>
                  <div className="text-sm text-gray-500">{t(stat.labelKey)}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.quick_actions')}</h2>
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
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{t(action.labelKey)}</div>
                  <div className="text-xs text-gray-500">{t(action.descKey)}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
