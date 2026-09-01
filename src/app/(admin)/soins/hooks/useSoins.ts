import { useEffect, useState } from 'react'

import { soinService, type Soin } from '@/services/soin.service'

interface UseSoinsParams {
  page: number
  limit: number
  statusFilter: string
  categoryFilter: string
}

export const useSoins = (params: UseSoinsParams) => {
  const [loading, setLoading] = useState(true)
  const [soins, setSoins] = useState<Soin[]>([])

  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const [error, setError] = useState<string | null>(null)

  const loadSoins = async () => {
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

      if (params.categoryFilter !== 'all') {
        apiParams.category = params.categoryFilter
      }

      const response = await soinService.getAll(apiParams)

      setSoins(response.data)
      setPagination({
        page: response.pagination.page - 1,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      })
    } catch (err: any) {
      console.error('Erreur lors du chargement des soins:', err)
      setError(err.message || 'Erreur lors du chargement des soins')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSoins()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.limit, params.statusFilter, params.categoryFilter])

  return {
    soins,
    pagination,
    loading,
    error,
    reload: loadSoins
  }
}

