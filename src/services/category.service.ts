import { apiClient } from './api.client'

/**
 * Interface pour une catégorie
 */
export interface Category {
  _id: string
  slug: string
  name: string
  content?: string
  parent?: Category | string
  status?: 'active' | 'inactive' | 'archived'
  createdAt: string
  updatedAt: string
}

/**
 * Interface pour créer une catégorie
 */
export interface CreateCategoryRequest {
  name: string
  slug?: string
  content?: string
  parent?: string | null
  status?: 'active' | 'inactive' | 'archived'
}

/**
 * Interface pour mettre à jour une catégorie
 */
export type UpdateCategoryRequest = Partial<CreateCategoryRequest>

/**
 * Interface pour la réponse paginée
 */
export interface CategoriesResponse {
  data: Category[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Service pour les opérations sur les catégories
 */
export class CategoryService {
  /**
   * Récupère la liste paginée des catégories
   * GET /category
   */
  async getAll(params?: {
    page?: number
    limit?: number
    onlyActive?: boolean
    status?: string
    parent?: string | null
    slug?: string
  }): Promise<CategoriesResponse> {
    const queryParams = new URLSearchParams()
    const pageSize = params?.limit

    if (params?.page) queryParams.append('page', params.page.toString())
    // Le backend attend `pageSize` (pas `limit`).
    if (pageSize) queryParams.append('pageSize', pageSize.toString())
    // Le backend filtre via `status` (pas `onlyActive`).
    if (params?.onlyActive) queryParams.append('status', 'active')
    else if (params?.status) queryParams.append('status', params.status)

    if (params?.parent !== undefined) {
      if (params.parent === null || params.parent === 'root') {
        queryParams.append('parent', 'root')
      } else {
        queryParams.append('parent', params.parent)
      }
    }

    if (params?.slug) queryParams.append('slug', params.slug)

    const queryString = queryParams.toString()
    const endpoint = `/category${queryString ? `?${queryString}` : ''}`

    // On récupère l'enveloppe brute pour lire la pagination réelle du backend
    // (coddyger : { data, message: { totalRows, totalPages, countRowsPerPage } }).
    const raw = await apiClient.get<any>(endpoint, { rawResponse: true })

    const data = Array.isArray(raw) ? raw : raw?.data || []
    const meta = !Array.isArray(raw) && raw?.message ? raw.message : {}
    const limit = Number(pageSize || meta.countRowsPerPage || 10)
    const total = Number(meta.totalRows ?? data.length)
    const totalPages = Number(meta.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 1))
    const page = Number(params?.page || 1)

    return {
      data,
      pagination: { page, limit, total, totalPages }
    }
  }

  /**
   * Récupère une catégorie par son ID
   * GET /category/:id
   */
  async getById(id: string): Promise<Category> {
    const response = await apiClient.get<Category>(`/category/details/${id}`)

    return response
  }

  /**
   * Récupère une catégorie par son slug
   * GET /category/slug/:slug
   */
  async getBySlug(slug: string): Promise<Category> {
    const response = await apiClient.get<Category>(`/category/slug/${slug}`)

    return response
  }

  /**
   * Crée une nouvelle catégorie
   * POST /category
   */
  async create(data: CreateCategoryRequest): Promise<Category> {
    const response = await apiClient.post<{ data: Category }>('/category', data)

    return response.data || response
  }

  /**
   * Met à jour une catégorie
   * PUT /category/:id
   */
  async update(id: string, data: UpdateCategoryRequest): Promise<Category> {
    // Backend : PUT /category avec l'_id dans le corps.
    const response = await apiClient.put<{ data: Category }>('/category', { _id: id, ...data })

    return (response as any).data || response
  }

  /**
   * Supprime une catégorie (met le statut à inactive)
   * DELETE /category/:id
   */
  async delete(id: string): Promise<{ status: string; message: string }> {
    // Backend : DELETE /category/remove/:id (suppression logique).
    const response = await apiClient.delete<{ data: { status: string; message: string } }>(`/category/remove/${id}`)

    return (response as any).data || response
  }

  /**
   * Récupère les catégories disponibles comme parents
   * GET /category/parents
   */
  async getParents(params?: { page?: number; limit?: number; excludeId?: string }): Promise<CategoriesResponse> {
    // Pas d'endpoint `/category/parents` côté backend : on réutilise la liste `/category`
    // (grande page) et on exclut éventuellement l'id courant.
    const res = await this.getAll({ page: params?.page || 1, limit: params?.limit || 1000 })

    const data = params?.excludeId ? res.data.filter(c => c._id !== params.excludeId) : res.data

    return { data, pagination: { ...res.pagination, total: data.length } }
  }

  /**
   * Récupère les catégories par le slug du parent
   * GET /category/parent/:parentSlug
   */
  async getByParentSlug(
    parentSlug: string,
    params?: {
      page?: number
      limit?: number
      onlyActive?: boolean
      status?: string
    }
  ): Promise<CategoriesResponse & { parent?: Category }> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.onlyActive) queryParams.append('onlyActive', 'true')
    if (params?.status) queryParams.append('status', params.status)


    const queryString = queryParams.toString()
    const endpoint = `/category/parent/${parentSlug}${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<any>(endpoint)

    const data = Array.isArray(response) ? response : response.data || []
    const pagination =
      !Array.isArray(response) && response.pagination
        ? response.pagination
        : {

            page: 1,
            limit: 10,
            total: data.length,
            totalPages: 1
          }
    const parent = !Array.isArray(response) ? response.parent : undefined

    return {
      data,
      pagination,
      parent
    }
  }
}

// Instance singleton
export const categoryService = new CategoryService()
