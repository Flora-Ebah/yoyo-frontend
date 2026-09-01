import { useState, useEffect, useCallback } from 'react'
import { purchaseService, type Purchase } from '@/services/purchase.service'

interface UsePurchasesParams {
  page: number
  limit: number
  type?: string
  paymentStatus?: string
  subscriptionStatus?: string
  status?: string
  userId?: string
}

export const usePurchases = (params: UsePurchasesParams) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const loadPurchases = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await purchaseService.getAll({
        page: params.page + 1, // API uses 1-based indexing, MUI uses 0-based
        limit: params.limit,
        type: params.type,
        paymentStatus: params.paymentStatus,
        subscriptionStatus: params.subscriptionStatus,
        status: params.status,
        userId: params.userId
      })
      setPurchases(response.data)
      setPagination(response.pagination)
    } catch (err: any) {
      console.error('Erreur lors du chargement des achats:', err)
      setError(err.message || 'Une erreur est survenue lors du chargement des achats')
    } finally {
      setLoading(false)
    }
  }, [
    params.page,
    params.limit,
    params.type,
    params.paymentStatus,
    params.subscriptionStatus,
    params.status,
    params.userId
  ])

  useEffect(() => {
    loadPurchases()
  }, [loadPurchases])

  return {
    purchases,
    pagination,
    loading,
    error,
    reload: loadPurchases
  }
}
