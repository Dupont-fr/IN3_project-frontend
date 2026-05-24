import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { patientsAPI } from '../../api/patientApi'
import { useAuth } from '../../context/AuthContext'
import { hasPermission } from '../../utils/roleHelpers'
import { ArrowLeft } from 'lucide-react'

export default function EditPatient() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canEdit = hasPermission(user, 'canManagePatients')

  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', birthDate: '', notes: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await patientsAPI.getById(id)
        const p = res.data.data
        setForm({ name: p.name, email: p.email || '', phone: p.phone || '', address: p.address || '', birthDate: p.birthDate ? p.birthDate.split('T')[0] : '', notes: p.notes || '' })
      } catch {
        setError('Patient non trouvé')
      } finally {
        setFetching(false)
      }
    }
    fetch()
  }, [id])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canEdit) return
    setError('')
    setLoading(true)
    try {
      await patientsAPI.update(id, form)
      navigate('/patients')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur modification')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="text-center py-12 text-gray-500">Chargement...</div>

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/patients')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier le patient</h1>
      </div>

      {!canEdit && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">Vous êtes en mode lecture seule</div>
      )}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet</label>
          <input name="name" value={form.name} onChange={handleChange} required disabled={!canEdit}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} disabled={!canEdit}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
          <input name="phone" value={form.phone} onChange={handleChange} disabled={!canEdit}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de naissance</label>
            <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} disabled={!canEdit}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse</label>
          <input name="address" value={form.address} onChange={handleChange} disabled={!canEdit}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} disabled={!canEdit}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/patients')}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">Annuler</button>
          {canEdit && (
            <button type="submit" disabled={loading}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
