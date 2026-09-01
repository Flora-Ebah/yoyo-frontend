import { useEffect, useState } from 'react'

import { categoryService, type Category } from '@/services/category.service'

interface UseCategoriesParams {
  page: number
  limit: number
  statusFilter: string
  parentFilter: string
}

export const useCategories = (params: UseCategoriesParams) => {
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])

  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const [error, setError] = useState<string | null>(null)

  const loadCategories = async () => {
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

      if (params.parentFilter !== 'all') {
        if (params.parentFilter === 'root') {
          apiParams.parent = 'root'
        } else {
          apiParams.parent = params.parentFilter
        }
      }

      const response = await categoryService.getAll(apiParams)

      setCategories(response.data)
      setPagination({
        page: response.pagination.page - 1,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      })
    } catch (err: any) {
      console.error('Erreur lors du chargement des catégories:', err)
      setError(err.message || 'Erreur lors du chargement des catégories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.limit, params.statusFilter, params.parentFilter])

  return {
    categories,
    pagination,
    loading,
    error,
    reload: loadCategories
  }
}

