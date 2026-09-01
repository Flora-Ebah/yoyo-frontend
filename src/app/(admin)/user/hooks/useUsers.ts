import { useEffect, useState } from 'react'

import { userService, type User } from '@/services/user.service'

interface UseUsersParams {
  page: number
  limit: number
  statusFilter: string
  roleFilter: string
  searchFilter: string
}

export const useUsers = (params: UseUsersParams) => {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])

  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const [error, setError] = useState<string | null>(null)

  const loadUsers = async () => {
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
          // Pour les autres statuts, on devra filtrer côté client ou ajouter un paramètre API
          // Pour l'instant, on utilise search
        }
      }

      if (params.searchFilter && params.searchFilter.trim() !== '') {
        apiParams.search = params.searchFilter.trim()
      }

      const response = await userService.getAll(apiParams)

      // Filtrer par statut si nécessaire
      let filteredUsers = response.data
      if (params.statusFilter !== 'all' && params.statusFilter !== 'active') {
        filteredUsers = filteredUsers.filter(user => user.status === params.statusFilter)
      }

      // Filtrer par rôle si nécessaire
      if (params.roleFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === params.roleFilter)
      }

      setUsers(filteredUsers)
      setPagination({
        page: response.pagination.page - 1,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      })
    } catch (err: any) {
      console.error('Erreur lors du chargement des utilisateurs:', err)
      setError(err.message || 'Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.limit, params.statusFilter, params.roleFilter, params.searchFilter])

  return {
    users,
    pagination,
    loading,
    error,
    reload: loadUsers
  }
}

