import { apiClient } from './api.client'

export type RoutineSoinType = 'entretien' | 'restructuration'
export type RoutineSoinSubTypeStatus = 'active' | 'inactive'

export type RoutineSoinSubTypeFieldInputType =
  | 'text'
  | 'number'
  | 'select'
  | 'boolean'
  | 'date'
  | 'textarea'

export interface RoutineSoinSubTypeField {
  key: string
  label: string
  inputType: RoutineSoinSubTypeFieldInputType
  required?: boolean
  options?: string[]
  placeholder?: string
  order?: number
}

export interface RoutineSoinSubType {
  _id: string
  slug?: string
  name: string
  type: RoutineSoinType
  description?: string
  status: RoutineSoinSubTypeStatus
  fields: RoutineSoinSubTypeField[]
  createdAt: string
  updatedAt: string
}

export interface CreateRoutineSoinSubTypeRequest {
  name: string
  slug?: string
  type: RoutineSoinType
  description?: string
  status?: RoutineSoinSubTypeStatus
  fields: RoutineSoinSubTypeField[]
}

export interface UpdateRoutineSoinSubTypeRequest extends Partial<CreateRoutineSoinSubTypeRequest> {}

export interface RoutineSoinSubTypesResponse {
  data: RoutineSoinSubType[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class RoutineSoinSubTypeService {
  async getAll(params?: {
    page?: number
    limit?: number
    type?: RoutineSoinType
    slug?: string
    status?: RoutineSoinSubTypeStatus
  }): Promise<RoutineSoinSubTypesResponse> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.type) queryParams.append('type', params.type)
    if (params?.slug) queryParams.append('slug', params.slug)
    if (params?.status) queryParams.append('status', params.status)

    const queryString = queryParams.toString()
    const endpoint = `/routine-soin/subtypes${queryString ? `?${queryString}` : ''}`

    return apiClient.get<RoutineSoinSubTypesResponse>(endpoint)
  }

  async getById(id: string): Promise<RoutineSoinSubType> {
    return apiClient.get<RoutineSoinSubType>(`/routine-soin/subtypes/${id}`)
  }

  async getBySlug(slug: string): Promise<RoutineSoinSubType> {
    return apiClient.get<RoutineSoinSubType>(`/routine-soin/subtypes/slug/${slug}`)
  }

  async create(payload: CreateRoutineSoinSubTypeRequest): Promise<RoutineSoinSubType> {
    return apiClient.post<RoutineSoinSubType>('/routine-soin/subtypes', payload)
  }

  async update(id: string, payload: UpdateRoutineSoinSubTypeRequest): Promise<RoutineSoinSubType> {
    return apiClient.put<RoutineSoinSubType>(`/routine-soin/subtypes/${id}`, payload)
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/routine-soin/subtypes/${id}`)
  }
}

export const routineSoinSubTypeService = new RoutineSoinSubTypeService()

