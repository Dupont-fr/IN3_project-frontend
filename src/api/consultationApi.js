import api from './axios'

export const consultationsAPI = {
  getAll: (params) => api.get('/api/consultations', { params }),
  getById: (id) => api.get(`/api/consultations/${id}`),
  create: (data) => api.post('/api/consultations/register', data),
  update: (id, data) => api.put(`/api/consultations/${id}`, data),
  delete: (id) => api.delete(`/api/consultations/${id}`),
}
