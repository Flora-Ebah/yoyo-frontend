import { useState } from 'react'
import { documentService, type LegalDocument } from '@/services/document.service'

interface UseDocumentActionsParams {
  onDeleteSuccess?: () => void
}

export const useDocumentActions = ({ onDeleteSuccess }: UseDocumentActionsParams = {}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, document: LegalDocument) => {
    setAnchorEl(event.currentTarget)
    setSelectedDocument(document)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedDocument(null)
  }

  const handleDelete = async () => {
    if (!selectedDocument) return

    if (!confirm(`Etes-vous sur de vouloir supprimer le document "${selectedDocument.title}" ?`)) {
      handleMenuClose()
      return
    }

    try {
      await documentService.delete(selectedDocument.slug)
      handleMenuClose()

      if (onDeleteSuccess) {
        onDeleteSuccess()
      }
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err)
      alert(err.message || 'Erreur lors de la suppression du document')
    }
  }

  const deleteDocument = async (document: LegalDocument) => {
    if (!confirm(`Etes-vous sur de vouloir supprimer le document "${document.title}" ?`)) return

    try {
      await documentService.delete(document.slug)

      if (onDeleteSuccess) {
        onDeleteSuccess()
      }
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err)
      alert(err.message || 'Erreur lors de la suppression du document')
    }
  }

  return {
    anchorEl,
    selectedDocument,
    handleMenuOpen,
    handleMenuClose,
    handleDelete,
    deleteDocument
  }
}

