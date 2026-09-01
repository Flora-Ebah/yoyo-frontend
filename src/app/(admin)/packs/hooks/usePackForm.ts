import { useState } from 'react'
import { packService, type Pack, type CreatePackRequest } from '@/services/pack.service'

interface UsePackFormParams {
  onSuccess?: () => void
}

export const usePackForm = ({ onSuccess }: UsePackFormParams = {}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formData, setFormData] = useState<CreatePackRequest>({
    name: '',
    slug: '',
    price: 0,
    nombreElements: 1,
    description: '',
    type: 'produit',
    status: 'active'
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null)

  // Ouvrir le formulaire de création
  const handleCreate = async () => {
    setFormMode('create')
    setFormData({
      name: '',
      slug: '',
      price: 0,
      nombreElements: 1,
      description: '',
      type: 'produit',
      status: 'active'
    })
    setFormErrors({})
    setSelectedPack(null)
    setDialogOpen(true)
  }

  // Ouvrir le formulaire d'édition
  const handleEdit = async (pack: Pack) => {
    setFormMode('edit')
    setSelectedPack(pack)
    setFormData({
      slug: pack.slug,
      name: pack.name,
      price: pack.price,
      nombreElements: pack.nombreElements,
      description: pack.description || '',
      type: pack.type,
      status: pack.status || 'active'
    })
    setFormErrors({})
    setDialogOpen(true)
  }

  // Soumettre le formulaire
  const handleSubmit = async () => {
    // Validation
    const errors: Record<string, string> = {}

    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Le nom est requis'
    }

    if (!formData.price || formData.price < 0) {
      errors.price = 'Le prix est requis et doit être positif'
    }

    if (!formData.nombreElements || formData.nombreElements < 1) {
      errors.nombreElements = 'Le nombre d\'éléments est requis et doit être supérieur à 0'
    }

    if (!formData.type) {
      errors.type = 'Le type est requis'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)

      return
    }

    try {
      setSubmitting(true)

      if (formMode === 'create') {
        await packService.create(formData)
      } else if (selectedPack) {
        await packService.update(selectedPack._id, formData)
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
    setSelectedPack(null)
  }

  return {
    dialogOpen,
    formMode,
    formData,
    setFormData,
    formErrors,
    submitting,
    selectedPack,
    handleCreate,
    handleEdit,
    handleSubmit,
    handleClose
  }
}

