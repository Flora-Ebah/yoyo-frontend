import { apiClient } from './api.client'
import type { Ability } from '@/configs/permissions'

export type AdminStatus = 'active' | 'archived' | 'removed'

export interface AdminProfileRef {
  _id: string
  name?: string
  description?: string
  ability?: Ability[]
}

export interface AdminAccount {
  _id: string
  slug?: string
  email?: string
  password?: string
  matricule?: string
  lastname?: string
  firstname?: string
  phone?: string
  phoneOffice?: string
  address?: string
  office?: string
  photo?: string
  type?: 'externe' | 'interne'
  status?: AdminStatus
  profile?: string | AdminProfileRef
  createdAt?: string
  updatedAt?: string
  lastLogin?: string
}

export interface AdminAccountsResponse {
  data: AdminAccount[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface CreateAdminAccountRequest {
  email: string
  password: string
  profile: string
  matricule?: string
  phone?: string
  phoneOffice?: string
  lastname?: string
  firstname?: string
  address?: string
  office?: string
  photo?: string
  type?: 'externe' | 'interne'
  status?: AdminStatus
}

export interface UpdateAdminAccountRequest {
  _id: string
  email: string
  profile: string
  password?: string
  matricule?: string
  phone?: string
  phoneOffice?: string
  lastname?: string
  firstname?: string
  address?: string
  office?: string
  photo?: string
  type?: 'externe' | 'interne'
  status?: AdminStatus
}

type RawApiListResponse = {
  data?: AdminAccount[]
  message?: {
    totalRows?: number
    totalPages?: number
    countRowsPerPage?: number
  }
}

export class AdminAccountService {
  async getAll(params?: {
    page?: number
    pageSize?: number
    status?: AdminStatus
    q?: string
    sortBy?: string
    orderBy?: 'asc' | 'desc'
  }): Promise<AdminAccountsResponse> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', String(params.page))
    if (params?.pageSize) queryParams.append('pageSize', String(params.pageSize))
    if (params?.status) queryParams.append('status', params.status)
    if (params?.q) queryParams.append('q', params.q)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.orderBy) queryParams.append('orderBy', params.orderBy)

    const queryString = queryParams.toString()
    const endpoint = `/admin${queryString ? `?${queryString}` : ''}`

    const rawResponse = await apiClient.get<RawApiListResponse>(endpoint, { rawResponse: true })
    const rows = Array.isArray(rawResponse?.data) ? rawResponse.data : []
    const meta = rawResponse?.message || {}
    const pageSize = Number(params?.pageSize || meta.countRowsPerPage || 10)
    const total = Number(meta.totalRows || rows.length || 0)
    const totalPages = Number(meta.totalPages || (pageSize > 0 ? Math.ceil(total / pageSize) : 0))
    const page = Number(params?.page || 1)

    return {
      data: rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages
      }
    }
  }

  async getById(id: string): Promise<AdminAccount> {
    const response = await apiClient.get<AdminAccount | { data: AdminAccount }>(`/admin/details/${id}`)
    return (response as any).data ?? (response as any)
  }

  /** Compte admin connecté (avec profil peuplé -> permissions). GET /admin/me */
  async getMe(): Promise<AdminAccount> {
    const response = await apiClient.get<AdminAccount | { data: AdminAccount }>('/admin/me')
    return (response as any).data ?? (response as any)
  }

  async create(payload: CreateAdminAccountRequest): Promise<AdminAccount> {
    const response = await apiClient.post<AdminAccount | { data: AdminAccount }>('/admin', payload)
    return (response as any).data ?? (response as any)
  }

  async update(payload: UpdateAdminAccountRequest): Promise<AdminAccount> {
    const response = await apiClient.put<AdminAccount | { data: AdminAccount }>('/admin', payload)
    return (response as any).data ?? (response as any)
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/admin/remove/${id}`)
  }

  async erase(id: string): Promise<void> {
    await apiClient.delete(`/admin/erase/${id}`)
  }

  async restore(id: string): Promise<void> {
    await apiClient.put(`/admin/restore/${id}`)
  }
}

export const adminAccountService = new AdminAccountService()
