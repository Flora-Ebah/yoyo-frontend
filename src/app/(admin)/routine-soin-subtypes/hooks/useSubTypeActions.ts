import { useState } from 'react'

import { routineSoinSubTypeService, type RoutineSoinSubType } from '@/services/routine-soin-subtype.service'

interface UseSubTypeActionsParams {
  onDeleteSuccess?: () => void
}

export const useSubTypeActions = ({ onDeleteSuccess }: UseSubTypeActionsParams = {}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedSubType, setSelectedSubType] = useState<RoutineSoinSubType | null>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, subType: RoutineSoinSubType) => {
    setAnchorEl(event.currentTarget)
    setSelectedSubType(subType)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedSubType(null)
  }

  const handleDelete = async () => {
    if (!selectedSubType) return

    if (!confirm(`Êtes-vous sûr de vouloir supprimer le sous-type "${selectedSubType.name}" ?`)) {
      handleMenuClose()
      return
    }

    try {
      await routineSoinSubTypeService.delete(selectedSubType._id)
      handleMenuClose()
      onDeleteSuccess?.()
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err)
      alert(err.message || 'Erreur lors de la suppression du sous-type')
    }
  }

  const deleteSubType = async (subType: RoutineSoinSubType) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le sous-type "${subType.name}" ?`)) return

    try {
      await routineSoinSubTypeService.delete(subType._id)
      onDeleteSuccess?.()
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err)
      alert(err.message || 'Erreur lors de la suppression du sous-type')
    }
  }

  return {
    anchorEl,
    selectedSubType,
    handleMenuOpen,
    handleMenuClose,
    handleDelete,
    deleteSubType
  }
}

