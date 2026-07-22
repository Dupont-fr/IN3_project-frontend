import { describe, test, expect, vi, beforeEach } from 'vitest'

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('../src/api/axios', () => ({ default: mockApi }))

const { patientsAPI } = await import('../src/api/patientApi')

describe('patientApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('getAll should call GET /api/patients with params', () => {
    patientsAPI.getAll({ search: 'Dupont', page: 1 })
    expect(mockApi.get).toHaveBeenCalledWith('/api/patients', { params: { search: 'Dupont', page: 1 } })
  })

  test('getById should call GET /api/patients/:id', () => {
    patientsAPI.getById(5)
    expect(mockApi.get).toHaveBeenCalledWith('/api/patients/5')
  })

  test('create should call POST /api/patients with data', () => {
    const data = { nomPatient: 'Dupont' }
    patientsAPI.create(data)
    expect(mockApi.post).toHaveBeenCalledWith('/api/patients', data)
  })

  test('update should call PUT /api/patients/:id', () => {
    const data = { nomPatient: 'Updated' }
    patientsAPI.update(5, data)
    expect(mockApi.put).toHaveBeenCalledWith('/api/patients/5', data)
  })

  test('delete should call DELETE /api/patients/:id', () => {
    patientsAPI.delete(5)
    expect(mockApi.delete).toHaveBeenCalledWith('/api/patients/5')
  })

  test('checkDuplicates should call POST /api/patients/check-duplicates', () => {
    const data = { nomPatient: 'Dupont' }
    patientsAPI.checkDuplicates(data)
    expect(mockApi.post).toHaveBeenCalledWith('/api/patients/check-duplicates', data)
  })

  test('desactiver should call PUT /api/patients/:id/desactiver', () => {
    patientsAPI.desactiver(5)
    expect(mockApi.put).toHaveBeenCalledWith('/api/patients/5/desactiver')
  })

  test('reactiver should call PUT /api/patients/:id/reactiver', () => {
    patientsAPI.reactiver(5)
    expect(mockApi.put).toHaveBeenCalledWith('/api/patients/5/reactiver')
  })
})
