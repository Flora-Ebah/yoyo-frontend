import { apiClient } from './api.client'

/**
 * Interface pour un achat (Purchase)
 */
export interface Purchase {
  _id: string
  user:
    | {
        _id: string
        firstname?: string
        lastname?: string
        email?: string
        username?: string
      }
    | string // Peut être peuplé ou ID
  type: 'pack' | 'subscription'
  itemId?: string
  itemType?: string
  amount: number
  currency?: string
  paymentMethod?: string
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  transactionId?: string
  paymentUrl?: string
  paymentToken?: string

  // Abonnements
  subscriptionStartDate?: string
  subscriptionEndDate?: string
  subscriptionStatus?: 'active' | 'expired' | 'cancelled'

  // Métadonnées
  metadata?: any
  notes?: string
  status?: string
  createdAt: string
  updatedAt: string
}

/**
 * Interface pour la réponse paginée
 */
export interface PurchasesResponse {
  data: Purchase[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Service pour les opérations sur les achats
 */
export class PurchaseService {
  /**
   * Récupère la liste paginée des achats
   * GET /purchase
   */
  async getAll(params?: {
    page?: number
    limit?: number
    userId?: string
    type?: string
    paymentStatus?: string
    subscriptionStatus?: string
    status?: string
  }): Promise<PurchasesResponse> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.userId) queryParams.append('userId', params.userId)
    if (params?.type && params.type !== 'all') queryParams.append('type', params.type)
    if (params?.paymentStatus && params.paymentStatus !== 'all')
      queryParams.append('paymentStatus', params.paymentStatus)
    if (params?.subscriptionStatus && params.subscriptionStatus !== 'all')
      queryParams.append('subscriptionStatus', params.subscriptionStatus)
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status)

    const queryString = queryParams.toString()
    const endpoint = `/purchase${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<{
      data: Purchase[]
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
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: 0,
        totalPages: 0
      }
    }
  }

  /**
   * Récupère un achat par son ID
   * GET /purchase/:id
   */
  async getById(id: string): Promise<Purchase> {
    return await apiClient.get<Purchase>(`/purchase/${id}`)
  }

  /**
   * Met à jour le statut de paiement
   * PUT /purchase/payment-status
   */
  async updatePaymentStatus(id: string, status: string): Promise<Purchase> {
    return await apiClient.put<Purchase>('/purchase/payment-status', {
      purchaseId: id,
      status
    })
  }
}

export const purchaseService = new PurchaseService()
