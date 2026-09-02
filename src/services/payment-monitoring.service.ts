import { apiClient } from './api.client'
import { buildQuery, extractListResult, type ApiEnvelope, type ApiListResult } from './yoyo-api.types'

export type PartnerPaymentStatus =
  | 'pending'
  | 'success'
  | 'failed'
  | 'refunded'
  | 'expired'
  | 'cancelled'
  | 'rejected'

export interface PopulatedPaymentClient {
  _id?: string
  firstname?: string
  lastname?: string
  email?: string
  contact?: string
}

export interface PopulatedPaymentPartner {
  _id?: string
  name?: string
}

export interface YoyoPayment {
  _id: string
  from?: PopulatedPaymentClient | string
  to?: PopulatedPaymentPartner | string
  amount?: number
  discountPercentage?: number
  status?: PartnerPaymentStatus
  completedAt?: string
  deniedAt?: string
  deniedReason?: string
  createdAt?: string
  updatedAt?: string
}

export interface PaymentListParams {
  page?: number
  pageSize?: number
  status?: string
  from?: string
  to?: string
  q?: string
  /** Filtre par partenaire (destinataire du paiement) — fiche détail partenaire. */
  partner?: string
}

export interface PaymentOverviewStats {
  totalPayments: number
  successCount: number
  pendingCount: number
  failedCount: number
  refundedCount: number
  totalAmount: number
}

export interface TopPartner {
  partnerId: string
  name: string
  volume: number
  amount: number
}

class PaymentMonitoringService {
  async getOverview(
    params: { status?: string; from?: string; to?: string; q?: string } = {}
  ): Promise<PaymentOverviewStats> {
    const query = buildQuery({
      status: params.status,
      from: params.from,
      to: params.to,
      q: params.q
    })

    const response = await apiClient.get<ApiEnvelope<PaymentOverviewStats>>(`/payments/overview${query}`, {
      rawResponse: true
    })

    const d = ((response as any).data || response) as Partial<PaymentOverviewStats>

    return {
      totalPayments: d.totalPayments || 0,
      successCount: d.successCount || 0,
      pendingCount: d.pendingCount || 0,
      failedCount: d.failedCount || 0,
      refundedCount: d.refundedCount || 0,
      totalAmount: d.totalAmount || 0
    }
  }

  async list(params: PaymentListParams = {}): Promise<ApiListResult<YoyoPayment>> {
    const query = buildQuery({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      status: params.status,
      from: params.from,
      to: params.to,
      q: params.q,
      partner: params.partner
    })

    const response = await apiClient.get<ApiEnvelope<YoyoPayment[]>>(`/payments${query}`, {
      rawResponse: true
    })

    return extractListResult<YoyoPayment>(response)
  }

  async getTopPartners(
    params: { from?: string; to?: string; status?: string; limit?: number; certified?: string } = {}
  ): Promise<TopPartner[]> {
    const query = buildQuery({
      from: params.from,
      to: params.to,
      status: params.status,
      limit: params.limit,
      certified: params.certified
    })

    const response = await apiClient.get<ApiEnvelope<TopPartner[]>>(`/payments/top-partners${query}`, {
      rawResponse: true
    })

    const data = (response as any).data || response

    return Array.isArray(data) ? data : []
  }
}

export const paymentMonitoringService = new PaymentMonitoringService()
