import { api } from './api'

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url?: string
  created_at: string
  updated_at?: string
}

export interface OrganizationMember {
  id: string
  user_id: string
  organization_id: string
  role: string
  joined_at: string
}

class OrganizationService {
  async getOrganizations(): Promise<{ data: Organization[] }> {
    return api.get('/organizations')
  }

  async getOrganization(id: string): Promise<Organization> {
    return api.get(`/organizations/${id}`)
  }

  async getCurrentOrganization(): Promise<Organization | null> {
    const stored = localStorage.getItem('current_organization')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return null
      }
    }
    return null
  }

  setCurrentOrganization(organization: Organization): void {
    localStorage.setItem('current_organization', JSON.stringify(organization))
    window.dispatchEvent(new CustomEvent('organization:changed', { detail: organization }))
  }

  clearCurrentOrganization(): void {
    localStorage.removeItem('current_organization')
  }
}

export const organizationService = new OrganizationService()
