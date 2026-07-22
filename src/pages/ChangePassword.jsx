import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, KeyRound, ShieldCheck, CheckCircle, XCircle } from 'lucide-react'

const rules = [
  { labelKey: 'changePassword.rule_length', test: (p) => p.length >= 8 },
  { labelKey: 'changePassword.rule_upper', test: (p) => /[A-Z]/.test(p) },
  { labelKey: 'changePassword.rule_lower', test: (p) => /[a-z]/.test(p) },
  { labelKey: 'changePassword.rule_digit', test: (p) => /[0-9]/.test(p) },
  { labelKey: 'changePassword.rule_special', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

export default function ChangePassword() {
  const { user, clearMustChangePassword, logout } = useAuth()
  const { t } = useTranslation()
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
    if (passedCount <= 2) return { labelKey: 'changePassword.weak', color: 'bg-red-500', textColor: 'text-red-600' }
    if (passedCount <= 3) return { labelKey: 'changePassword.medium', color: 'bg-yellow-500', textColor: 'text-yellow-600' }
    if (passedCount <= 4) return { labelKey: 'changePassword.good', color: 'bg-blue-500', textColor: 'text-blue-600' }
    return { labelKey: 'changePassword.strong', color: 'bg-green-500', textColor: 'text-green-600' }
  }

  const strength = getStrength()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError(t('changePassword.error_no_match'))
      return
    }

    if (!allPassed) {
      setError(t('changePassword.error_rules'))
      return
    }

    setLoading(true)
    try {
      await api.post('/api/users/change-password', { currentPassword, newPassword })
      clearMustChangePassword()
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || t('changePassword.error_generic'))
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('changePassword.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {t('changePassword.subtitle', { name: user?.nameUser })}
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-6">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {t('changePassword.security')}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('changePassword.current_password')}</label>
              <div className="relative">
                <input
                  type={show.current ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder={t('changePassword.current_placeholder')}
                  required
                />
                <button type="button" onClick={() => toggleShow('current')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('changePassword.new_password')}</label>
              <div className="relative">
                <input
                  type={show.new ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder={t('changePassword.new_placeholder')}
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
                    {t(strength.labelKey)}
                  </p>
                  <ul className="space-y-0.5">
                    {rules.map((rule, i) => (
                      <li key={i} className={`flex items-center gap-1.5 text-xs ${checks[i] ? 'text-green-600' : 'text-gray-400'}`}>
                        {checks[i] ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {t(rule.labelKey)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('changePassword.confirm_password')}</label>
              <div className="relative">
                <input
                  type={show.confirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder={t('changePassword.confirm_placeholder')}
                  required
                />
                <button type="button" onClick={() => toggleShow('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p className={`mt-1 text-xs flex items-center gap-1 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                  {newPassword === confirmPassword ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {newPassword === confirmPassword ? t('changePassword.match') : t('changePassword.no_match')}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={logout}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
              >
                {t('changePassword.logout')}
              </button>
              <button
                type="submit"
                disabled={loading || !allPassed}
                className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                {loading ? t('saving') : t('changePassword.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
