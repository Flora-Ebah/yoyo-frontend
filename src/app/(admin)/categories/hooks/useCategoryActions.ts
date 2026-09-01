import { useState } from 'react'
import { categoryService, type Category } from '@/services/category.service'
import { isPredefinedCategory } from '../utils/category.utils'

interface UseCategoryActionsParams {
  onDeleteSuccess?: () => void
}

export const useCategoryActions = ({ onDeleteSuccess }: UseCategoryActionsParams = {}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  // Ouvrir le menu d'actions
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, category: Category) => {
    setAnchorEl(event.currentTarget)
    setSelectedCategory(category)
  }

  // Fermer le menu d'actions
  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedCategory(null)
  }

  // Supprimer une catégorie (directement, pour une action texte)
  const deleteCategory = async (category: Category) => {
    if (!category) return

    if (isPredefinedCategory(category.slug)) {
      alert('Impossible de supprimer une catégorie prédéfinie. Les catégories avec un slug commençant par "ref-" sont générées automatiquement et ne peuvent pas être supprimées.')

      return
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) {
      return
    }

    try {
      await categoryService.delete(category._id)

      if (onDeleteSuccess) {
        onDeleteSuccess()
      }
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err)
      alert(err.message || 'Erreur lors de la suppression de la catégorie')
    }
  }

  // Conservé pour le menu (utilise la catégorie sélectionnée)
  const handleDelete = async () => {
    if (!selectedCategory) return
    await deleteCategory(selectedCategory)
    handleMenuClose()
  }

  return {
    anchorEl,
    selectedCategory,
    handleMenuOpen,
    handleMenuClose,
    handleDelete,
    deleteCategory
  }
}

