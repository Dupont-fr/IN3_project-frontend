import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Users,
  Stethoscope,
  ClipboardList,
  History,
  KeyRound,
  Download,
  FileQuestion,
  Mail,
  Phone,
  ExternalLink,
  ArrowLeft,
  UserPlus,
  Search,
  AlertTriangle,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  Share2,
  Pill,
  FileText,
  MessageSquareText,
  CheckCircle,
  Clock,
  Building2,
  ShieldAlert,
  UserCheck,
  UserCog,
} from 'lucide-react'

const sections = {
  common: {
    title: 'help.common_title',
    items: [
      { key: 'connexion', icon: ShieldAlert },
      { key: 'aide_contact', icon: Mail },
    ],
  },
  accueil: {
    title: 'help.accueil_title',
    items: [
      { key: 'creer_patient', icon: UserPlus, link: '/patients/create' },
      { key: 'doublons', icon: Search },
      {
        key: 'creer_consultation',
        icon: ClipboardList,
        link: '/consultations/create',
      },
      { key: 'historique', icon: History, link: '/historique' },
    ],
  },
  medecin: {
    title: 'help.medecin_title',
    items: [
      { key: 'prise_en_charge', icon: Stethoscope },
      { key: 'constantes', icon: Heart },
      { key: 'motif', icon: FileQuestion },
      { key: 'observations', icon: FileText },
      { key: 'conclusion', icon: MessageSquareText },
      { key: 'decision', icon: CheckCircle },
      { key: 'prescription', icon: Pill },
      { key: 'transfert', icon: Share2, link: '/consultations' },
      { key: 'modification', icon: Clock },
    ],
  },
  admin: {
    title: 'help.admin_title',
    items: [
      {
        key: 'password_resets',
        icon: KeyRound,
        link: '/admin/password-resets',
      },
    ],
  },
}

const contacts = [
  { icon: Mail, label: 'help.contact_email', value: 'dupontdjeague@gmail.com' },
  { icon: Phone, label: 'help.contact_phone', value: '+237 692 763 964' },
]

function Section({ title, icon: Icon, children }) {
  return (
    <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5'>
      <h2 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2'>
        <Icon className='w-4 h-4' /> {title}
      </h2>
      {children}
    </div>
  )
}

export default function Help() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const role = user?.roleUser || 'ACCUEIL'

  const visibleSections = {
    common: true,
    accueil: role === 'ACCUEIL',
    medecin: role === 'MEDECIN',
    admin: role === 'ADMIN',
  }

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='mb-6'>
        <Link
          to='/dashboard'
          className='flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-2'
        >
          <ArrowLeft className='w-4 h-4' /> {t('back')}
        </Link>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
          {t('help.title')}
        </h1>
        <p className='text-sm text-gray-500 mt-1'>{t('help.subtitle')}</p>
      </div>

      <div className='mb-6'>
        <Section title={t('help.quick_links_title')} icon={ExternalLink}>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
            {role !== 'ADMIN' && (
              <>
                <Link
                  to='/patients/create'
                  className='flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors'
                >
                  <UserPlus className='w-4 h-4' /> {t('help.link_new_patient')}
                </Link>
                <Link
                  to='/consultations/create'
                  className='flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors'
                >
                  <ClipboardList className='w-4 h-4' />{' '}
                  {t('help.link_new_consultation')}
                </Link>
                <Link
                  to='/historique'
                  className='flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors'
                >
                  <History className='w-4 h-4' /> {t('sidebar.historique')}
                </Link>
              </>
            )}
            <Link
              to='/patients'
              className='flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors'
            >
              <Users className='w-4 h-4' /> {t('help.link_patients')}
            </Link>
            <Link
              to='/consultations'
              className='flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors'
            >
              <Stethoscope className='w-4 h-4' /> {t('help.link_consultations')}
            </Link>
            <Link
              to='/change-password'
              className='flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors'
            >
              <KeyRound className='w-4 h-4' /> {t('help.link_change_password')}
            </Link>
          </div>
        </Section>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {Object.entries(sections).map(([key, section]) => {
          if (!visibleSections[key]) return null
          return (
            <Section
              key={key}
              title={t(section.title)}
              icon={section.icon || Users}
            >
              <ul className='space-y-2'>
                {section.items.map((item) => (
                  <li key={item.key}>
                    {item.link ? (
                      <Link
                        to={item.link}
                        className='flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors'
                      >
                        <item.icon className='w-4 h-4 mt-0.5 shrink-0' />
                        <span>{t(`help.item_${item.key}`)}</span>
                      </Link>
                    ) : (
                      <div className='flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400'>
                        <item.icon className='w-4 h-4 mt-0.5 shrink-0' />
                        <span>{t(`help.item_${item.key}`)}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )
        })}

        <Section title={t('help.contact_title')} icon={Mail}>
          <ul className='space-y-3'>
            {contacts.map((c, i) => (
              <li
                key={i}
                className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'
              >
                <c.icon className='w-4 h-4 text-primary-600 shrink-0' />
                <span className='font-medium text-gray-900 dark:text-white'>
                  {t(c.label)}
                </span>
                <span className='text-gray-500'>{c.value}</span>
              </li>
            ))}
          </ul>
          <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300'>
            {t('help.contact_hours')}
          </div>
        </Section>
      </div>

      <div className='mt-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5'>
        <h2 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2'>
          <Download className='w-4 h-4' /> {t('help.documentation_title')}
        </h2>
        <p className='text-sm text-gray-500 mb-3'>
          {t('help.documentation_desc')}
        </p>
        <a
          href='/Guide_Utilisateur_MediSys.doc'
          download
          className='inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors'
        >
          <Download className='w-4 h-4' /> {t('help.download_guide')}
        </a>
      </div>

      <div className='mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3'>
        <AlertTriangle className='w-5 h-5 text-amber-600 shrink-0 mt-0.5' />
        <div>
          <p className='text-sm font-medium text-amber-800 dark:text-amber-300'>
            {t('help.security_title')}
          </p>
          <p className='text-xs text-amber-700 dark:text-amber-400 mt-1'>
            {t('help.security_desc')}
          </p>
        </div>
      </div>
    </div>
  )
}
