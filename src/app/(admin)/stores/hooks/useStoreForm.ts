import { useState } from 'react'
import { storeService, type CreateStoreRequest, type UpdateStoreRequest, type Store } from '@/services/store.service'
import { userService } from '@/services/user.service'

interface UseStoreFormParams {
  onSuccess?: () => void
}

export const useStoreForm = ({ onSuccess }: UseStoreFormParams = {}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formData, setFormData] = useState<CreateStoreRequest | UpdateStoreRequest>({
    name: '',
    type: 'boutique',
    status: 'active'
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [providers, setProviders] = useState<any[]>([])
  const [loadingProviders, setLoadingProviders] = useState(false)

  const loadProviders = async () => {
    try {
      setLoadingProviders(true)
      const response = await userService.getAll({ limit: 100 })
      const providerUsers = (response.data || []).filter(user => user.role === 'provider')
      setProviders(providerUsers)
    } catch (error) {
      console.error('Erreur lors du chargement des providers:', error)
    } finally {
      setLoadingProviders(false)
    }
  }

  const handleCreate = async () => {
    setFormMode('create')
    setFormData({
      name: '',
      type: 'boutique',
      status: 'active'
    })
    setFormErrors({})
    setSelectedStore(null)
    await loadProviders()
    setDialogOpen(true)
  }

  const handleEdit = async (store: Store) => {
    try {
      setFormMode('edit')
      setSelectedStore(store)
      await loadProviders()

      // Charger le store complet depuis l'API
      const fullStore = await storeService.getById(store._id)

      setFormData({
        name: fullStore.name,
        type: fullStore.type,
        owner: typeof fullStore.owner === 'string' ? fullStore.owner : fullStore.owner._id,
        rccm: fullStore.rccm,
        email: fullStore.email,
        address: fullStore.address,
        status: fullStore.status || 'active',
        socialNetwork: fullStore.socialNetwork,
        joursOuverture: fullStore.joursOuverture,
        pays: fullStore.pays,
        description: fullStore.description
      })
      setFormErrors({})
      setDialogOpen(true)
    } catch (err: any) {
      console.error('Erreur lors du chargement de la boutique:', err)
      setFormErrors({ submit: err.message || 'Erreur lors du chargement de la boutique' })
    }
  }

  const handleSubmit = async () => {
    // Validation
    const errors: Record<string, string> = {}

    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Le nom est requis'
    }

    if (!formData.type) {
      errors.type = 'Le type est requis'
    }

    if (formMode === 'create' && !formData.owner) {
      errors.owner = 'Le propriétaire est requis'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      setSubmitting(true)

      if (formMode === 'create') {
        await storeService.create(formData as CreateStoreRequest)
      } else if (selectedStore) {
        await storeService.update(selectedStore._id, formData as UpdateStoreRequest)
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

  const handleClose = () => {
    setDialogOpen(false)
    setFormErrors({})
    setSelectedStore(null)
  }

  return {
    dialogOpen,
    formMode,
    formData,
    setFormData,
    formErrors,
    submitting,
    selectedStore,
    providers,
    loadingProviders,
    handleCreate,
    handleEdit,
    handleSubmit,
    handleClose
  }
}


