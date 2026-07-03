export interface Document {
  id: number
  title: string
  document_type: string
  category: string | null
  is_approved: boolean
  created_at: string
  updated_at?: string
  tags?: string[]
}

export interface Workflow {
  id: number
  name: string
  workflow_type: string
  is_active: boolean
  created_at: string
  updated_at?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  status?: 'pending' | 'in_progress' | 'completed' | 'blocked'
  assignee?: string
  due_date?: string
}

export interface Notification {
  id: number
  title: string
  message: string
  notification_type: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  is_read: boolean
  created_at: string
}

export interface SearchResult {
  document_id: number
  content_snippet: string
  similarity_score: number
  embedding_model: string
}

export interface DashboardMetrics {
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

export interface Policy {
  id: number
  name: string
  policy_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  is_enabled: boolean
  created_at: string
}

export interface Finding {
  id: number
  title: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed'
  repository?: string
  created_at: string
  resolved_at?: string
}

export interface Repository {
  id: number
  name: string
  provider: 'github' | 'gitlab'
  url: string
  is_active: boolean
  last_synced_at?: string
}

export interface AuditLog {
  id: number
  action: string
  resource_type: string
  resource_id: number
  actor: string
  ip_address?: string
  created_at: string
}

export interface Report {
  id: number
  title: string
  report_type: string
  status: 'pending' | 'generating' | 'completed' | 'failed'
  created_at: string
  completed_at?: string
}
