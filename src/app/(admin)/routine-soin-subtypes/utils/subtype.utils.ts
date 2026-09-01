import type { RoutineSoinSubTypeStatus, RoutineSoinType, RoutineSoinSubTypeFieldInputType } from '@/services/routine-soin-subtype.service'

export const ROUTINE_SOIN_TYPES: { value: RoutineSoinType; label: string }[] = [
  { value: 'entretien', label: 'Entretien' },
  { value: 'restructuration', label: 'Restructuration' }
]

export const ROUTINE_SOIN_SUBTYPE_STATUSES: { value: RoutineSoinSubTypeStatus; label: string }[] = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' }
]

export const ROUTINE_SOIN_SUBTYPE_FIELD_INPUT_TYPES: { value: RoutineSoinSubTypeFieldInputType; label: string }[] = [
  { value: 'text', label: 'Texte' },
  { value: 'number', label: 'Nombre' },
  { value: 'select', label: 'Liste (select)' },
  { value: 'boolean', label: 'Oui / Non' },
  { value: 'date', label: 'Date' },
  { value: 'textarea', label: 'Zone de texte' }
]

export const getRoutineSoinTypeLabel = (type?: string) => {
  const found = ROUTINE_SOIN_TYPES.find(t => t.value === type)

  return found?.label || type || '-'
}

export const getStatusLabel = (status?: string) => {
  const found = ROUTINE_SOIN_SUBTYPE_STATUSES.find(s => s.value === status)

  return found?.label || status || '-'
}

export const getStatusColor = (status?: RoutineSoinSubTypeStatus) => {
  switch (status) {
    case 'active':
      return 'success' as const
    case 'inactive':
      return 'warning' as const
    default:
      return 'default' as const
  }
}

