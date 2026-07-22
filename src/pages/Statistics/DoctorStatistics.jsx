import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { statisticsAPI } from '../../api/statisticsApi'
import StatCard from '../../components/charts/StatCard'
import TradingChart from '../../components/charts/TradingChart'
import { ClipboardList, Activity, Users, Hospital } from 'lucide-react'
import { buildSeries, hslColor } from '../../utils/colors'
import Loader from '../../components/Loader'

export default function DoctorStatistics() {
  const { t } = useTranslation()
  const [overview, setOverview] = useState(null)
  const [consultationsBySpecialty, setConsultationsBySpecialty] = useState([])
  const [patientsByHospital, setPatientsByHospital] = useState([])
  const [patientsTotalByHospital, setPatientsTotalByHospital] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [ov, cs, ph, pt] = await Promise.all([
          statisticsAPI.doctor.overview(),
          statisticsAPI.doctor.consultationsBySpecialtyMonthly(),
          statisticsAPI.doctor.patientsByHospitalMonthly(),
          statisticsAPI.doctor.patientsTotalByHospital(),
        ])
        setOverview(ov.data.data)
        setConsultationsBySpecialty(cs.data.data)
        setPatientsByHospital(ph.data.data)
        setPatientsTotalByHospital(pt.data.data)
      } catch {
        console.error('Erreur chargement stats docteur')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const specialtySeries = useMemo(() => buildSeries(consultationsBySpecialty), [consultationsBySpecialty])
  const hospitalSeries = useMemo(() => buildSeries(patientsByHospital), [patientsByHospital])

  if (loading) return <Loader />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('statistics.doctor.title')}</h1>
        {overview?.doctorName && (
          <p className="text-sm text-gray-500 mt-1">
            {overview.doctorName}
            {overview.specialty && ` — ${overview.specialty}`}
            {overview.hospital && ` (${overview.hospital})`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={t('statistics.doctor.my_consultations')} value={overview?.totalConsultations} icon={ClipboardList} color="bg-blue-500" />
        <StatCard label={t('statistics.doctor.this_month')} value={overview?.consultationsThisMonth} icon={Activity} color="bg-amber-500" />
        <StatCard label={t('statistics.doctor.my_patients')} value={overview?.totalPatients} icon={Users} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TradingChart
          data={consultationsBySpecialty}
          series={specialtySeries}
          title={t('statistics.doctor.consultations_by_specialty')}
          height={420}
        />
        <TradingChart
          data={patientsByHospital}
          series={hospitalSeries}
          title={t('statistics.doctor.patients_by_hospital')}
          height={420}
        />
      </div>

      {patientsTotalByHospital.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            {t('statistics.doctor.patients_total_by_hospital')}
          </h3>
          <div className="space-y-3">
            {patientsTotalByHospital.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <Hospital className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 w-48 truncate">{item.hospital}</span>
                <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(item.total / Math.max(...patientsTotalByHospital.map(p => p.total))) * 100}%`,
                      backgroundColor: hslColor(i),
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 w-12 text-right">{item.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
