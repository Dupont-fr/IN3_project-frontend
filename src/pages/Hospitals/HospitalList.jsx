import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { hospitalsAPI } from '../../api/hospitalApi'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Building2 } from 'lucide-react'
import Loader from '../../components/Loader'

export default function HospitalList() {
  const { t } = useTranslation()
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  const fetchHospitals = useCallback(async () => {
    try {
      const params = {}
      if (search) params.search = search
      const res = await hospitalsAPI.getAll(params)
      setHospitals(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || t('hospitalList.error'))
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchHospitals() }, [fetchHospitals])

  const handleDelete = async (id) => {
    try {
      await hospitalsAPI.delete(id)
      setHospitals((prev) => prev.filter((h) => h._id !== id))
      setDeleteId(null)
    } catch (err) {
      setError(err.response?.data?.message || t('hospitalList.delete_error'))
    }
  }

  if (loading) return <Loader />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('hospitalList.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('hospitalList.count', { count: hospitals.length })}</p>
        </div>
        <Link
          to="/hospitals/create"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('hospitalList.new')}
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('hospitalList.search')}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hospitals.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">{t('hospitalList.no_hospitals')}</div>
        ) : (
          hospitals.map((hospital) => (
            <div
              key={hospital._id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{hospital.nameHospital}</h3>
                  </div>
                </div>
              </div>

              {hospital.servicesHospital?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">{t('hospitalList.services')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {hospital.servicesHospital.map((s, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <Link
                  to={`/hospitals/${hospital._id}/edit`}
                  className="px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                >
                  {t('edit')}
                </Link>
                {deleteId === hospital._id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDelete(hospital._id)}
                      className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      {t('confirm')}
                    </button>
                    <button
                      onClick={() => setDeleteId(null)}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteId(hospital._id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    {t('delete')}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
