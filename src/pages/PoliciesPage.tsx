import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Plus, Search, MoveHorizontal as MoreHorizontal, CreditCard as Edit, Trash2, ToggleLeft, ToggleRight, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { TableSkeleton } from '@/components/common/skeletons'
import { ErrorState, EmptyState } from '@/components/common/states'
import { usePolicies } from '@/hooks'
import type { Policy } from '@/types'

const severityConfig = {
  critical: { label: 'Critical', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  high: { label: 'High', color: 'bg-warning/10 text-warning border-warning/20' },
  medium: { label: 'Medium', color: 'bg-primary/10 text-primary border-primary/20' },
  low: { label: 'Low', color: 'bg-muted text-muted-foreground border-border' },
}

const severityIcon = {
  critical: AlertTriangle,
  high: AlertTriangle,
  medium: Info,
  low: Info,
}

function PoliciesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const { data: response, isLoading, error, isError, refetch } = usePolicies({
    severity: selectedSeverity || undefined,
    policy_type: selectedType || undefined,
  })

  const policies = response?.data
  const filteredPolicies = policies?.filter((policy) =>
    policy.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) return <TableSkeleton rows={8} />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  const severities = ['critical', 'high', 'medium', 'low']
  const policyTypes = [...new Set(policies?.map((p) => p.policy_type) ?? [])]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Policies</h1>
          <p className="text-muted-foreground">Security and compliance policies</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Policy
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search policies..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
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

      {filteredPolicies?.length === 0 ? (
        <EmptyState
          title="No policies found"
          description="Create your first policy to enforce security standards."
          icon={Shield}
          action={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Policy</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Type</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Severity</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPolicies?.map((policy, index) => (
                    <PolicyRow key={policy.id} policy={policy} index={index} />
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

function PolicyRow({ policy, index }: { policy: Policy; index: number }) {
  const config = severityConfig[policy.severity] || severityConfig.low
  const Icon = severityIcon[policy.severity] || Info

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="hover:bg-muted/50 transition-colors"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{policy.name}</p>
            <p className="text-xs text-muted-foreground">ID: {policy.id}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge variant="secondary" className="capitalize">
          {policy.policy_type}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <Badge variant="outline" className={cn('gap-1', config.color)}>
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <Badge variant={policy.is_enabled ? 'success' : 'secondary'} className="gap-1">
          {policy.is_enabled ? (
            <>
              <CheckCircle2 className="h-3 w-3" />
              Enabled
            </>
          ) : (
            <>
              <ToggleLeft className="h-3 w-3" />
              Disabled
            </>
          )}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {policy.is_enabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </motion.tr>
  )
}

export default PoliciesPage
