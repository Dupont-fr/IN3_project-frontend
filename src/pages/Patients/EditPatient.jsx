import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { patientsAPI } from '../../api/patientApi'
import { useAuth } from '../../context/AuthContext'
import { hasPermission } from '../../utils/roleHelpers'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import Loader from '../../components/Loader'

export default function EditPatient() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation()
  const canEdit = hasPermission(user, 'canManagePatients')

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
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await patientsAPI.getById(id)
        const p = res.data.data
        setForm({
          prenomPatient: p.prenom_patient || '',
          nomPatient: p.nom_patient || '',
          dateNaissancePatient: p.date_naissance_patient ? p.date_naissance_patient.split('T')[0] : '',
          genrePatient: p.genre_patient || '',
          telephonePatient: p.telephone_patient || '',
          nomPere: p.nom_pere || '',
          nomMere: p.nom_mere || '',
          adresseRue: p.adresse_rue || '',
          adresseVille: p.adresse_ville || '',
          adresseCodePostal: p.adresse_code_postal || '',
          religionPatient: p.religion || '',
          situationMatrimonialePatient: p.situation_matrimoniale || '',
          paysPatient: p.pays || 'Cameroun',
          lieuNaissancePatient: p.lieu_naissance || '',
          groupeSanguinPatient: p.groupe_sanguin || '',
          rhesusPatient: p.rhesus || '',
          professionPatient: p.profession || '',
        })
      } catch {
        setError('Patient non trouvé')
      } finally {
        setFetching(false)
      }
    }
    fetch()
  }, [id])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canEdit) return
    setError('')
    const phone = form.telephonePatient?.replace(/\s/g, '')
    if (phone && !/^\d{9}$/.test(phone)) {
      setError(t('editPatient.phone_validation_error'))
      return
    }
    setLoading(true)
    try {
      await patientsAPI.update(id, form)
      navigate('/patients')
    } catch (err) {
      setError(err.response?.data?.message || t('editPatient.error'))
    } finally {
      setLoading(false)
    }
  }

      if (fetching) return <Loader />

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/patients')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft className="w-4 h-4" /> {t('back')}
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('editPatient.title')}</h1>
      </div>

      {!canEdit && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">{t('editPatient.readonly')}</div>
      )}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('editPatient.field_lastname')}</label>
            <input name="nomPatient" value={form.nomPatient} onChange={handleChange} required disabled={!canEdit}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('editPatient.field_firstname')}</label>
            <input name="prenomPatient" value={form.prenomPatient} onChange={handleChange} disabled={!canEdit}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('editPatient.field_dob')}</label>
            <input type="date" name="dateNaissancePatient" value={form.dateNaissancePatient} onChange={handleChange} required disabled={!canEdit}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('editPatient.field_gender')}</label>
            <select name="genrePatient" value={form.genrePatient} onChange={handleChange} required disabled={!canEdit}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60">
              <option value="">{t('editPatient.field_gender_placeholder')}</option>
              <option value="Homme">{t('editPatient.field_gender_male')}</option>
              <option value="Femme">{t('editPatient.field_gender_female')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('editPatient.field_phone')}</label>
            <input type="tel" name="telephonePatient" value={form.telephonePatient} onChange={handleChange} disabled={!canEdit}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('editPatient.section_parents')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('editPatient.field_father')}</label>
              <input name="nomPere" value={form.nomPere} onChange={handleChange} disabled={!canEdit}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('editPatient.field_mother')}</label>
              <input name="nomMere" value={form.nomMere} onChange={handleChange} disabled={!canEdit}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('editPatient.section_address')}</h3>
          <input name="adresseRue" value={form.adresseRue} onChange={handleChange} disabled={!canEdit}
            placeholder={t('editPatient.field_street_placeholder')}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60 mb-3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="adresseVille" value={form.adresseVille} onChange={handleChange} disabled={!canEdit}
              placeholder={t('editPatient.field_city_placeholder')}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
            <input name="adresseCodePostal" value={form.adresseCodePostal} onChange={handleChange} disabled={!canEdit}
              placeholder={t('editPatient.field_zip_placeholder')}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('editPatient.section_complementary')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('editPatient.field_groupe_sanguin')}</label>
              <select name="groupeSanguinPatient" value={form.groupeSanguinPatient} onChange={handleChange} disabled={!canEdit}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60">
                <option value="">{t('editPatient.field_groupe_sanguin_placeholder')}</option>
                <option value="A">{t('editPatient.field_groupe_sanguin_A')}</option>
                <option value="B">{t('editPatient.field_groupe_sanguin_B')}</option>
                <option value="AB">{t('editPatient.field_groupe_sanguin_AB')}</option>
                <option value="O">{t('editPatient.field_groupe_sanguin_O')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('editPatient.field_rhesus')}</label>
              <select name="rhesusPatient" value={form.rhesusPatient} onChange={handleChange} disabled={!canEdit}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60">
                <option value="">{t('editPatient.field_rhesus_placeholder')}</option>
                <option value="Positif">{t('editPatient.field_rhesus_positif')}</option>
                <option value="Negatif">{t('editPatient.field_rhesus_negatif')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('editPatient.field_profession')}</label>
              <input name="professionPatient" value={form.professionPatient} onChange={handleChange} disabled={!canEdit}
                placeholder={t('editPatient.field_profession_placeholder')}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('editPatient.field_situation')}</label>
              <select name="situationMatrimonialePatient" value={form.situationMatrimonialePatient} onChange={handleChange} disabled={!canEdit}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60">
                <option value="">{t('editPatient.field_situation_placeholder')}</option>
                <option value="Celibataire">{t('editPatient.field_situation_celibataire')}</option>
                <option value="Marie">{t('editPatient.field_situation_marie')}</option>
                <option value="Divorce">{t('editPatient.field_situation_divorce')}</option>
                <option value="Veuf">{t('editPatient.field_situation_veuf')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('editPatient.field_religion')}</label>
              <input name="religionPatient" value={form.religionPatient} onChange={handleChange} disabled={!canEdit}
                placeholder={t('editPatient.field_religion')}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('editPatient.field_lieu_naissance')}</label>
              <input name="lieuNaissancePatient" value={form.lieuNaissancePatient} onChange={handleChange} disabled={!canEdit}
                placeholder={t('editPatient.field_lieu_naissance_placeholder')}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('editPatient.field_pays')}</label>
            <input name="paysPatient" value={form.paysPatient} onChange={handleChange} disabled={!canEdit}
              placeholder={t('editPatient.field_pays_placeholder')}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-60" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/patients')}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">{t('cancel')}</button>
          {canEdit && (
            <button type="submit" disabled={loading}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50">
              {loading ? t('saving') : t('save')}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
