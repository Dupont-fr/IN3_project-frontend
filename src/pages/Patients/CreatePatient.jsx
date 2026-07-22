import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { patientsAPI } from '../../api/patientApi'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, AlertTriangle, Eye } from 'lucide-react'

export default function CreatePatient() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState({
    prenomPatient: '',
    nomPatient: '',
    dateNaissancePatient: '',
    genrePatient: '',
    telephonePatient: '',
    nomPere: '',
    nomMere: '',
    adresseRue: '',
    adresseVille: '',
    adresseCodePostal: '',
    religionPatient: '',
    situationMatrimonialePatient: '',
    paysPatient: 'Cameroun',
    lieuNaissancePatient: '',
    groupeSanguinPatient: '',
    rhesusPatient: '',
    professionPatient: '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [duplicates, setDuplicates] = useState([])
  const [checking, setChecking] = useState(false)

  const fieldRefs = {
    nomPatient: useRef(null),
    dateNaissancePatient: useRef(null),
    genrePatient: useRef(null),
    telephonePatient: useRef(null),
  }

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

  const validate = () => {
    const errors = {}

    if (!form.nomPatient?.trim()) {
      errors.nomPatient = t('createPatient.error_lastname_required')
    }

    if (!form.dateNaissancePatient) {
      errors.dateNaissancePatient = t('createPatient.error_dob_required')
    }

    if (!form.genrePatient) {
      errors.genrePatient = t('createPatient.error_gender_required')
    }

    const phone = form.telephonePatient?.replace(/\s/g, '')
    if (phone && !/^\d{9}$/.test(phone)) {
      errors.telephonePatient = t('createPatient.phone_validation_error')
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

    if (duplicates.length > 0) {
      await doCreate()
      return
    }
    setChecking(true)
    try {
      const res = await patientsAPI.checkDuplicates(form)
      if (res.data.hasDuplicates) {
        setDuplicates(res.data.duplicates)
      } else {
        await doCreate()
      }
    } catch {
      console.warn('Impossible de vérifier les doublons, création directe')
      await doCreate()
    } finally {
      setChecking(false)
    }
  }

  const doCreate = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await patientsAPI.create(form)
      navigate(`/patients/${res.data.data.id}`)
    } catch (err) {
      setError(err.response?.data?.message || t('createPatient.error'))
      setLoading(false)
    }
  }

  const fullName = (p) =>
    [p.nom_patient, p.prenom_patient].filter(Boolean).join(' ')

  const matchLabel = (key) => t(`createPatient.match_${key}`, key)

  const inputClass = (fieldName) =>
    `w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none ${
      fieldErrors[fieldName]
        ? 'border-red-500 focus:ring-2 focus:ring-red-300'
        : 'border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500'
    }`

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='mb-6'>
        <button
          onClick={() => navigate('/patients')}
          className='flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2'
        >
          <ArrowLeft className='w-4 h-4' /> {t('back')}
        </button>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
          {t('createPatient.title')}
        </h1>
      </div>

      {error && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm'>
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4'
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div ref={fieldRefs.nomPatient}>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              {t('createPatient.field_lastname')} <span className='text-red-500'>*</span>
            </label>
            <input
              name='nomPatient'
              value={form.nomPatient}
              onChange={handleChange}
              placeholder={t('createPatient.field_lastname')}
              className={inputClass('nomPatient')}
            />
            {fieldErrors.nomPatient && (
              <p className='text-xs text-red-600 mt-1'>{fieldErrors.nomPatient}</p>
            )}
            <p className='text-xs text-gray-400 mt-1'>
              {t('createPatient.field_lastname_hint')}
            </p>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              {t('createPatient.field_firstname')}
            </label>
            <input
              name='prenomPatient'
              value={form.prenomPatient}
              onChange={handleChange}
              placeholder={t('createPatient.field_firstname_placeholder')}
              className={inputClass('prenomPatient')}
            />
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <div ref={fieldRefs.dateNaissancePatient}>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              {t('createPatient.field_dob')} <span className='text-red-500'>*</span>
            </label>
            <input
              type='date'
              name='dateNaissancePatient'
              value={form.dateNaissancePatient}
              onChange={handleChange}
              className={inputClass('dateNaissancePatient')}
            />
            {fieldErrors.dateNaissancePatient && (
              <p className='text-xs text-red-600 mt-1'>{fieldErrors.dateNaissancePatient}</p>
            )}
          </div>
          <div ref={fieldRefs.genrePatient}>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              {t('createPatient.field_gender')} <span className='text-red-500'>*</span>
            </label>
            <select
              name='genrePatient'
              value={form.genrePatient}
              onChange={handleChange}
              className={inputClass('genrePatient')}
            >
              <option value=''>{t('createPatient.field_gender_placeholder')}</option>
              <option value='Homme'>{t('createPatient.field_gender_male')}</option>
              <option value='Femme'>{t('createPatient.field_gender_female')}</option>
            </select>
            {fieldErrors.genrePatient && (
              <p className='text-xs text-red-600 mt-1'>{fieldErrors.genrePatient}</p>
            )}
          </div>
          <div ref={fieldRefs.telephonePatient}>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              {t('createPatient.field_phone')}
            </label>
            <input
              type='tel'
              name='telephonePatient'
              value={form.telephonePatient}
              onChange={handleChange}
              placeholder={t('createPatient.field_phone_placeholder')}
              className={inputClass('telephonePatient')}
            />
            {fieldErrors.telephonePatient && (
              <p className='text-xs text-red-600 mt-1'>{fieldErrors.telephonePatient}</p>
            )}
          </div>
        </div>

        <div className='border-t border-gray-200 dark:border-gray-700 pt-4'>
          <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3'>
            {t('createPatient.section_parents')}
          </h3>
          <p className='text-xs text-gray-400 mb-3'>
            {t('createPatient.parents_hint')}
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                {t('createPatient.field_father')}
              </label>
              <input
                name='nomPere'
                value={form.nomPere}
                onChange={handleChange}
                placeholder={t('createPatient.field_father_placeholder')}
                className={inputClass('nomPere')}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                {t('createPatient.field_mother')}
              </label>
              <input
                name='nomMere'
                value={form.nomMere}
                onChange={handleChange}
                placeholder={t('createPatient.field_mother_placeholder')}
                className={inputClass('nomMere')}
              />
            </div>
          </div>
        </div>

        <div className='border-t border-gray-200 dark:border-gray-700 pt-4'>
          <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3'>
            {t('createPatient.section_address')}
          </h3>
          <div>
            <input
              name='adresseRue'
              value={form.adresseRue}
              onChange={handleChange}
              placeholder={t('createPatient.field_street_placeholder')}
              className={inputClass('adresseRue') + ' mb-3'}
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <input
              name='adresseVille'
              value={form.adresseVille}
              onChange={handleChange}
              placeholder={t('createPatient.field_city_placeholder')}
              className={inputClass('adresseVille')}
            />

            <input
              name='adresseCodePostal'
              value={form.adresseCodePostal}
              onChange={handleChange}
              placeholder={t('createPatient.field_zip_placeholder')}
              className={inputClass('adresseCodePostal')}
            />
          </div>
        </div>

        <div className='border-t border-gray-200 dark:border-gray-700 pt-4'>
          <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3'>
            {t('createPatient.section_complementary')}
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                {t('createPatient.field_groupe_sanguin')}
              </label>
              <select name='groupeSanguinPatient' value={form.groupeSanguinPatient} onChange={handleChange}
                className={inputClass('groupeSanguinPatient')}>
                <option value=''>{t('createPatient.field_groupe_sanguin_placeholder')}</option>
                <option value='A'>{t('createPatient.field_groupe_sanguin_A')}</option>
                <option value='B'>{t('createPatient.field_groupe_sanguin_B')}</option>
                <option value='AB'>{t('createPatient.field_groupe_sanguin_AB')}</option>
                <option value='O'>{t('createPatient.field_groupe_sanguin_O')}</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                {t('createPatient.field_rhesus')}
              </label>
              <select name='rhesusPatient' value={form.rhesusPatient} onChange={handleChange}
                className={inputClass('rhesusPatient')}>
                <option value=''>{t('createPatient.field_rhesus_placeholder')}</option>
                <option value='Positif'>{t('createPatient.field_rhesus_positif')}</option>
                <option value='Negatif'>{t('createPatient.field_rhesus_negatif')}</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                {t('createPatient.field_profession')}
              </label>
              <input name='professionPatient' value={form.professionPatient} onChange={handleChange}
                placeholder={t('createPatient.field_profession_placeholder')}
                className={inputClass('professionPatient')} />
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                {t('createPatient.field_situation')}
              </label>
              <select name='situationMatrimonialePatient' value={form.situationMatrimonialePatient} onChange={handleChange}
                className={inputClass('situationMatrimonialePatient')}>
                <option value=''>{t('createPatient.field_situation_placeholder')}</option>
                <option value='Celibataire'>{t('createPatient.field_situation_celibataire')}</option>
                <option value='Marie'>{t('createPatient.field_situation_marie')}</option>
                <option value='Divorce'>{t('createPatient.field_situation_divorce')}</option>
                <option value='Veuf'>{t('createPatient.field_situation_veuf')}</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                {t('createPatient.field_religion')}
              </label>
              <input name='religionPatient' value={form.religionPatient} onChange={handleChange}
                placeholder={t('createPatient.field_religion')}
                className={inputClass('religionPatient')} />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                {t('createPatient.field_lieu_naissance')}
              </label>
              <input name='lieuNaissancePatient' value={form.lieuNaissancePatient} onChange={handleChange}
                placeholder={t('createPatient.field_lieu_naissance_placeholder')}
                className={inputClass('lieuNaissancePatient')} />
            </div>
          </div>
          <div className='mt-4'>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              {t('createPatient.field_pays')}
            </label>
            <input name='paysPatient' value={form.paysPatient} onChange={handleChange}
              placeholder={t('createPatient.field_pays_placeholder')}
              className={inputClass('paysPatient')} />
          </div>
        </div>

        <div className='flex gap-3 pt-2'>
          <button
            type='button'
            onClick={() => navigate('/patients')}
            className='px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm'
          >
            {t('cancel')}
          </button>
          <button
            type='submit'
            disabled={loading || checking}
            className='px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50'
          >
            {checking
              ? t('createPatient.checking')
              : loading
                ? t('createPatient.creating')
                : t('createPatient.create')}
          </button>
        </div>
      </form>

      {duplicates.length > 0 && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 max-w-lg w-full max-h-[80vh] flex flex-col'>
            <div className='p-5 border-b border-gray-200 dark:border-gray-800 flex items-start gap-3'>
              <div className='w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0'>
                <AlertTriangle className='w-5 h-5 text-amber-600' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  {t('createPatient.duplicate_title')}
                </h2>
                <p className='text-sm text-gray-500 mt-1'>
                  {t('createPatient.duplicate_text', { count: duplicates.length })}
                </p>
                <div className='flex flex-wrap gap-1.5 mt-2'>
                  {Array.from(new Set(duplicates.flatMap(d => d.matchedFields || []))).map(field => (
                    <span key={field} className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'>
                      {matchLabel(field)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className='overflow-y-auto p-5 space-y-3 flex-1'>
              {duplicates.map((p) => (
                <div
                  key={p.id}
                  className='flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                >
                  <div>
                    <p className='text-sm font-medium text-gray-900 dark:text-white'>
                      {fullName(p)}
                    </p>
                    <p className='text-xs text-gray-500 mt-0.5'>
                      {p.date_naissance_patient
                        ? new Date(p.date_naissance_patient).toLocaleDateString(
                            'fr-FR',
                          )
                        : '?'}{' '}
                      — {p.genre_patient || '-'}
                    </p>
                    {p.code_patient && (
                      <p className='text-xs font-mono text-primary-600 mt-0.5'>
                        {p.code_patient}
                      </p>
                    )}
                    {p.telephone_patient && (
                      <p className='text-xs text-gray-500'>
                        {p.telephone_patient}
                      </p>
                    )}
                    {(p.matchedFields || []).length > 0 && (
                      <div className='flex flex-wrap gap-1 mt-1.5'>
                        {p.matchedFields.map(field => (
                          <span key={field} className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'>
                            {matchLabel(field)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <a
                    href={`/patients/${p.id}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 shrink-0'
                  >
                    <Eye className='w-3.5 h-3.5' /> {t('view')}
                  </a>
                </div>
              ))}
            </div>

            <div className='p-5 border-t border-gray-200 dark:border-gray-800 flex gap-3 justify-end'>
              <button
                onClick={() => setDuplicates([])}
                className='px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm'
              >
                {t('createPatient.duplicate_back')}
              </button>
              <button
                onClick={doCreate}
                disabled={loading}
                className='px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50'
              >
                {loading ? t('createPatient.creating') : t('createPatient.duplicate_create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
