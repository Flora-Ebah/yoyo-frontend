import { useState } from 'react'
import { productService, type Product } from '@/services/product.service'

interface UseProductActionsParams {
  onSuccess?: () => void
}

export const useProductActions = ({ onSuccess }: UseProductActionsParams = {}) => {
  const [deleting, setDeleting] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const handleDelete = async (product: Product) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`)) {
      return
    }

    try {
      setDeleting(true)
      await productService.delete(product._id)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      alert(error.message || 'Erreur lors de la suppression du produit')
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = async (product: Product, newStatus: 'active' | 'inactive' | 'archived') => {
    try {
      setUpdatingStatus(product._id)
      await productService.update(product._id, { status: newStatus })

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

  const handleDisponibiliteChange = async (product: Product, disponibilite: boolean) => {
    try {
      setUpdatingStatus(product._id)
      await productService.update(product._id, { disponibilite })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la disponibilité:', error)
      alert(error.message || 'Erreur lors de la mise à jour de la disponibilité')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const deleteProduct = async (product: Product) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`)) return

    try {
      await productService.delete(product._id)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error)
      alert(error.message || 'Erreur lors de la suppression du produit')
    }
  }

  return {
    deleting,
    updatingStatus,
    handleDelete,
    handleStatusChange,
    handleDisponibiliteChange,
    deleteProduct
  }
}

