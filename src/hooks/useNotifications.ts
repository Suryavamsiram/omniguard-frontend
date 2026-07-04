import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { notificationsService, NotificationListResponse } from '@/services/notifications.service'
import { useCurrentOrganizationId } from '@/context'

export function useNotifications(params?: {
  page?: number
  per_page?: number
  is_read?: boolean
  priority?: string
  notification_type?: string
}, options?: UseQueryOptions<NotificationListResponse>) {
  const organizationId = useCurrentOrganizationId()

  return useQuery({
    queryKey: ['notifications', organizationId, params],
    queryFn: () => notificationsService.getNotifications(organizationId, params),
    ...options,
  })
}

export function useMarkNotificationAsRead() {
  const organizationId = useCurrentOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: number) =>
      notificationsService.markAsRead(organizationId, notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', organizationId] })
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const organizationId = useCurrentOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', organizationId] })
    },
  })
}
