import { useState } from 'react'
import { motion } from 'framer-motion'
import { GitBranch, MoveHorizontal as MoreHorizontal, RefreshCw, Unlink, ExternalLink, Plus, Search, Clock, CircleCheck as CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatRelativeTime } from '@/lib/utils'
import { ListSkeleton } from '@/components/common/skeletons'
import { ErrorState, EmptyState } from '@/components/common/states'
import { useRepositories, useConnectRepository, useSyncRepository, useDisconnectRepository } from '@/hooks'
import { useOrganization } from '@/context'
import type { Repository } from '@/types'

const providerConfig = {
  github: { icon: GitBranch, color: 'bg-white/10 text-white' },
  gitlab: { icon: GitBranch, color: 'bg-orange-500/10 text-orange-500' },
}

function RepositoriesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { currentOrganization } = useOrganization()

  const { data: response, isLoading, error, isError, refetch } = useRepositories()
  const connectMutation = useConnectRepository()
  const syncMutation = useSyncRepository()
  const disconnectMutation = useDisconnectRepository()

  const repositories = response?.data
  const filteredRepositories = repositories?.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) return <ListSkeleton items={5} />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">Connected code repositories</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Connect Repository
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {filteredRepositories?.length === 0 ? (
        <EmptyState
          title="No repositories connected"
          description="Connect your first repository to start scanning for policy violations."
          icon={GitBranch}
          action={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Connect Repository
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRepositories?.map((repo, index) => (
            <RepositoryCard
              key={repo.id}
              repository={repo}
              index={index}
              onSync={() => syncMutation.mutate(repo.id)}
              onDisconnect={() => disconnectMutation.mutate(repo.id)}
              isSyncing={syncMutation.isPending}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

function RepositoryCard({
  repository,
  index,
  onSync,
  onDisconnect,
  isSyncing,
}: {
  repository: Repository
  index: number
  onSync: () => void
  onDisconnect: () => void
  isSyncing: boolean
}) {
  const config = providerConfig[repository.provider] || providerConfig.github
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', config.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{repository.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{repository.provider}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSync} disabled={isSyncing}>
                <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Badge variant={repository.is_active ? 'success' : 'secondary'} className="gap-1">
              {repository.is_active ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </>
              ) : (
                'Inactive'
              )}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {repository.last_synced_at
                ? `Synced ${formatRelativeTime(repository.last_synced_at)}`
                : 'Never synced'}
            </div>
            <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-destructive">
              <Unlink className="h-3 w-3 mr-1" />
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default RepositoriesPage
