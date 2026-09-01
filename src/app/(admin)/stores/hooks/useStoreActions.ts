import { useState } from 'react'
import { storeService, type Store } from '@/services/store.service'

interface UseStoreActionsParams {
  onSuccess?: () => void
}

export const useStoreActions = ({ onSuccess }: UseStoreActionsParams = {}) => {
  const [deleting, setDeleting] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const handleDelete = async (store: Store) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la boutique "${store.name}" ?`)) {
      return
    }

    try {
      setDeleting(true)
      await storeService.delete(store._id)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      alert(error.message || 'Erreur lors de la suppression de la boutique')
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = async (store: Store, newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      setUpdatingStatus(store._id)
      await storeService.update(store._id, { status: newStatus })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut:', error)
      alert(error.message || 'Erreur lors de la mise à jour du statut')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const deleteStore = async (store: Store) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la boutique "${store.name}" ?`)) return

    try {
      await storeService.delete(store._id)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      alert(error.message || 'Erreur lors de la suppression de la boutique')
    }
  }

  return {
    deleting,
    updatingStatus,
    handleDelete,
    handleStatusChange,
    deleteStore
  }
}

