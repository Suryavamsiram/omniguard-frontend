import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { organizationService, Organization } from '@/services/organizations.service'
import { setOrganizationContext } from '@/services/api'
import { useAuth } from './AuthContext'

interface OrganizationContextType {
  currentOrganization: Organization | null
  organizations: Organization[]
  isLoading: boolean
  setCurrentOrganization: (org: Organization) => void
  refreshOrganizations: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const setCurrentOrganization = useCallback((org: Organization) => {
    setCurrentOrganizationState(org)
    organizationService.setCurrentOrganization(org)
    setOrganizationContext(org.id)
  }, [])

  const refreshOrganizations = useCallback(async () => {
    if (!isAuthenticated) return

    setIsLoading(true)
    try {
      const response = await organizationService.getOrganizations()
      setOrganizations(response.data)

      const storedOrg = await organizationService.getCurrentOrganization()
      if (storedOrg && response.data.some(o => o.id === storedOrg.id)) {
        setCurrentOrganizationState(storedOrg)
        setOrganizationContext(storedOrg.id)
      } else if (response.data.length > 0) {
        setCurrentOrganization(response.data[0])
      }
    } catch (error) {
      console.error('Failed to load organizations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, setCurrentOrganization])

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshOrganizations()
    } else {
      setCurrentOrganizationState(null)
      setOrganizations([])
      setOrganizationContext('')
    }
  }, [isAuthenticated, user, refreshOrganizations])

  useEffect(() => {
    const handleOrgChange = (event: CustomEvent<Organization>) => {
      setCurrentOrganizationState(event.detail)
      setOrganizationContext(event.detail.id)
    }

    window.addEventListener('organization:changed', handleOrgChange as EventListener)
    return () => window.removeEventListener('organization:changed', handleOrgChange as EventListener)
  }, [])

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        organizations,
        isLoading,
        setCurrentOrganization,
        refreshOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}

export function useCurrentOrganizationId(): string {
  const { currentOrganization } = useOrganization()
  const orgId = currentOrganization?.id

  if (!orgId) {
    throw new Error('No organization selected')
  }

  return orgId
}
