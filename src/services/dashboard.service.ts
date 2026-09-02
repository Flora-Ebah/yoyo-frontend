import { clientManagementService } from './client-management.service'
import { moderationService } from './moderation.service'
import { paymentMonitoringService, type TopPartner } from './payment-monitoring.service'
import { proManagementService, type ProGeoPoint, type PlatformProStats } from './pro-management.service'
import {
  transactionMonitoringService,
  type TransactionTrends,
  type TransactionTimeseries
} from './transaction-monitoring.service'

export interface DashboardStats {
  clients: {
    total: number
  }
  pros: {
    total: number
  }
  transactions: {
    total: number
    successful: number
    pending: number
    failed: number
    totalAmount: number
    trends?: TransactionTrends | null
  }
  moderation: {
    certificationsTotal: number
    questionsTotal: number
    reviewQueue: number
  }
}

export interface DashboardAnalyticsFilters {
  from?: string
  to?: string
  paymentStatus?: string
  certified?: string
}

export interface DashboardAnalytics {
  transactions: {
    total: number
    successful: number
    pending: number
    failed: number
    totalAmount: number
    trends: TransactionTrends | null
  }
  pros: PlatformProStats
  timeseries: TransactionTimeseries
  topPartners: TopPartner[]
  geo: ProGeoPoint[]
}

/**
 * Service de consolidation des indicateurs du dashboard YoYo.
 */
export class DashboardService {
  async getStats(filters: { from?: string; to?: string; paymentStatus?: string } = {}): Promise<DashboardStats> {
    const [clients, pros, transactionStats, certifications, questions] = await Promise.all([
      clientManagementService.list({ page: 1, pageSize: 1 }),
      proManagementService.list({ page: 1, pageSize: 1 }),
      transactionMonitoringService.getStats({
        from: filters.from,
        to: filters.to,
        paymentStatus: filters.paymentStatus
      }),
      moderationService.listCertifications({ page: 1, pageSize: 200, orderBy: 'desc', sortBy: 'createdAt', from: filters.from, to: filters.to }),
      moderationService.listQuestions({ page: 1, pageSize: 1 })
    ])

    const reviewQueue = certifications.rows.filter(item => {
      const status = (item.verificationStatus || '').toLowerCase()

      return status === 'en-attente' || status === 'en-cours'
    }).length

    return {
      clients: {
        total: clients.meta.totalRows
      },
      pros: {
        total: pros.meta.totalRows
      },
      transactions: {
        total: transactionStats.totalTransactions || 0,
        successful: transactionStats.successfulTransactions || 0,
        pending: transactionStats.pendingTransactions || 0,
        failed: transactionStats.failedTransactions || 0,
        totalAmount: transactionStats.totalAmount || 0,
        trends: transactionStats.trends ?? null
      },
      moderation: {
        certificationsTotal: certifications.meta.totalRows,
        questionsTotal: questions.meta.totalRows,
        reviewQueue
      }
    }
  }

  /**
   * Indicateurs analytiques de l'onglet « Analyses » (séries temporelles, top pros, carte,
   * tendances), tous pilotés par les filtres (plage de dates, statut de paiement, certification).
   */
  async getAnalytics(filters: DashboardAnalyticsFilters = {}): Promise<DashboardAnalytics> {
    const { from, to, paymentStatus, certified } = filters

    const [txStats, prosStats, timeseries, topPartners, geo] = await Promise.all([
      transactionMonitoringService.getStats({ from, to, paymentStatus }),
      proManagementService.getPlatformStats({ from, to, certified }),
      transactionMonitoringService.getTimeseries({ from, to, paymentStatus }),
      paymentMonitoringService.getTopPartners({ from, to, certified }),
      proManagementService.getGeoDistribution({ certified })
    ])

    return {
      transactions: {
        total: txStats.totalTransactions || 0,
        successful: txStats.successfulTransactions || 0,
        pending: txStats.pendingTransactions || 0,
        failed: txStats.failedTransactions || 0,
        totalAmount: txStats.totalAmount || 0,
        trends: txStats.trends ?? null
      },
      pros: prosStats,
      timeseries,
      topPartners,
      geo
    }
  }
}

export const dashboardService = new DashboardService()
