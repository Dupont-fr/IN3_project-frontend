import api from './axios'

export const patientsAPI = {
  getAll: (params) => api.get('/api/patients', { params }),
  getById: (id) => api.get(`/api/patients/${id}`),
  create: (data) => api.post('/api/patients/register', data),
  update: (id, data) => api.put(`/api/patients/${id}`, data),
  delete: (id) => api.delete(`/api/patients/${id}`),
}
