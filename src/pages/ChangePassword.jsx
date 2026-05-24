import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { Eye, EyeOff, KeyRound, ShieldCheck, CheckCircle, XCircle } from 'lucide-react'

const rules = [
  { label: 'Min. 8 caractères', test: (p) => p.length >= 8 },
  { label: 'Une majuscule', test: (p) => /[A-Z]/.test(p) },
  { label: 'Une minuscule', test: (p) => /[a-z]/.test(p) },
  { label: 'Un chiffre', test: (p) => /[0-9]/.test(p) },
  { label: 'Un caractère spécial', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

export default function ChangePassword() {
  const { user, clearMustChangePassword, logout } = useAuth()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleShow = (field) => setShow({ ...show, [field]: !show[field] })

  const checks = useMemo(() => rules.map((r) => r.test(newPassword)), [newPassword])
  const passedCount = checks.filter(Boolean).length
  const allPassed = passedCount === rules.length

  const getStrength = () => {
    if (passedCount <= 2) return { label: 'Faible', color: 'bg-red-500', textColor: 'text-red-600' }
    if (passedCount <= 3) return { label: 'Moyen', color: 'bg-yellow-500', textColor: 'text-yellow-600' }
    if (passedCount <= 4) return { label: 'Bon', color: 'bg-blue-500', textColor: 'text-blue-600' }
    return { label: 'Fort', color: 'bg-green-500', textColor: 'text-green-600' }
  }

  const strength = getStrength()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas')
      return
    }

    if (!allPassed) {
      setError('Le mot de passe ne respecte pas toutes les règles')
      return
    }

    setLoading(true)
    try {
      await api.post('/api/users/change-password', { currentPassword, newPassword })
      clearMustChangePassword()
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du changement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Changement de mot de passe</h1>
            <p className="text-sm text-gray-500 mt-1">
              {user?.name}, veuillez définir votre propre mot de passe
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-6">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Pour des raisons de sécurité, vous devez changer le mot de passe provisoire défini par l'administrateur.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe actuel</label>
              <div className="relative">
                <input
                  type={show.current ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Mot de passe provisoire"
                  required
                />
                <button type="button" onClick={() => toggleShow('current')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={show.new ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Min. 8 caractères"
                  required
                />
                <button type="button" onClick={() => toggleShow('new')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {newPassword.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1.5 h-1.5">
                    {rules.map((_, i) => (
                      <div key={i} className={`flex-1 rounded-full transition-colors ${i < passedCount ? strength.color : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength.textColor}`}>
                    {strength.label}
                  </p>
                  <ul className="space-y-0.5">
                    {rules.map((rule, i) => (
                      <li key={i} className={`flex items-center gap-1.5 text-xs ${checks[i] ? 'text-green-600' : 'text-gray-400'}`}>
                        {checks[i] ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer le mot de passe</label>
              <div className="relative">
                <input
                  type={show.confirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Confirmer le mot de passe"
                  required
                />
                <button type="button" onClick={() => toggleShow('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p className={`mt-1 text-xs flex items-center gap-1 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                  {newPassword === confirmPassword ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {newPassword === confirmPassword ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={logout}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
              >
                Me déconnecter
              </button>
              <button
                type="submit"
                disabled={loading || !allPassed}
                className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Changer le mot de passe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
