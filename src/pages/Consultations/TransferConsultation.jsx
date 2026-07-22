import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { consultationsAPI } from '../../api/consultationApi'
import { hospitalsAPI } from '../../api/hospitalApi'
import { patientsAPI } from '../../api/patientApi'
import Loader from '../../components/Loader'
import { ArrowLeft, User, Stethoscope, Pill, MessageSquareText, Weight, Ruler, Thermometer, Heart, Hospital } from 'lucide-react'

const fieldLabels = {
  motifConsultation: 'Motif',
  poids: 'Poids',
  taille: 'Taille',
  temperature: 'Température',
  tension: 'Tension',
  observations: 'Observations',
  conclusion: 'Conclusion',
  decision: 'Décision',
  prescription: 'Prescription',
}

const Section = ({ title, icon: Icon, children }) => (
  <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5'>
    <h2 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2'>
      <Icon className='w-4 h-4' /> {title}
    </h2>
    {children}
  </div>
)

const Field = ({ label, value }) => (
  <div className='py-2'>
    <p className='text-xs text-gray-500 uppercase tracking-wide'>{label}</p>
    <p className='text-sm font-medium text-gray-900 dark:text-white mt-0.5 whitespace-pre-wrap break-words'>
      {value || '-'}
    </p>
  </div>
)

const IconMap = {
  motifConsultation: MessageSquareText,
  poids: Weight,
  taille: Ruler,
  temperature: Thermometer,
  tension: Heart,
  observations: MessageSquareText,
  conclusion: MessageSquareText,
  decision: Stethoscope,
  prescription: Pill,
}

