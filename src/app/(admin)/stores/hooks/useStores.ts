import { useState, useEffect } from 'react'
import { storeService, type Store } from '@/services/store.service'

interface UseStoresParams {
  page?: number
  limit?: number
}

export const useStores = (initialParams?: UseStoresParams) => {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: initialParams?.page || 1,
    limit: initialParams?.limit || 10,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState<{
    type?: string
    status?: string
    owner?: string
    search?: string
    onlyActive?: boolean
  }>({})

  const loadStores = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      }

      if (filters.search) {
        // Note: Le backend devra peut-être être modifié pour supporter la recherche
        // Pour l'instant, on filtre côté client
      }

      const response = await storeService.getAll(params)
      setStores(response.data)
      setPagination(response.pagination)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des boutiques')
      console.error('Erreur useStores:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStores()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filters.type, filters.status, filters.owner, filters.onlyActive])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleRowsPerPageChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }))
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const refresh = () => {
    loadStores()
  }

  // Filtrer par recherche côté client si nécessaire
  const filteredStores = filters.search
    ? stores.filter(store =>
        store.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
        store.email?.toLowerCase().includes(filters.search!.toLowerCase()) ||
        store.address?.toLowerCase().includes(filters.search!.toLowerCase())
      )
    : stores

  return {
    stores: filteredStores,
    loading,
    error,
    pagination,
    filters,
    handlePageChange,
    handleRowsPerPageChange,
    handleFilterChange,
    refresh
  }
}


