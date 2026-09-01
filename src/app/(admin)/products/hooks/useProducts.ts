import { useState, useEffect } from 'react'
import { productService, type Product } from '@/services/product.service'

interface UseProductsParams {
  page?: number
  limit?: number
}

export const useProducts = (initialParams?: UseProductsParams) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: initialParams?.page || 1,
    limit: initialParams?.limit || 10,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState<{
    store?: string
    category?: string
    disponibilite?: boolean
    search?: string
    onlyActive?: boolean
  }>({})

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      }

      const response = await productService.getAll(params)
      setProducts(response.data)
      setPagination(response.pagination)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des produits')
      console.error('Erreur useProducts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, filters.store, filters.category, filters.disponibilite, filters.onlyActive])

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
    loadProducts()
  }

  // Filtrer par recherche côté client si nécessaire
  const filteredProducts = filters.search
    ? products.filter(product =>
        product.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
        product.description?.toLowerCase().includes(filters.search!.toLowerCase())
      )
    : products

  return {
    products: filteredProducts,
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

