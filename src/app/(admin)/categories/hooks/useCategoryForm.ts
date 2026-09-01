import { useState } from 'react'

import { categoryService, type Category, type CreateCategoryRequest } from '@/services/category.service'
import { isPredefinedCategory } from '../utils/category.utils'

interface UseCategoryFormParams {
  onSuccess?: () => void
}

export const useCategoryForm = ({ onSuccess }: UseCategoryFormParams = {}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    slug: '',
    content: '',
    parent: null,
    status: 'active'
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [parentCategories, setParentCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  // Charger les catégories disponibles pour le sélecteur de parent
  const loadParentCategories = async (excludeId?: string) => {
    try {
      const response = await categoryService.getParents({
        page: 1,
        limit: 1000,
        excludeId
      })

      setParentCategories(response.data)
    } catch (err) {
      console.error('Erreur lors du chargement des catégories parentes:', err)

      // Fallback: utiliser getAll si l'endpoint parents n'existe pas
      try {
        const fallbackResponse = await categoryService.getAll({
          page: 1,
          limit: 1000,
          onlyActive: true
        })

        setParentCategories(fallbackResponse.data)
      } catch (fallbackErr) {
        console.error('Erreur lors du chargement de fallback:', fallbackErr)
      }
    }
  }

  // Ouvrir le formulaire de création
  const handleCreate = async () => {
    setFormMode('create')
    setFormData({
      name: '',
      slug: '',
      content: '',
      parent: null,
      status: 'active'
    })
    setFormErrors({})
    setSelectedCategory(null)
    setDialogOpen(true)

    // Recharger les catégories parentes pour le sélecteur
    await loadParentCategories()
  }

  // Ouvrir le formulaire d'édition
  const handleEdit = async (category: Category) => {
    // Vérifier si c'est une catégorie prédéfinie
    if (isPredefinedCategory(category.slug)) {
      alert('Impossible de modifier une catégorie prédéfinie. Les catégories avec un slug commençant par "ref-" sont générées automatiquement et ne peuvent pas être modifiées.')

      return false
    }

    setFormMode('edit')
    setSelectedCategory(category)
    setFormData({
      slug: category.slug,
      name: category.name,
      content: category.content || '',
      parent: typeof category.parent === 'string'
        ? category.parent
        : category.parent?._id || null,
      status: category.status || 'active'
    })
    setFormErrors({})
    setDialogOpen(true)

    // Recharger les catégories parentes (en excluant la catégorie courante)
    await loadParentCategories(category._id)

    return true
  }

  // Soumettre le formulaire
  const handleSubmit = async () => {
    // Validation
    const errors: Record<string, string> = {}

    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Le nom est requis'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)

      return
    }

    try {
      setSubmitting(true)

      if (formMode === 'create') {
        await categoryService.create(formData)
      } else if (selectedCategory) {
        await categoryService.update(selectedCategory._id, formData)
      }

      setDialogOpen(false)
      await loadParentCategories()

      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err)

      setFormErrors({ submit: err.message || 'Erreur lors de la sauvegarde' })
    } finally {
      setSubmitting(false)
    }
  }

  // Fermer le formulaire
  const handleClose = () => {
    setDialogOpen(false)
    setFormErrors({})
    setSelectedCategory(null)
  }

  return {
    dialogOpen,
    formMode,
    formData,
    setFormData,
    formErrors,
    submitting,
    parentCategories,
    selectedCategory,
    handleCreate,
    handleEdit,
    handleSubmit,
    handleClose
  }
}

