import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usersAPI } from '../../api/userApi'
import { hospitalsAPI, SPECIALTIES } from '../../api/hospitalApi'
import { ROLE_LABELS } from '../../utils/roleHelpers'
import SearchableSelect from '../../components/SearchableSelect'
import Loader from '../../components/Loader'
import { useTranslation } from 'react-i18next'

export default function EditUser() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState({ nameUser: '', roleUser: 'ACCUEIL', hospitalUser: '', specialtyUser: '' })
  const [original, setOriginal] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [hospitals, setHospitals] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, hospitalsRes] = await Promise.all([
          usersAPI.getById(id),
          hospitalsAPI.getAll(),
        ])
        const user = userRes.data.data
        setOriginal(user)
        setForm({
          nameUser: user.nameUser,
          roleUser: user.roleUser,
          hospitalUser: user.hospitalUser || '',
          specialtyUser: user.specialtyUser || '',
        })
        setHospitals(hospitalsRes.data.data)
      } catch (err) {
        setError('Utilisateur non trouvé')
      } finally {
        setFetching(false)
      }
    }
    fetchData()
  }, [id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = { nameUser: form.nameUser, roleUser: form.roleUser }
      if (form.roleUser === 'MEDECIN' || form.roleUser === 'ACCUEIL') {
        payload.hospitalUser = form.hospitalUser
      }
      if (form.roleUser === 'MEDECIN') {
        payload.specialtyUser = form.specialtyUser
      }
      await usersAPI.update(id, payload)
      navigate('/users')
    } catch (err) {
      setError(err.response?.data?.message || t('editUser.error'))
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <Loader />

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('editUser.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{original?.emailUser}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('editUser.field_name')}</label>
          <input
            type="text"
            name="nameUser"
            value={form.nameUser}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('editUser.field_role')}</label>
          <select
            name="roleUser"
            value={form.roleUser}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {(form.roleUser === 'MEDECIN' || form.roleUser === 'ACCUEIL') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('editUser.field_hospital')}
            </label>
            <SearchableSelect
              items={hospitals}
              value={form.hospitalUser}
              onChange={(val) => setForm({ ...form, hospitalUser: val })}
              labelKey="nameHospital"
              placeholder={t('editUser.field_hospital_placeholder')}
            />
          </div>
        )}

        {form.roleUser === 'MEDECIN' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('editUser.field_specialty')}</label>
            <select
              name="specialtyUser"
              value={form.specialtyUser}
              onChange={(e) => setForm({ ...form, specialtyUser: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="">{t('editUser.field_specialty_placeholder')}</option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        <div className="pt-2">
          <div className="text-xs text-gray-500 mb-3">
            {t('editUser.email_unchanged', { email: original?.emailUser })}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/users')}
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
