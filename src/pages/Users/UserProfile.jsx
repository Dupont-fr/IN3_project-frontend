import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { usersAPI } from '../../api/userApi'
import { ROLE_LABELS, ROLE_BADGES } from '../../utils/roleHelpers'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Mail, Building2, Stethoscope, Calendar, Shield } from 'lucide-react'
import Loader from '../../components/Loader'

export default function UserProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await usersAPI.getById(id)
        setUser(res.data.data)
      } catch {
        setError(t('userProfile.not_found'))
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  if (loading) return <Loader />
  if (error) return (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">{error}</p>
      <Link to="/users" className="text-primary-600 hover:underline text-sm">{t('userProfile.back_to_list')}</Link>
    </div>
  )
  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/users')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('back')}
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 pb-0">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 text-xl font-bold">
              {user.nameUser?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{user.nameUser}</h1>
              <span className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${ROLE_BADGES[user.roleUser] || ''}`}>
                {ROLE_LABELS[user.roleUser] || user.roleUser}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800">
          <dl className="divide-y divide-gray-200 dark:divide-gray-800">
            <div className="px-6 py-4 flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <dt className="text-sm text-gray-500 w-24">{t('userList.col_email')}</dt>
              <dd className="text-sm text-gray-900 dark:text-white">{user.emailUser}</dd>
            </div>
            <div className="px-6 py-4 flex items-center gap-3">
              <Shield className="w-4 h-4 text-gray-400 shrink-0" />
              <dt className="text-sm text-gray-500 w-24">{t('userList.col_role')}</dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${ROLE_BADGES[user.roleUser] || ''}`}>
                  {ROLE_LABELS[user.roleUser] || user.roleUser}
                </span>
              </dd>
            </div>
            <div className="px-6 py-4 flex items-center gap-3">
              <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
              <dt className="text-sm text-gray-500 w-24">{t('userList.col_hospital')}</dt>
              <dd className="text-sm text-gray-900 dark:text-white">{user.hospitalUser || '-'}</dd>
            </div>
            <div className="px-6 py-4 flex items-center gap-3">
              <Stethoscope className="w-4 h-4 text-gray-400 shrink-0" />
              <dt className="text-sm text-gray-500 w-24">{t('userList.col_specialty')}</dt>
              <dd className="text-sm text-gray-900 dark:text-white">{user.specialtyUser || '-'}</dd>
            </div>
            <div className="px-6 py-4 flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <dt className="text-sm text-gray-500 w-24">{t('userList.col_created')}</dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {new Date(user.createdAtUser).toLocaleDateString('fr-FR')}
              </dd>
            </div>
          </dl>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
          <Link
            to={`/users/${user._id}/edit`}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {t('edit')}
          </Link>
          <Link
            to="/users"
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
          >
            {t('back')}
          </Link>
        </div>
      </div>
    </div>
  )
}
