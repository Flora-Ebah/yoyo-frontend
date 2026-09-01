import { useEffect, useState } from 'react'

import { documentService, type LegalDocument } from '@/services/document.service'

interface UseDocumentsParams {
  page: number
  limit: number
  statusFilter: string
  typeFilter: string
}

export const useDocuments = (params: UseDocumentsParams) => {
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<LegalDocument[]>([])

  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const [error, setError] = useState<string | null>(null)

  const loadDocuments = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiParams: any = {
        page: params.page + 1,
        limit: params.limit
      }

      if (params.statusFilter !== 'all') {
        if (params.statusFilter === 'active') {
          apiParams.onlyActive = true
        } else {
          apiParams.status = params.statusFilter
        }
      }

      if (params.typeFilter !== 'all') {
        apiParams.type = params.typeFilter
      }

      const response = await documentService.getAll(apiParams)

      setDocuments(response.data)
      setPagination({
        page: response.pagination.page - 1,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      })
    } catch (err: any) {
      console.error('Erreur lors du chargement des documents:', err)
      setError(err.message || 'Erreur lors du chargement des documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.limit, params.statusFilter, params.typeFilter])

  return {
    documents,
    pagination,
    loading,
    error,
    reload: loadDocuments
  }
}

