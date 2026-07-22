import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { hospitalsAPI } from '../../api/hospitalApi'
import { useTranslation } from 'react-i18next'
import Loader from '../../components/Loader'

const COMMON_SERVICES = [
  'Médecine générale', 'Pédiatrie', 'Maternité', 'Urgences', 'Laboratoire',
  'Chirurgie', 'Cardiologie', 'Ophtalmologie', 'Radiologie', 'Neurologie',
]

export default function EditHospital() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState({ nameHospital: '', servicesHospital: [] })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [customService, setCustomService] = useState('')

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const res = await hospitalsAPI.getById(id)
        const h = res.data.data
        setForm({ nameHospital: h.nameHospital, servicesHospital: h.servicesHospital || [] })
      } catch (err) {
        setError('Hôpital non trouvé')
      } finally {
        setFetching(false)
      }
    }
    fetchHospital()
  }, [id])

  const toggleService = (service) => {
    setForm((prev) => ({
      ...prev,
      servicesHospital: prev.servicesHospital.includes(service)
        ? prev.servicesHospital.filter((s) => s !== service)
        : [...prev.servicesHospital, service],
    }))
  }

  const addCustomService = () => {
    const s = customService.trim()
    if (s && !form.servicesHospital.includes(s)) {
      setForm((prev) => ({ ...prev, servicesHospital: [...prev.servicesHospital, s] }))
    }
    setCustomService('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nameHospital.trim()) {
      setError(t('editHospital.error_required'))
      return
    }
    setError('')
    setLoading(true)
    try {
      await hospitalsAPI.update(id, form)
      navigate('/hospitals')
    } catch (err) {
      setError(err.response?.data?.message || t('editHospital.error_update'))
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <Loader />

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('editHospital.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{form.nameHospital}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('editHospital.field_name')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.nameHospital}
            onChange={(e) => setForm({ ...form, nameHospital: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('editHospital.field_services')}
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_SERVICES.map((service) => (
              <button
                key={service}
                type="button"
                onClick={() => toggleService(service)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  form.servicesHospital.includes(service)
                    ? 'bg-primary-100 border-primary-300 text-primary-700 dark:bg-primary-900 dark:border-primary-700 dark:text-primary-300'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                }`}
              >
                {service}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customService}
              onChange={(e) => setCustomService(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomService())}
              placeholder={t('editHospital.service_placeholder')}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <button
              type="button"
              onClick={addCustomService}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
            >
              {t('editHospital.service_add')}
            </button>
          </div>
          {form.servicesHospital.filter((s) => !COMMON_SERVICES.includes(s)).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {form.servicesHospital.filter((s) => !COMMON_SERVICES.includes(s)).map((s) => (
                <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                  {s}
                  <button type="button" onClick={() => toggleService(s)} className="hover:text-blue-900 dark:hover:text-blue-100">&times;</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/hospitals')}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            {loading ? t('saving') : t('save')}
          </button>
        </div>
      </form>
    </div>
  )
}
