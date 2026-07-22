import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { patientsAPI } from '../../api/patientApi'
import { useAuth } from '../../context/AuthContext'
import { hasPermission } from '../../utils/roleHelpers'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Eye, PenSquare } from 'lucide-react'
import Loader from '../../components/Loader'

export default function PatientList() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const canEdit = hasPermission(user, 'canManagePatients')

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = {}
        if (search) {
          params.search = search
        } else if (user?.hospitalUser) {
          params.hopital = user.hospitalUser
        }
        const res = await patientsAPI.getAll(params)
        setPatients(res.data.patients || [])
      } catch {
        setError(t('patientList.error'))
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [search, user?.hospitalUser])

  const fullName = (p) => [p.nom_patient, p.prenom_patient].filter(Boolean).join(' ')

  const calcAge = (dob) => {
    if (!dob) return '?'
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-'

  const genreLabel = (g) => {
    if (!g) return '-'
    const map = { M: 'Homme', F: 'Femme', Homme: t('createPatient.field_gender_male'), Femme: t('createPatient.field_gender_female') }
    return map[g] || g
  }

  if (loading) return <Loader />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('patientList.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('patientList.count', { count: patients.length })}</p>
        </div>
        {canEdit && (
          <Link to="/patients/create" className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> {t('patientList.new')}
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
          placeholder={t('patientList.search')}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t('patientList.col_patient')}</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t('patientList.col_code')}</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t('patientList.col_phone')}</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t('patientList.col_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">{t('patientList.no_patients')}</td>
                </tr>
              ) : (
                patients.map((patient) => {
                  const estActif = patient.actif !== false
                  return (
                  <tr key={patient.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!estActif ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {fullName(patient)}
                        {!estActif && <span className="text-xs font-semibold text-red-600 dark:text-red-400">{t('patientList.inactive')}</span>}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(patient.date_naissance_patient)} ({calcAge(patient.date_naissance_patient)} ans) — {genreLabel(patient.genre_patient)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-primary-600 font-medium">{patient.code_patient || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{patient.telephone_patient || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/patients/${patient.id}`} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                          <Eye className="w-3.5 h-3.5" /> {t('view')}
                        </Link>
                        {canEdit && user?.hospitalUser && patient.hopital === user.hospitalUser && (
                          <Link to={`/patients/${patient.id}/edit`} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                            <PenSquare className="w-3.5 h-3.5" /> {t('edit')}
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
