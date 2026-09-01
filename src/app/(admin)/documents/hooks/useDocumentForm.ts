import { useState } from 'react'

import {
  documentService,
  type CreateDocumentRequest,
  type LegalDocument,
  type UpdateDocumentRequest
} from '@/services/document.service'
import { DOCUMENT_TYPES } from '../utils/document.utils'

interface UseDocumentFormParams {
  onSuccess?: () => void
}

export const useDocumentForm = ({ onSuccess }: UseDocumentFormParams = {}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  const [formData, setFormData] = useState<CreateDocumentRequest | UpdateDocumentRequest>({
    title: '',
    content: '',
    file: '',
    type: DOCUMENT_TYPES[0]?.value || 'cgu'
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [fileUploading, setFileUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null)

  const handleCreate = async () => {
    setFormMode('create')
    setFormData({
      title: '',
      content: '',
      file: '',
      type: DOCUMENT_TYPES[0]?.value || 'cgu'
    })
    setFormErrors({})
    setFileName(null)
    setSelectedDocument(null)
    setDialogOpen(true)
  }

  const handleEdit = async (document: LegalDocument) => {
    try {
      setFormMode('edit')
      setSelectedDocument(document)

      const fullDocument = await documentService.getBySlug(document.slug)

      setFormData({
        title: fullDocument.title,
        content: fullDocument.content || '',
        file: fullDocument.file || '',
        type: fullDocument.type,
        status: fullDocument.status
      })
      setFormErrors({})
      setFileName(fullDocument.file || null)
      setDialogOpen(true)
    } catch (err: any) {
      console.error('Erreur lors du chargement du document:', err)
      setFormErrors({ submit: err.message || 'Erreur lors du chargement du document' })
    }
  }

  const handleSubmit = async () => {
    const errors: Record<string, string> = {}

    if (!formData.title || formData.title.trim() === '') {
      errors.title = 'Le titre est requis'
    }

    if (!formData.type || formData.type.trim() === '') {
      errors.type = 'Le type est requis'
    }

    if ((!formData.content || formData.content.trim() === '') && (!formData.file || formData.file.trim() === '')) {
      errors.content = 'Le contenu ou un fichier est requis'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      setSubmitting(true)

      if (formMode === 'create') {
        await documentService.create(formData)
      } else if (selectedDocument) {
        await documentService.update(selectedDocument.slug, formData)
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
    setSelectedDocument(null)
  }

  const handleFileSelect = async (file: File | null) => {
    if (!file) return

    try {
      setFileUploading(true)
      const result = await documentService.uploadFile(file)
      setFormData(prev => ({ ...prev, file: result.slug }))
      setFileName(file.name)
      setFormErrors(prev => ({ ...prev, file: '' }))
    } catch (err: any) {
      console.error('Erreur lors du telechargement du fichier:', err)
      setFormErrors(prev => ({ ...prev, file: err.message || 'Erreur lors du telechargement du fichier' }))
    } finally {
      setFileUploading(false)
    }
  }

  const handleClearFile = () => {
    setFormData(prev => ({ ...prev, file: '' }))
    setFileName(null)
  }

  return {
    dialogOpen,
    formMode,
    formData,
    setFormData,
    formErrors,
    submitting,
    fileUploading,
    fileName,
    selectedDocument,
    handleCreate,
    handleEdit,
    handleSubmit,
    handleClose,
    handleFileSelect,
    handleClearFile
  }
}


