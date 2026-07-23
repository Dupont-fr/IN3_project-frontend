import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { passwordResetAPI } from '../api/userApi'
import { useTranslation } from 'react-i18next'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await passwordResetAPI.request(email)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || t('forgotPassword.error'))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className='flex items-center justify-center p-4' style={{ minHeight: 'calc(100vh - 4rem)' }}>
        <div className='w-full max-w-md'>
          <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 text-center'>
            <div className='w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4'>
              <CheckCircle className='w-8 h-8 text-green-600 dark:text-green-400' />
            </div>
            <h1 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>
              {t('forgotPassword.sent_title')}
            </h1>
            <p className='text-sm text-gray-500 dark:text-gray-400 mb-6'>
              {t('forgotPassword.sent_text')}
            </p>
            <button
              onClick={() => navigate('/login')}
              className='inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium'
            >
              <ArrowLeft className='w-4 h-4' />
              {t('forgotPassword.back_login')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex items-center justify-center p-4' style={{ minHeight: 'calc(100vh - 4rem)' }}>
      <div className='w-full max-w-md'>
        <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8'>
          <div className='text-center mb-6'>
            <img
              src='/Medilogo.jpg'
              alt='MediSys'
              className='h-14 w-auto mx-auto mb-2'
            />
            <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
              {t('forgotPassword.title')}
            </h1>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
              {t('forgotPassword.subtitle')}
            </p>
          </div>

          {error && (
            <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                {t('forgotPassword.email')}
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none'
                  placeholder='votre.email@hospital.com'
                  required
                />
              </div>
            </div>

            <div className='flex gap-3 pt-2'>
              <button
                type='button'
                onClick={() => navigate('/login')}
                className='flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm'
              >
                {t('forgotPassword.cancel')}
              </button>
              <button
                type='submit'
                disabled={loading}
                className='flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50'
              >
                {loading
                  ? t('forgotPassword.sending')
                  : t('forgotPassword.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
