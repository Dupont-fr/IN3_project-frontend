import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { statisticsAPI } from '../../api/statisticsApi'
import TradingChart from '../../components/charts/TradingChart'
import { Hospital, Stethoscope, X, Building2, UserRound } from 'lucide-react'
import { buildSeries, hslColor } from '../../utils/colors'
import { ROLE_LABELS } from '../../utils/roleHelpers'
import Loader from '../../components/Loader'

export default function AdminStatistics() {
  const { t } = useTranslation()
  const [usersBySpecialty, setUsersBySpecialty] = useState([])
  const [usersByHospital, setUsersByHospital] = useState([])
  const [totalBySpecialty, setTotalBySpecialty] = useState([])
  const [totalByHospital, setTotalByHospital] = useState([])
  const [loading, setLoading] = useState(true)

  const [modal, setModal] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [us, uh, ts, th] = await Promise.all([
          statisticsAPI.admin.usersBySpecialtyMonthly(),
          statisticsAPI.admin.usersByHospitalMonthly(),
          statisticsAPI.admin.usersTotalBySpecialty(),
          statisticsAPI.admin.usersTotalByHospital(),
        ])
        setUsersBySpecialty(us.data.data)
        setUsersByHospital(uh.data.data)
        setTotalBySpecialty(ts.data.data)
        setTotalByHospital(th.data.data)
      } catch {
        console.error('Erreur chargement stats admin')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const specialtySeries = useMemo(() => buildSeries(usersBySpecialty), [usersBySpecialty])
  const hospitalSeries = useMemo(() => buildSeries(usersByHospital), [usersByHospital])

  const openSpecialty = async (specialty) => {
    try {
      const res = await statisticsAPI.admin.doctorsBySpecialty(specialty)
      setModal({ type: 'specialty', title: specialty, list: res.data.data })
    } catch {
      console.error('Erreur chargement médecins')
    }
  }

  const openHospital = async (hospital) => {
    try {
      const res = await statisticsAPI.admin.usersByHospital(hospital)
      setModal({ type: 'hospital', title: hospital, list: res.data.data })
    } catch {
      console.error('Erreur chargement utilisateurs')
    }
  }

  if (loading) return <Loader />

  const maxSpec = Math.max(...totalBySpecialty.map(p => p.total), 1)
  const maxHosp = Math.max(...totalByHospital.map(p => p.total), 1)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('statistics.admin.title')}</h1>

      <div className="grid grid-cols-1 gap-6">
        <TradingChart
          data={usersBySpecialty}
          series={specialtySeries}
          title={t('statistics.admin.users_by_specialty')}
          height={420}
        />
        <TradingChart
          data={usersByHospital}
          series={hospitalSeries}
          title={t('statistics.admin.users_by_hospital')}
          height={420}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Stethoscope className="w-4 h-4" />
            {t('statistics.admin.total_by_specialty')}
          </h3>
          <div className="space-y-2.5">
            {totalBySpecialty.map((item, i) => (
              <button
                key={item.specialty}
                onClick={() => openSpecialty(item.specialty)}
                className="flex items-center gap-3 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hslColor(i) }} />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{item.specialty}</span>
                <div className="w-32 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(item.total / maxSpec) * 100}%`, backgroundColor: hslColor(i) }} />
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 w-8 text-right">{item.total}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Hospital className="w-4 h-4" />
            {t('statistics.admin.total_by_hospital')}
          </h3>
          <div className="space-y-2.5">
            {totalByHospital.map((item, i) => (
              <button
                key={item.hospital}
                onClick={() => openHospital(item.hospital)}
                className="flex items-center gap-3 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: hslColor(i) }} />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{item.hospital}</span>
                <div className="w-32 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(item.total / maxHosp) * 100}%`, backgroundColor: hslColor(i) }} />
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 w-8 text-right">{item.total}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-lg mx-4 max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                {modal.type === 'specialty' ? <Stethoscope className="w-4 h-4 text-gray-500" /> : <Building2 className="w-4 h-4 text-gray-500" />}
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{modal.title}</h3>
              </div>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="overflow-y-auto p-5 space-y-2 flex-1">
              {modal.list.length === 0 && <p className="text-sm text-gray-400 text-center py-6">{t('statistics.admin.modal_empty')}</p>}
              {modal.list.filter(Boolean).map((item, i) => (
                <Link
                  key={i}
                  to={`/users/${item._id}`}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <UserRound className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {modal.type === 'specialty'
                        ? (item.hospital || '—')
                        : `${ROLE_LABELS[item.role] || item.role} · ${item.specialty || '—'}`}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.role === 'MEDECIN' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                    {(ROLE_LABELS[item.role] || item.role || '').toUpperCase()}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
