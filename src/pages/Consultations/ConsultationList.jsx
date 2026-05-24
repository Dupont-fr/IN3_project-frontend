import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { consultationsAPI } from '../../api/consultationApi'
import { patientsAPI } from '../../api/patientApi'
import { useAuth } from '../../context/AuthContext'
import { hasPermission } from '../../utils/roleHelpers'
import { Plus, FileText, Eye, PenSquare, ArrowLeft } from 'lucide-react'

export default function ConsultationList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const canManage = hasPermission(user, 'canManageConsultations')
  const canView = hasPermission(user, 'canViewConsultations')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await consultationsAPI.getAll()
        setConsultations(res.data.data || [])
      } catch {
        setError('Service consultations indisponible')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-500">Chargement...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Consultations</h1>
          <p className="text-sm text-gray-500 mt-1">{consultations.length} consultation(s)</p>
        </div>
        {canManage && (
          <Link to="/consultations/create" className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Nouvelle consultation
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">{error}</div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Médecin</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Diagnostic</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {consultations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Aucune consultation</td>
                </tr>
              ) : (
                consultations.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{c.patientName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{c.doctorName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {c.date ? new Date(c.date).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{c.diagnostic || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canView && (
                          <Link to={`/consultations/${c._id}`} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                            <Eye className="w-3.5 h-3.5" /> Voir
                          </Link>
                        )}
                        {canManage && (
                          <Link to={`/consultations/${c._id}/edit`} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg">
                            <PenSquare className="w-3.5 h-3.5" /> Modifier
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
