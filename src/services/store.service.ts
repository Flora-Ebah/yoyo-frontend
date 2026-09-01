import { apiClient } from './api.client'

export interface SocialNetwork {
  whatsapp?: string
  facebook?: string
  instagram?: string
}

export interface Store {
  _id: string
  slug: string
  type: 'boutique' | 'salon-coiffure-homme' | 'salon-coiffure-femme' | 'salon-coiffure-mixte'
  name: string
  owner: {
    _id: string
    firstname?: string
    lastname?: string
    email?: string
    username?: string
  } | string
  rccm?: string
  email?: string
  address?: string
  status?: 'active' | 'inactive' | 'suspended'
  socialNetwork?: SocialNetwork
  joursOuverture?: string
  pays?: string
  description?: string
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateStoreRequest {
  name: string
  type: 'boutique' | 'salon-coiffure-homme' | 'salon-coiffure-femme' | 'salon-coiffure-mixte'
  owner?: string
  rccm?: string
  email?: string
  address?: string
  status?: 'active' | 'inactive' | 'suspended'
  socialNetwork?: SocialNetwork
  joursOuverture?: string
  pays?: string
  description?: string
}

export interface UpdateStoreRequest extends Partial<CreateStoreRequest> {
  owner?: string
}

export interface StoresResponse {
  data: Store[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class StoreService {
  async getAll(params?: { page?: number; limit?: number; onlyActive?: boolean; type?: string; status?: string; owner?: string }): Promise<StoresResponse> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.onlyActive) queryParams.append('onlyActive', 'true')
    if (params?.type) queryParams.append('type', params.type)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.owner) queryParams.append('owner', params.owner)

    const response = await apiClient.get<StoresResponse>(`/store?${queryParams.toString()}`)
    return response
  }

  async getById(id: string): Promise<Store> {
    const response = await apiClient.get<{ data: Store }>(`/store/${id}`)
    return response.data
  }

  async create(data: CreateStoreRequest): Promise<Store> {
    const response = await apiClient.post<{ data: Store }>('/store', data)
    return response.data
  }

  async update(id: string, data: UpdateStoreRequest): Promise<Store> {
    const response = await apiClient.put<{ data: Store }>(`/store/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/store/${id}`)
  }
}

export const storeService = new StoreService()

