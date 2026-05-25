import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersAPI } from '../../api/userApi'
import { hospitalsAPI, SPECIALTIES } from '../../api/hospitalApi'
import { ROLES, ROLE_LABELS } from '../../utils/roleHelpers'
import SearchableSelect from '../../components/SearchableSelect'
import { Eye, EyeOff } from 'lucide-react'

export default function CreateUser() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nameUser: '', emailUser: '', passwordUser: '', roleUser: 'ACCUEIL', hospitalUser: '', specialtyUser: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [hospitals, setHospitals] = useState([])

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await hospitalsAPI.getAll()
        setHospitals(res.data.data)
      } catch (err) {
        console.error('Erreur chargement hôpitaux:', err)
      }
    }
    fetchHospitals()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (e.target.name === 'roleUser') {
      setForm((prev) => ({ ...prev, roleUser: e.target.value, hospitalUser: '', specialtyUser: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        nameUser: form.nameUser,
        emailUser: form.emailUser,
        passwordUser: form.passwordUser,
        roleUser: form.roleUser,
      }
      if (form.roleUser === 'MEDECIN' || form.roleUser === 'ACCUEIL') {
        payload.hospitalUser = form.hospitalUser
      }
      if (form.roleUser === 'MEDECIN') {
        payload.specialtyUser = form.specialtyUser
      }
      await usersAPI.create(payload)
      navigate('/users')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouvel utilisateur</h1>
        <p className="text-sm text-gray-500 mt-1">Créez un médecin ou un agent d'accueil</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet</label>
          <input
            type="text"
            name="nameUser"
            value={form.nameUser}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            placeholder="Dr. Jean Martin"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input
            type="email"
            name="emailUser"
            value={form.emailUser}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            placeholder="jean.martin@hospital.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
            name="passwordUser"
            value={form.passwordUser}
              onChange={handleChange}
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Min. 8 caractères"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle</label>
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
              Hôpital / Centre de travail <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              items={hospitals}
              value={form.hospitalUser}
              onChange={(val) => setForm({ ...form, hospitalUser: val })}
              placeholder="Rechercher un hôpital..."
            />
          </div>
        )}

        {form.roleUser === 'MEDECIN' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Spécialité <span className="text-red-500">*</span>
            </label>
            <select
              name="specialtyUser"
              value={form.specialtyUser}
              onChange={(e) => setForm({ ...form, specialtyUser: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="">Sélectionner une spécialité</option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Création...' : "Créer l'utilisateur"}
          </button>
        </div>
      </form>
    </div>
  )
}
