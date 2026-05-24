import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { consultationsAPI } from '../../api/consultationApi'
import { patientsAPI } from '../../api/patientApi'
import { useAuth } from '../../context/AuthContext'
import { hasPermission } from '../../utils/roleHelpers'
import { ArrowLeft } from 'lucide-react'

export default function EditConsultation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = hasPermission(user, 'canManageConsultations')

  const [patients, setPatients] = useState([])
  const [form, setForm] = useState({ patientId: '', date: '', motif: '', diagnostic: '', traitement: '', notes: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    patientsAPI.getAll().then((res) => setPatients(res.data.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await consultationsAPI.getById(id)
        const c = res.data.data
        setForm({
          patientId: c.patientId || '',
          date: c.date ? c.date.split('T')[0] : '',
          motif: c.motif || '',
          diagnostic: c.diagnostic || '',
          traitement: c.traitement || '',
          notes: c.notes || '',
        })
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
      await consultationsAPI.update(id, form)
      navigate('/consultations')
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
        <button onClick={() => navigate('/consultations')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier la consultation</h1>
      </div>

      {!canManage && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">Vous êtes en mode lecture seule</div>
      )}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Patient</label>
          <select name="patientId" value={form.patientId} onChange={handleChange} disabled={!canManage}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60">
            <option value="">Sélectionner un patient</option>
            {patients.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} disabled={!canManage}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motif</label>
          <input name="motif" value={form.motif} onChange={handleChange} disabled={!canManage}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diagnostic</label>
          <textarea name="diagnostic" value={form.diagnostic} onChange={handleChange} rows={3} disabled={!canManage}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Traitement</label>
          <textarea name="traitement" value={form.traitement} onChange={handleChange} rows={2} disabled={!canManage}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} disabled={!canManage}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/consultations')}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">Annuler</button>
          {canManage && (
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
