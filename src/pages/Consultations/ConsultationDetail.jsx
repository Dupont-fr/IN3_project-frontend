import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { consultationsAPI, examensAPI } from '../../api/consultationApi'
import { patientsAPI } from '../../api/patientApi'
import { hospitalsAPI } from '../../api/hospitalApi'
import { useAuth } from '../../context/AuthContext'
import { hasPermission } from '../../utils/roleHelpers'
import { useTranslation } from 'react-i18next'
import jsPDF from 'jspdf'
import {
  ArrowLeft,
  PenSquare,
  FileText,
  User,
  Stethoscope,
  Pill,
  MessageSquareText,
  Trash2,
  Weight,
  Ruler,
  Thermometer,
  Heart,
  CheckCircle,
  Download,
  Clock,
  XCircle,
  Users,
  ChevronDown,
  ChevronRight,
  Share2,
  FlaskConical,
  Building2,
  Plus,
  X,
  Search,
} from 'lucide-react'
import Loader from '../../components/Loader'

const statusConfig = {
  en_attente: {
    labelKey: 'consultationDetail.status_pending',
    class:
      'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: Clock,
  },
  complete: {
    labelKey: 'consultationDetail.status_completed',
    class:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: CheckCircle,
  },
  annulee: {
    labelKey: 'consultationDetail.status_cancelled',
    class: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle,
  },
  transferee: {
    labelKey: 'consultationDetail.status_transferred',
    class: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: Share2,
  },
}

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

