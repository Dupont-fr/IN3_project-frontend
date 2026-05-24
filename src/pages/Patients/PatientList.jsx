import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { patientsAPI } from '../../api/patientApi'
import { useAuth } from '../../context/AuthContext'
import { hasPermission } from '../../utils/roleHelpers'
import { Plus, Search, Eye, PenSquare } from 'lucide-react'

export default function PatientList() {
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const canEdit = hasPermission(user, 'canManagePatients')

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = search ? { search } : {}
        const res = await patientsAPI.getAll(params)
        setPatients(res.data.data || [])
      } catch {
        setError('Service patients indisponible')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [search])

  if (loading) return <div className="text-center py-12 text-gray-500">Chargement...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patients</h1>
          <p className="text-sm text-gray-500 mt-1">{patients.length} patient(s)</p>
        </div>
        {canEdit && (
          <Link to="/patients/create" className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Nouveau patient
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">{error}</div>
      )}

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un patient..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Créé le</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Aucun patient</td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{patient.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{patient.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/patients/${patient._id}`} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                          <Eye className="w-3.5 h-3.5" /> Voir
                        </Link>
                        {canEdit && (
                          <Link to={`/patients/${patient._id}/edit`} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
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
