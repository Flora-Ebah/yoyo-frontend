import { useEffect, useState } from 'react'

import { packService, type Pack } from '@/services/pack.service'

interface UsePacksParams {
  page: number
  limit: number
  statusFilter: string
  typeFilter: string
}

export const usePacks = (params: UsePacksParams) => {
  const [loading, setLoading] = useState(true)
  const [packs, setPacks] = useState<Pack[]>([])

  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const [error, setError] = useState<string | null>(null)

  const loadPacks = async () => {
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

      const response = await packService.getAll(apiParams)

      setPacks(response.data)
      setPagination({
        page: response.pagination.page - 1,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      })
    } catch (err: any) {
      console.error('Erreur lors du chargement des packs:', err)
      setError(err.message || 'Erreur lors du chargement des packs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPacks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.limit, params.statusFilter, params.typeFilter])

  return {
    packs,
    pagination,
    loading,
    error,
    reload: loadPacks
  }
}

