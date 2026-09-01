/**
 * Utilitaires pour les packs
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
 * Obtient la couleur du type pour l'affichage
 */
export const getTypeColor = (type?: string): 'primary' | 'secondary' | 'info' => {
  switch (type) {
    case 'produit':
      return 'primary'
    case 'outil':
      return 'secondary'
    case 'service':
      return 'info'
    default:
      return 'primary'
  }
}

/**
 * Obtient le label du type en français
 */
export const getTypeLabel = (type?: string): string => {
  switch (type) {
    case 'produit':
      return 'Produit'
    case 'outil':
      return 'Outil'
    case 'service':
      return 'Service'
    default:
      return 'Inconnu'
  }
}

/**
 * Formate un prix en XOF
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(price)
}

