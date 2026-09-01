import { apiClient } from './api.client'

/**
 * Interface pour un soin
 */
export interface Soin {
  _id: string
  slug: string
  title: string
  content?: string
  category: {
    _id: string
    slug: string
    name: string
  }
  user: {
    _id: string
    firstname?: string
    lastname?: string
    email?: string
    username?: string
  }
  status?: 'active' | 'inactive' | 'archived'
  createdAt: string
  updatedAt: string
}

/**
 * Interface pour créer un soin
 */
export interface CreateSoinRequest {
  title: string
  content?: string
  category: string // Slug de la catégorie
}

/**
 * Interface pour mettre à jour un soin
 */
export interface UpdateSoinRequest {
  title: string
  content?: string
  category: string // Slug de la catégorie
  status?: 'active' | 'inactive' | 'archived'
}

/**
 * Interface pour la réponse paginée
 */
export interface SoinsResponse {
  data: Soin[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Service pour les opérations sur les soins
 */
export class SoinService {
  /**
   * Récupère la liste paginée des soins
   * GET /soin
   */
  async getAll(params?: {
    page?: number
    limit?: number
    onlyActive?: boolean
    category?: string
    userId?: string
    status?: 'active' | 'inactive' | 'archived'
  }): Promise<SoinsResponse> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.onlyActive) queryParams.append('onlyActive', 'true')
    if (params?.category) queryParams.append('category', params.category)
    if (params?.userId) queryParams.append('userId', params.userId)
    if (params?.status) queryParams.append('status', params.status)

    const queryString = queryParams.toString()
    const endpoint = `/soin${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<{
      data: Soin[]
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
   * Récupère un soin par son slug
   * GET /soin/:slug
   */
  async getBySlug(slug: string): Promise<Soin> {
    // apiClient.get retourne déjà data.data si data.data existe et qu'il n'y a pas de pagination
    // Sinon, il retourne data directement
    // La réponse de l'API est : { message: "...", data: Soin }
    // Donc apiClient.get retourne directement l'objet Soin (data.data)
    const response = await apiClient.get<Soin>(`/soin/${slug}`)

    return response
  }

  /**
   * Récupère les soins par catégorie
   * GET /soin/category/:category
   */
  async getByCategory(params: { categorySlug: string; page?: number; limit?: number }): Promise<SoinsResponse> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const queryString = queryParams.toString()
    const endpoint = `/soin/category/${params.categorySlug}${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<{
      data: Soin[]
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
   * Crée un nouveau soin
   * POST /soin
   */
  async create(soin: CreateSoinRequest): Promise<Soin> {
    const response = await apiClient.post<{ data: Soin }>('/soin', soin)

    return response.data
  }

  /**
   * Met à jour un soin
   * PUT /soin/:slug
   */
  async update(slug: string, soin: UpdateSoinRequest): Promise<Soin> {
    const response = await apiClient.put<{ data: Soin }>(`/soin/${slug}`, soin)

    return response.data
  }

  /**
   * Supprime un soin
   * DELETE /soin/:slug
   */
  async delete(slug: string): Promise<void> {
    await apiClient.delete(`/soin/${slug}`)
  }
}

export const soinService = new SoinService()
