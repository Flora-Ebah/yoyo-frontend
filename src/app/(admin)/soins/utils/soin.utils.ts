/**
 * Utilitaires pour les soins
 */

/**
 * Obtient la couleur du statut pour l'affichage
 */
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

/**
 * Obtient le label du statut en français
 */
export const getStatusLabel = (status?: string): string => {
  switch (status) {
    case 'active':
      return 'Actif'
    case 'inactive':
      return 'Inactif'
    case 'archived':
      return 'Archivé'
    default:
      return 'Inconnu'
  }
}

/**
 * Formate le nom complet de l'utilisateur
 */
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

