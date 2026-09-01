import { useEffect, useState } from 'react'

import type { Category } from '@/services/category.service'
import { categoryService } from '@/services/category.service'
import { soinService, type CreateSoinRequest, type Soin, type UpdateSoinRequest } from '@/services/soin.service'

interface UseSoinFormParams {
  onSuccess?: () => void
}

export const useSoinForm = ({ onSuccess }: UseSoinFormParams = {}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  const [formData, setFormData] = useState<CreateSoinRequest | UpdateSoinRequest>({
    title: '',
    content: '',
    category: ''
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [selectedSoin, setSelectedSoin] = useState<Soin | null>(null)
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  // Charger les catégories disponibles (enfants de ref-gestion-soin)
  const loadCategories = async () => {
    try {
      setLoadingCategories(true)

      const response = await categoryService.getByParentSlug('gestion-soin', {
        page: 1,
        limit: 100,
        onlyActive: true
      })

      setAvailableCategories(response.data || [])
    } catch (err: any) {
      console.error('Erreur lors du chargement des catégories:', err)
    } finally {
      setLoadingCategories(false)
    }
  }

  useEffect(() => {
    if (dialogOpen) {
      loadCategories()
    }
  }, [dialogOpen])

  // Ouvrir le formulaire de création
  const handleCreate = async () => {
    setFormMode('create')
    setFormData({
      title: '',
      content: '',
      category: ''
    })
    setFormErrors({})
    setSelectedSoin(null)
    setDialogOpen(true)
  }

  // Ouvrir le formulaire d'édition
  const handleEdit = async (soin: Soin) => {
    try {
      setFormMode('edit')
      setSelectedSoin(soin)

      // Charger le soin complet avec le contenu depuis l'API
      const fullSoin = await soinService.getBySlug(soin.slug)

      setFormData({
        title: fullSoin.title,
        content: fullSoin.content || '',
        category: fullSoin.category.slug,
        status: fullSoin.status
      })
      setFormErrors({})
      setDialogOpen(true)
    } catch (err: any) {
      console.error('Erreur lors du chargement du soin:', err)
      setFormErrors({ submit: err.message || 'Erreur lors du chargement du soin' })
    }
  }

  // Soumettre le formulaire
  const handleSubmit = async () => {
    // Validation
    const errors: Record<string, string> = {}

    if (!formData.title || formData.title.trim() === '') {
      errors.title = 'Le titre est requis'
    }

    if (!formData.category || formData.category.trim() === '') {
      errors.category = 'La catégorie est requise'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)

      return
    }

    try {
      setSubmitting(true)

      if (formMode === 'create') {
        await soinService.create(formData)
      } else if (selectedSoin) {
        await soinService.update(selectedSoin.slug, formData)
      }

      setDialogOpen(false)

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
    setSelectedSoin(null)
  }

  return {
    dialogOpen,
    formMode,
    formData,
    setFormData,
    formErrors,
    submitting,
    selectedSoin,
    availableCategories,
    loadingCategories,
    handleCreate,
    handleEdit,
    handleSubmit,
    handleClose
  }
}
