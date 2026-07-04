import { useDashboard } from '@/hooks/useApi'
import { motion } from 'framer-motion'
import { Shield, TriangleAlert as AlertTriangle, GitBranch, FileCheck, Users, TrendingUp, TrendingDown, ArrowUpRight, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { DashboardSkeleton } from '@/components/common/skeletons'
import { ErrorState, UnauthorizedState } from '@/components/common/states'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardMetrics {
  coverage: number
  adoption: number
  total_findings: number
  open_findings: number
  critical_findings: number
  compliance_score?: number
  risk_score?: number
  repositories?: number
  policies?: number
  developers?: number
}

const complianceTrend = [
  { month: 'Jan', score: 72 },
  { month: 'Feb', score: 75 },
  { month: 'Mar', score: 78 },
  { month: 'Apr', score: 82 },
  { month: 'May', score: 85 },
  { month: 'Jun', score: 88 },
]

const riskTrend = [
  { month: 'Jan', score: 45 },
  { month: 'Feb', score: 42 },
  { month: 'Mar', score: 38 },
  { month: 'Apr', score: 35 },
  { month: 'May', score: 32 },
  { month: 'Jun', score: 28 },
]

const recentActivity = [
  { id: 1, type: 'policy', action: 'Policy "Password Requirements" updated', time: '2m ago', icon: Shield },
  { id: 2, type: 'finding', action: 'Critical finding detected in API Gateway', time: '15m ago', icon: AlertTriangle },
  { id: 3, type: 'repo', action: 'Repository "auth-service" connected', time: '1h ago', icon: GitBranch },
  { id: 4, type: 'user', action: 'Developer Sarah K. joined team', time: '2h ago', icon: Users },
  { id: 5, type: 'document', action: 'Document "Security Guidelines" approved', time: '3h ago', icon: FileCheck },
]

function DashboardPage() {
  const { data: response, isLoading, error, isError, refetch } = useDashboard()
  const metrics = response?.metrics as DashboardMetrics | undefined

  if (isLoading) return <DashboardSkeleton />
  if (isError) {
    const status = (error as any)?.response?.status
    if (status === 401) return <UnauthorizedState />
    return <ErrorState onRetry={() => refetch()} />
  }

  const coverageValue = metrics?.coverage ?? 0
  const adoptionValue = metrics?.adoption ?? 0
  const complianceScore = metrics?.compliance_score ?? 87

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Governance metrics and policy health summary</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button size="sm">
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Compliance Score"
          value={`${complianceScore}%`}
          description="Overall compliance health"
          trend={+3.2}
          icon={Shield}
          iconClassName="text-success bg-success/10"
        />
        <MetricCard
          title="Risk Score"
          value="28"
          description="Identified risks"
          trend={-12}
          trendDown
          icon={AlertTriangle}
          iconClassName="text-warning bg-warning/10"
        />
        <MetricCard
          title="Open Findings"
          value={metrics?.open_findings ?? 0}
          description="Requiring attention"
          trend={-8}
          trendDown
          icon={AlertTriangle}
          iconClassName="text-destructive bg-destructive/10"
        />
        <MetricCard
          title="Critical Findings"
          value={metrics?.critical_findings ?? 0}
          description="High priority issues"
          trend={+2}
          icon={AlertTriangle}
          iconClassName="text-destructive bg-destructive/10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Repositories"
          value={metrics?.repositories ?? 24}
          icon={GitBranch}
        />
        <StatCard
          title="Policies"
          value={metrics?.policies ?? 47}
          icon={Shield}
        />
        <StatCard
          title="Developers"
          value={metrics?.developers ?? 156}
          icon={Users}
        />
        <StatCard
          title="Documents"
          value={metrics?.total_findings ?? 89}
          icon={FileCheck}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Compliance Trend
              <Badge variant="success" className="text-xs">+15% this quarter</Badge>
            </CardTitle>
            <CardDescription>6-month compliance score progression</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complianceTrend}>
                  <defs>
                    <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142.1 76.2% 36.3%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142.1 76.2% 36.3%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 17.5%)" />
                  <XAxis dataKey="month" stroke="hsl(215 20.2% 65.1%)" fontSize={12} />
                  <YAxis stroke="hsl(215 20.2% 65.1%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222.2 84% 4.9%)',
                      border: '1px solid hsl(217.2 32.6% 17.5%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(142.1 76.2% 36.3%)"
                    fill="url(#complianceGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Risk Trend
              <Badge variant="warning" className="text-xs">-38% reduction</Badge>
            </CardTitle>
            <CardDescription>6-month risk score progression</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217.2 32.6% 17.5%)" />
                  <XAxis dataKey="month" stroke="hsl(215 20.2% 65.1%)" fontSize={12} />
                  <YAxis stroke="hsl(215 20.2% 65.1%)" fontSize={12} reversed />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222.2 84% 4.9%)',
                      border: '1px solid hsl(217.2 32.6% 17.5%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(45.4 93.4% 47.5%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(45.4 93.4% 47.5%)', strokeWidth: 0, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <QuickActionItem
                title="Run Policy Scan"
                description="Scan all repositories for violations"
                icon={Shield}
              />
              <QuickActionItem
                title="Review Findings"
                description={`${metrics?.open_findings ?? 0} open items need attention`}
                icon={AlertTriangle}
              />
              <QuickActionItem
                title="Upload Document"
                description="Add new governance document"
                icon={FileCheck}
              />
              <QuickActionItem
                title="Generate Report"
                description="Create compliance report"
                icon={TrendingUp}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Activity
              <Button variant="ghost" size="sm" className="text-xs">
                View all
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <activity.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Coverage</CardTitle>
            <CardDescription>Repository coverage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">{coverageValue.toFixed(1)}%</div>
            <Progress value={coverageValue} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(24 * coverageValue / 100)} of 24 repositories
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Adoption</CardTitle>
            <CardDescription>Policy adoption rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">{adoptionValue.toFixed(1)}%</div>
            <Progress value={adoptionValue} className="h-2" indicatorClassName="bg-success" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(156 * adoptionValue / 100)} of 156 developers
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Policy Violations</CardTitle>
            <CardDescription>Latest security findings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ViolationItem
                severity="critical"
                title="Hardcoded credentials in config.py"
                repo="auth-service"
                time="2m ago"
              />
              <ViolationItem
                severity="high"
                title="SQL injection vulnerability"
                repo="api-gateway"
                time="15m ago"
              />
              <ViolationItem
                severity="medium"
                title="Missing HTTPS enforcement"
                repo="web-frontend"
                time="1h ago"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

