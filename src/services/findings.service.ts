import { api } from './api'
import type { Finding } from '@/types'

export interface FindingListResponse {
  data: Finding[]
  total: number
}

class FindingsService {
  async getFindings(organizationId: string, params?: {
    status?: string
    severity?: string
    repository?: string
    page?: number
    per_page?: number
  }): Promise<FindingListResponse> {
    const query = new URLSearchParams({ organization_id: organizationId })

    if (params?.status) query.append('status', params.status)
    if (params?.severity) query.append('severity', params.severity)
    if (params?.repository) query.append('repository', params.repository)
    if (params?.page) query.append('page', params.page.toString())
    if (params?.per_page) query.append('per_page', params.per_page.toString())

    return api.get(`/findings?${query.toString()}`)
  }

  async getFinding(organizationId: string, findingId: number): Promise<Finding> {
    return api.get(`/findings/${findingId}?organization_id=${organizationId}`)
  }

  async updateFinding(organizationId: string, findingId: number, data: Partial<Finding>): Promise<Finding> {
    return api.patch(`/findings/${findingId}?organization_id=${organizationId}`, data)
  }

  async resolveFinding(organizationId: string, findingId: number): Promise<Finding> {
    return api.post(`/findings/${findingId}/resolve?organization_id=${organizationId}`)
  }

  async dismissFinding(organizationId: string, findingId: number, reason: string): Promise<Finding> {
    return api.post(`/findings/${findingId}/dismiss?organization_id=${organizationId}`, { reason })
  }
}

export const findingsService = new FindingsService()
