/**
 * Utilitaires pour les catégories
 */

/**
 * Vérifie si une catégorie est prédéfinie (slug commence par "ref-")
 */
export const isPredefinedCategory = (slug?: string): boolean => {
  return slug ? slug.startsWith('ref-') : false
}

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

