import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminStatistics from './AdminStatistics'
import DoctorStatistics from './DoctorStatistics'
import ReceptionStats from './ReceptionStats'

export default function StatisticsIndex() {
  const { user } = useAuth()

  if (user?.roleUser === 'ADMIN') return <AdminStatistics />
  if (user?.roleUser === 'MEDECIN') return <DoctorStatistics />
  if (user?.roleUser === 'ACCUEIL') return <ReceptionStats />

  return <Navigate to="/dashboard" replace />
}
