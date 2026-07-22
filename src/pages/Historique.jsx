import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { consultationsAPI } from '../api/consultationApi'
import { patientsAPI } from '../api/patientApi'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Calendar, Clock, User, Building2, Stethoscope, FileText, Phone, Hash, ChevronRight, Loader } from 'lucide-react'

function fmtHeure(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

const genreLabel = {
  masculin: 'M',
  feminin: 'F',
  M: 'M',
  F: 'F',
}

export default function Historique() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const role = user?.roleUser

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        if (role === 'MEDECIN') {
          const res = await consultationsAPI.getAll({ limit: 200 })
          const consultations = res.data?.data || []
          const grouped = {}
          for (const c of consultations) {
            const key = c.date || c.createdAt?.split('T')[0]
            if (!key) continue
            if (!grouped[key]) grouped[key] = []
            grouped[key].push({
              id: c.id,
              patientName: c.patientName,
              patientGenre: c.patientGenre,
              heure: fmtHeure(c.createdAt),
              motif: c.motifConsultation,
              statut: c.statut,
              doctorName: c.doctorName,
            })
          }
          const sorted = Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a))
          setData({ type: 'consultations', entries: sorted })
        } else if (role === 'ACCUEIL') {
          const res = await patientsAPI.getAll({ limit: 200 })
          const patients = res.data?.patients || []
          const grouped = {}
          for (const p of patients) {
            const key = p.created_at?.split('T')[0]
            if (!key) continue
            if (!grouped[key]) grouped[key] = []
            grouped[key].push({
              id: p.id,
              nom: p.nom_patient,
              prenom: p.prenom_patient,
              genre: p.genre_patient,
              telephone: p.telephone_patient,
              codePatient: p.code_patient,
              heure: fmtHeure(p.created_at),
            })
          }
          const sorted = Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a))
          setData({ type: 'patients', entries: sorted })
        } else {
          setData({ type: 'none', entries: [] })
        }
      } catch {
        setData({ type: 'error', entries: [] })
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [role])

  if (loading) return (
    <div className='max-w-4xl mx-auto flex items-center justify-center py-20'>
      <Loader className='w-6 h-6 animate-spin text-gray-400' />
    </div>
  )

  if (!data || data.type === 'none') return (
    <div className='max-w-4xl mx-auto text-center py-20'>
      <p className='text-gray-500'>{t('historique.not_available')}</p>
    </div>
  )

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='flex items-center gap-3 mb-6'>
        <Calendar className='w-5 h-5 text-primary-600' />
        <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
          {data.type === 'consultations' ? t('historique.title_consultations') : t('historique.title_patients')}
        </h1>
      </div>

      <div className='space-y-6'>
        {data.entries.map(([dateKey, items]) => (
          <div key={dateKey}>
            <div className='flex items-center gap-2 mb-3'>
              <Calendar className='w-4 h-4 text-primary-500' />
              <h2 className='text-sm font-semibold text-primary-700 dark:text-primary-400 uppercase tracking-wide'>
                {fmtDate(dateKey)}
              </h2>
              <span className='text-xs text-gray-400 ml-auto'>{items.length} {t(items.length > 1 ? 'historique.items_plural' : 'historique.items_single')}</span>
            </div>

            <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800'>
              {items.map((item, i) => (
                <Link
                  key={item.id || i}
                  to={data.type === 'consultations' ? `/consultations/${item.id}` : `/patients/${item.id}`}
                  className='flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group'
                >
                  <div className='w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0'>
                    {data.type === 'consultations' ? <FileText className='w-5 h-5' /> : <User className='w-5 h-5' />}
                  </div>

                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-gray-900 dark:text-white truncate'>
                      {data.type === 'consultations' ? item.patientName : `${item.prenom} ${item.nom}`}
                    </p>
                    <div className='flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap'>
                      {item.genre && (
                        <span>{genreLabel[item.genre] || item.genre}</span>
                      )}
                      {item.heure && (
                        <span className='flex items-center gap-1'>
                          <Clock className='w-3 h-3' /> {item.heure}
                        </span>
                      )}
                      {item.motif && (
                        <span className='flex items-center gap-1 truncate max-w-[200px]'>
                          <Stethoscope className='w-3 h-3' /> {item.motif}
                        </span>
                      )}
                      {item.codePatient && (
                        <span className='flex items-center gap-1'>
                          <Hash className='w-3 h-3' /> {item.codePatient}
                        </span>
                      )}
                      {item.telephone && (
                        <span className='flex items-center gap-1'>
                          <Phone className='w-3 h-3' /> {item.telephone}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className='w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0' />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
