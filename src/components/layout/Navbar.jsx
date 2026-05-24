import { useAuth } from '../../context/AuthContext'
import { ROLE_LABELS } from '../../utils/roleHelpers'
import { Moon, Sun, LogOut, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const toggleTheme = () => setDark((prev) => !prev)

  const handleLogout = () => {
    setShowConfirm(false)
    logout()
  }

  return (
    <>
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden lg:block" />

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            title="Changer le thème"
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                <div className="text-xs text-gray-500">{ROLE_LABELS[user.role] || user.role}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                {user.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <button
                onClick={() => setShowConfirm(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Déconnexion</h3>
              <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir vous déconnecter ?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
