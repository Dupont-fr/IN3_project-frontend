import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { hasPermission, ROLE_LABELS } from '../../utils/roleHelpers'
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  History,
  Stethoscope,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  X,
  KeyRound,
  HelpCircle,
  FlaskConical,
} from 'lucide-react'

const navItems = [
  {
    to: '/dashboard',
    key: 'dashboard',
    icon: LayoutDashboard,
    permission: null,
  },
  { to: '/users', key: 'users', icon: Users, permission: 'canViewUsers' },
  {
    to: '/hospitals',
    key: 'hospitals',
    icon: Building2,
    permission: 'canManageHospitals',
  },
  {
    to: '/patients',
    key: 'patients',
    icon: Stethoscope,
    permission: 'canViewPatients',
  },
  {
    to: '/consultations',
    key: 'consultations',
    icon: ClipboardList,
    permission: 'canViewConsultations',
  },
  {
    to: '/examens/pending',
    key: 'pending_examens',
    icon: FlaskConical,
    permission: 'canViewConsultations',
  },
  {
    to: '/statistics',
    key: 'statistics',
    icon: BarChart3,
    permission: 'canViewStatistics',
  },
]

export default function Sidebar({ open, onClose }) {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  return (
    <>
      {open && (
        <div
          className='fixed inset-0 bg-black/50 z-40 lg:hidden'
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900 
          border-r border-gray-200 dark:border-gray-800 
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className='flex items-center gap-3 px-6 h-16 border-b border-gray-200 dark:border-gray-800'>
          <img
            src='/Medilogo.jpg'
            alt='MediSys'
            className='h-12 w-auto rounded-xl'
          />
          <span className='text-xl font-bold text-primary-600'>MediSys</span>
        </div>

        <nav className='p-4 space-y-1'>
          {navItems.map((item) => {
            if (item.permission && !hasPermission(user, item.permission))
              return null
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`
                }
              >
                <Icon className='w-5 h-5' />
                {t(`sidebar.${item.key}`)}
              </NavLink>
            )
          })}

          {(user?.roleUser === 'MEDECIN' || user?.roleUser === 'ACCUEIL') && (
            <NavLink
              to='/historique'
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`
              }
            >
              <History className='w-5 h-5' />
              {t('sidebar.historique')}
            </NavLink>
          )}
        </nav>

        <div className='absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800'>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className='flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors'
          >
            <div className='flex items-center gap-3'>
              <Settings className='w-5 h-5' />
              <span>{t('sidebar.settings')}</span>
            </div>
            {settingsOpen ? (
              <ChevronUp className='w-4 h-4' />
            ) : (
              <ChevronDown className='w-4 h-4' />
            )}
          </button>

          {settingsOpen && (
            <div className='px-4 pb-3 space-y-2'>
              {user && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800'>
                    <div className='w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-medium shrink-0'>
                      {user.nameUser?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className='min-w-0'>
                      <div className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>
                        {user.nameUser}
                      </div>
                      <div className='text-xs text-gray-500 truncate'>
                        {ROLE_LABELS[user.roleUser] || user.roleUser}
                      </div>
                    </div>
                  </div>
                  {user.hospitalUser && (
                    <div className='flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800'>
                      <Building2 className='w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0' />
                      <span className='text-sm font-bold text-primary-700 dark:text-primary-300 truncate'>
                        {user.hospitalUser}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {user?.roleUser === 'ADMIN' && (
                <NavLink
                  to='/admin/password-resets'
                  onClick={onClose}
                  className='flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors'
                >
                  <KeyRound className='w-4 h-4' />
                  {t('sidebar.password_resets')}
                </NavLink>
              )}
              <NavLink
                to='/change-password'
                onClick={onClose}
                className='flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors'
              >
                <KeyRound className='w-4 h-4' />
                {t('sidebar.change_password')}
              </NavLink>
              <NavLink
                to='/help'
                onClick={onClose}
                className='flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors'
              >
                <HelpCircle className='w-4 h-4' />
                {t('sidebar.help')}
              </NavLink>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className='flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
              >
                <LogOut className='w-4 h-4' />
                {t('nav.logout')}
              </button>
            </div>
          )}
        </div>
      </aside>

      {showLogoutConfirm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                {t('nav.logout_title')}
              </h3>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-400 mb-6'>
              {t('nav.logout_confirm')}
            </p>
            <div className='flex gap-3 justify-end'>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
              >
                {t('nav.cancel')}
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false)
                  logout()
                }}
                className='px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors'
              >
                {t('nav.logout_title')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
