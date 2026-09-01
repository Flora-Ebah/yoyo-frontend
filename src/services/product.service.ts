import { apiClient } from './api.client'

export interface Store {
  _id: string
  name: string
  slug: string
  type: string
  socialNetwork?: {
    whatsapp?: string
    facebook?: string
    instagram?: string
  }
  owner?: {
    _id: string
    firstname?: string
    lastname?: string
    contact?: string
    avatar?: string
    username?: string
    email?: string
  }
}

export interface Product {
  _id: string
  slug: string
  name: string
  description?: string
  content?: string
  category: { _id: string; name: string; slug: string } | string
  store: Store | string
  price: number
  volume?: string
  composantePrincipale?: string
  format?: string
  dimension?: string
  color?: string
  composantNaturel?: string
  typeExtraction?: string
  images?: string[]
  disponibilite: boolean
  status?: 'active' | 'inactive' | 'archived' | 'pending' | 'removed' | 'denied' | 'out-of-stock'
  rejectionReason?: string
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProductRequest {
  name: string
  description?: string
  content?: string
  category: string
  store: string
  price: number
  volume?: string
  composantePrincipale?: string
  format?: string
  dimension?: string
  color?: string
  composantNaturel?: string
  typeExtraction?: string
  images?: string[]
  disponibilite?: boolean
  status?: 'active' | 'inactive' | 'archived' | 'pending' | 'removed' | 'denied' | 'out-of-stock'
  rejectionReason?: string
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductsResponse {
  data: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class ProductService {
  async getAll(params?: {
    page?: number

    limit?: number
    onlyActive?: boolean
    store?: string
    category?: string
    disponibilite?: boolean
  }): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())

    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.onlyActive) queryParams.append('onlyActive', 'true')
    if (params?.store) queryParams.append('store', params.store)
    if (params?.category) queryParams.append('category', params.category)
    if (params?.disponibilite !== undefined) queryParams.append('disponibilite', params.disponibilite.toString())

    const response = await apiClient.get<ProductsResponse>(`/product?${queryParams.toString()}`)

    return response
  }

  async getById(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/product/${id}`)

    
return response
  }

  async getStats(): Promise<{ total: number; active: number; pending: number; denied: number; outOfStock: number }> {
    const response = await apiClient.get<{
      total: number
      active: number
      pending: number
      denied: number
      outOfStock: number
    }>('/product/stats')

    return response
  }

  async create(data: CreateProductRequest): Promise<Product> {
    const response = await apiClient.post<Product>('/product', data)
    return response
  }

  async update(id: string, data: UpdateProductRequest): Promise<Product> {

    
const response = await apiClient.put<Product>(`/product/${id}`, data)
    return response
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/product/${id}`)
  }

}


export const productService = new ProductService()
