/**
 * Utilitaires pour le module user
 */

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned' | 'pending'
export type UserRole = 'admin' | 'user' | 'provider'

/**
 * Vérifie si une catégorie est prédéfinie
 */
export function getStatusColor(status?: UserStatus): 'success' | 'error' | 'warning' | 'info' | 'default' {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'default'
    case 'suspended':
      return 'warning'
    case 'banned':
      return 'error'
    case 'pending':
      return 'info'
    default:
      return 'default'
  }
}

/**
 * Retourne le libellé du statut
 */
export function getStatusLabel(status?: UserStatus): string {
  switch (status) {
    case 'active':
      return 'Actif'
    case 'inactive':
      return 'Inactif'
    case 'suspended':
      return 'Suspendu'
    case 'banned':
      return 'Banni'
    case 'pending':
      return 'En attente'
    default:
      return 'Inconnu'
  }
}

/**
 * Retourne la couleur du rôle
 */
export function getRoleColor(role?: UserRole): 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' {
  switch (role) {
    case 'admin':
      return 'error'
    case 'provider':
      return 'warning'
    case 'user':
      return 'primary'
    default:
      return 'primary'
  }
}

/**
 * Retourne le libellé du rôle
 */
export function getRoleLabel(role?: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Administrateur'
    case 'provider':
      return 'Prestataire'
    case 'user':
      return 'Utilisateur'
    default:
      return 'Inconnu'
  }
}

/**
 * Formate le nom complet de l'utilisateur
 */
export function formatUserName(user: { firstname?: string; lastname?: string; username?: string; email?: string }): string {
  if (user.firstname && user.lastname) {
    return `${user.firstname} ${user.lastname}`
  }
  if (user.firstname) {
    return user.firstname
  }
  if (user.lastname) {
    return user.lastname
  }
  if (user.username) {
    return user.username
  }
  if (user.email) {
    return user.email
  }
  return 'Utilisateur sans nom'
}




