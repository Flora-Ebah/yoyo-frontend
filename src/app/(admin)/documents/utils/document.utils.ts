export const getStatusColor = (status?: string): 'success' | 'default' | 'error' => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'default'
    case 'archived':
      return 'error'
    default:
      return 'default'
  }
}

export const getStatusLabel = (status?: string): string => {
  switch (status) {
    case 'active':
      return 'Actif'
    case 'inactive':
      return 'Inactif'
    case 'archived':
      return 'Archive'
    default:
      return 'Inconnu'
  }
}

export const formatUserName = (user?: {
  firstname?: string
  lastname?: string
  username?: string
  email?: string
}): string => {
  if (!user) return 'Inconnu'

  if (user.firstname && user.lastname) {
    return `${user.firstname} ${user.lastname}`
  }

  if (user.firstname) {
    return user.firstname
  }

  if (user.username) {
    return user.username
  }

  if (user.email) {
    return user.email
  }

  return 'Inconnu'
}

export const DOCUMENT_TYPES = [
  { value: 'cgu', label: 'CGU' },
  { value: 'mentions-legales', label: 'Mentions legales' },
  { value: 'regles-communautaires', label: 'Regles communautaires' },
  { value: 'autre', label: 'Autre' }
]

export const getDocumentTypeLabel = (type?: string): string => {
  if (!type) return 'Non defini'
  const match = DOCUMENT_TYPES.find(item => item.value === type)
  return match?.label || type
}

