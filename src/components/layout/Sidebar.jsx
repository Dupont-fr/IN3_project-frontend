import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { hasPermission } from '../../utils/roleHelpers'
import { LayoutDashboard, Users, Hospital, ClipboardList } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, permission: null },
  { to: '/users', label: 'Utilisateurs', icon: Users, permission: 'canViewUsers' },
  { to: '/patients', label: 'Patients', icon: Hospital, permission: 'canViewPatients' },
  { to: '/consultations', label: 'Consultations', icon: ClipboardList, permission: 'canViewConsultations' },
]

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
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
          <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-200 dark:border-gray-800">
            <Hospital className="w-6 h-6 text-primary-600" />
            <span className="text-xl font-bold text-primary-600">MediSys</span>
          </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            if (item.permission && !hasPermission(user, item.permission)) return null
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="text-xs text-gray-400 text-center">MediSys v1.0</div>
        </div>
      </aside>
    </>
  )
}
