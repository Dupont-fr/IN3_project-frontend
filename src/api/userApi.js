import api from './axios'

export const authAPI = {
  login: (credentials) => api.post('/api/users/login', credentials),
  registerAdmin: (data) => api.post('/api/users/register/admin', data),
}

export const usersAPI = {
  getAll: (params) => api.get('/api/users/users', { params }),
  getById: (id) => api.get(`/api/users/users/${id}`),
  create: (data) => api.post('/api/users/register', data),
  update: (id, data) => api.put(`/api/users/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/users/${id}`),
}
