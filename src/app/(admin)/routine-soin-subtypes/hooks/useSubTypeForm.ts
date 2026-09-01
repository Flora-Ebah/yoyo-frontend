import { useState } from 'react'

import {
  routineSoinSubTypeService,
  type CreateRoutineSoinSubTypeRequest,
  type RoutineSoinSubType,
  type RoutineSoinSubTypeField,
  type UpdateRoutineSoinSubTypeRequest
} from '@/services/routine-soin-subtype.service'

interface UseSubTypeFormParams {
  onSuccess?: () => void
}

const defaultField = (): RoutineSoinSubTypeField => ({
  key: '',
  label: '',
  inputType: 'text',
  required: false,
  options: undefined,
  placeholder: '',
  order: 0
})

const buildInitialFormData = (): CreateRoutineSoinSubTypeRequest => ({
  name: '',
  slug: '',
  type: 'entretien',
  description: '',
  status: 'active',
  fields: [defaultField()]
})

export const useSubTypeForm = ({ onSuccess }: UseSubTypeFormParams = {}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formData, setFormData] = useState<CreateRoutineSoinSubTypeRequest | UpdateRoutineSoinSubTypeRequest>(
    buildInitialFormData()
  )

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [selectedSubType, setSelectedSubType] = useState<RoutineSoinSubType | null>(null)

  const handleCreate = async () => {
    setFormMode('create')
    setFormData(buildInitialFormData())
    setFormErrors({})
    setSelectedSubType(null)
    setDialogOpen(true)
  }

  const handleEdit = async (subType: RoutineSoinSubType) => {
    try {
      setFormMode('edit')
      setSelectedSubType(subType)
      setFormErrors({})

      const full = await routineSoinSubTypeService.getById(subType._id)

      setFormData({
        name: full.name,
        slug: full.slug || '',
        type: full.type,
        description: full.description || '',
        status: full.status,
        fields: Array.isArray(full.fields) ? full.fields : []
      })
      setDialogOpen(true)
    } catch (err: any) {
      console.error('Erreur lors du chargement du sous-type:', err)
      setFormErrors({ submit: err.message || 'Erreur lors du chargement du sous-type' })
    }
  }

  const validate = () => {
    const errors: Record<string, string> = {}

    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Le nom est requis'
    }

    if (!formData.type || `${formData.type}`.trim() === '') {
      errors.type = 'Le type est requis'
    }

    const fields = (formData.fields || []) as RoutineSoinSubTypeField[]
    const keys = new Set<string>()

    fields.forEach((field, index) => {
      const key = (field.key || '').trim()
      const label = (field.label || '').trim()

      if (!key) {
        errors[`fields.${index}.key`] = 'La clé est requise'
      } else {
        const normalized = key.toLowerCase()
        if (keys.has(normalized)) {
          errors[`fields.${index}.key`] = 'Clé dupliquée'
        } else {
          keys.add(normalized)
        }
      }

      if (!label) {
        errors[`fields.${index}.label`] = 'Le libellé est requis'
      }
    })

    return errors
  }

  const handleSubmit = async () => {
    const errors = validate()

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      setSubmitting(true)
      setFormErrors({})

      const payload: any = {
        ...formData,
        slug: formData.slug?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        fields: (formData.fields || []).map((f: RoutineSoinSubTypeField) => ({
          ...f,
          key: f.key.trim(),
          label: f.label.trim(),
          placeholder: f.placeholder?.trim() || undefined,
          options: f.inputType === 'select' ? (f.options || []).filter(Boolean) : undefined,
          order: Number.isFinite(f.order as any) ? f.order : 0,
          required: !!f.required
        }))
      }

      if (formMode === 'create') {
        await routineSoinSubTypeService.create(payload)
      } else if (selectedSubType) {
        await routineSoinSubTypeService.update(selectedSubType._id, payload)
      }

      setDialogOpen(false)

      onSuccess?.()
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
    setSelectedSubType(null)
  }

  return {
    dialogOpen,
    formMode,
    formData,
    setFormData,
    formErrors,
    submitting,
    selectedSubType,
    handleCreate,
    handleEdit,
    handleSubmit,
    handleClose
  }
}

