import { describe, test, expect, vi, beforeEach } from 'vitest'

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('../src/api/axios', () => ({ default: mockApi }))

const { usersAPI, authAPI } = await import('../src/api/userApi')

describe('authAPI', () => {
  beforeEach(() => vi.clearAllMocks())

  test('login should call POST /api/users/login', () => {
    const creds = { email: 'test@test.com', password: '1234' }
    authAPI.login(creds)
    expect(mockApi.post).toHaveBeenCalledWith('/api/users/login', creds)
  })

  test('registerAdmin should call POST /api/users/register/admin', () => {
    const data = { emailUser: 'new@test.com' }
    authAPI.registerAdmin(data)
    expect(mockApi.post).toHaveBeenCalledWith('/api/users/register/admin', data)
  })
})

describe('usersAPI', () => {
  beforeEach(() => vi.clearAllMocks())

  test('getAll should call GET /api/users/users with params', () => {
    usersAPI.getAll({ hopital: 'Central' })
    expect(mockApi.get).toHaveBeenCalledWith('/api/users/users', { params: { hopital: 'Central' } })
  })

  test('getById should call GET /api/users/users/:id', () => {
    usersAPI.getById('u1')
    expect(mockApi.get).toHaveBeenCalledWith('/api/users/users/u1')
  })

  test('create should call POST /api/users/register', () => {
    const data = { emailUser: 'new@test.com' }
    usersAPI.create(data)
    expect(mockApi.post).toHaveBeenCalledWith('/api/users/register', data)
  })

  test('update should call PUT /api/users/users/:id', () => {
    const data = { nameUser: 'Updated' }
    usersAPI.update('u1', data)
    expect(mockApi.put).toHaveBeenCalledWith('/api/users/users/u1', data)
  })

  test('delete should call DELETE /api/users/users/:id', () => {
    usersAPI.delete('u1')
    expect(mockApi.delete).toHaveBeenCalledWith('/api/users/users/u1')
  })
})
