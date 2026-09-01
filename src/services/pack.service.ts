import { apiClient } from './api.client'

/**
 * Interface pour un pack
 */
export interface Pack {
  _id: string
  slug: string
  name: string
  price: number
  nombreElements: number
  description?: string
  type: 'produit' | 'outil' | 'service'
  status?: 'active' | 'inactive' | 'archived'
  createdAt: string
  updatedAt: string
}

/**
 * Interface pour créer un pack
 */
export interface CreatePackRequest {
  name: string
  slug?: string
  price: number
  nombreElements: number
  description?: string
  type: 'produit' | 'outil' | 'service'
  status?: 'active' | 'inactive' | 'archived'
}

/**
 * Interface pour mettre à jour un pack
 */
export type UpdatePackRequest = Partial<CreatePackRequest>

/**
 * Interface pour la réponse paginée
 */
export interface PacksResponse {
  data: Pack[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Service pour les opérations sur les packs
 */
export class PackService {
  /**
   * Récupère la liste paginée des packs
   * GET /pack
   */
  async getAll(params?: {
    page?: number
    limit?: number
    onlyActive?: boolean
    type?: 'produit' | 'outil' | 'service'
    status?: 'active' | 'inactive' | 'archived'
  }): Promise<PacksResponse> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.onlyActive) queryParams.append('onlyActive', 'true')
    if (params?.type) queryParams.append('type', params.type)
    if (params?.status) queryParams.append('status', params.status)

    const queryString = queryParams.toString()
    const endpoint = `/pack${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<{
      data: Pack[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }>(endpoint)

    return {
      data: response.data || [],
      pagination: response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    }
  }

  /**
   * Récupère un pack par son ID
   * GET /pack/:id
   */
  async getById(id: string): Promise<Pack> {
    const response = await apiClient.get<{ data: Pack }>(`/pack/${id}`)
    return response.data
  }

  /**
   * Crée un nouveau pack
   * POST /pack
   */
  async create(pack: CreatePackRequest): Promise<Pack> {
    const response = await apiClient.post<{ data: Pack }>('/pack', pack)
    return response.data
  }

  /**
   * Met à jour un pack
   * PUT /pack/:id
   */
  async update(id: string, pack: UpdatePackRequest): Promise<Pack> {
    const response = await apiClient.put<{ data: Pack }>(`/pack/${id}`, pack)
    return response.data
  }

  /**
   * Supprime un pack
   * DELETE /pack/:id
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/pack/${id}`)
  }
}

export const packService = new PackService()

