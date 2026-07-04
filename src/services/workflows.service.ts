import { api } from './api'
import type { Workflow } from '@/types'

export interface WorkflowListResponse {
  data: Workflow[]
  total: number
}

export interface CreateWorkflowRequest {
  name: string
  workflow_type: string
  assignee?: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

class WorkflowsService {
  async getWorkflows(organizationId: string, params?: {
    status?: string
    assignee?: string
  }): Promise<WorkflowListResponse> {
    const query = new URLSearchParams({ organization_id: organizationId })

    if (params?.status) query.append('status', params.status)
    if (params?.assignee) query.append('assignee', params.assignee)

    return api.get(`/workflows?${query.toString()}`)
  }

  async getWorkflow(organizationId: string, workflowId: number): Promise<Workflow> {
    return api.get(`/workflows/${workflowId}?organization_id=${organizationId}`)
  }

  async createWorkflow(organizationId: string, data: CreateWorkflowRequest): Promise<Workflow> {
    return api.post(`/workflows?organization_id=${organizationId}`, data)
  }

  async updateWorkflow(organizationId: string, workflowId: number, data: Partial<Workflow>): Promise<Workflow> {
    return api.patch(`/workflows/${workflowId}?organization_id=${organizationId}`, data)
  }

  async deleteWorkflow(organizationId: string, workflowId: number): Promise<void> {
    return api.delete(`/workflows/${workflowId}?organization_id=${organizationId}`)
  }
}

export const workflowsService = new WorkflowsService()
