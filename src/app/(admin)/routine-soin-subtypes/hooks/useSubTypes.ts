import { useEffect, useMemo, useState } from 'react'

import { routineSoinSubTypeService, type RoutineSoinSubType } from '@/services/routine-soin-subtype.service'

interface UseSubTypesParams {
  page: number
  limit: number
  statusFilter: string
  typeFilter: string
  search: string
}

export const useSubTypes = (params: UseSubTypesParams) => {
  const [loading, setLoading] = useState(true)
  const [subTypes, setSubTypes] = useState<RoutineSoinSubType[]>([])
  const [error, setError] = useState<string | null>(null)

  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const loadSubTypes = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiParams: any = {
        page: params.page + 1,
        limit: params.limit
      }

      if (params.typeFilter !== 'all') {
        apiParams.type = params.typeFilter
      }

      if (params.statusFilter !== 'all') {
        apiParams.status = params.statusFilter
      }

      const response = await routineSoinSubTypeService.getAll(apiParams)

      setSubTypes(response.data || [])
      setPagination({
        page: (response.pagination?.page || 1) - 1,
        limit: response.pagination?.limit || params.limit,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0
      })
    } catch (err: any) {
      console.error('Erreur lors du chargement des sous-types:', err)
      setError(err.message || 'Erreur lors du chargement des sous-types')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubTypes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.limit, params.statusFilter, params.typeFilter])

  const filteredSubTypes = useMemo(() => {
    const query = params.search.trim().toLowerCase()
    if (!query) return subTypes

    return subTypes.filter(item => {
      const name = (item.name || '').toLowerCase()
      const slug = (item.slug || '').toLowerCase()

      return name.includes(query) || slug.includes(query)
    })
  }, [params.search, subTypes])

  return {
    subTypes: filteredSubTypes,
    rawSubTypes: subTypes,
    pagination,
    loading,
    error,
    reload: loadSubTypes
  }
}

