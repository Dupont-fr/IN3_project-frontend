import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api/userApi'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { t } = useTranslation()
  const [emailUser, setEmailUser] = useState('')
  const [passwordUser, setPasswordUser] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await authAPI.login({ emailUser, passwordUser })
      const { user, token, mustChangePassword } = res.data.data
      login(user, token, mustChangePassword)
      if (mustChangePassword) {
        navigate('/change-password')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || t('login.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center p-4' style={{ minHeight: 'calc(100vh - 4rem)' }}>
      <div className='w-full max-w-md'>
        <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8'>
          <div className='text-center mb-8'>
            <img
              src='/Medilogo.jpg'
              alt='MediSys'
              className='h-14 w-auto mx-auto mb-2'
            />
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>{t('login.subtitle')}</p>
          </div>

          {error && (
            <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                {t('login.email')}
              </label>
              <input
                type='email'
                value={emailUser}
                onChange={(e) => setEmailUser(e.target.value)}
                className='w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition'
                placeholder='admin@hospital.com'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                {t('login.password')}
              </label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordUser}
                  onChange={(e) => setPasswordUser(e.target.value)}
                  className='w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition'
                  placeholder={t('login.password_placeholder')}
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                >
                  {showPassword ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
            </div>

            <div className='text-right'>
              <Link
                to='/forgot-password'
                className='text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium'
              >
                {t('login.forgot')}
              </Link>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50'
            >
              {loading ? t('login.signing_in') : t('login.signin')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
