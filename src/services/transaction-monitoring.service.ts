import { apiClient } from './api.client'
import { buildQuery, extractListResult, type ApiEnvelope, type ApiListResult } from './yoyo-api.types'

export type TransactionStatus = 'active' | 'archived' | 'removed'
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded' | 'expired' | 'cancelled' | 'initiated'

export interface YoyoTransaction {
  _id: string
  slug?: string
  user?:
    | {
      _id?: string
      firstname?: string
      lastname?: string
      email?: string
      contact?: string
    }
    | string
  plan?:
    | {
      _id?: string
      name?: string
      label?: string
    }
    | string
  amount?: number
  currency?: string
  status?: TransactionStatus
  paymentMethod?: string
  paymentStatus?: PaymentStatus
  rawPaymentStatus?: string
  paymentDate?: string
  paymentId?: string
  paymentUrl?: string
  txnId?: string
  createdAt?: string
  updatedAt?: string
}

export interface TransactionTrends {
  /** Variation en % du volume vs période précédente (null = pas de base de comparaison) */
  totalTransactions: number | null
  /** Variation en % du montant encaissé vs période précédente */
  totalAmount: number | null
  /** Variation en points du taux de succès vs période précédente */
  successRate: number
}

export interface TransactionStats {
  totalTransactions: number
  successfulTransactions: number
  pendingTransactions: number
  failedTransactions: number
  totalAmount: number
  trends?: TransactionTrends | null
}

export interface TransactionTimeseriesPoint {
  period: string
  total: number
  successful: number
  failed: number
  pending: number
  amount: number
}

export interface TransactionTimeseries {
  interval: 'day' | 'month'
  series: TransactionTimeseriesPoint[]
}

export interface TransactionListParams {
  page?: number
  pageSize?: number
  status?: string
  paymentStatus?: string
  from?: string
  to?: string
  q?: string
}

export type UpdatablePaymentStatus = Exclude<PaymentStatus, 'initiated'>

const PAYMENT_STATUS_MAP: Record<string, PaymentStatus> = {
  pending: 'pending',
  initiated: 'initiated',
  processing: 'pending',
  waiting: 'pending',

  success: 'success',
  succeeded: 'success',
  completed: 'success',
  paid: 'success',
  accepted: 'success',

  failed: 'failed',
  fail: 'failed',
  refused: 'failed',
  rejected: 'failed',
  error: 'failed',

  refunded: 'refunded',
  refund: 'refunded',

  expired: 'expired',
  timeout: 'expired',

  cancelled: 'cancelled',
  canceled: 'cancelled'
}

export function normalizePaymentStatus(value?: string): PaymentStatus {
  const key = String(value || '').trim().toLowerCase()

  if (!key) return 'pending'

  return PAYMENT_STATUS_MAP[key] || 'pending'
}

class TransactionMonitoringService {
  async list(params: TransactionListParams = {}): Promise<ApiListResult<YoyoTransaction>> {
    const query = buildQuery({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      status: params.status,
      paymentStatus: params.paymentStatus,
      from: params.from,
      to: params.to,
      q: params.q
    })

    const response = await apiClient.get<ApiEnvelope<YoyoTransaction[]>>(`/transactions${query}`, {
      rawResponse: true
    })

    const result = extractListResult<YoyoTransaction>(response)

    return {
      ...result,
      rows: result.rows.map(row => ({
        ...row,
        rawPaymentStatus: String(row.paymentStatus || ''),
        paymentStatus: normalizePaymentStatus(row.paymentStatus)
      }))
    }
  }

  async getStats(
    params: { paymentStatus?: string; from?: string; to?: string; q?: string } = {}
  ): Promise<TransactionStats> {
    const query = buildQuery({
      paymentStatus: params.paymentStatus,
      from: params.from,
      to: params.to,
      q: params.q
    })

    const response = await apiClient.get<ApiEnvelope<TransactionStats>>(`/transactions/stats${query}`, {
      rawResponse: true
    })

    return (response as any).data || (response as any)
  }

  async getTimeseries(
    params: { paymentStatus?: string; from?: string; to?: string; q?: string; interval?: 'day' | 'month' } = {}
  ): Promise<TransactionTimeseries> {
    const query = buildQuery({
      paymentStatus: params.paymentStatus,
      from: params.from,
      to: params.to,
      q: params.q,
      interval: params.interval
    })

    const response = await apiClient.get<ApiEnvelope<TransactionTimeseries>>(`/transactions/timeseries${query}`, {
      rawResponse: true
    })

    const data = ((response as any).data || response) as Partial<TransactionTimeseries>

    return {
      interval: data.interval || 'day',
      series: Array.isArray(data.series) ? data.series : []
    }
  }

  async updatePaymentStatus(transactionId: string, paymentStatus: UpdatablePaymentStatus): Promise<void> {
    await apiClient.put('/transactions/update-status', {
      transactionId,
      paymentStatus
    })
  }
}

export const transactionMonitoringService = new TransactionMonitoringService()
