import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { consultationsAPI } from '../../api/consultationApi'
import { useAuth } from '../../context/AuthContext'
import { hasPermission } from '../../utils/roleHelpers'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Weight, Ruler, Thermometer, Heart, Stethoscope, FileText, Pill, MessageSquareText, CheckCircle, User } from 'lucide-react'
import Loader from '../../components/Loader'

export default function EditConsultation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation()
  const canManage = hasPermission(user, 'canManageConsultations')

  const [form, setForm] = useState({
    patientId: '', date: '',
    poids: '', taille: '', temperature: '', tension: '', motifConsultation: '',
    observations: '', conclusion: '', decision: '', prescription: '',
    statut: 'en_attente',
    contactUrgenceNom: '', contactUrgenceTelephone: '',
  })
  const [readOnlyFields, setReadOnlyFields] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const isFieldReadOnly = (field) => {
    if (!canManage) return true
    return readOnlyFields[field] === true
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await consultationsAPI.getById(id)
        const c = res.data.data
        setForm({
          patientId: String(c.patientId || ''),
          date: c.date ? c.date.split('T')[0] : '',
          poids: c.poids || '',
          taille: c.taille || '',
          temperature: c.temperature || '',
          tension: c.tension || '',
          motifConsultation: c.motifConsultation || '',
          observations: c.observations || '',
          conclusion: c.conclusion || '',
          decision: c.decision || '',
          prescription: c.prescription || '',
          statut: c.statut || 'en_attente',
          contactUrgenceNom: c.contactUrgenceNom || '',
          contactUrgenceTelephone: c.contactUrgenceTelephone || '',
        })
        setReadOnlyFields(c.readOnlyFields || {})
      } catch {
        setError('Consultation non trouvée')
      } finally {
        setFetching(false)
      }
    }
    fetch()
  }, [id])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canManage) return
    setError('')
    setLoading(true)
    try {
      const writable = {}
      for (const key of ['motifConsultation', 'observations', 'conclusion', 'decision', 'prescription', 'statut']) {
        if (!isFieldReadOnly(key) || key === 'statut') {
          writable[key] = form[key]
        }
      }
      await consultationsAPI.update(id, {
        ...writable,
        doctorId: user?._id || user?.id,
        doctorName: user?.nameUser,
        doctorSpecialty: user?.specialtyUser,
        doctorHospital: user?.hospitalUser,
      })
      navigate('/consultations')
    } catch (err) {
      setError(err.response?.data?.message || t('editConsultation.error'))
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <Loader />

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-gray-800/50"

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/consultations')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="w-4 h-4" /> {t('back')}
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('editConsultation.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('editConsultation.subtitle')}</p>
      </div>

      {!canManage && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">{t('editConsultation.readonly')}</div>
      )}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-red-500" /> {t('editConsultation.section_vitals')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('editConsultation.field_weight')}</label>
              <input name="poids" value={form.poids} disabled className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('editConsultation.field_height')}</label>
              <input name="taille" value={form.taille} disabled className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('editConsultation.field_temperature')}</label>
              <input name="temperature" value={form.temperature} disabled className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('editConsultation.field_blood_pressure')}</label>
              <input name="tension" value={form.tension} disabled className={inputClass} />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
            <User className="w-4 h-4" /> {t('editConsultation.section_contact')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('editConsultation.field_urgence_nom')}</label>
              <input name="contactUrgenceNom" value={form.contactUrgenceNom} disabled className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('editConsultation.field_urgence_telephone')}</label>
              <input name="contactUrgenceTelephone" value={form.contactUrgenceTelephone} disabled className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4" /> {t('editConsultation.field_motif')}
          </label>
          <textarea name="motifConsultation" value={form.motifConsultation} onChange={handleChange} rows={2} disabled={isFieldReadOnly('motifConsultation')}
            className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> {t('editConsultation.field_observations')}
          </label>
          <textarea name="observations" value={form.observations} onChange={handleChange} rows={4} disabled={isFieldReadOnly('observations')}
            placeholder={t('editConsultation.field_observations_placeholder')}
            className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
            <MessageSquareText className="w-4 h-4" /> {t('editConsultation.field_conclusion')}
          </label>
          <textarea name="conclusion" value={form.conclusion} onChange={handleChange} rows={3} disabled={isFieldReadOnly('conclusion')}
            placeholder={t('editConsultation.field_conclusion_placeholder')}
            className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> {t('editConsultation.field_decision')}
          </label>
          <textarea name="decision" value={form.decision} onChange={handleChange} rows={2} disabled={isFieldReadOnly('decision')}
            placeholder={t('editConsultation.field_decision_placeholder')}
            className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
            <Pill className="w-4 h-4" /> {t('editConsultation.field_prescription')}
          </label>
          <textarea name="prescription" value={form.prescription} onChange={handleChange} rows={3} disabled={isFieldReadOnly('prescription')}
            placeholder={t('editConsultation.field_prescription_placeholder')}
            className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('editConsultation.field_status')}</label>
          <select name="statut" value={form.statut} onChange={handleChange} disabled={!canManage}
            className={inputClass}>
            <option value="en_attente">{t('editConsultation.status_pending')}</option>
            <option value="complete">{t('editConsultation.status_completed')}</option>
            <option value="annulee">{t('editConsultation.status_cancelled')}</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/consultations')}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
            {t('cancel')}
          </button>
          {canManage && (
            <button type="submit" disabled={loading}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50">
              {loading ? t('saving') : t('save')}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
