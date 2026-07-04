import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { findingsService, FindingListResponse } from '@/services/findings.service'
import { useCurrentOrganizationId } from '@/context'
import type { Finding } from '@/types'

export function useFindings(params?: {
  status?: string
  severity?: string
  repository?: string
  page?: number
  per_page?: number
}, options?: UseQueryOptions<FindingListResponse>) {
  const organizationId = useCurrentOrganizationId()

  return useQuery({
    queryKey: ['findings', organizationId, params],
    queryFn: () => findingsService.getFindings(organizationId, params),
    ...options,
  })
}

export function useFinding(findingId: number, options?: UseQueryOptions<Finding>) {
  const organizationId = useCurrentOrganizationId()

  return useQuery({
    queryKey: ['finding', organizationId, findingId],
    queryFn: () => findingsService.getFinding(organizationId, findingId),
    enabled: findingId > 0,
    ...options,
  })
}

export function useUpdateFinding() {
  const organizationId = useCurrentOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ findingId, data }: { findingId: number; data: Partial<Finding> }) =>
      findingsService.updateFinding(organizationId, findingId, data),
    onSuccess: (_, { findingId }) => {
      queryClient.invalidateQueries({ queryKey: ['findings', organizationId] })
      queryClient.invalidateQueries({ queryKey: ['finding', organizationId, findingId] })
    },
  })
}

export function useResolveFinding() {
  const organizationId = useCurrentOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (findingId: number) => findingsService.resolveFinding(organizationId, findingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings', organizationId] })
    },
  })
}

export function useDismissFinding() {
  const organizationId = useCurrentOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ findingId, reason }: { findingId: number; reason: string }) =>
      findingsService.dismissFinding(organizationId, findingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings', organizationId] })
    },
  })
}
