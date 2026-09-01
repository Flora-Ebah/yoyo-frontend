import { apiClient } from './api.client'

export interface LegalDocument {
  _id: string
  slug: string
  title: string
  content?: string
  file?: string
  type: string
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

export interface CreateDocumentRequest {
  title: string
  content?: string
  file?: string
  type: string
}

export interface UpdateDocumentRequest {
  title: string
  content?: string
  file?: string
  type: string
  status?: 'active' | 'inactive' | 'archived'
}

export interface DocumentsResponse {
  data: LegalDocument[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export class DocumentService {
  async getAll(params?: {
    page?: number
    limit?: number
    onlyActive?: boolean
    type?: string
    userId?: string
    status?: 'active' | 'inactive' | 'archived'
  }): Promise<DocumentsResponse> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.onlyActive) queryParams.append('onlyActive', 'true')
    if (params?.type) queryParams.append('type', params.type)
    if (params?.userId) queryParams.append('userId', params.userId)
    if (params?.status) queryParams.append('status', params.status)

    const queryString = queryParams.toString()
    const endpoint = `/document${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<{
      data: LegalDocument[]
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

  async getBySlug(slug: string): Promise<LegalDocument> {
    const response = await apiClient.get<LegalDocument>(`/document/${slug}`)

    return response
  }

  async create(document: CreateDocumentRequest): Promise<LegalDocument> {
    const response = await apiClient.post<{ data: LegalDocument }>('/document', document)

    return response.data
  }

  async update(slug: string, document: UpdateDocumentRequest): Promise<LegalDocument> {
    const response = await apiClient.put<{ data: LegalDocument }>(`/document/${slug}`, document)

    return response.data
  }

  async delete(slug: string): Promise<void> {
    await apiClient.delete(`/document/${slug}`)
  }

  async uploadFile(file: File): Promise<{ slug: string }> {
    const formData = new FormData()

    formData.append('file', file)

    // Passe par le proxy same-origin : l'auth (Bearer httpOnly) et la clé API sont
    // ajoutées côté serveur. Pas de Content-Type explicite → le navigateur pose la
    // boundary multipart lui-même.
    const response = await fetch('/api/proxy/file/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      let errorMessage = 'Erreur lors du telechargement du fichier'

      try {
        const errorData = await response.json()

        errorMessage = errorData?.message || errorMessage
      } catch {}

      throw new Error(errorMessage)
    }

    const data = await response.json()


return data?.data || data
  }
}

export const documentService = new DocumentService()


