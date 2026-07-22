export const ROLES = {
  ADMIN: 'ADMIN',
  MEDECIN: 'MEDECIN',
  ACCUEIL: 'ACCUEIL',
}

export const ROLE_LABELS = {
  ADMIN: 'Administrateur',
  MEDECIN: 'Médecin',
  ACCUEIL: 'Accueil',
}

export const ROLE_BADGES = {
  ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  MEDECIN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ACCUEIL: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
}

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    canViewUsers: true,
    canManageUsers: true,
    canViewPatients: false,
    canManagePatients: false,
    canViewConsultations: false,
    canManageConsultations: false,
    canCreateConsultation: false,
    canManageHospitals: true,
    canViewStatistics: true,
    label: 'Gestion du système',
  },
  [ROLES.MEDECIN]: {
    canViewUsers: false,
    canManageUsers: false,
    canViewPatients: true,
    canManagePatients: true,
    canDeletePatient: true,
    canViewConsultations: true,
    canManageConsultations: true,
    canCreateConsultation: true,
    canViewStatistics: true,
    label: 'Soins médicaux',
  },
  [ROLES.ACCUEIL]: {
    canViewUsers: false,
    canManageUsers: false,
    canViewPatients: true,
    canManagePatients: true,
    canViewConsultations: true,
    canManageConsultations: false,
    canCreateConsultation: true,
    canViewStatistics: false,
    label: 'Accueil & Patients',
  },
}

export function hasPermission(user, permission) {
  if (!user) return false
  const perms = ROLE_PERMISSIONS[user.roleUser]
  return perms ? perms[permission] || false : false
}

export function userCan(role, action) {
  const perms = ROLE_PERMISSIONS[role]
  return perms ? perms[action] || false : false
}
