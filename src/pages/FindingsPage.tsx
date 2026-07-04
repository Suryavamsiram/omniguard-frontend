import { useState } from 'react'
import { motion } from 'framer-motion'
import { TriangleAlert as AlertTriangle, Search, ListFilter as Filter, MoveHorizontal as MoreHorizontal, ExternalLink, CircleCheck as CheckCircle2, Circle as XCircle, Clock, User, GitBranch } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatRelativeTime } from '@/lib/utils'
import { TableSkeleton } from '@/components/common/skeletons'
import { ErrorState, EmptyState } from '@/components/common/states'
import { useFindings, useResolveFinding, useDismissFinding } from '@/hooks'
import type { Finding } from '@/types'

const severityConfig = {
  critical: { label: 'Critical', color: 'bg-destructive/10 text-destructive border-destructive/20', score: '9.0-10.0' },
  high: { label: 'High', color: 'bg-warning/10 text-warning border-warning/20', score: '7.0-8.9' },
  medium: { label: 'Medium', color: 'bg-primary/10 text-primary border-primary/20', score: '4.0-6.9' },
  low: { label: 'Low', color: 'bg-muted text-muted-foreground border-border', score: '0.1-3.9' },
}

const statusConfig = {
  open: { label: 'Open', color: 'bg-destructive/10 text-destructive' },
  in_progress: { label: 'In Progress', color: 'bg-primary/10 text-primary' },
  resolved: { label: 'Resolved', color: 'bg-success/10 text-success' },
  dismissed: { label: 'Dismissed', color: 'bg-muted text-muted-foreground' },
}

function FindingsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const { data: response, isLoading, error, isError, refetch } = useFindings({
    severity: selectedSeverity || undefined,
    status: selectedStatus || undefined,
  })

  const findings = response?.data
  const filteredFindings = findings?.filter((finding) =>
    finding.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const resolveMutation = useResolveFinding()

  if (isLoading) return <TableSkeleton rows={8} />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  const severities = ['critical', 'high', 'medium', 'low']
  const statuses = ['open', 'in_progress', 'resolved', 'dismissed']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Findings</h1>
          <p className="text-muted-foreground">Security vulnerabilities and policy violations</p>
        </div>
        <Button variant="outline" size="sm">
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {severities.map((severity) => {
          const config = severityConfig[severity as keyof typeof severityConfig]
          const count = findings?.filter((f) => f.severity === severity && f.status !== 'resolved' && f.status !== 'dismissed').length ?? 0
          return (
            <Card key={severity}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground capitalize">{severity}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <Badge variant="outline" className={config.color}>
                    CVSS {config.score}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search findings..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {severities.map((severity) => (
                <Button
                  key={severity}
                  variant={selectedSeverity === severity ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSeverity(selectedSeverity === severity ? null : severity)}
                  className="capitalize"
                >
                  {severity}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredFindings?.length === 0 ? (
        <EmptyState
          title="No findings"
          description="No security findings match your filters."
          icon={AlertTriangle}
        />
      ) : (
        <div className="space-y-3">
          {filteredFindings?.map((finding, index) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              index={index}
              onResolve={() => resolveMutation.mutate(finding.id)}
              isResolving={resolveMutation.isPending}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

function FindingCard({
  finding,
  index,
  onResolve,
  isResolving,
}: {
  finding: Finding
  index: number
  onResolve: () => void
  isResolving: boolean
}) {
  const sevConfig = severityConfig[finding.severity] || severityConfig.low
  const statConfig = statusConfig[finding.status] || statusConfig.open

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', sevConfig.color)}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{finding.title}</p>
                  <Badge variant="outline" className={cn('text-xs', sevConfig.color)}>
                    {sevConfig.label}
                  </Badge>
                  <Badge variant="secondary" className={cn('text-xs', statConfig.color)}>
                    {statConfig.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {finding.repository && (
                    <div className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {finding.repository}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(finding.created_at)}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {finding.status !== 'resolved' && finding.status !== 'dismissed' && (
                <Button size="sm" onClick={onResolve} disabled={isResolving}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Resolve
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default FindingsPage
