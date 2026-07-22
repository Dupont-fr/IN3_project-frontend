import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { examensAPI } from '../../api/consultationApi'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { FlaskConical, ArrowLeft, Building2, User, CheckCircle, Clock } from 'lucide-react'
import Loader from '../../components/Loader'

export default function PendingExamens() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation()
  const [examens, setExamens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await examensAPI.getPending()
        setExamens(res.data.data || [])
      } catch {
        setError(t('pendingExamens.error_load'))
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [t])

  const [results, setResults] = useState({})

  const handleResultChange = (id, value) => {
    setResults({ ...results, [id]: value })
  }

  const handleSubmitResult = async (id) => {
    if (!results[id]?.trim()) return
    setUpdating(id)
    try {
      await examensAPI.updateResult(id, { resultats: results[id] })
      setExamens((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, statut: 'realise', resultats: results[id], dateRealisation: new Date().toISOString() } : e,
        ),
      )
      setResults({ ...results, [id]: '' })
    } catch {
      setError(t('pendingExamens.error_update'))
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> {t('back')}
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('pendingExamens.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('pendingExamens.subtitle')}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {examens.length === 0 && !error && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <FlaskConical className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">{t('pendingExamens.empty')}</p>
        </div>
      )}

      <div className="space-y-4">
        {examens.map((ex) => (
          <div
            key={ex.id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{ex.type}</h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                      ex.statut === 'realise'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}
                  >
                    {ex.statut === 'realise' ? (
                      <><CheckCircle className="w-3 h-3" /> {t('pendingExamens.done')}</>
                    ) : (
                      <><Clock className="w-3 h-3" /> {t('pendingExamens.pending')}</>
                    )}
                  </span>
                </div>
                {ex.description && (
                  <p className="text-sm text-gray-500 mt-1">{ex.description}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-500 mb-4">
              {ex.patientName && (
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{ex.patientName}</span>
                </div>
              )}
              {ex.hopitalSource && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>{ex.hopitalSource}</span>
                </div>
              )}
              {ex.consultationDate && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(ex.consultationDate).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
            </div>

            {ex.statut === 'realise' ? (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">{t('pendingExamens.results')}</p>
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{ex.resultats || '-'}</p>
                {ex.dateRealisation && (
                  <p className="text-xs text-gray-400 mt-2">
                    {t('pendingExamens.realized_on')} {new Date(ex.dateRealisation).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <textarea
                  value={results[ex.id] || ''}
                  onChange={(e) => handleResultChange(ex.id, e.target.value)}
                  placeholder={t('pendingExamens.result_placeholder')}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                />
                <button
                  onClick={() => handleSubmitResult(ex.id)}
                  disabled={updating === ex.id || !results[ex.id]?.trim()}
                  className="mt-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {updating === ex.id ? t('pendingExamens.saving') : t('pendingExamens.submit_results')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}