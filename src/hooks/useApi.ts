import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { analyticsService, ExecutiveDashboard, DashboardMetrics } from '@/services/analytics.service'
import { useCurrentOrganizationId } from '@/context'

export function useDashboard(options?: UseQueryOptions<ExecutiveDashboard>) {
  const organizationId = useCurrentOrganizationId()

  return useQuery({
    queryKey: ['dashboard', organizationId],
    queryFn: () => analyticsService.getExecutiveDashboard(organizationId),
    ...options,
  })
}

export function useMetrics(options?: UseQueryOptions<DashboardMetrics>) {
  const organizationId = useCurrentOrganizationId()

  return useQuery({
    queryKey: ['metrics', organizationId],
    queryFn: () => analyticsService.getMetrics(organizationId),
    ...options,
  })
}
