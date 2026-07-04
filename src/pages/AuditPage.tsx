import { useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Search, ListFilter as Filter, User, Clock, Activity, Shield, FileText, GitBranch } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatRelativeTime } from '@/lib/utils'
import { TableSkeleton } from '@/components/common/skeletons'
import { ErrorState, EmptyState } from '@/components/common/states'

const mockAuditLogs = [
  { id: 1, action: 'policy.updated', resource_type: 'policy', resource_id: 12, actor: 'John Doe', ip_address: '192.168.1.1', created_at: new Date().toISOString() },
  { id: 2, action: 'document.uploaded', resource_type: 'document', resource_id: 45, actor: 'Sarah Chen', ip_address: '192.168.1.2', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, action: 'finding.resolved', resource_type: 'finding', resource_id: 78, actor: 'Mike Johnson', ip_address: '192.168.1.3', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 4, action: 'repository.connected', resource_type: 'repository', resource_id: 3, actor: 'John Doe', ip_address: '192.168.1.1', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 5, action: 'user.invited', resource_type: 'user', resource_id: 15, actor: 'Admin', ip_address: '192.168.1.100', created_at: new Date(Date.now() - 172800000).toISOString() },
]

const actionConfig: Record<string, { label: string; color: string }> = {
  'policy.updated': { label: 'Policy Updated', color: 'text-primary bg-primary/10' },
  'policy.created': { label: 'Policy Created', color: 'text-success bg-success/10' },
  'policy.deleted': { label: 'Policy Deleted', color: 'text-destructive bg-destructive/10' },
  'document.uploaded': { label: 'Document Uploaded', color: 'text-success bg-success/10' },
  'document.approved': { label: 'Document Approved', color: 'text-success bg-success/10' },
  'finding.resolved': { label: 'Finding Resolved', color: 'text-success bg-success/10' },
  'finding.dismissed': { label: 'Finding Dismissed', color: 'text-warning bg-warning/10' },
  'repository.connected': { label: 'Repository Connected', color: 'text-success bg-success/10' },
  'repository.disconnected': { label: 'Repository Disconnected', color: 'text-destructive bg-destructive/10' },
  'user.invited': { label: 'User Invited', color: 'text-primary bg-primary/10' },
}

const resourceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  policy: Shield,
  document: FileText,
  finding: Activity,
  repository: GitBranch,
  user: User,
}

function AuditPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResource, setSelectedResource] = useState<string | null>(null)

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesResource = !selectedResource || log.resource_type === selectedResource
    return matchesSearch && matchesResource
  })

  const resourceTypes = [...new Set(mockAuditLogs.map((l) => l.resource_type))]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">System activity and change history</p>
        </div>
        <Button variant="outline" size="sm">
          Export Logs
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search actions, users..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              {resourceTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedResource === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedResource(selectedResource === type ? null : type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredLogs.length === 0 ? (
        <EmptyState
          title="No audit logs"
          description="No activity matches your filters."
          icon={ClipboardList}
        />
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log, index) => {
            const config = actionConfig[log.action] || { label: log.action, color: 'text-muted-foreground bg-muted' }
            const Icon = resourceIcons[log.resource_type] || Activity

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className={cn('text-xs', config.color)}>
                            {config.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            by {log.actor}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{log.resource_type}#{log.resource_id}</span>
                          <span>{log.ip_address}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(log.created_at)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

export default AuditPage
