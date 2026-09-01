import { apiClient } from './api.client'
import { buildQuery, extractListResult, type ApiEnvelope, type ApiListResult } from './yoyo-api.types'

export type ProStatus = 'active' | 'inactive' | 'suspended' | 'removed' | 'archived'

export interface ProStats {
  totalRevenue: number
  totalDiscount: number
  successCount: number
  pendingCount: number
}

export interface ProCategory {
  _id: string
  name?: string
  status?: string
}

export interface ProOpeningHours {
  day: string
  isOpen: boolean
  openTime?: string
  closeTime?: string
  breaks?: Array<{
    startTime: string
    endTime: string
  }>
}

export interface YoyoPro {
  _id: string
  slug?: string
  name: string
  description?: string
  ville?: string
  address?: string
  latitude?: number
  longitude?: number
  phone?: string
  email?: string
  categories?: ProCategory[]
  thumbnail?: string
  photos?: string[]
  maxDiscount?: number
  minOrder?: number
  openingHours?: ProOpeningHours[]
  status?: ProStatus
  createdAt?: string
  updatedAt?: string
}

export interface ProListParams {
  page?: number
  pageSize?: number
  status?: string
  q?: string
  category?: string
}

export interface ProGeoPoint {
  ville: string
  pros: number
  lat: number | null
  lng: number | null
}

export interface PlatformProStats {
  total: number
  newInPeriod: number | null
  trend: number | null
}

class ProManagementService {
  async list(params: ProListParams = {}): Promise<ApiListResult<YoyoPro>> {
    const query = buildQuery({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      status: params.status,
      q: params.q,
      category: params.category
    })

    const response = await apiClient.get<ApiEnvelope<YoyoPro[]>>(`/partners${query}`, {
      rawResponse: true
    })

    return extractListResult<YoyoPro>(response)
  }

  async getById(id: string): Promise<YoyoPro> {
    const response = await apiClient.get<ApiEnvelope<YoyoPro>>(`/partners/details/${id}`, {
      rawResponse: true
    })

    return (response as any).data || (response as any)
  }

  async updateStatus(id: string, status: ProStatus): Promise<void> {
    await apiClient.put('/partners', {
      _id: id,
      status
    })
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/partners/remove/${id}`)
  }

  async getStats(partnerId: string): Promise<ProStats> {
    const response = await apiClient.get<ApiEnvelope<ProStats>>(`/payments/stats/${partnerId}`, {
      rawResponse: true
    })

    const data = ((response as any).data || response) as Partial<ProStats>

    return {
      totalRevenue: data.totalRevenue || 0,
      totalDiscount: data.totalDiscount || 0,
      successCount: data.successCount || 0,
      pendingCount: data.pendingCount || 0
    }
  }

  async getGeoDistribution(params: { certified?: string } = {}): Promise<ProGeoPoint[]> {
    const query = buildQuery({ certified: params.certified })

    const response = await apiClient.get<ApiEnvelope<ProGeoPoint[]>>(`/partners/geo-distribution${query}`, {
      rawResponse: true
    })

    const data = (response as any).data || response

    return Array.isArray(data) ? data : []
  }

  async getPlatformStats(params: { from?: string; to?: string; certified?: string } = {}): Promise<PlatformProStats> {
    const query = buildQuery({
      from: params.from,
      to: params.to,
      certified: params.certified
    })

    const response = await apiClient.get<ApiEnvelope<PlatformProStats>>(`/partners/stats${query}`, {
      rawResponse: true
    })

    const data = ((response as any).data || response) as Partial<PlatformProStats>

    return {
      total: data.total || 0,
      newInPeriod: data.newInPeriod ?? null,
      trend: data.trend ?? null
    }
  }
}

export const proManagementService = new ProManagementService()
