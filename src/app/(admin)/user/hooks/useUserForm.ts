import { useEffect, useState } from 'react'

import { userService, type CreateUserRequest, type UpdateUserRequest, type User } from '@/services/user.service'

interface UseUserFormParams {
  onSuccess?: () => void
}

export const useUserForm = ({ onSuccess }: UseUserFormParams = {}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  const [formData, setFormData] = useState<CreateUserRequest | UpdateUserRequest>({
    contact: '',
    role: 'admin',
    status: 'active'
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Ouvrir le formulaire de création
  const handleCreate = async () => {
    setFormMode('create')
    setFormData({
      contact: '',
      role: 'admin',
      status: 'active'
    })
    setFormErrors({})
    setSelectedUser(null)
    setDialogOpen(true)
  }

  // Ouvrir le formulaire d'édition
  const handleEdit = async (user: User) => {
    try {
      setFormMode('edit')
      setSelectedUser(user)

      // Charger l'utilisateur complet depuis l'API
      const fullUser = await userService.getById(user._id)

      setFormData({
        email: fullUser.email,
        firstname: fullUser.firstname,
        lastname: fullUser.lastname,
        contact: fullUser.contact || '',
        profile: typeof fullUser.profile === 'object' ? fullUser.profile._id : fullUser.profile,
        role: fullUser.role || 'user',
        status: fullUser.status || 'active'
      })
      setFormErrors({})
      setDialogOpen(true)
    } catch (err: any) {
      console.error('Erreur lors du chargement de l\'utilisateur:', err)
      setFormErrors({ submit: err.message || 'Erreur lors du chargement de l\'utilisateur' })
    }
  }

  // Soumettre le formulaire
  const handleSubmit = async () => {
    // Validation
    const errors: Record<string, string> = {}

    if (!formData.contact || formData.contact.trim() === '') {
      errors.contact = 'Le contact est requis'
    }

    if (formMode === 'create') {
      const createFormData = formData as CreateUserRequest

      if (!createFormData.password && createFormData.role !== 'user') {
        errors.password = 'Le mot de passe est requis pour les rôles admin et provider'
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)

      return
    }

    try {
      setSubmitting(true)

      if (formMode === 'create') {
        // Le rôle est toujours 'admin' pour le backoffice
        const createData: CreateUserRequest = {
          ...formData,
          role: 'admin'
        } as CreateUserRequest
        await userService.create(createData)
      } else if (selectedUser) {
        await userService.update(selectedUser._id, formData as UpdateUserRequest)
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
    setSelectedUser(null)
  }

  return {
    dialogOpen,
    formMode,
    formData,
    setFormData,
    formErrors,
    submitting,
    selectedUser,
    handleCreate,
    handleEdit,
    handleSubmit,
    handleClose
  }
}


