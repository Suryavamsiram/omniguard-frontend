import { motion, AnimatePresence } from 'framer-motion'
import { Workflow as WorkflowIcon, Plus, MoveHorizontal as MoreHorizontal, Clock, User, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, Loader as Loader2, Pause, ListFilter as Filter, Search, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'
import { TableSkeleton } from '@/components/common/skeletons'
import { ErrorState, UnauthorizedState, EmptyState } from '@/components/common/states'
import { useState } from 'react'
import { useWorkflows } from '@/hooks'
import type { Workflow } from '@/types'

type WorkflowStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'

const statusConfig: Record<WorkflowStatus, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' },
  in_progress: { label: 'In Progress', icon: Loader2, color: 'text-primary', bg: 'bg-primary/10' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  blocked: { label: 'Blocked', icon: Pause, color: 'text-destructive', bg: 'bg-destructive/10' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  critical: { label: 'Critical', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  high: { label: 'High', color: 'bg-warning/10 text-warning border-warning/20' },
  medium: { label: 'Medium', color: 'bg-primary/10 text-primary border-primary/20' },
  low: { label: 'Low', color: 'bg-muted text-muted-foreground border-border' },
}

function WorkflowsPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: response, isLoading, error, isError, refetch } = useWorkflows()
  const workflows = response?.data as Workflow[] | undefined

  const columns: { status: WorkflowStatus; title: string }[] = [
    { status: 'pending', title: 'Pending' },
    { status: 'in_progress', title: 'In Progress' },
    { status: 'blocked', title: 'Blocked' },
    { status: 'completed', title: 'Completed' },
  ]

  const workflowsByStatus = columns.reduce((acc, col) => {
    acc[col.status] = workflows?.filter((w) => (w.status || 'pending') === col.status) ?? []
    return acc
  }, {} as Record<WorkflowStatus, Workflow[]>)

  const filteredWorkflows = workflows?.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) return <TableSkeleton rows={8} />
  if (isError) {
    const status = (error as any)?.response?.status
    if (status === 401) return <UnauthorizedState />
    return <ErrorState onRetry={() => refetch()} />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground">Manage and track workflow processes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}>
            {viewMode === 'kanban' ? 'List View' : 'Kanban View'}
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Start Workflow
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workflows..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {filteredWorkflows?.length === 0 ? (
        <EmptyState
          title="No workflows found"
          description="Start a new workflow to begin."
          icon={WorkflowIcon}
          action={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Start Workflow
            </Button>
          }
        />
      ) : viewMode === 'kanban' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {columns.map((column, colIndex) => {
            const statusConfig_ = statusConfig[column.status]
            const columnWorkflows = workflowsByStatus[column.status].filter((w) =>
              w.name.toLowerCase().includes(searchQuery.toLowerCase())
            )

            return (
              <motion.div
                key={column.status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: colIndex * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={cn('rounded-md p-1', statusConfig_.bg)}>
                          <statusConfig_.icon className={cn('h-3.5 w-3.5', statusConfig_.color)} />
                        </div>
                        {column.title}
                      </div>
                      <Badge variant="secondary" className="ml-auto">
                        {columnWorkflows.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 px-3 pb-3">
                    <AnimatePresence mode="popLayout">
                      {columnWorkflows.map((workflow, index) => (
                        <WorkflowCard key={workflow.id} workflow={workflow} index={index} />
                      ))}
                    </AnimatePresence>
                    {columnWorkflows.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-border rounded-lg">
                        <p className="text-xs text-muted-foreground">No items</p>
                      </div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full flex items-center justify-center gap-1 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Add item
                    </motion.button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Workflow</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Type</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Priority</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Created</th>
                    <th className="px-6 py-4 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredWorkflows?.map((workflow, index) => (
                    <motion.tr
                      key={workflow.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium">{workflow.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary">{workflow.workflow_type}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={(workflow.status || 'pending') as WorkflowStatus} />
                      </td>
                      <td className="px-6 py-4">
                        {workflow.priority && (
                          <Badge variant="outline" className={priorityConfig[workflow.priority]?.color}>
                            {priorityConfig[workflow.priority]?.label || workflow.priority}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(workflow.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}

function WorkflowCard({ workflow, index }: { workflow: Workflow; index: number }) {
  const status = (workflow.status || 'pending') as WorkflowStatus
  const config = statusConfig[status]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="group relative rounded-lg border border-border bg-card p-3 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="font-medium text-sm leading-tight">{workflow.name}</p>
          <p className="text-xs text-muted-foreground">{workflow.workflow_type}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 mt-3">
        {workflow.priority && (
          <Badge variant="outline" className={cn('text-xs', priorityConfig[workflow.priority]?.color)}>
            {priorityConfig[workflow.priority]?.label}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatRelativeTime(workflow.created_at)}
        </div>
        {workflow.assignee && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
            {workflow.assignee.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function StatusBadge({ status }: { status: WorkflowStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant="secondary" className={cn('gap-1', config.bg, config.color)}>
      <Icon className={cn('h-3 w-3', status === 'in_progress' && 'animate-spin')} />
      {config.label}
    </Badge>
  )
}

export default WorkflowsPage
