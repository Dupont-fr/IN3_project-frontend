import { describe, test, expect, vi, beforeEach } from 'vitest'

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('../src/api/axios', () => ({ default: mockApi }))

const { hospitalsAPI } = await import('../src/api/hospitalApi')

describe('hospitalApi', () => {
  beforeEach(() => vi.clearAllMocks())

  test('getAll should call GET /api/users/hospitals with params', () => {
    hospitalsAPI.getAll()
    expect(mockApi.get).toHaveBeenCalledWith('/api/users/hospitals', { params: undefined })
  })

  test('getById should call GET /api/users/hospitals/:id', () => {
    hospitalsAPI.getById(1)
    expect(mockApi.get).toHaveBeenCalledWith('/api/users/hospitals/1')
  })

  test('create should call POST /api/users/hospitals', () => {
    const data = { nameHospital: 'Central' }
    hospitalsAPI.create(data)
    expect(mockApi.post).toHaveBeenCalledWith('/api/users/hospitals', data)
  })

  test('update should call PUT /api/users/hospitals/:id', () => {
    const data = { nameHospital: 'Updated' }
    hospitalsAPI.update(1, data)
    expect(mockApi.put).toHaveBeenCalledWith('/api/users/hospitals/1', data)
  })

  test('delete should call DELETE /api/users/hospitals/:id', () => {
    hospitalsAPI.delete(1)
    expect(mockApi.delete).toHaveBeenCalledWith('/api/users/hospitals/1')
  })
})
