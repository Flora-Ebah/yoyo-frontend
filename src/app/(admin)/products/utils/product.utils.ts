export const getStatusColor = (status?: string): 'success' | 'error' | 'warning' | 'default' | 'info' => {
  const colors: Record<string, 'success' | 'error' | 'warning' | 'default' | 'info'> = {
    active: 'success',
    inactive: 'default',
    archived: 'warning',
    pending: 'warning',
    denied: 'error',
    'out-of-stock': 'error',
    removed: 'error'
  }

  return colors[status || ''] || 'default'
}

export const getStatusLabel = (status?: string): string => {
  const labels: Record<string, string> = {
    active: 'Actif',
    inactive: 'Inactif',
    archived: 'Archivé',
    pending: 'En attente',
    denied: 'Refusé',
    'out-of-stock': 'Rupture de stock',
    removed: 'Supprimé'
  }

  return labels[status || ''] || status || '-'
}

export const getImageUrl = (imageSlug?: string | string[]) => {
  const slug = Array.isArray(imageSlug) ? imageSlug[0] : imageSlug

  if (!slug) return '/images/avatars/1.png' // Fallback image
  if (slug.startsWith('http')) return slug

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1'

  return `${API_BASE_URL}/${API_VERSION}/file/${slug}`
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(price)
}

export const formatStoreName = (store: any): string => {
  if (typeof store === 'string') return store

  return store?.name || '-'
}

export const formatCategoryName = (category: any): string => {
  if (typeof category === 'string') return category

  return category?.name || '-'
}

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-'

  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatTypeExtraction = (type?: string): string => {
  const types: Record<string, string> = {
    afroid: 'À froid',
    achaud: 'À chaud'
  }

  return types[type || ''] || type || '-'
}

export const formatProductFormat = (format?: string): string => {
  const formats: Record<string, string> = {
    pot: 'Pot',
    bouteille: 'Bouteille'
  }

  return formats[format || ''] || format || '-'
}

export const formatComposantNaturel = (value?: string | boolean): string => {
  if (value === true || value === 'true') return 'Oui'
  if (value === false || value === 'false') return 'Non'

  return (value as string) || '-'
}
