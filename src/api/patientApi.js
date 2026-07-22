import api from './axios'

export const patientsAPI = {
  getAll: (params) => api.get('/api/patients', { params }),
  getById: (id) => api.get(`/api/patients/${id}`),
  create: (data) => api.post('/api/patients', data),
  update: (id, data) => api.put(`/api/patients/${id}`, data),
  delete: (id) => api.delete(`/api/patients/${id}`),
  checkDuplicates: (data) => api.post('/api/patients/check-duplicates', data),
  desactiver: (id) => api.put(`/api/patients/${id}/desactiver`),
  reactiver: (id) => api.put(`/api/patients/${id}/reactiver`),
  getAntecedents: (patientId) => api.get(`/api/patients/${patientId}/antecedents`),
  createAntecedent: (patientId, data) => api.post(`/api/patients/${patientId}/antecedents`, data),
  updateAntecedent: (patientId, id, data) => api.put(`/api/patients/${patientId}/antecedents/${id}`, data),
  deleteAntecedent: (patientId, id) => api.delete(`/api/patients/${patientId}/antecedents/${id}`),
}
