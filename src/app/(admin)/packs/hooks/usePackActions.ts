import { useState } from 'react'
import { packService, type Pack } from '@/services/pack.service'

interface UsePackActionsParams {
  onDeleteSuccess?: () => void
}

export const usePackActions = ({ onDeleteSuccess }: UsePackActionsParams = {}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null)

  // Ouvrir le menu d'actions
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, pack: Pack) => {
    setAnchorEl(event.currentTarget)
    setSelectedPack(pack)
  }

  // Fermer le menu d'actions
  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedPack(null)
  }

  // Supprimer un pack
  const handleDelete = async () => {
    if (!selectedPack) return

    if (!confirm(`Êtes-vous sûr de vouloir supprimer le pack "${selectedPack.name}" ?`)) {
      handleMenuClose()

      return
    }

    try {
      await packService.delete(selectedPack._id)
      handleMenuClose()

      if (onDeleteSuccess) {
        onDeleteSuccess()
      }
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err)
      alert(err.message || 'Erreur lors de la suppression du pack')
    }
  }

  // Supprimer un pack directement (depuis une action texte)
  const deletePack = async (pack: Pack) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le pack "${pack.name}" ?`)) return

    try {
      await packService.delete(pack._id)

      if (onDeleteSuccess) {
        onDeleteSuccess()
      }
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err)
      alert(err.message || 'Erreur lors de la suppression du pack')
    }
  }

  return {
    anchorEl,
    selectedPack,
    handleMenuOpen,
    handleMenuClose,
    handleDelete,
    deletePack
  }
}

