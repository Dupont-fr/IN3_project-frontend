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
    canViewPatients: true,
    canManagePatients: false,
    canViewConsultations: true,
    canManageConsultations: false,
    label: 'Gestion des utilisateurs',
  },
  [ROLES.MEDECIN]: {
    canViewUsers: false,
    canManageUsers: false,
    canViewPatients: true,
    canManagePatients: true,
    canViewConsultations: true,
    canManageConsultations: true,
    label: 'Soins médicaux',
  },
  [ROLES.ACCUEIL]: {
    canViewUsers: false,
    canManageUsers: false,
    canViewPatients: true,
    canManagePatients: true,
    canViewConsultations: true,
    canManageConsultations: false,
    label: 'Accueil & Patients',
  },
}

export function hasPermission(user, permission) {
  if (!user) return false
  if (user.role === ROLES.ADMIN && permission.startsWith('canView')) return true
  const perms = ROLE_PERMISSIONS[user.role]
  return perms ? perms[permission] || false : false
}

export function userCan(role, action) {
  if (role === ROLES.ADMIN && action.startsWith('canView')) return true
  const perms = ROLE_PERMISSIONS[role]
  return perms ? perms[action] || false : false
}
