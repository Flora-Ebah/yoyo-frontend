import { apiClient } from './api.client'
import { buildQuery, extractListResult, type ApiEnvelope, type ApiListResult } from './yoyo-api.types'

export interface CertificationUser {
  _id: string
  firstname?: string
  lastname?: string
  email?: string
  contact?: string
}

export interface CertificationItem {
  _id: string
  documentType?: string
  documentFile?: string[]
  verificationStatus?: string
  reviewNotes?: string
  rejectionReason?: string
  status?: string
  user?: CertificationUser
  reviewedBy?: CertificationUser
  createdAt?: string
  updatedAt?: string
}

export interface SecretQuestion {
  _id: string
  questionText: string
  languageCode?: string
  category?: string
  status?: 'active' | 'inactive' | 'draft' | 'removed'
  isCustomizable?: boolean
  minAnswerLength?: number
  maxAnswerLength?: number
  createdAt?: string
  updatedAt?: string
}

export interface ModerationListParams {
  page?: number
  pageSize?: number
  status?: string
  q?: string
  from?: string
  to?: string
  sortBy?: string
  orderBy?: string
}

export interface UpdateCertificationPayload {
  _id: string
  verificationStatus: string
  reviewNotes?: string
  rejectionReason?: string
}

class ModerationService {
  async listCertifications(params: ModerationListParams = {}): Promise<ApiListResult<CertificationItem>> {
    const query = buildQuery({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      status: params.status,
      q: params.q,
      from: params.from,
      to: params.to,
      sortBy: params.sortBy,
      orderBy: params.orderBy
    })

    const response = await apiClient.get<ApiEnvelope<CertificationItem[]>>(`/certification${query}`, {
      rawResponse: true
    })

    return extractListResult<CertificationItem>(response)
  }

  async updateCertification(payload: UpdateCertificationPayload): Promise<void> {
    await apiClient.put('/certification', payload)
  }

  async getRejectionReasons(): Promise<Array<{ slug: string; title: string; description?: string }>> {
    const response = await apiClient.get<ApiEnvelope<Array<{ slug: string; title: string; description?: string }>>>(
      '/certification/rejection-reasons',
      { rawResponse: true }
    )

    return (response as any).data || []
  }

  async listQuestions(params: ModerationListParams = {}): Promise<ApiListResult<SecretQuestion>> {
    const query = buildQuery({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      status: params.status,
      q: params.q,
      from: params.from,
      to: params.to,
      sortBy: params.sortBy,
      orderBy: params.orderBy
    })

    const response = await apiClient.get<ApiEnvelope<SecretQuestion[]>>(`/question${query}`, {
      rawResponse: true
    })

    return extractListResult<SecretQuestion>(response)
  }

  async updateQuestion(item: SecretQuestion): Promise<void> {
    await apiClient.put('/question', {
      _id: item._id,
      questionText: item.questionText,
      languageCode: item.languageCode || 'fr',
      category: item.category,
      status: item.status,
      isCustomizable: item.isCustomizable,
      minAnswerLength: item.minAnswerLength,
      maxAnswerLength: item.maxAnswerLength
    })
  }
}

export const moderationService = new ModerationService()
