export const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    boutique: 'Boutique',
    'salon-coiffure-homme': 'Salon Homme',
    'salon-coiffure-femme': 'Salon Femme',
    'salon-coiffure-mixte': 'Salon Mixte'
  }
  return labels[type] || type
}

export const getTypeColor = (type: string): 'primary' | 'success' | 'warning' | 'info' => {
  const colors: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    boutique: 'primary',
    'salon-coiffure-homme': 'info',
    'salon-coiffure-femme': 'success',
    'salon-coiffure-mixte': 'warning'
  }
  return colors[type] || 'primary'
}

export const getStatusColor = (status?: string): 'success' | 'error' | 'warning' | 'default' => {
  const colors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
    active: 'success',
    inactive: 'default',
    suspended: 'error'
  }
  return colors[status || ''] || 'default'
}

export const getStatusLabel = (status?: string): string => {
  const labels: Record<string, string> = {
    active: 'Actif',
    inactive: 'Inactif',
    suspended: 'Suspendu'
  }
  return labels[status || ''] || status || '-'
}

export const formatOwnerName = (owner: any): string => {
  if (typeof owner === 'string') return owner
  if (owner?.firstname || owner?.lastname) {
    return `${owner.firstname || ''} ${owner.lastname || ''}`.trim() || owner.email || owner.username || '-'
  }
  return owner?.email || owner?.username || '-'
}

