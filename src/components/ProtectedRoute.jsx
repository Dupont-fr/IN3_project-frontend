import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { hasPermission } from '../utils/roleHelpers'

export default function ProtectedRoute({ children, permission }) {
  const { isAuthenticated, user, mustChangePassword } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) return <Navigate to="/" replace />

  if (mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  if (permission && !hasPermission(user, permission)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