export default function TransferConsultation() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [consultation, setConsultation] = useState(null)
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hospitals, setHospitals] = useState([])
  const [selectedHospital, setSelectedHospital] = useState('')
  const [searchHospital, setSearchHospital] = useState('')
  const [transferring, setTransferring] = useState(false)
  const [success, setSuccess] = useState(false)
  const [newConsultationId, setNewConsultationId] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await consultationsAPI.getById(id)
        const c = res.data.data
        setConsultation(c)
        if (c.patientId) {
          try {
            const pres = await patientsAPI.getById(c.patientId)
            setPatient(pres.data.data)
          } catch {}
        }
        const hospRes = await hospitalsAPI.getAll()
        const allHospitals = hospRes.data.data || []
        setHospitals(allHospitals.filter(h => h.nameHospital !== c.doctorHospital))
      } catch {
        setError('Impossible de charger la consultation')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleTransfer = async () => {
    if (!selectedHospital) return
    setTransferring(true)
    try {
      const res = await consultationsAPI.transfer(id, { destinationHospital: selectedHospital })
      setNewConsultationId(res.data.data?.id || res.data.data?._id)
      setSuccess(true)
    } catch {
      setError('Erreur lors du transfert de la consultation')
    } finally {
      setTransferring(false)
    }
  }

  if (loading) return <Loader />
  if (error) return (
    <div className='max-w-4xl mx-auto text-center py-12'>
      <p className='text-gray-500 mb-4'>{error}</p>
      <button onClick={() => navigate(`/consultations/${id}`)} className='text-primary-600 hover:underline text-sm'>
        Retour à la consultation
      </button>
    </div>
  )
  if (success) return (
    <div className='max-w-4xl mx-auto text-center py-12'>
      <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8'>
        <div className='w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4'>
          <Hospital className='w-8 h-8 text-emerald-600 dark:text-emerald-400' />
        </div>
        <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>Transfert effectué</h2>
        <p className='text-sm text-gray-500 dark:text-gray-400 mb-2'>
          La consultation a été transférée vers <span className='font-semibold'>{selectedHospital}</span>
        </p>
        <p className='text-sm text-gray-400 dark:text-gray-500 mb-6'>
          Une copie archive reste disponible dans l'hôpital d'origine.
        </p>
        <div className='flex justify-center gap-3'>
          <button
            onClick={() => navigate('/consultations')}
            className='px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors'
          >
            Retour aux consultations
          </button>
          <button
            onClick={() => navigate(newConsultationId ? `/consultations/${newConsultationId}` : '/consultations')}
            className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
          >
            Voir la nouvelle consultation
          </button>
        </div>
      </div>
    </div>
  )

  const medicalFields = ['motifConsultation', 'poids', 'taille', 'temperature', 'tension']
  const clinicalFields = ['observations', 'conclusion', 'decision', 'prescription']

  const filteredHospitals = hospitals.filter(h =>
    h.nameHospital.toLowerCase().includes(searchHospital.toLowerCase())
  )

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='flex items-center justify-between mb-4'>
        <button
          onClick={() => navigate(`/consultations/${id}`)}
          className='flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        >
          <ArrowLeft className='w-4 h-4' /> Retour
        </button>
        <span className='text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full'>
          Consultation #{id}
        </span>
      </div>

      <div className='bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4'>
        <p className='text-sm text-amber-800 dark:text-amber-300 font-medium'>
          Vous êtes sur le point de transférer cette consultation vers un autre hôpital.
          Une copie de l'état actuel est affichée ci-dessous.
        </p>
      </div>

      <div className='space-y-4 mb-6'>
        <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6'>
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                Consultation #{id}
              </h1>
              <p className='text-sm text-gray-500 mt-1'>
                {consultation.date
                  ? new Date(consultation.date).toLocaleDateString('fr-FR', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    })
                  : '-'}
              </p>
            </div>
            <span className='inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'>
              {consultation.doctorHospital}
            </span>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Section title='Patient' icon={User}>
            <Field label='Nom' value={consultation.patientName} />
            <Field label='Code patient' value={patient?.code_patient} />
            <Field label='Genre' value={patient?.genre_patient} />
          </Section>

          <Section title='Médecin' icon={Stethoscope}>
            <Field label='Médecin traitant' value={consultation.doctorName} />
            <Field label='Spécialité' value={consultation.doctorSpecialty} />
            <Field label='Hôpital actuel' value={consultation.doctorHospital} />
          </Section>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {medicalFields.map(key => {
            if (!consultation[key]) return null
            const IconComp = IconMap[key]
            return (
              <Section key={key} title={fieldLabels[key]} icon={IconComp}>
                <Field label={fieldLabels[key]} value={consultation[key]} />
              </Section>
            )
          })}
        </div>

        {clinicalFields.map(key => {
          if (!consultation[key]) return null
          const IconComp = IconMap[key]
          return (
            <Section key={key} title={fieldLabels[key]} icon={IconComp}>
              <Field label={fieldLabels[key]} value={consultation[key]} />
            </Section>
          )
        })}
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6'>
        <h2 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2'>
          <Hospital className='w-4 h-4' /> Hôpital de destination
        </h2>

        <div className='relative mb-4'>
          <input
            type='text'
            value={searchHospital}
            onChange={e => setSearchHospital(e.target.value)}
            placeholder='Rechercher un hôpital...'
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
          />
          {searchHospital && (
            <div className='absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10'>
              {filteredHospitals.map(h => (
                <button
                  key={h._id || h.id}
                  type='button'
                  onClick={() => { setSelectedHospital(h.nameHospital); setSearchHospital('') }}
                  className='w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                >
                  {h.nameHospital}
                </button>
              ))}
              {filteredHospitals.length === 0 && (
                <p className='px-3 py-2 text-sm text-gray-400'>Aucun hôpital trouvé</p>
              )}
            </div>
          )}
        </div>

        {selectedHospital && (
          <p className='text-sm text-primary-600 dark:text-primary-400 mb-4'>
            Hôpital sélectionné : <span className='font-semibold'>{selectedHospital}</span>
          </p>
        )}

        <div className='flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700'>
          <button
            onClick={() => navigate(`/consultations/${id}`)}
            className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
          >
            Annuler
          </button>
          <button
            onClick={handleTransfer}
            disabled={!selectedHospital || transferring}
            className='px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50'
          >
            {transferring ? 'Transfert en cours...' : 'Confirmer le transfert'}
          </button>
        </div>
      </div>
    </div>
  )
}
