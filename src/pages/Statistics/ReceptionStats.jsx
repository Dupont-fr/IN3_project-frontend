import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { statisticsAPI } from '../../api/statisticsApi'
import StatCard from '../../components/charts/StatCard'
import { CalendarDays, UserPlus, Clock, ClipboardList, Users } from 'lucide-react'
import Loader from '../../components/Loader'

export default function ReceptionStats() {
  const { t } = useTranslation()
  const [today, setToday] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await statisticsAPI.reception.today()
        setToday(res.data.data)
      } catch {
        console.error('Erreur chargement stats accueil')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <Loader />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('statistics.reception.title')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('statistics.reception.today_consultations')} value={today?.consultationsToday} icon={CalendarDays} color="bg-blue-500" />
        <StatCard label={t('statistics.reception.today_new_patients')} value={today?.newPatientsToday} icon={UserPlus} color="bg-green-500" />
        <StatCard label={t('statistics.reception.pending')} value={today?.pendingConsultations} icon={Clock} color="bg-amber-500" />
        <StatCard label={t('dashboard.stat_consultations')} value={today?.totalConsultations} icon={ClipboardList} color="bg-purple-500" />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Users className="w-5 h-5" />
          <span>{t('dashboard.stat_patients')} : <strong className="text-gray-900 dark:text-white">{today?.totalPatients ?? '--'}</strong></span>
        </div>
      </div>
    </div>
  )
}
