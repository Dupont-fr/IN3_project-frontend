import api from './axios'

export const consultationsAPI = {
  getAll: (params) => api.get('/api/consultations', { params }),
  getById: (id) => api.get(`/api/consultations/${id}`),
  create: (data) => api.post('/api/consultations/register', data),
  update: (id, data) => api.put(`/api/consultations/${id}`, data),
  delete: (id) => api.delete(`/api/consultations/${id}`),
  transfer: (id, data) => api.put(`/api/consultations/${id}/transfer`, data),
}

export const examensAPI = {
  create: (data) => api.post('/api/consultations/examens', data),
  getByConsultation: (consultationId) => api.get(`/api/consultations/${consultationId}/examens`),
  getByHospital: () => api.get('/api/consultations/examens/hospital'),
  getPending: () => api.get('/api/consultations/examens/pending'),
  getById: (id) => api.get(`/api/consultations/examens/${id}`),
  updateResult: (id, data) => api.put(`/api/consultations/examens/${id}/result`, data),
}

export const notificationsAPI = {
  getAll: (params) => api.get('/api/consultations/notifications', { params }),
  getUnreadCount: () => api.get('/api/consultations/notifications/unread-count'),
  markRead: (id) => api.put(`/api/consultations/notifications/${id}/read`),
  markAllRead: () => api.put('/api/consultations/notifications/read-all'),
}
