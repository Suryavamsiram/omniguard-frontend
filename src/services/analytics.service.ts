import { api } from './api'

export interface DashboardMetrics {
  coverage: number
  adoption: number
  total_findings: number
  open_findings: number
  critical_findings: number
  compliance_score: number
  risk_score: number
  repositories: number
  policies: number
  developers: number
}

export interface ComplianceTrend {
  month: string
  score: number
}

export interface RiskTrend {
  month: string
  score: number
}

export interface ExecutiveDashboard {
  metrics: DashboardMetrics
  compliance_trend?: ComplianceTrend[]
  risk_trend?: RiskTrend[]
}

class AnalyticsService {
  async getExecutiveDashboard(organizationId: string): Promise<ExecutiveDashboard> {
    return api.get(`/analytics/dashboard/executive?organization_id=${organizationId}`)
  }

  async getMetrics(organizationId: string): Promise<DashboardMetrics> {
    return api.get(`/analytics/metrics?organization_id=${organizationId}`)
  }
}

export const analyticsService = new AnalyticsService()