function fmt(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const PDF_MARGIN = 14
const PDF_PAGE_W = 210
const PDF_CONTENT_W = PDF_PAGE_W - 2 * PDF_MARGIN

function ensurePage(doc, y, needed) {
  if (y + needed > 277) {
    doc.addPage()
    return 20
  }
  return y
}

function addSection(doc, title, y) {
  y = ensurePage(doc, y, 14)
  doc.setFillColor(240, 240, 245)
  doc.rect(PDF_MARGIN, y - 4, PDF_CONTENT_W, 8, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(40, 40, 40)
  doc.text(title, PDF_MARGIN + 2, y + 1)
  doc.setDrawColor(180, 180, 200)
  doc.setLineWidth(0.3)
  doc.line(PDF_MARGIN, y + 5, PDF_PAGE_W - PDF_MARGIN, y + 5)
  return y + 12
}

function addField(doc, label, value, y) {
  const text = String(value || '-')
  if (label) {
    y = ensurePage(doc, y, 12)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(110, 110, 110)
    doc.text(label, PDF_MARGIN + 2, y)
    y += 4
  } else {
    y = ensurePage(doc, y, 6)
  }
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(30, 30, 30)
  const lines = doc.splitTextToSize(text, PDF_CONTENT_W - 4)
  for (const line of lines) {
    y = ensurePage(doc, y, 5)
    doc.text(line, PDF_MARGIN + 2, y)
    y += 4.2
  }
  return y + 2
}

function addFieldValue(doc, label, value, y) {
  y = ensurePage(doc, y, 14)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(110, 110, 110)
  doc.text(label, PDF_MARGIN + 2, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(30, 30, 30)
  const lines = doc.splitTextToSize(String(value || '-'), PDF_CONTENT_W - 4)
  doc.text(lines, PDF_MARGIN + 2, y + 4.5)
  return y + 7 + lines.length * 4.2
}

const Section = ({ title, icon: Icon, children, className = '' }) => (
  <div
    className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 ${className}`}
  >
    <h2 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2'>
      <Icon className='w-4 h-4' /> {title}
    </h2>
    {children}
  </div>
)

const Field = ({ label, value, className = '' }) => (
  <div className={`py-2 ${className}`}>
    <p className='text-xs text-gray-500 uppercase tracking-wide'>{label}</p>
    <p className='text-sm font-medium text-gray-900 dark:text-white mt-0.5 whitespace-pre-wrap break-words'>
      {value || '-'}
    </p>
  </div>
)

function generatePDF(c, p, examens, tFn) {
  const doc = new jsPDF('p', 'mm', 'a4')

  const statusLabels = {
    en_attente: tFn('consultationDetail.status_pending'),
    complete: tFn('consultationDetail.status_completed'),
    annulee: tFn('consultationDetail.status_cancelled'),
    transferee: tFn('consultationDetail.status_transferred'),
  }
  const statusColors = {
    en_attente: [245, 158, 11],
    complete: [16, 185, 129],
    annulee: [239, 68, 68],
    transferee: [59, 130, 246],
  }

  let y = 18

  if (c.doctorHospital) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(130, 130, 130)
    doc.text(c.doctorHospital.toUpperCase(), PDF_PAGE_W / 2, y, { align: 'center' })
    y += 7
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(25, 25, 112)
  doc.text(tFn('consultationDetail.pdf_title'), PDF_PAGE_W / 2, y, { align: 'center' })
  y += 10

  doc.setDrawColor(25, 25, 112)
  doc.setLineWidth(0.8)
  doc.line(PDF_MARGIN, y, PDF_PAGE_W - PDF_MARGIN, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  doc.text(`ID: ${String(c.id).slice(0, 8).toUpperCase()}`, PDF_MARGIN, y)
  doc.text(`${tFn('consultationDetail.pdf_date')} ${fmt(c.date)}`, PDF_PAGE_W / 2, y, { align: 'center' })

  const sLabel = statusLabels[c.statut] || statusLabels.en_attente
  const sColor = statusColors[c.statut] || statusColors.en_attente
  const sWidth = doc.getTextWidth(sLabel) + 6
  doc.setFillColor(...sColor)
  doc.roundedRect(PDF_PAGE_W - PDF_MARGIN - sWidth, y - 4, sWidth, 6, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text(sLabel, PDF_PAGE_W - PDF_MARGIN - sWidth / 2, y, { align: 'center' })
  y += 10

  doc.setDrawColor(200, 200, 210)
  doc.setLineWidth(0.3)
  doc.line(PDF_MARGIN, y, PDF_PAGE_W - PDF_MARGIN, y)
  y += 10

  y = addSection(doc, tFn('consultationDetail.pdf_section_patient'), y)
  y = addFieldValue(doc, tFn('consultationDetail.pdf_field_fullname'), c.patientName, y)
  y = addFieldValue(doc, tFn('consultationDetail.pdf_field_code'), p?.code_patient, y)
  y = addFieldValue(doc, tFn('consultationDetail.pdf_field_gender'), p?.genre_patient, y)
  y = addFieldValue(doc, tFn('consultationDetail.pdf_field_dob'), p?.date_naissance_patient ? fmt(p.date_naissance_patient) : '-', y)
  y += 4

  y = addSection(doc, tFn('consultationDetail.pdf_section_doctors'), y)
  const grouped = {}
  for (const inv of c.interventions || []) {
    const key = inv.doctorId || `__accueil_${inv.id}`
    if (!grouped[key]) {
      grouped[key] = { doctorName: inv.doctorName, doctorSpecialty: inv.doctorSpecialty, doctorHospital: inv.doctorHospital, interventions: [] }
    }
    grouped[key].interventions.push(inv)
  }
  const groupEntries = Object.entries(grouped)
  if (groupEntries.length === 0) {
    y = addField(doc, '', tFn('consultationDetail.no_doctors'), y)
  } else {
    for (const [, g] of groupEntries) {
      const label = g.interventions[0].action === 'creation'
        ? tFn('consultationDetail.action_creation')
        : g.interventions[0].action === 'prise_en_charge'
          ? tFn('consultationDetail.action_prise_en_charge')
          : tFn('consultationDetail.action_modification')
      const doctorInfo = g.doctorName
        ? `${g.doctorName}${g.doctorSpecialty ? ' — ' + g.doctorSpecialty : ''}${g.doctorHospital ? ' (' + g.doctorHospital + ')' : ''}`
        : 'Accueil'
      y = addFieldValue(doc, label, doctorInfo, y)
      for (const inv of g.interventions) {
        if (inv.changes && Object.keys(inv.changes).length > 0) {
          for (const [field, vals] of Object.entries(inv.changes)) {
            const fieldLabel = fieldLabels[field] || field
            let changeText = ''
            if (vals && typeof vals === 'object' && 'old' in vals) {
              changeText = `${vals.old || '(vide)'} → ${vals.new || '(vide)'}`
            } else {
              changeText = String(vals ?? '(vide)')
            }
            y = addField(doc, `    ${fieldLabel}`, changeText, y)
          }
        }
      }
    }
  }
  y += 4

  y = addSection(doc, tFn('consultationDetail.pdf_section_vitals'), y)
  y = addFieldValue(doc, `${tFn('consultationDetail.field_weight')} (kg)`, c.poids, y)
  y = addFieldValue(doc, `${tFn('consultationDetail.field_height')} (cm)`, c.taille, y)
  y = addFieldValue(doc, `${tFn('consultationDetail.field_temperature')} (°C)`, c.temperature, y)
  y = addFieldValue(doc, `${tFn('consultationDetail.field_blood_pressure')} (mmHg)`, c.tension, y)
  y += 4

  if (c.contactUrgenceNom || c.contactUrgenceTelephone) {
    y = addSection(doc, tFn('consultationDetail.section_contact'), y)
    y = addFieldValue(doc, tFn('consultationDetail.field_urgence_nom'), c.contactUrgenceNom, y)
    y = addFieldValue(doc, tFn('consultationDetail.field_urgence_telephone'), c.contactUrgenceTelephone, y)
    y += 4
  }

  y = addSection(doc, tFn('consultationDetail.pdf_section_examens'), y)
  if (examens && examens.length > 0) {
    for (const ex of examens) {
      y = ensurePage(doc, y, 30)
      y = addFieldValue(doc, tFn('consultationDetail.pdf_field_examen_type'), ex.type, y)
      if (ex.description) y = addField(doc, tFn('consultationDetail.pdf_field_examen_description'), ex.description, y)
      const exStatus = ex.statut === 'realise' ? `✓ ${tFn('consultationDetail.examen_done')}` : `○ ${tFn('consultationDetail.examen_pending')}`
      y = addFieldValue(doc, tFn('consultationDetail.pdf_field_examen_status'), exStatus, y)
      if (ex.hopitalDestination) y = addFieldValue(doc, tFn('consultationDetail.pdf_field_examen_hospital'), ex.hopitalDestination, y)
      if (ex.statut === 'realise' && ex.resultats) y = addFieldValue(doc, tFn('consultationDetail.examen_results'), ex.resultats, y)
      y += 2
      if (examens.indexOf(ex) < examens.length - 1) {
        doc.setDrawColor(220, 220, 225)
        doc.setLineWidth(0.2)
        doc.line(PDF_MARGIN + 4, y, PDF_PAGE_W - PDF_MARGIN - 4, y)
        y += 4
      }
    }
  } else {
    y = addField(doc, '', tFn('consultationDetail.no_examens'), y)
  }
  y += 4

  y = addSection(doc, tFn('consultationDetail.pdf_section_motif'), y)
  y = addField(doc, '', c.motifConsultation, y)
  y += 4

  y = addSection(doc, tFn('consultationDetail.pdf_section_observations'), y)
  y = addField(doc, '', c.observations, y)
  y += 4

  y = addSection(doc, tFn('consultationDetail.pdf_section_conclusion'), y)
  y = addField(doc, '', c.conclusion, y)
  y += 4

  y = addSection(doc, tFn('consultationDetail.pdf_section_decision'), y)
  y = addField(doc, '', c.decision, y)
  y += 4

  y = addSection(doc, tFn('consultationDetail.pdf_section_prescription'), y)
  y = addField(doc, '', c.prescription, y)
  y += 4

  if (c.transfertDepuis || c.transfertVers) {
    y = addSection(doc, tFn('consultationDetail.pdf_section_transfer'), y)
    if (c.transfertDepuis) y = addFieldValue(doc, tFn('consultationDetail.pdf_field_transfer_from'), c.transfertDepuis, y)
    if (c.transfertVers) y = addFieldValue(doc, tFn('consultationDetail.pdf_field_transfer_to'), c.transfertVers, y)
  }

  const addFooter = (pageNum) => {
    const footerY = 285
    doc.setDrawColor(200, 200, 210)
    doc.setLineWidth(0.3)
    doc.line(PDF_MARGIN, footerY, PDF_PAGE_W - PDF_MARGIN, footerY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(140, 140, 140)
    const created = c.createdAt ? new Date(c.createdAt).toLocaleString('fr-FR') : '-'
    doc.text(`${tFn('consultationDetail.pdf_created_at')} ${created}`, PDF_MARGIN, footerY + 4)
    if (c.doctorHospital) doc.text(c.doctorHospital, PDF_PAGE_W / 2, footerY + 4, { align: 'center' })
    const updated = c.updatedAt ? new Date(c.updatedAt).toLocaleString('fr-FR') : '-'
    doc.text(`${tFn('consultationDetail.pdf_updated_at')} ${updated}`, PDF_PAGE_W - PDF_MARGIN, footerY + 4, { align: 'right' })
    doc.text(`${pageNum}`, PDF_PAGE_W / 2, footerY + 8, { align: 'center' })
  }

  const numPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= numPages; i++) {
    doc.setPage(i)
    addFooter(i)
  }

  doc.save(`consultation-${String(c.id).slice(0, 8)}.pdf`)
}

export default function ConsultationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation()

  const canManage = hasPermission(user, 'canManageConsultations')
  const isAccueil = user?.roleUser === 'ACCUEIL'

  const [consultation, setConsultation] = useState(null)
  const [patient, setPatient] = useState(null)
  const [examens, setExamens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const [expandedInv, setExpandedInv] = useState(null)
  const [showAddExamen, setShowAddExamen] = useState(false)
  const [newExamen, setNewExamen] = useState({ type: '', description: '', hopitalDestination: '' })
  const [hospitals, setHospitals] = useState([])
  const [savingExamen, setSavingExamen] = useState(false)
  const [hospitalSearch, setHospitalSearch] = useState('')
  const [openHospital, setOpenHospital] = useState(false)
  const hospitalRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (hospitalRef.current && !hospitalRef.current.contains(e.target)) setOpenHospital(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
        try {
          const exRes = await examensAPI.getByConsultation(id)
          setExamens(exRes.data.data || [])
        } catch {}
      } catch {
        setError('Consultation non trouvée')
      } finally {
        setLoading(false)
      }
    }
    fetch()
    hospitalsAPI.getAll().then((res) => setHospitals(res.data.data || [])).catch(() => {})
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm(t('consultationDetail.delete_confirm'))) return
    try {
      await consultationsAPI.delete(id)
      navigate('/consultations')
    } catch {
      setError(t('consultationDetail.delete_error'))
    }
  }

  const handleDownloadPDF = async () => {
    setPdfGenerating(true)
    try {
      generatePDF(consultation, patient, examens, t)
    } catch (err) {
      console.error('PDF generation error:', err)
    } finally {
      setPdfGenerating(false)
    }
  }

  const handleAddExamen = async () => {
    if (!newExamen.type) return
    setSavingExamen(true)
    try {
      await examensAPI.create({
        consultationId: id,
        type: newExamen.type,
        description: newExamen.description,
        hopitalSource: user?.hospitalUser || consultation?.doctorHospital || '',
        hopitalDestination: newExamen.hopitalDestination,
      })
      setNewExamen({ type: '', description: '', hopitalDestination: '' })
      setShowAddExamen(false)
      const exRes = await examensAPI.getByConsultation(id)
      setExamens(exRes.data.data || [])
    } catch {
      setError(t('consultationDetail.error_examen_create'))
    } finally {
      setSavingExamen(false)
    }
  }

  const EXAMEN_TYPES = ['Laboratoire', 'Scanner', 'Radiologie', 'Imagerie', 'Échographie', 'Autre']

  if (loading)
    return <Loader />
  if (error)
    return (
      <div className='text-center py-12'>
        <p className='text-gray-500 mb-4'>{error}</p>
        <button
          onClick={() => navigate('/consultations')}
          className='text-primary-600 hover:underline text-sm'
        >
          {t('consultationDetail.back_to_list')}
        </button>
      </div>
    )

  const st = statusConfig[consultation.statut] || statusConfig.en_attente
  const StatusIcon = st.icon
  const stLabel = t(st.labelKey)

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4'>
        <button
          onClick={() => navigate('/consultations')}
          className='flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        >
          <ArrowLeft className='w-4 h-4' /> {t('consultationDetail.back')}
        </button>
        <div className='flex flex-wrap gap-2'>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfGenerating}
            className='flex items-center gap-1.5 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors disabled:opacity-50'
          >
            <Download className='w-4 h-4' />{' '}
            {pdfGenerating
              ? t('consultationDetail.pdf_generating')
              : t('consultationDetail.pdf_download')}
          </button>
          {!isAccueil && (
            <Link
              to={`/consultations/${id}/transfer`}
              className='flex items-center gap-1.5 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors'
            >
              <Share2 className='w-4 h-4' /> Transférer
            </Link>
          )}
          {canManage && (
            <>
              <Link
                to={`/consultations/${id}/edit`}
                className='flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors'
              >
                <PenSquare className='w-4 h-4' /> {t('edit')}
              </Link>
              <button
                onClick={handleDelete}
                className='flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors'
              >
                <Trash2 className='w-4 h-4' /> {t('delete')}
              </button>
            </>
          )}
        </div>
      </div>

      <div className='space-y-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6'>
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                {t('consultationDetail.title')}
              </h1>
              <p className='text-sm text-gray-500 mt-1'>
                {consultation.date
                  ? new Date(consultation.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '-'}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${st.class}`}
            >
              <StatusIcon className='w-3.5 h-3.5' /> {stLabel}
            </span>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Section title={t('consultationDetail.section_patient')} icon={User}>
            <Field
              label={t('consultationDetail.field_fullname')}
              value={
                consultation.patientName ? (
                  <Link
                    to={`/patients/${consultation.patientId}`}
                    className='text-primary-600 hover:underline'
                  >
                    {consultation.patientName}
                  </Link>
                ) : (
                  '-'
                )
              }
            />
            <Field
              label={t('consultationDetail.field_code')}
              value={patient?.code_patient}
            />
            <Field
              label={t('consultationDetail.field_gender')}
              value={patient?.genre_patient}
            />
            <Field
              label={t('consultationDetail.field_dob')}
              value={
                patient?.date_naissance_patient
                  ? new Date(patient.date_naissance_patient).toLocaleDateString(
                      'fr-FR',
                    )
                  : '-'
              }
            />
          </Section>

          <Section title={t('consultationDetail.section_doctors')} icon={Users}>
            {(consultation.interventions?.length || 0) > 0 ? (
              <div className='divide-y divide-gray-100 dark:divide-gray-800'>
                {(() => {
                  const seen = new Set()
                  return consultation.interventions.filter((inv) => {
                    const key = inv.doctorId || `__accueil_${inv.id}`
                    if (seen.has(key)) return false
                    seen.add(key)
                    return true
                  })
                })().map((inv) => (
                  <div key={inv.id}>
                    <div className='py-3 flex items-start gap-3'>
                      <div className='w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0'>
                        <User className='w-4 h-4 text-gray-500' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-medium text-gray-900 dark:text-white'>
                          {inv.doctorName || 'Accueil'}{' '}
                          <span className='text-xs text-gray-400 font-normal'>
                            (
                            {inv.action === 'creation'
                              ? t('consultationDetail.action_creation')
                              : inv.action === 'prise_en_charge'
                                ? t('consultationDetail.action_prise_en_charge')
                                : t('consultationDetail.action_modification')}
                            )
                          </span>
                        </p>
                        <p className='text-xs text-gray-500'>
                          {[inv.doctorSpecialty, inv.doctorHospital]
                            .filter(Boolean)
                            .join(' · ') || '-'}
                        </p>
                        <p className='text-xs text-gray-400 mt-0.5'>
                          {inv.createdAt
                            ? new Date(inv.createdAt).toLocaleString('fr-FR')
                            : ''}
                        </p>
                        {inv.changes && Object.keys(inv.changes).length > 0 && (
                          <button
                            onClick={() =>
                              setExpandedInv(
                                expandedInv === inv.id ? null : inv.id,
                              )
                            }
                            className='mt-1.5 flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700'
                          >
                            {expandedInv === inv.id ? (
                              <ChevronDown className='w-3 h-3' />
                            ) : (
                              <ChevronRight className='w-3 h-3' />
                            )}
                            {t('consultationDetail.show_changes')}
                          </button>
                        )}
                      </div>
                    </div>
                    {expandedInv === inv.id && inv.changes && (
                      <div className='ml-11 mb-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-xs space-y-2'>
                        {Object.entries(inv.changes).map(([field, vals]) => (
                          <div key={field}>
                            <span className='font-semibold text-gray-700 dark:text-gray-300'>
                              {fieldLabels[field] || field}
                            </span>
                            <div className='mt-0.5 text-gray-500'>
                              {vals && typeof vals === 'object' && 'old' in vals ? (
                                <><span className='line-through'>{vals.old || '(vide)'}</span><span className='mx-1'>→</span><span className='text-gray-900 dark:text-gray-200 font-medium'>{vals.new || '(vide)'}</span></>
                              ) : (
                                <span className='text-gray-900 dark:text-gray-200 font-medium'>{String(vals ?? '(vide)')}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-sm text-gray-500'>
                {t('consultationDetail.no_doctors')}
              </p>
            )}
          </Section>
        </div>

        {!isAccueil && (
          <Section title={t('consultationDetail.section_vitals')} icon={Heart}>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center'>
                <Weight className='w-5 h-5 text-gray-400 mx-auto mb-1' />
                <p className='text-xs text-gray-500'>
                  {t('consultationDetail.field_weight')}
                </p>
                <p className='text-lg font-semibold text-gray-900 dark:text-white'>
                  {consultation.poids || '-'}
                </p>
              </div>
              <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center'>
                <Ruler className='w-5 h-5 text-gray-400 mx-auto mb-1' />
                <p className='text-xs text-gray-500'>
                  {t('consultationDetail.field_height')}
                </p>
                <p className='text-lg font-semibold text-gray-900 dark:text-white'>
                  {consultation.taille || '-'}
                </p>
              </div>
              <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center'>
                <Thermometer className='w-5 h-5 text-gray-400 mx-auto mb-1' />
                <p className='text-xs text-gray-500'>
                  {t('consultationDetail.field_temperature')}
                </p>
                <p className='text-lg font-semibold text-gray-900 dark:text-white'>
                  {consultation.temperature || '-'}
                </p>
              </div>
              <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center'>
                <Heart className='w-5 h-5 text-red-400 mx-auto mb-1' />
                <p className='text-xs text-gray-500'>
                  {t('consultationDetail.field_blood_pressure')}
                </p>
                <p className='text-lg font-semibold text-gray-900 dark:text-white'>
                  {consultation.tension || '-'}
                </p>
              </div>
            </div>
          </Section>
        )}

        {(consultation.contactUrgenceNom || consultation.contactUrgenceTelephone) && (
          <Section title={t('consultationDetail.section_contact')} icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t('consultationDetail.field_urgence_nom')} value={consultation.contactUrgenceNom} />
              <Field label={t('consultationDetail.field_urgence_telephone')} value={consultation.contactUrgenceTelephone} />
            </div>
          </Section>
        )}

        <Section title={t('consultationDetail.section_examens')} icon={FlaskConical}>
          <div className="space-y-3">
            {examens.length === 0 ? (
              <p className="text-sm text-gray-500">{t('consultationDetail.no_examens')}</p>
            ) : (
              examens.map((ex) => (
                <div key={ex.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{ex.type}</p>
                      {ex.description && <p className="text-xs text-gray-500 mt-0.5">{ex.description}</p>}
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                      ex.statut === 'realise'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {ex.statut === 'realise' ? t('consultationDetail.examen_done') : t('consultationDetail.examen_pending')}
                    </span>
                  </div>
                  {ex.hopitalDestination && (
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {ex.hopitalDestination}
                    </p>
                  )}
                  {ex.statut === 'realise' && ex.resultats && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-medium text-gray-500 mb-1">{t('consultationDetail.examen_results')}</p>
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{ex.resultats}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {user?.roleUser === 'MEDECIN' && (
            <div className="mt-3">
              {showAddExamen ? (
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('consultationDetail.add_examen')}</p>
                    <button type="button" onClick={() => { setShowAddExamen(false); setNewExamen({ type: '', description: '', hopitalDestination: '' }) }}
                      className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <select
                    value={newExamen.type}
                    onChange={(e) => setNewExamen({ ...newExamen, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">{t('consultationDetail.examen_type_placeholder')}</option>
                    {EXAMEN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input
                    value={newExamen.description}
                    onChange={(e) => setNewExamen({ ...newExamen, description: e.target.value })}
                    placeholder={t('consultationDetail.examen_description_placeholder')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <div className="relative" ref={hospitalRef}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        value={hospitalSearch}
                        onChange={(e) => {
                          setHospitalSearch(e.target.value)
                          setOpenHospital(true)
                          setNewExamen({ ...newExamen, hopitalDestination: '' })
                        }}
                        onFocus={() => setOpenHospital(true)}
                        placeholder={t('consultationDetail.examen_hospital_placeholder')}
                        className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    {openHospital && (
                      <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                        {hospitals
                          .filter((h) => {
                            const name = h.nameHospital || h.nomHopital || ''
                            const match = !hospitalSearch || name.toLowerCase().includes(hospitalSearch.toLowerCase())
                            return match && name !== consultation?.doctorHospital
                          })
                          .slice(0, 10)
                          .map((h) => {
                            const name = h.nameHospital || h.nomHopital || ''
                            return (
                              <li key={h._id || h.id}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewExamen({ ...newExamen, hopitalDestination: name })
                                    setHospitalSearch(name)
                                    setOpenHospital(false)
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
                          const match = !hospitalSearch || name.toLowerCase().includes(hospitalSearch.toLowerCase())
                          return match && name !== consultation?.doctorHospital
                        }).length === 0 && (
                          <li className="px-3 py-2 text-sm text-gray-400">{t('consultationDetail.no_hospital_found')}</li>
                        )}
                      </ul>
                    )}
                  </div>
                  <button
                    onClick={handleAddExamen}
                    disabled={savingExamen || !newExamen.type}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {savingExamen ? t('consultationDetail.saving') : t('consultationDetail.save_examen')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddExamen(true)}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  <Plus className="w-4 h-4" /> {t('consultationDetail.add_examen_btn')}
                </button>
              )}
            </div>
          )}
        </Section>

        {!isAccueil && (
          <Section
            title={t('consultationDetail.section_motif')}
            icon={Stethoscope}
          >
            <p className='text-sm text-gray-900 dark:text-white whitespace-pre-wrap'>
              {consultation.motifConsultation ||
                t('consultationDetail.not_provided')}
            </p>
          </Section>
        )}

        {!isAccueil && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Section
              title={t('consultationDetail.section_observations')}
              icon={FileText}
            >
              <p className='text-sm text-gray-900 dark:text-white whitespace-pre-wrap'>
                {consultation.observations ||
                  t('consultationDetail.not_provided')}
              </p>
            </Section>
            <Section
              title={t('consultationDetail.section_conclusion')}
              icon={MessageSquareText}
            >
              <p className='text-sm text-gray-900 dark:text-white whitespace-pre-wrap'>
                {consultation.conclusion || t('consultationDetail.not_provided')}
              </p>
            </Section>
          </div>
        )}

        {!isAccueil && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Section
              title={t('consultationDetail.section_decision')}
              icon={CheckCircle}
            >
              <p className='text-sm text-gray-900 dark:text-white whitespace-pre-wrap'>
                {consultation.decision || t('consultationDetail.not_provided')}
              </p>
            </Section>
            <Section
              title={t('consultationDetail.section_prescription')}
              icon={Pill}
            >
              <p className='text-sm text-gray-900 dark:text-white whitespace-pre-wrap'>
                {consultation.prescription ||
                  t('consultationDetail.not_provided')}
              </p>
            </Section>
          </div>
        )}

        <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 text-xs text-gray-400'>
            <span>
              {t('consultationDetail.created_at')}{' '}
              {consultation.createdAt
                ? new Date(consultation.createdAt).toLocaleString('fr-FR')
                : '-'}
            </span>
            <span className='font-medium text-gray-600 dark:text-gray-300'>
              {consultation.doctorHospital || '-'}
            </span>
            <span>
              {t('consultationDetail.updated_at')}{' '}
              {consultation.updatedAt
                ? new Date(consultation.updatedAt).toLocaleString('fr-FR')
                : '-'}
            </span>
          </div>
          {consultation.transfertDepuis && (
            <div className='mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400'>
              <p>Transférée depuis <span className='font-medium text-gray-600 dark:text-gray-300'>{consultation.transfertDepuis}</span></p>
            </div>
          )}
          {consultation.transfertVers && (
            <div className='mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400'>
              <p>Transférée vers <span className='font-medium text-gray-600 dark:text-gray-300'>{consultation.transfertVers}</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
