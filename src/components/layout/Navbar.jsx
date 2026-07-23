import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { ROLE_LABELS } from '../../utils/roleHelpers'
import { Moon, Sun, Menu, Building2, Bell, BellRing, ArrowRightLeft, FileText, KeyRound } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import LanguageSwitcher from '../LanguageSwitcher'

const NOTIF_ICONS = {
  transfert: ArrowRightLeft,
  examen: FileText,
  password_reset: KeyRound,
}

const NOTIF_COLORS = {
  transfert: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  examen: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
  password_reset: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
}

function getNotifLink(n) {
  if (n.link) return n.link
  switch (n.type) {
    case 'transfert':
      return n.data?.newConsultationId ? `/consultations/${n.data.newConsultationId}` : '/consultations'
    case 'examen':
      return '/examens/pending'
    case 'password_reset':
      return '/admin/password-resets'
    default:
      return '/dashboard'
  }
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'À l\'instant'
  if (diff < 3600000) return `il y a ${Math.floor(diff / 60000)}min`
  if (diff < 86400000) return `il y a ${Math.floor(diff / 3600000)}h`
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export default function Navbar({ onMenuClick }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { notifications, unreadCount, markAllRead } = useNotifications()
  const { dark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showNotif, setShowNotif] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleNotifClick = (n) => {
    const link = getNotifLink(n)
    navigate(link)
    setShowNotif(false)
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        >
          <Menu className="w-6 h-6" />
        </button>

        {user?.hospitalUser && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 rounded-lg border border-primary-200 dark:border-primary-800">
            <Building2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-bold text-primary-700 dark:text-primary-300">
              {user.hospitalUser}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <LanguageSwitcher />

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif(!showNotif); if (!showNotif) markAllRead() }}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            title={t('nav.notifications')}
          >
            {unreadCount > 0 ? <BellRing className="w-5 h-5 text-primary-600" /> : <Bell className="w-5 h-5" />}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
              <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{t('nav.notifications')}</span>
                {notifications.length > 0 && (
                  <button onClick={() => setShowNotif(false)} className="text-xs text-gray-500 hover:text-gray-700">
                    {t('nav.close')}
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center">{t('nav.no_notifications')}</p>
              ) : (
                notifications.slice(0, 20).map((n) => {
                  const Icon = NOTIF_ICONS[n.type] || Bell
                  const colorClass = NOTIF_COLORS[n.type] || 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={`w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-50 dark:border-gray-800 last:border-0 flex items-start gap-3 ${n.read ? '' : 'bg-primary-50/50 dark:bg-primary-900/10'}`}
                    >
                      <div className={`mt-0.5 p-1.5 rounded-lg ${colorClass}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{n.title}</p>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{formatTime(n.createdAt)}</p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          title={t('nav.theme')}
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {user && (
          <div className="flex items-center gap-3 ml-1">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.nameUser}</div>
              <div className="text-xs text-gray-500">{user.specialtyUser || ROLE_LABELS[user.role] || user.role}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
              {user.nameUser?.charAt(0)?.toUpperCase() || '?'}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
