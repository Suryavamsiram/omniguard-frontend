import { motion } from 'framer-motion'
import { ChartBar as BarChart3, FileText, Download, Plus, Clock, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Loader as Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/common/states'

const mockReports = [
  { id: 1, title: 'Monthly Compliance Report', report_type: 'compliance', status: 'completed', created_at: '2024-01-15', completed_at: '2024-01-15' },
  { id: 2, title: 'Security Findings Summary', report_type: 'findings', status: 'completed', created_at: '2024-01-14', completed_at: '2024-01-14' },
  { id: 3, title: 'Executive Dashboard Export', report_type: 'executive', status: 'generating', created_at: '2024-01-16' },
]

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'text-muted-foreground bg-muted' },
  generating: { label: 'Generating', icon: Loader2, color: 'text-primary bg-primary/10' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-success bg-success/10' },
  failed: { label: 'Failed', icon: AlertCircle, color: 'text-destructive bg-destructive/10' },
}

const reportTypeIcons = {
  compliance: FileText,
  findings: BarChart3,
  executive: BarChart3,
}

function ReportsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generated compliance and security reports</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">Generated this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">3</div>
            <p className="text-sm text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">45</div>
            <p className="text-sm text-muted-foreground">Total reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-muted-foreground">—</div>
            <p className="text-sm text-muted-foreground">Downloads this week</p>
          </CardContent>
        </Card>
      </div>

      {mockReports.length === 0 ? (
        <EmptyState
          title="No reports"
          description="Generate your first compliance or security report."
          icon={BarChart3}
          action={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {mockReports.map((report, index) => {
            const config = statusConfig[report.status as keyof typeof statusConfig]
            const Icon = config.icon
            const TypeIcon = reportTypeIcons[report.report_type as keyof typeof reportTypeIcons] || FileText

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <TypeIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{report.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{report.report_type} report</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className={cn('gap-1', config.color)}>
                          <Icon className={cn('h-3 w-3', report.status === 'generating' && 'animate-spin')} />
                          {config.label}
                        </Badge>
                        {report.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
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

export default ReportsPage
