import { api } from './api'
import type { Notification } from '@/types'

export interface NotificationListResponse {
  data: Notification[]
  total: number
  unread_count: number
}

class NotificationsService {
  async getNotifications(organizationId: string, params?: {
    page?: number
    per_page?: number
    is_read?: boolean
    priority?: string
    notification_type?: string
  }): Promise<NotificationListResponse> {
    const query = new URLSearchParams({ organization_id: organizationId })

    if (params?.page) query.append('page', params.page.toString())
    if (params?.per_page) query.append('per_page', params.per_page.toString())
    if (params?.is_read !== undefined) query.append('is_read', params.is_read.toString())
    if (params?.priority) query.append('priority', params.priority)
    if (params?.notification_type) query.append('notification_type', params.notification_type)

    return api.get(`/notifications?${query.toString()}`)
  }

  async markAsRead(organizationId: string, notificationId: number): Promise<void> {
    return api.patch(`/notifications/${notificationId}/read?organization_id=${organizationId}`)
  }

  async markAllAsRead(organizationId: string): Promise<void> {
    return api.post(`/notifications/mark-all-read?organization_id=${organizationId}`)
  }

  async deleteNotification(organizationId: string, notificationId: number): Promise<void> {
    return api.delete(`/notifications/${notificationId}?organization_id=${organizationId}`)
  }
}

export const notificationsService = new NotificationsService()
