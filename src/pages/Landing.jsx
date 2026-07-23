import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Hospital,
  Shield,
  Users,
  ClipboardList,
  ArrowRight,
} from 'lucide-react'

const features = [
  { icon: Users, key: 'users' },
  { icon: Hospital, key: 'patients' },
  { icon: ClipboardList, key: 'consultations' },
  { icon: Shield, key: 'security' },
]

export default function Landing() {
  const { t } = useTranslation()

  return (
    <div>
      <div className='max-w-6xl mx-auto px-4 pt-16 pb-20 text-center'>
        <div className='inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 dark:bg-primary-900/30 rounded-full text-primary-600 dark:text-primary-400 text-sm mb-8 border border-primary-200 dark:border-primary-800'>
          <Hospital className='w-4 h-4' />
          {t('app.tagline')}
        </div>

        <h1 className='text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight'>
          {t('app.subtitle')}
          <br />
          <span className='text-primary-600 dark:text-primary-400'>{t('app.subtitle2')}</span>
        </h1>

        <p className='text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10'>
          {t('app.description')}
        </p>

        <div className='flex items-center justify-center gap-4'>
          <Link
            to='/login'
            className='inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20'
          >
            {t('app.cta')}
            <ArrowRight className='w-5 h-5' />
          </Link>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-4 py-20'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white text-center mb-12'>
          {t('features.title')}
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.key}
                className='bg-white dark:bg-gray-900 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-800 shadow-sm'
              >
                <div className='w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <Icon className='w-6 h-6 text-primary-600 dark:text-primary-400' />
                </div>
                <h3 className='text-gray-900 dark:text-white font-semibold mb-2'>
                  {t(`feature.${f.key}`)}
                </h3>
                <p className='text-gray-500 dark:text-gray-400 text-sm'>
                  {t(`feature.${f.key}_desc`)}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-4 py-12 text-center border-t border-gray-200 dark:border-gray-800'>
        <p className='text-gray-400 dark:text-gray-500 text-sm'>{t('app.footer')}</p>
      </div>
    </div>
  )
}
