import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Hospital,
  Shield,
  Users,
  ClipboardList,
  ArrowRight,
} from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher'

const features = [
  {
    icon: Users,
    key: 'users',
  },
  {
    icon: Hospital,
    key: 'patients',
  },
  {
    icon: ClipboardList,
    key: 'consultations',
  },
  {
    icon: Shield,
    key: 'security',
  },
]

export default function Landing() {
  const { t } = useTranslation()

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900'>
      <div className='max-w-6xl mx-auto px-4 py-6'>
        <nav className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <img
              src='/Medilogo.jpg'
              alt='MediSys'
              className='h-20 w-auto rounded-xl'
            />
            <span className='text-xl font-bold text-white'>
              {t('app.name')}
            </span>
          </div>
          <div className='flex items-center gap-3'>
            <LanguageSwitcher light />
            <Link
              to='/login'
              className='px-5 py-2 bg-white text-primary-700 font-medium rounded-lg hover:bg-primary-50 transition-colors text-sm'
            >
              {t('nav.login')}
            </Link>
          </div>
        </nav>
      </div>

      <div className='max-w-6xl mx-auto px-4 pt-20 pb-16 text-center'>
        <div className='inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-white/80 text-sm mb-8'>
          <Hospital className='w-4 h-4' />
          {t('app.tagline')}
        </div>

        <h1 className='text-4xl md:text-6xl font-bold text-white mb-6 leading-tight'>
          {t('app.subtitle')}
          <br />
          <span className='text-primary-200'>{t('app.subtitle2')}</span>
        </h1>

        <p className='text-lg text-primary-100 max-w-2xl mx-auto mb-10'>
          {t('app.description')}
        </p>

        <div className='flex items-center justify-center gap-4'>
          <Link
            to='/login'
            className='inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-lg shadow-black/20'
          >
            {t('app.cta')}
            <ArrowRight className='w-5 h-5' />
          </Link>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-4 py-20'>
        <h2 className='text-2xl font-bold text-white text-center mb-12'>
          {t('features.title')}
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.key}
                className='bg-white/10 backdrop-blur rounded-xl p-6 text-center'
              >
                <div className='w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <Icon className='w-6 h-6 text-white' />
                </div>
                <h3 className='text-white font-semibold mb-2'>
                  {t(`feature.${f.key}`)}
                </h3>
                <p className='text-primary-200 text-sm'>
                  {t(`feature.${f.key}_desc`)}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-4 py-12 text-center border-t border-white/10'>
        <p className='text-primary-200 text-sm'>{t('app.footer')}</p>
      </div>
    </div>
  )
}
