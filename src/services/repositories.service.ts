import { api } from './api'
import type { Repository } from '@/types'

export interface RepositoryListResponse {
  data: Repository[]
  total: number
}

class RepositoriesService {
  async getRepositories(organizationId: string): Promise<RepositoryListResponse> {
    return api.get(`/repositories?organization_id=${organizationId}`)
  }

  async getRepository(organizationId: string, repositoryId: string): Promise<Repository> {
    return api.get(`/repositories/${repositoryId}?organization_id=${organizationId}`)
  }

  async connectRepository(organizationId: string, data: {
    provider: 'github' | 'gitlab'
    url: string
    name: string
  }): Promise<Repository> {
    return api.post(`/repositories?organization_id=${organizationId}`, data)
  }

  async syncRepository(organizationId: string, repositoryId: string): Promise<void> {
    return api.post(`/repositories/${repositoryId}/sync?organization_id=${organizationId}`)
  }

  async disconnectRepository(organizationId: string, repositoryId: string): Promise<void> {
    return api.delete(`/repositories/${repositoryId}?organization_id=${organizationId}`)
  }
}

export const repositoriesService = new RepositoriesService()
