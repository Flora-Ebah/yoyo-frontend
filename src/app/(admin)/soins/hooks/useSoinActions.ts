import { useState } from 'react'
import { soinService, type Soin } from '@/services/soin.service'

interface UseSoinActionsParams {
  onDeleteSuccess?: () => void
}

export const useSoinActions = ({ onDeleteSuccess }: UseSoinActionsParams = {}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedSoin, setSelectedSoin] = useState<Soin | null>(null)

  // Ouvrir le menu d'actions
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, soin: Soin) => {
    setAnchorEl(event.currentTarget)
    setSelectedSoin(soin)
  }

  // Fermer le menu d'actions
  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedSoin(null)
  }

  // Supprimer un soin
  const handleDelete = async () => {
    if (!selectedSoin) return

    if (!confirm(`Êtes-vous sûr de vouloir supprimer le soin "${selectedSoin.title}" ?`)) {
      handleMenuClose()

      return
    }

    try {
      await soinService.delete(selectedSoin.slug)
      handleMenuClose()

      if (onDeleteSuccess) {
        onDeleteSuccess()
      }
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err)
      alert(err.message || 'Erreur lors de la suppression du soin')
    }
  }

  // Supprimer un soin directement (depuis une action texte)
  const deleteSoin = async (soin: Soin) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le soin "${soin.title}" ?`)) return

    try {
      await soinService.delete(soin.slug)

      if (onDeleteSuccess) {
        onDeleteSuccess()
      }
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err)
      alert(err.message || 'Erreur lors de la suppression du soin')
    }
  }

  return {
    anchorEl,
    selectedSoin,
    handleMenuOpen,
    handleMenuClose,
    handleDelete,
    deleteSoin
  }
}

