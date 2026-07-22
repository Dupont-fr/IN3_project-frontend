import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { patientsAPI } from '../../api/patientApi'
import { consultationsAPI } from '../../api/consultationApi'
import { useAuth } from '../../context/AuthContext'
import { hasPermission, ROLES } from '../../utils/roleHelpers'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft, PenSquare, Plus, Calendar, FileText, User, Phone, MapPin,
  Users, Tag,   AlertTriangle, ToggleLeft, ToggleRight, Clock, CheckCircle, Heart,
  Activity, Pencil, Trash2, Building2
} from 'lucide-react'
import Loader from '../../components/Loader'

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation()

  const isMedecin = user?.roleUser === ROLES.MEDECIN
  const canCreateConsultation = hasPermission(user, 'canCreateConsultation') || isMedecin
  const canViewConsultations = hasPermission(user, 'canViewConsultations')
  const canEdit = hasPermission(user, 'canManagePatients')
  const canDelete = hasPermission(user, 'canDeletePatient')

  const [patient, setPatient] = useState(null)
  const [consultations, setConsultations] = useState([])
  const [antecedents, setAntecedents] = useState([])
  const [loading, setLoading] = useState(true)
  const [consultLoading, setConsultLoading] = useState(false)
  const [consultError, setConsultError] = useState('')
  const [error, setError] = useState('')
  const [confirmToggle, setConfirmToggle] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [showAntecedentForm, setShowAntecedentForm] = useState(false)
  const [editingAntecedent, setEditingAntecedent] = useState(null)
  const [antecedentForm, setAntecedentForm] = useState({ type: '', description: '', date: '' })
  const [antecedentSaving, setAntecedentSaving] = useState(false)

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await patientsAPI.getById(id)
        setPatient(res.data.data)
      } catch {
        setError(t('patientDetail.not_found'))
      } finally {
        setLoading(false)
      }
    }
    fetchPatient()
  }, [id])

  useEffect(() => {
    const fetchAntecedents = async () => {
      try {
        const res = await patientsAPI.getAntecedents(id)
        setAntecedents(res.data.data || [])
      } catch { /* silencieux */ }
    }
    fetchAntecedents()
  }, [id])

  useEffect(() => {
    if (!canViewConsultations) return
    const fetchConsultations = async () => {
      setConsultLoading(true)
      try {
        const res = await consultationsAPI.getAll({ patientId: id })
        setConsultations(res.data.data || [])
      } catch {
        setConsultError(t('patientDetail.consultation_error') || 'Service consultations indisponible')
      } finally {
        setConsultLoading(false)
      }
    }
    fetchConsultations()
  }, [id, isMedecin])

  if (loading) return <Loader />
  if (error) return (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">{error}</p>
      <button onClick={() => navigate('/patients')} className="text-primary-600 hover:underline text-sm">{t('patientDetail.back_to_list')}</button>
    </div>
  )

  const fullName = [patient.nom_patient, patient.prenom_patient].filter(Boolean).join(' ')
  const estActif = patient.actif !== false

  const stats = {
    total: consultations.length,
    en_attente: consultations.filter(c => c.statut === 'en_attente').length,
    complete: consultations.filter(c => c.statut === 'complete').length,
  }

  const isOwnHospital = (a) => a.hopital === user?.hospitalUser

  const openAntecedentForm = (a) => {
    if (a) {
      setEditingAntecedent(a)
      setAntecedentForm({ type: a.type, description: a.description, date: a.date ? a.date.split('T')[0] : '' })
    } else {
      setEditingAntecedent(null)
      setAntecedentForm({ type: '', description: '', date: '' })
    }
    setShowAntecedentForm(true)
  }

  const handleAntecedentSave = async () => {
    if (!antecedentForm.type || !antecedentForm.description) return
    setAntecedentSaving(true)
    try {
      if (editingAntecedent) {
        const res = await patientsAPI.updateAntecedent(id, editingAntecedent.id, antecedentForm)
        setAntecedents((prev) => prev.map((a) => a.id === editingAntecedent.id ? res.data.data : a))
      } else {
        const res = await patientsAPI.createAntecedent(id, antecedentForm)
        setAntecedents((prev) => [res.data.data, ...prev])
      }
      setShowAntecedentForm(false)
      setEditingAntecedent(null)
    } catch (err) {
      setError(err.response?.data?.message || t('editPatient.error'))
    } finally {
      setAntecedentSaving(false)
    }
  }

  const handleAntecedentDelete = async (a) => {
    if (!window.confirm(t('patientDetail.antecedent_delete') + ' ?')) return
    try {
      await patientsAPI.deleteAntecedent(id, a.id)
      setAntecedents((prev) => prev.filter((x) => x.id !== a.id))
    } catch (err) {
      setError(err.response?.data?.message || t('editPatient.error'))
    }
  }

  const handleToggleActif = async () => {
    setToggling(true)
    try {
      const res = estActif ? await patientsAPI.desactiver(id) : await patientsAPI.reactiver(id)
      setPatient(res.data.data)
    } catch {
      setError(t('patientDetail.confirm_processing'))
    } finally {
      setToggling(false)
      setConfirmToggle(false)
    }
  }

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5 break-words">{value || '-'}</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/patients')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4">
        <ArrowLeft className="w-4 h-4" /> {t('patientDetail.back')}
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{fullName}</h1>
            {!estActif && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{t('patientDetail.inactive')}</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {patient.genre_patient} · {patient.date_naissance_patient ? new Date(patient.date_naissance_patient).toLocaleDateString('fr-FR') : '-'}
          </p>
          {patient.code_patient && (
            <p className="flex items-center gap-1.5 mt-1.5 text-sm font-mono font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2.5 py-0.5 rounded-md w-fit">
              <Tag className="w-3.5 h-3.5" /> {patient.code_patient}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {canCreateConsultation && (
            <Link to={`/consultations/create?patientId=${id}`} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> {t('patientDetail.consultation')}
            </Link>
          )}
          {canEdit && user?.hospitalUser && patient?.hopital === user.hospitalUser && (
            <Link to={`/patients/${id}/edit`} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
              <PenSquare className="w-4 h-4" /> {t('patientDetail.edit')}
            </Link>
          )}
          {canDelete && user?.hospitalUser && patient?.hopital === user.hospitalUser && (
            <button onClick={() => setConfirmToggle(true)} disabled={toggling}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                estActif
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}>
              {estActif ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
              {estActif ? t('patientDetail.deactivate') : t('patientDetail.reactivate')}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
            <User className="w-4 h-4" /> {t('patientDetail.section_personal')}
          </h2>
          <div className="mt-2 divide-y divide-gray-100 dark:divide-gray-800">
            <InfoRow icon={Tag} label={t('patientDetail.field_code')} value={patient.code_patient} />
            <InfoRow icon={User} label={t('patientDetail.field_lastname')} value={patient.nom_patient} />
            <InfoRow icon={User} label={t('patientDetail.field_firstname')} value={patient.prenom_patient} />
            <InfoRow icon={Calendar} label={t('patientDetail.field_dob')} value={patient.date_naissance_patient ? new Date(patient.date_naissance_patient).toLocaleDateString('fr-FR') : '-'} />
            <InfoRow icon={User} label={t('patientDetail.field_gender')} value={patient.genre_patient} />
            <InfoRow icon={Phone} label={t('patientDetail.field_phone')} value={patient.telephone_patient} />
            <InfoRow icon={User} label={t('patientDetail.field_profession')} value={patient.profession} />
            <InfoRow icon={User} label={t('patientDetail.field_religion')} value={patient.religion} />
            <InfoRow icon={User} label={t('patientDetail.field_situation')} value={patient.situation_matrimoniale} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {t('patientDetail.section_address')}
          </h2>
          <div className="mt-2 divide-y divide-gray-100 dark:divide-gray-800">
            <InfoRow icon={MapPin} label={t('patientDetail.field_street')} value={patient.adresse_rue} />
            <InfoRow icon={MapPin} label={t('patientDetail.field_city')} value={patient.adresse_ville} />
            <InfoRow icon={MapPin} label={t('patientDetail.field_zip')} value={patient.adresse_code_postal} />
            <InfoRow icon={MapPin} label={t('patientDetail.field_lieu_naissance')} value={patient.lieu_naissance} />
            <InfoRow icon={MapPin} label={t('patientDetail.field_pays')} value={patient.pays} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
            <Users className="w-4 h-4" /> {t('patientDetail.section_parents')}
          </h2>
          <div className="mt-2 divide-y divide-gray-100 dark:divide-gray-800">
            <InfoRow icon={Users} label={t('patientDetail.field_father')} value={patient.nom_pere} />
            <InfoRow icon={Users} label={t('patientDetail.field_mother')} value={patient.nom_mere} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
            <FileText className="w-4 h-4" /> {t('patientDetail.section_medical')}
          </h2>
          <div className="mt-2 divide-y divide-gray-100 dark:divide-gray-800">
            <InfoRow icon={Activity} label={t('patientDetail.field_groupe_sanguin')} value={patient.groupe_sanguin} />
            <InfoRow icon={Activity} label={t('patientDetail.field_rhesus')} value={patient.rhesus} />
            <InfoRow icon={FileText} label={t('patientDetail.field_hospital')} value={patient.hopital} />
            <InfoRow icon={FileText} label={t('patientDetail.field_created')} value={patient.created_at ? new Date(patient.created_at).toLocaleDateString('fr-FR') : '-'} />
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Activity className="w-4 h-4" /> {t('patientDetail.section_antecedents')}
          </h2>
          {user?.hospitalUser && (
            <button onClick={() => openAntecedentForm(null)}
              className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700">
              <Plus className="w-3.5 h-3.5" /> {t('patientDetail.antecedent_add')}
            </button>
          )}
        </div>

        {antecedents.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">{t('patientDetail.antecedent_empty')}</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {antecedents.map((a) => {
              const editable = isOwnHospital(a)
              return (
                <div key={a.id} className="py-3 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {t(`patientDetail.antecedent_type_${a.type}`) || a.type}
                      </span>
                      {a.date && (
                        <span className="text-xs text-gray-400">{new Date(a.date).toLocaleDateString('fr-FR')}</span>
                      )}
                      {!editable && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Building2 className="w-3 h-3" /> {a.hopital}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{a.description}</p>
                  </div>
                  {editable && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openAntecedentForm(a)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-600">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleAntecedentDelete(a)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showAntecedentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 max-w-md w-full p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingAntecedent ? t('patientDetail.antecedent_edit') : t('patientDetail.antecedent_add')}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('patientDetail.antecedent_field_type')}</label>
                <select value={antecedentForm.type} onChange={(e) => setAntecedentForm({ ...antecedentForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm">
                  <option value="">Sélectionner</option>
                  {['allergie','chirurgical','chronique','medical','familial','autre'].map((type) => (
                    <option key={type} value={type}>{t(`patientDetail.antecedent_type_${type}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('patientDetail.antecedent_field_description')}</label>
                <textarea value={antecedentForm.description} onChange={(e) => setAntecedentForm({ ...antecedentForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('patientDetail.antecedent_field_date')}</label>
                <input type="date" value={antecedentForm.date} onChange={(e) => setAntecedentForm({ ...antecedentForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-5">
              <button onClick={() => setShowAntecedentForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                {t('cancel')}
              </button>
              <button onClick={handleAntecedentSave} disabled={antecedentSaving}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50">
                {antecedentSaving ? t('saving') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {canViewConsultations && (
        <>
          <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" /> {t('patientDetail.section_stats')}
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-1">{t('patientDetail.stat_total')}</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.en_attente}</p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> {t('patientDetail.stat_pending')}
                </p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.complete}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1 flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {t('patientDetail.stat_completed')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {t('patientDetail.consultations_title')}
              </h2>
              {canCreateConsultation && (
                <Link to={`/consultations/create?patientId=${id}`} className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700">
                  <Plus className="w-3.5 h-3.5" /> {t('patientDetail.new_consultation')}
                </Link>
              )}
            </div>

            {consultLoading ? (
              <Loader />
            ) : consultError ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm text-center">
                {consultError}
              </div>
            ) : consultations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">{t('patientDetail.no_consultations')}</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {consultations.map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{c.motifConsultation || 'Consultation'}</p>
                        <p className="text-xs text-gray-500">{c.date ? new Date(c.date).toLocaleDateString('fr-FR') : '-'}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                        c.statut === 'complete'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : c.statut === 'annulee'
                          ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {c.statut === 'complete' ? t('patientDetail.status_completed') : c.statut === 'annulee' ? t('patientDetail.status_cancelled') : t('patientDetail.status_pending')}
                      </span>
                    </div>
                    <Link to={`/consultations/${c.id}`} className="text-xs text-primary-600 hover:underline">{t('view')}</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {confirmToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 max-w-sm w-full p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {estActif ? t('patientDetail.confirm_deactivate_title') : t('patientDetail.confirm_reactivate_title')}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {estActif ? t('patientDetail.confirm_deactivate_text') : t('patientDetail.confirm_reactivate_text')}
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmToggle(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                {t('cancel')}
              </button>
              <button onClick={handleToggleActif} disabled={toggling}
                className={`px-4 py-2 text-white rounded-lg transition-colors text-sm disabled:opacity-50 ${
                  estActif ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}>
                {toggling ? t('patientDetail.confirm_processing') : estActif ? t('patientDetail.confirm_yes_deactivate') : t('patientDetail.confirm_yes_reactivate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
