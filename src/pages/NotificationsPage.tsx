import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, Check, CheckCheck, ListFilter as Filter, TriangleAlert as AlertTriangle, Shield, FileText, CircleAlert as AlertCircle, Info, User, GitBranch, Clock, MoveHorizontal as MoreHorizontal, Trash2, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatRelativeTime } from '@/lib/utils'
import { ListSkeleton } from '@/components/common/skeletons'
import { ErrorState, UnauthorizedState, EmptyState } from '@/components/common/states'
import { useState } from 'react'
import type { Notification } from '@/types'

const notificationTypeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  security: { icon: Shield, color: 'text-warning bg-warning/10' },
  finding: { icon: AlertTriangle, color: 'text-destructive bg-destructive/10' },
  policy: { icon: FileText, color: 'text-primary bg-primary/10' },
  system: { icon: Info, color: 'text-muted-foreground bg-muted' },
  user: { icon: User, color: 'text-success bg-success/10' },
  repository: { icon: GitBranch, color: 'text-primary bg-primary/10' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  critical: { label: 'Critical', color: 'bg-destructive text-destructive-foreground' },
  high: { label: 'High', color: 'bg-warning text-warning-foreground' },
  medium: { label: 'Medium', color: 'bg-primary text-primary-foreground' },
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
}

function NotificationsPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all')
  const [typeFilter, setTypeFilter] = useState<string | null>(null)

  const { data: response, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await axios.get('/api/v1/notifications?organization_id=1')
      return data
    },
  })

  const notifications = response?.data as Notification[] | undefined
  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0

  const filteredNotifications = notifications?.filter((n) => {
    const matchesReadStatus = filter === 'all' || (filter === 'unread' && !n.is_read) || (filter === 'critical' && n.priority === 'critical')
    const matchesType = !typeFilter || n.notification_type === typeFilter
    return matchesReadStatus && matchesType
  })

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await axios.post('/api/v1/notifications/mark-all-read?organization_id=1')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  if (isLoading) return <ListSkeleton items={5} />
  if (isError) {
    const status = (error as any)?.response?.status
    if (status === 401) return <UnauthorizedState />
    return <ErrorState onRetry={() => refetch()} />
  }

  const notificationTypes = [...new Set(notifications?.map((n) => n.notification_type) ?? [])]

  const groupedNotifications = filteredNotifications?.reduce((acc, notification) => {
    const date = new Date(notification.created_at).toDateString()
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    let groupKey = 'Older'
    if (date === today) groupKey = 'Today'
    else if (date === yesterday) groupKey = 'Yesterday'

    if (!acc[groupKey]) acc[groupKey] = []
    acc[groupKey].push(notification)
    return acc
  }, {} as Record<string, Notification[]>)

  const groupOrder = ['Today', 'Yesterday', 'Older']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
          >
            {markAllReadMutation.isPending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="h-4 w-4 border-2 border-background border-t-primary rounded-full mr-2"
              />
            ) : (
              <CheckCheck className="h-4 w-4 mr-2" />
            )}
            Mark all read
          </Button>
          <Button variant="outline" size="sm">
            <BellOff className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
            className="relative"
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </Button>
          <Button
            variant={filter === 'critical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('critical')}
          >
            Critical
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {typeFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTypeFilter(null)}
              className="text-xs"
            >
              Clear filter
            </Button>
          )}
          <select
            className="h-8 rounded-md border border-input bg-transparent px-3 text-sm"
            value={typeFilter || ''}
            onChange={(e) => setTypeFilter(e.target.value || null)}
          >
            <option value="">All types</option>
            {notificationTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredNotifications?.length === 0 ? (
        <EmptyState
          title="No notifications"
          description={filter === 'unread' ? "You've read everything!" : 'No notifications to display.'}
          icon={Bell}
        />
      ) : (
        <div className="space-y-6">
          {groupOrder.map((group) => {
            const groupNotifications = groupedNotifications?.[group]
            if (!groupNotifications || groupNotifications.length === 0) return null

            return (
              <div key={group}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-medium">{group}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {groupNotifications.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {groupNotifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        layout
                      >
                        <NotificationCard notification={notification} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

function NotificationCard({ notification }: { notification: Notification }) {
  const typeConfig = notificationTypeConfig[notification.notification_type] || notificationTypeConfig.system
  const Icon = typeConfig.icon
  const priorityConf = priorityConfig[notification.priority] || priorityConfig.low

  return (
    <Card
      className={cn(
        'overflow-hidden transition-colors hover:border-primary/50',
        !notification.is_read && 'border-l-2 border-l-primary'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg shrink-0', typeConfig.color)}>
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className={cn('font-medium text-sm', !notification.is_read && 'text-foreground')}>
                    {notification.title}
                  </p>
                  {!notification.is_read && (
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className={cn('text-xs', priorityConf.color)}
                >
                  {priorityConf.label}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs capitalize">
                  {notification.notification_type}
                </Badge>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(notification.created_at)}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!notification.is_read && (
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default NotificationsPage
