import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { consultationsAPI, examensAPI } from '../../api/consultationApi'
import { patientsAPI } from '../../api/patientApi'
import { hospitalsAPI } from '../../api/hospitalApi'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Weight, Ruler, Thermometer, Heart, Stethoscope, User, FlaskConical, Plus, X, Building2, Search } from 'lucide-react'

const EXAMEN_TYPES = ['Laboratoire', 'Scanner', 'Radiologie', 'Imagerie', 'Échographie', 'Autre']

export default function CreateConsultation() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const preSelectedPatientId = searchParams.get('patientId') || ''
  const [patients, setPatients] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [form, setForm] = useState({
    patientId: preSelectedPatientId,
    date: new Date().toISOString().split('T')[0],
    motifConsultation: '',
    poids: '',
    taille: '',
    temperature: '',
    tension: '',
    contactUrgenceNom: '',
    contactUrgenceTelephone: '',
  })
  const [examens, setExamens] = useState([])
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [hospitalSearch, setHospitalSearch] = useState({})
  const [openHospitalIdx, setOpenHospitalIdx] = useState(null)
  const hospitalRef = useRef(null)

  const fieldRefs = {
    patientId: useRef(null),
    date: useRef(null),
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (hospitalRef.current && !hospitalRef.current.contains(e.target)) {
        setOpenHospitalIdx(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    patientsAPI.getAll({ allHospitals: true }).then((res) => setPatients(res.data.patients || [])).catch(() => {})
    hospitalsAPI.getAll().then((res) => setHospitals(res.data.data || [])).catch(() => {})
  }, [])

  const fullName = (p) => [p.nom_patient, p.prenom_patient].filter(Boolean).join(' ')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' })
    }
  }

  const scrollToField = (fieldName) => {
    const ref = fieldRefs[fieldName]
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      ref.current.focus()
    }
  }

  const addExamen = () => {
    setExamens([...examens, { type: '', description: '', hopitalDestination: '' }])
  }

  const removeExamen = (idx) => {
    setExamens(examens.filter((_, i) => i !== idx))
  }

  const updateExamen = (idx, field, value) => {
    const updated = [...examens]
    updated[idx] = { ...updated[idx], [field]: value }
    setExamens(updated)
  }

  const validate = () => {
    const errors = {}

    if (!form.patientId) {
      errors.patientId = t('createConsultation.error_patient_required')
    }

    if (!form.date) {
      errors.date = t('createConsultation.error_date_required')
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const errors = validate()
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      const firstError = Object.keys(errors)[0]
      scrollToField(firstError)
      return
    }

    setLoading(true)
    try {
      const res = await consultationsAPI.create({
        ...form,
        doctorId: user?._id || user?.id,
        createdBy: user?._id || user?.id,
        statut: 'en_attente',
      })
      const consultationId = res.data.data?.id || res.data.data?._id

      for (const ex of examens) {
        if (ex.type) {
          await examensAPI.create({
            consultationId,
            type: ex.type,
            description: ex.description,
            hopitalDestination: ex.hopitalDestination || null,
          })
        }
      }

      navigate('/consultations')
    } catch (err) {
      const msg = err.response?.data?.message || t('createConsultation.error_create')
      setError(msg)
      if (msg.includes('déjà été consulté')) {
        scrollToField('patientId')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (fieldName) =>
    `w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none ${
      fieldErrors[fieldName]
        ? 'border-red-500 focus:ring-2 focus:ring-red-300'
        : 'border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500'
    }`

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/consultations')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="w-4 h-4" /> {t('back')}
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('createConsultation.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('createConsultation.subtitle')}</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
        <div ref={fieldRefs.patientId}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
            <User className="w-4 h-4" /> {t('createConsultation.field_patient')} *
          </label>
          <select name="patientId" value={form.patientId} onChange={handleChange} className={inputClass('patientId')}>
            <option value="">{t('createConsultation.field_patient_placeholder')}</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{fullName(p)}</option>)}
          </select>
          {fieldErrors.patientId && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.patientId}</p>
          )}
        </div>

        <div ref={fieldRefs.date}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('createConsultation.field_date')} *</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} className={inputClass('date')} />
          {fieldErrors.date && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.date}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4" /> {t('createConsultation.field_motif')}
          </label>
          <textarea name="motifConsultation" value={form.motifConsultation} onChange={handleChange} rows={3}
            placeholder={t('createConsultation.field_motif_placeholder')}
            className={inputClass('motifConsultation')} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-red-500" /> {t('createConsultation.section_vitals')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <Weight className="w-3.5 h-3.5" /> {t('createConsultation.field_weight')}
              </label>
              <input name="poids" value={form.poids} onChange={handleChange} placeholder={t('createConsultation.field_weight_placeholder')}
                className={inputClass('poids')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5" /> {t('createConsultation.field_height')}
              </label>
              <input name="taille" value={form.taille} onChange={handleChange} placeholder={t('createConsultation.field_height_placeholder')}
                className={inputClass('taille')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5" /> {t('createConsultation.field_temperature')}
              </label>
              <input name="temperature" value={form.temperature} onChange={handleChange} placeholder={t('createConsultation.field_temperature_placeholder')}
                className={inputClass('temperature')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" /> {t('createConsultation.field_blood_pressure')}
              </label>
              <input name="tension" value={form.tension} onChange={handleChange} placeholder={t('createConsultation.field_blood_pressure_placeholder')}
                className={inputClass('tension')} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
            <User className="w-4 h-4" /> {t('createConsultation.section_contact')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('createConsultation.field_urgence_nom')}</label>
              <input name="contactUrgenceNom" value={form.contactUrgenceNom} onChange={handleChange}
                placeholder={t('createConsultation.field_urgence_nom_placeholder')}
                className={inputClass('contactUrgenceNom')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('createConsultation.field_urgence_telephone')}</label>
              <input name="contactUrgenceTelephone" value={form.contactUrgenceTelephone} onChange={handleChange}
                placeholder={t('createConsultation.field_urgence_telephone_placeholder')}
                className={inputClass('contactUrgenceTelephone')} />
            </div>
          </div>
        </div>

        {user?.roleUser === 'MEDECIN' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4" /> {t('createConsultation.section_examens')}
              </h3>
              <button type="button" onClick={addExamen}
                className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700">
                <Plus className="w-3.5 h-3.5" /> {t('createConsultation.add_examen')}
              </button>
            </div>
            {examens.map((ex, idx) => (
              <div key={idx} className="mb-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">{t('createConsultation.examen')} {idx + 1}</span>
                  <button type="button" onClick={() => removeExamen(idx)}
                    className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t('createConsultation.examen_type')}</label>
                    <select value={ex.type} onChange={(e) => updateExamen(idx, 'type', e.target.value)} className={inputClass('examen_type_' + idx)}>
                      <option value="">{t('createConsultation.examen_type_placeholder')}</option>
                      {EXAMEN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t('createConsultation.examen_description')}</label>
                    <input value={ex.description} onChange={(e) => updateExamen(idx, 'description', e.target.value)}
                      placeholder={t('createConsultation.examen_description_placeholder')} className={inputClass('examen_desc_' + idx)} />
                  </div>
                  <div className="relative" ref={hospitalRef}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t('createConsultation.examen_hospital')}</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        value={hospitalSearch[idx] || ''}
                        onChange={(e) => {
                          setHospitalSearch({ ...hospitalSearch, [idx]: e.target.value })
                          setOpenHospitalIdx(idx)
                          updateExamen(idx, 'hopitalDestination', '')
                        }}
                        onFocus={() => setOpenHospitalIdx(idx)}
                        placeholder={t('createConsultation.examen_hospital_placeholder')}
                        className={`${inputClass('examen_hosp_' + idx)} pl-9`}
                      />
                    </div>
                    {openHospitalIdx === idx && (hospitalSearch[idx] || '').length > 0 && (
                      <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                        {hospitals
                          .filter((h) => {
                            const name = h.nameHospital || h.nomHopital || ''
                            return name.toLowerCase().includes((hospitalSearch[idx] || '').toLowerCase()) && name !== user?.hospitalUser
                          })
                          .map((h) => {
                            const name = h.nameHospital || h.nomHopital || ''
                            return (
                              <li key={h._id || h.id}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateExamen(idx, 'hopitalDestination', name)
                                    setHospitalSearch({ ...hospitalSearch, [idx]: name })
                                    setOpenHospitalIdx(null)
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center gap-2"
                                >
                                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                  {name}
                                </button>
                              </li>
                            )
                          })}
                        {hospitals.filter((h) => {
                          const name = h.nameHospital || h.nomHopital || ''
                          return name.toLowerCase().includes((hospitalSearch[idx] || '').toLowerCase()) && name !== user?.hospitalUser
                        }).length === 0 && (
                          <li className="px-3 py-2 text-sm text-gray-400">{t('createConsultation.no_hospital_found')}</li>
                        )}
                      </ul>
                    )}
                    {openHospitalIdx === idx && (hospitalSearch[idx] || '').length === 0 && (
                      <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                        {hospitals
                          .filter((h) => {
                            const name = h.nameHospital || h.nomHopital || ''
                            return name !== user?.hospitalUser
                          })
                          .slice(0, 10)
                          .map((h) => {
                            const name = h.nameHospital || h.nomHopital || ''
                            return (
                              <li key={h._id || h.id}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateExamen(idx, 'hopitalDestination', name)
                                    setHospitalSearch({ ...hospitalSearch, [idx]: name })
                                    setOpenHospitalIdx(null)
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center gap-2"
                                >
                                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                  {name}
                                </button>
                              </li>
                            )
                          })}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/consultations')}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
            {t('cancel')}
          </button>
          <button type="submit" disabled={loading}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50">
            {loading ? t('saving') : t('createConsultation.create')}
          </button>
        </div>
      </form>
    </div>
  )
}
