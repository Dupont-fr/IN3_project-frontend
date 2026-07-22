import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { consultationsAPI } from '../../api/consultationApi'
import { useAuth } from '../../context/AuthContext'
import { hasPermission } from '../../utils/roleHelpers'
import { useTranslation } from 'react-i18next'
import { Plus, Eye, PenSquare, Calendar, User, Building2, Heart, Clock, CheckCircle, XCircle, Share2 } from 'lucide-react'
import Loader from '../../components/Loader'

const statusConfig = {
  en_attente: { labelKey: 'consultationList.status_pending', class: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  complete: { labelKey: 'consultationList.status_completed', class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
  annulee: { labelKey: 'consultationList.status_cancelled', class: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  transferee: { labelKey: 'consultationList.status_transferred', class: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Share2 },
}

export default function ConsultationList() {
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const mineOnly = searchParams.get('mine') === 'true'
  const currentDoctorId = currentUser?._id || currentUser?.id

  const canManage = hasPermission(currentUser, 'canManageConsultations')
  const canCreate = hasPermission(currentUser, 'canCreateConsultation') || canManage
  const canView = hasPermission(currentUser, 'canViewConsultations')
  const isAccueil = currentUser?.roleUser === 'ACCUEIL'

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = {}
        if (mineOnly && currentDoctorId) {
          params.doctorId = currentDoctorId
        }
        if (currentUser?.hospitalUser) {
          params.doctorHospital = currentUser.hospitalUser
        }
        const res = await consultationsAPI.getAll(params)
        setConsultations(res.data.data || [])
      } catch {
        setError(t('consultationList.error'))
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [mineOnly, currentDoctorId, currentUser?.hospitalUser])

  if (loading) return <Loader />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('consultationList.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('consultationList.count', { count: consultations.length })}</p>
        </div>
        {canCreate && (
          <Link to="/consultations/create" className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> {t('consultationList.new')}
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
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t('consultationList.col_patient')}</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t('consultationList.col_date')}</th>
                {!isAccueil && <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t('consultationList.col_motif')}</th>}
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t('consultationList.col_doctor')}</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t('consultationList.col_hospital')}</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t('consultationList.col_status')}</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">{t('consultationList.col_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {consultations.length === 0 ? (
                <tr>
                  <td colSpan={isAccueil ? 6 : 7} className="px-6 py-12 text-center text-gray-500">{t('consultationList.no_data')}</td>
                </tr>
              ) : (
                consultations.map((c) => {
                  const st = statusConfig[c.statut] || statusConfig.en_attente
                  const StatusIcon = st.icon
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="font-medium text-gray-900 dark:text-white">{c.patientName || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {c.date ? new Date(c.date).toLocaleDateString('fr-FR') : '-'}
                          </span>
                        </div>
                      </td>
                      {!isAccueil && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{c.motifConsultation || '-'}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{c.doctorName || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{c.doctorHospital || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${st.class}`}>
                          <StatusIcon className="w-3 h-3" /> {t(st.labelKey)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canView && (
                            <Link to={`/consultations/${c.id}`} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                              <Eye className="w-3.5 h-3.5" /> {t('view')}
                            </Link>
                          )}
                          {canManage && c.statut !== 'complete' && (
                            <Link to={`/consultations/${c.id}/edit`} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
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
