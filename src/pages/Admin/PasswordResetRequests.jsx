import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { passwordResetAPI } from '../../api/userApi'
import { Loader2, CheckCircle, XCircle, Clock, Mail, User, Calendar } from 'lucide-react'

const STATUS_LABELS = { pending: 'En attente', approved: 'Approuvée', rejected: 'Rejetée' }
const STATUS_COLORS = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' }

export default function PasswordResetRequests() {
  const { t } = useTranslation()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [processing, setProcessing] = useState(null)

  const fetchRequests = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await passwordResetAPI.getRequests()
      setRequests(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || t('passwordResetRequests.error_load'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [])

  const handleApprove = async (id) => {
    setProcessing(id)
    setSuccessMsg('')
    try {
      const res = await passwordResetAPI.approve(id)
      setSuccessMsg(t('passwordResetRequests.approved_msg', { email: res.data.data?.emailUser || '' }))
      fetchRequests()
    } catch (err) {
      setError(err.response?.data?.message || t('passwordResetRequests.error_approve'))
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id) => {
    setProcessing(id)
    setSuccessMsg('')
    try {
      await passwordResetAPI.reject(id)
      setSuccessMsg(t('passwordResetRequests.rejected_msg'))
      fetchRequests()
    } catch (err) {
      setError(err.response?.data?.message || t('passwordResetRequests.error_reject'))
    } finally {
      setProcessing(null)
    }
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('passwordResetRequests.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('passwordResetRequests.subtitle')}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{successMsg}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">{t('passwordResetRequests.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req._id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{req.nameUser}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {req.emailUser}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(req.createdAt)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-800'}`}>
                      {STATUS_LABELS[req.status] || req.status}
                    </span>
                  </div>
                  {req.approvedBy && (
                    <div className="text-xs text-gray-400">
                      {t('passwordResetRequests.by')} {req.approvedBy?.nameUser || '-'} — {formatDate(req.approvedAt)}
                    </div>
                  )}
                </div>

                {req.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(req._id)}
                      disabled={processing === req._id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {processing === req._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      {t('passwordResetRequests.approve')}
                    </button>
                    <button
                      onClick={() => handleReject(req._id)}
                      disabled={processing === req._id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {processing === req._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                      {t('passwordResetRequests.reject')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
