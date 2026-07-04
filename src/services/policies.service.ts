import { api } from './api'
import type { Policy } from '@/types'

export interface PolicyListResponse {
  data: Policy[]
  total: number
}

class PoliciesService {
  async getPolicies(organizationId: string, params?: {
    policy_type?: string
    severity?: string
    is_enabled?: boolean
  }): Promise<PolicyListResponse> {
    const query = new URLSearchParams({ organization_id: organizationId })

    if (params?.policy_type) query.append('policy_type', params.policy_type)
    if (params?.severity) query.append('severity', params.severity)
    if (params?.is_enabled !== undefined) query.append('is_enabled', params.is_enabled.toString())

    return api.get(`/policies?${query.toString()}`)
  }

  async getPolicy(organizationId: string, policyId: number): Promise<Policy> {
    return api.get(`/policies/${policyId}?organization_id=${organizationId}`)
  }

  async createPolicy(organizationId: string, data: Partial<Policy>): Promise<Policy> {
    return api.post(`/policies?organization_id=${organizationId}`, data)
  }

  async updatePolicy(organizationId: string, policyId: number, data: Partial<Policy>): Promise<Policy> {
    return api.patch(`/policies/${policyId}?organization_id=${organizationId}`, data)
  }

  async deletePolicy(organizationId: string, policyId: number): Promise<void> {
    return api.delete(`/policies/${policyId}?organization_id=${organizationId}`)
  }
}

export const policiesService = new PoliciesService()
