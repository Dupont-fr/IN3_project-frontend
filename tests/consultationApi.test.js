import { describe, test, expect, vi, beforeEach } from 'vitest'

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('../src/api/axios', () => ({ default: mockApi }))

const { consultationsAPI } = await import('../src/api/consultationApi')

describe('consultationApi', () => {
  beforeEach(() => vi.clearAllMocks())

  test('getAll should call GET /api/consultations with params', () => {
    consultationsAPI.getAll({ page: 1 })
    expect(mockApi.get).toHaveBeenCalledWith('/api/consultations', { params: { page: 1 } })
  })

  test('getById should call GET /api/consultations/:id', () => {
    consultationsAPI.getById(5)
    expect(mockApi.get).toHaveBeenCalledWith('/api/consultations/5')
  })

  test('create should call POST /api/consultations/register', () => {
    const data = { motifConsultation: 'Fièvre', patientId: 1 }
    consultationsAPI.create(data)
    expect(mockApi.post).toHaveBeenCalledWith('/api/consultations/register', data)
  })

  test('update should call PUT /api/consultations/:id', () => {
    const data = { observations: 'RAS' }
    consultationsAPI.update(5, data)
    expect(mockApi.put).toHaveBeenCalledWith('/api/consultations/5', data)
  })

  test('delete should call DELETE /api/consultations/:id', () => {
    consultationsAPI.delete(5)
    expect(mockApi.delete).toHaveBeenCalledWith('/api/consultations/5')
  })
})
