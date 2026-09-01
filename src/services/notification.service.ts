import type { NotificationsType } from '@/components/layout/shared/NotificationsDropdown'
import { apiClient } from './api.client'

export interface INotification {
  _id: string
  userId: string
  type: string
  title: string
  message: string
  isRead: boolean
  metadata?: any
  priority?: string
  createdAt: string
  updatedAt: string
}

class NotificationService {
  private readonly basePath = '/notifications'

  private buildQuery(params?: Record<string, unknown>): string {
    if (!params) return ''

    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return
      queryParams.append(key, String(value))
    })

    const queryString = queryParams.toString()

    return queryString ? `?${queryString}` : ''
  }

  private isReadStatus(status?: string): boolean {
    const normalized = String(status || '').toLowerCase()
    return normalized === 'sent' || normalized === 'read' || normalized === 'delivered'
  }

  private normalizeNotification(item: any): INotification {
    const data = item?.data && typeof item.data === 'object' ? item.data : {}
    const to = item?.to
    const userId = typeof to === 'string' ? to : Array.isArray(to) ? (to[0] ?? '') : (item?.userId ?? '')
    const type = String(item?.category || item?.type || 'INFO')
    const message = String(data?.message || item?.message || '')
    const title = String(data?.title || item?.title || type)

    return {
      _id: String(item?._id || ''),
      userId,
      type,
      title,
      message,
      isRead: typeof item?.isRead === 'boolean' ? item.isRead : this.isReadStatus(item?.status),
      metadata: data?.data || item?.metadata,
      priority: item?.priority,
      createdAt: item?.createdAt || new Date().toISOString(),
      updatedAt: item?.updatedAt || item?.createdAt || new Date().toISOString()
    }
  }

  private normalizeList(payload: unknown): INotification[] {
    if (!Array.isArray(payload)) return []
    return payload.map(item => this.normalizeNotification(item))
  }

  async getMyNotifications(params?: { onlyUnread?: boolean; page?: number; pageSize?: number }) {
    const { onlyUnread, ...queryParams } = params || {}
    const query = this.buildQuery(queryParams as Record<string, unknown>)
    const rows = await apiClient.get<any[]>(`${this.basePath}/me${query}`)
    const normalized = this.normalizeList(rows)

    return onlyUnread ? normalized.filter(item => !item.isRead) : normalized
  }

  async getAllNotifications(params?: {
    page?: number
    pageSize?: number
    userId?: string
    type?: string
    isRead?: boolean
  }) {
    const { isRead, ...queryParams } = params || {}
    const query = this.buildQuery(queryParams as Record<string, unknown>)
    const rows = await apiClient.get<any[]>(`${this.basePath}${query}`)
    const normalized = this.normalizeList(rows)

    if (typeof isRead === 'boolean') {
      return normalized.filter(item => item.isRead === isRead)
    }

    return normalized
  }

  async getUnreadCount() {
    const notifications = await this.getMyNotifications({ pageSize: 100 })
    return { count: notifications.filter(item => !item.isRead).length }
  }

  async markAsRead(id: string) {
    const item = await apiClient.put<any>(`${this.basePath}/${id}/read`, {})
    return this.normalizeNotification(item)
  }

  async markAllAsRead() {
    return apiClient.put<{ success: boolean; modifiedCount: number }>(`${this.basePath}/read-all`, {})
  }

  async delete(id: string) {
    return apiClient.delete<{ status: number; message: string }>(`${this.basePath}/${id}`)
  }

  async deleteRead() {
    const notifications = await this.getMyNotifications({ pageSize: 100 })
    const readItems = notifications.filter(item => item.isRead)

    await Promise.all(readItems.map(item => this.delete(item._id)))

    return { success: true, deletedCount: readItems.length }
  }

  async create(data: {
    title: string
    message: string
    type: string
    userId?: string
    all?: boolean
    role?: string
    metadata?: any
  }) {
    if (!data.userId) {
      throw new Error("Le backend YoYo n'accepte actuellement que l'envoi de notification vers un utilisateur cible.")
    }

    const categoryMap: Record<string, 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'> = {
      info: 'INFO',
      success: 'SUCCESS',
      warning: 'WARNING',
      error: 'ERROR',
      danger: 'ERROR',
      system: 'INFO'
    }

    return apiClient.post<any>(this.basePath, {
      type: 'PUSH',
      category: categoryMap[String(data.type || 'info').toLowerCase()] || 'INFO',
      to: data.userId,
      data: {
        title: data.title,
        message: data.message,
        data: data.metadata
      }
    })
  }

  toFrontendFormat(notification: INotification): NotificationsType {
    return {
      title: notification.title,
      subtitle: notification.message,
      time: new Date(notification.createdAt).toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }),
      read: notification.isRead,
      avatarIcon: this.getNotificationIcon(notification.type),
      avatarColor: this.getNotificationColor(notification.type) as any,
      _id: notification._id,
      type: notification.type,
      metadata: notification.metadata,
      productId: notification.metadata?.productId || notification.metadata?.product_id
    } as NotificationsType & { _id: string; type: string }
  }

  private getNotificationIcon(type: string): string {
    const typeUpper = type?.toUpperCase() || 'INFO'

    switch (typeUpper) {
      case 'SUCCESS':
        return 'tabler-check'
      case 'ERROR':
      case 'DANGER':
        return 'tabler-alert-circle'
      case 'WARNING':
        return 'tabler-alert-triangle'
      default:
        return 'tabler-bell'
    }
  }

  private getNotificationColor(type: string): string {
    const typeUpper = type?.toUpperCase() || 'INFO'

    switch (typeUpper) {
      case 'SUCCESS':
        return 'success'
      case 'ERROR':
      case 'DANGER':
        return 'error'
      case 'WARNING':
        return 'warning'
      case 'INVITATION':
        return 'info'
      case 'MATCH':
        return 'primary'
      case 'TOURNAMENT':
        return 'secondary'
      default:
        return 'primary'
    }
  }
}

export const notificationService = new NotificationService()
