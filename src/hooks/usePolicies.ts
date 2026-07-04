import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { policiesService, PolicyListResponse } from '@/services/policies.service'
import { useCurrentOrganizationId } from '@/context'
import type { Policy } from '@/types'

export function usePolicies(params?: {
  policy_type?: string
  severity?: string
  is_enabled?: boolean
}, options?: UseQueryOptions<PolicyListResponse>) {
  const organizationId = useCurrentOrganizationId()

  return useQuery({
    queryKey: ['policies', organizationId, params],
    queryFn: () => policiesService.getPolicies(organizationId, params),
    ...options,
  })
}

export function usePolicy(policyId: number, options?: UseQueryOptions<Policy>) {
  const organizationId = useCurrentOrganizationId()

  return useQuery({
    queryKey: ['policy', organizationId, policyId],
    queryFn: () => policiesService.getPolicy(organizationId, policyId),
    enabled: policyId > 0,
    ...options,
  })
}

export function useCreatePolicy() {
  const organizationId = useCurrentOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Policy>) => policiesService.createPolicy(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies', organizationId] })
    },
  })
}

export function useUpdatePolicy() {
  const organizationId = useCurrentOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ policyId, data }: { policyId: number; data: Partial<Policy> }) =>
      policiesService.updatePolicy(organizationId, policyId, data),
    onSuccess: (_, { policyId }) => {
      queryClient.invalidateQueries({ queryKey: ['policies', organizationId] })
      queryClient.invalidateQueries({ queryKey: ['policy', organizationId, policyId] })
    },
  })
}

export function useDeletePolicy() {
  const organizationId = useCurrentOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (policyId: number) => policiesService.deletePolicy(organizationId, policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies', organizationId] })
    },
  })
}
