import api from './axios'

export const statisticsAPI = {
  admin: {
    overview: () => api.get('/api/statistics/admin/overview'),
    usersBySpecialtyMonthly: () => api.get('/api/statistics/admin/users-by-specialty-monthly'),
    usersByHospitalMonthly: () => api.get('/api/statistics/admin/users-by-hospital-monthly'),
    usersTotalBySpecialty: () => api.get('/api/statistics/admin/users-total-by-specialty'),
    usersTotalByHospital: () => api.get('/api/statistics/admin/users-total-by-hospital'),
    doctorsBySpecialty: (specialty) => api.get(`/api/statistics/admin/doctors-by-specialty/${encodeURIComponent(specialty)}`),
    usersByHospital: (hospital) => api.get(`/api/statistics/admin/users-by-hospital/${encodeURIComponent(hospital)}`),
  },
  doctor: {
    overview: () => api.get('/api/statistics/doctor/overview'),
    consultationsMonthly: (months = 12) => api.get(`/api/statistics/doctor/consultations-monthly?months=${months}`),
    patientsByGender: () => api.get('/api/statistics/doctor/patients-by-gender'),
    consultationsByStatus: () => api.get('/api/statistics/doctor/consultations-by-status'),
    consultationsBySpecialtyMonthly: (months = 12) => api.get(`/api/statistics/doctor/consultations-by-specialty-monthly?months=${months}`),
    patientsByHospitalMonthly: (months = 12) => api.get(`/api/statistics/doctor/patients-by-hospital-monthly?months=${months}`),
    patientsTotalByHospital: () => api.get('/api/statistics/doctor/patients-total-by-hospital'),
  },
  reception: {
    today: () => api.get('/api/statistics/reception/today'),
    overview: () => api.get('/api/statistics/reception/overview'),
  },
}
