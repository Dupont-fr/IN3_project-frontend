import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usersAPI } from '../../api/userApi'
import { hospitalsAPI, SPECIALTIES } from '../../api/hospitalApi'
import { ROLE_LABELS } from '../../utils/roleHelpers'
import SearchableSelect from '../../components/SearchableSelect'

export default function EditUser() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', role: 'ACCUEIL', hospital: '', specialty: '' })
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
          name: user.name,
          role: user.role,
          hospital: user.hospital || '',
          specialty: user.specialty || '',
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
      const payload = { name: form.name, role: form.role }
      if (form.role === 'MEDECIN' || form.role === 'ACCUEIL') {
        payload.hospital = form.hospital
      }
      if (form.role === 'MEDECIN') {
        payload.specialty = form.specialty
      }
      await usersAPI.update(id, payload)
      navigate('/users')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="text-center py-12 text-gray-500">Chargement...</div>

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier l'utilisateur</h1>
        <p className="text-sm text-gray-500 mt-1">{original?.email}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {(form.role === 'MEDECIN' || form.role === 'ACCUEIL') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hôpital / Centre de travail
            </label>
            <SearchableSelect
              items={hospitals}
              value={form.hospital}
              onChange={(val) => setForm({ ...form, hospital: val })}
              placeholder="Rechercher un hôpital..."
            />
          </div>
        )}

        {form.role === 'MEDECIN' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Spécialité</label>
            <select
              name="specialty"
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="">Sélectionner une spécialité</option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        <div className="pt-2">
          <div className="text-xs text-gray-500 mb-3">
            Email inchangé : <span className="font-medium">{original?.email}</span>
          </div>
        </div>

        <div className="flex gap-3">
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
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}
