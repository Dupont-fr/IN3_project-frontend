import api from './axios'

export const hospitalsAPI = {
  getAll: (params) => api.get('/api/users/hospitals', { params }),
  getById: (id) => api.get(`/api/users/hospitals/${id}`),
  create: (data) => api.post('/api/users/hospitals', data),
}

export const SPECIALTIES = [
  'Médecine générale',
  'Pédiatrie',
  'Cardiologie',
  'Gastroentérologie',
  'Ophtalmologie',
  'Dermatologie',
  'Gynécologie',
  'Neurologie',
  'Psychiatrie',
  'Radiologie',
  'Chirurgie générale',
  'Orthopédie',
  'Oto-rhino-laryngologie (ORL)',
  'Pneumologie',
  'Rhumatologie',
  'Urologie',
  'Anesthésiologie',
  'Oncologie',
  'Néonatologie',
  'Endocrinologie',
  'Hématologie',
  'Néphrologie',
  "Médecine d'urgence",
  'Médecine interne',
]