function MetricCard({
  title,
  value,
  description,
  trend,
  trendDown,
  icon: Icon,
  iconClassName,
}: {
  title: string
  value: string | number
  description: string
  trend?: number
  trendDown?: boolean
  icon: React.ComponentType<{ className?: string }>
  iconClassName?: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {trend !== undefined && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trendDown ? 'text-success' : trend > 0 ? 'text-success' : 'text-destructive'
            )}>
              {trendDown ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground opacity-50" />
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActionItem({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Button
      variant="outline"
      className="h-auto flex items-start justify-start gap-3 p-4 text-left"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </Button>
  )
}

function ViolationItem({
  severity,
  title,
  repo,
  time,
}: {
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  repo: string
  time: string
}) {
  const severityColors = {
    critical: 'bg-destructive/10 text-destructive border-destructive/20',
    high: 'bg-warning/10 text-warning border-warning/20',
    medium: 'bg-primary/10 text-primary border-primary/20',
    low: 'bg-muted text-muted-foreground border-border',
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted">
        <AlertTriangle className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{title}</p>
          <Badge variant="outline" className={cn('text-xs', severityColors[severity])}>
            {severity}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">{repo}</span>
          <span className="text-xs text-muted-foreground">{'•'}</span>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <ArrowUpRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default DashboardPage
