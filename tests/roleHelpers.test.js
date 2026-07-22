import { describe, test, expect, beforeEach } from 'vitest'

let roleHelpers

beforeEach(async () => {
  roleHelpers = await import('../src/utils/roleHelpers')
})

test('should define ROLES object', () => {
  expect(roleHelpers.ROLES).toBeDefined()
  expect(roleHelpers.ROLES.ADMIN).toBe('ADMIN')
  expect(roleHelpers.ROLES.MEDECIN).toBe('MEDECIN')
  expect(roleHelpers.ROLES.ACCUEIL).toBe('ACCUEIL')
})

test('hasPermission checks user object role', () => {
  const { hasPermission, ROLES } = roleHelpers
  const admin = { roleUser: ROLES.ADMIN }
  const medecin = { roleUser: ROLES.MEDECIN }
  const accueil = { roleUser: ROLES.ACCUEIL }

  expect(hasPermission(admin, 'canManageUsers')).toBe(true)
  expect(hasPermission(admin, 'canManageHospitals')).toBe(true)
  expect(hasPermission(admin, 'canViewPatients')).toBe(false)

  expect(hasPermission(medecin, 'canViewPatients')).toBe(true)
  expect(hasPermission(medecin, 'canManagePatients')).toBe(true)
  expect(hasPermission(medecin, 'canViewConsultations')).toBe(true)
  expect(hasPermission(medecin, 'canCreateConsultation')).toBe(true)
  expect(hasPermission(medecin, 'canManageUsers')).toBe(false)

  expect(hasPermission(accueil, 'canViewPatients')).toBe(true)
  expect(hasPermission(accueil, 'canManagePatients')).toBe(true)
  expect(hasPermission(accueil, 'canViewConsultations')).toBe(true)
  expect(hasPermission(accueil, 'canCreateConsultation')).toBe(true)
  expect(hasPermission(accueil, 'canManageConsultations')).toBe(false)
  expect(hasPermission(accueil, 'canManageUsers')).toBe(false)
})

test('userCan checks role string directly', () => {
  const { userCan, ROLES } = roleHelpers

  expect(userCan(ROLES.ADMIN, 'canManageUsers')).toBe(true)
  expect(userCan(ROLES.ADMIN, 'canViewPatients')).toBe(false)

  expect(userCan(ROLES.MEDECIN, 'canViewPatients')).toBe(true)
  expect(userCan(ROLES.MEDECIN, 'canManageUsers')).toBe(false)

  expect(userCan(ROLES.ACCUEIL, 'canViewPatients')).toBe(true)
  expect(userCan(ROLES.ACCUEIL, 'canManageConsultations')).toBe(false)
})

test('hasPermission returns false for null user', () => {
  const { hasPermission } = roleHelpers
  expect(hasPermission(null, 'canViewPatients')).toBe(false)
  expect(hasPermission(undefined, 'canManageUsers')).toBe(false)
})
