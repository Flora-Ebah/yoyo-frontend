import { apiClient } from './api.client'
import { buildQuery, extractListResult, type ApiEnvelope, type ApiListResult } from './yoyo-api.types'

export type ClientStatus = 'active' | 'inactive' | 'suspended' | 'removed' | 'archived'

export interface YoyoClient {
  _id: string
  slug?: string
  email?: string
  contact?: string
  firstname?: string
  lastname?: string
  country?: string
  gender?: string
  status?: ClientStatus
  isPartner?: boolean
  isCertified?: boolean
  isEmailConfirmed?: boolean
  isPhoneConfirmed?: boolean
  isDocumentVerified?: boolean
  documentVerificationStatus?: string
  removedReason?: string
  createdAt?: string
  updatedAt?: string
}

export interface ClientListParams {
  page?: number
  pageSize?: number
  status?: string
  q?: string
}

export interface ClientNotificationPayload {
  message: string
  type?: 'EMAIL' | 'SMS' | 'PUSH'
}

class ClientManagementService {
  async list(params: ClientListParams = {}): Promise<ApiListResult<YoyoClient>> {
    const query = buildQuery({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      status: params.status,
      q: params.q
    })

    const response = await apiClient.get<ApiEnvelope<YoyoClient[]>>(`/clients${query}`, {
      rawResponse: true
    })

    return extractListResult<YoyoClient>(response)
  }

  async getById(id: string): Promise<YoyoClient> {
    const response = await apiClient.get<ApiEnvelope<YoyoClient>>(`/clients/details/${id}`, {
      rawResponse: true
    })

    return (response as any).data || (response as any)
  }

  async remove(id: string, reason: string): Promise<void> {
    await apiClient.patch(`/clients/remove/${id}`, { reason })
  }

  async notify(id: string, payload: ClientNotificationPayload): Promise<void> {
    await apiClient.post(`/clients/${id}/notify`, {
      message: payload.message,
      type: payload.type || 'EMAIL'
    })
  }
}

export const clientManagementService = new ClientManagementService()
