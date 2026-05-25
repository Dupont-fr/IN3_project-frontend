import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { usersAPI } from '../../api/userApi'
import { ROLE_LABELS, ROLE_BADGES } from '../../utils/roleHelpers'
import { Search } from 'lucide-react'

export default function UserList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [filterRole, setFilterRole] = useState('')
  const [search, setSearch] = useState('')

  const fetchUsers = useCallback(async () => {
    try {
      const params = {}
      if (filterRole) params.roleUser = filterRole
      if (search) params.search = search
      const res = await usersAPI.getAll(params)
      setUsers(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur chargement')
    } finally {
      setLoading(false)
    }
  }, [filterRole, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleDelete = async (id) => {
    try {
      await usersAPI.delete(id)
      setUsers((prev) => prev.filter((u) => u._id !== id))
      setDeleteId(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur suppression')
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Chargement...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} utilisateur(s)</p>
        </div>
        <Link
          to="/users/create"
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nouvel utilisateur
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
        >
          <option value="">Tous les rôles</option>
          <option value="ADMIN">Administrateur</option>
          <option value="MEDECIN">Médecin</option>
          <option value="ACCUEIL">Accueil</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Hôpital</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Spécialité</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Créé le</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">Aucun utilisateur</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 text-sm font-medium">
                          {user.nameUser?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{user.nameUser}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.emailUser}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${ROLE_BADGES[user.roleUser] || ''}`}>
                        {ROLE_LABELS[user.roleUser] || user.roleUser}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.hospitalUser || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.specialtyUser || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAtUser).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/users/${user._id}/edit`}
                          className="px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        >
                          Modifier
                        </Link>
                        {deleteId === user._id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              Confirmer
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              className="px-3 py-1.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteId(user._id)}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
