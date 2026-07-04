import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { workflowsService, WorkflowListResponse, CreateWorkflowRequest } from '@/services/workflows.service'
import { useCurrentOrganizationId } from '@/context'
import type { Workflow } from '@/types'

export function useWorkflows(params?: {
  status?: string
  assignee?: string
}, options?: UseQueryOptions<WorkflowListResponse>) {
  const organizationId = useCurrentOrganizationId()

  return useQuery({
    queryKey: ['workflows', organizationId, params],
    queryFn: () => workflowsService.getWorkflows(organizationId, params),
    ...options,
  })
}

export function useWorkflow(workflowId: number, options?: UseQueryOptions<Workflow>) {
  const organizationId = useCurrentOrganizationId()

  return useQuery({
    queryKey: ['workflow', organizationId, workflowId],
    queryFn: () => workflowsService.getWorkflow(organizationId, workflowId),
    enabled: workflowId > 0,
    ...options,
  })
}

export function useCreateWorkflow() {
  const organizationId = useCurrentOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWorkflowRequest) => workflowsService.createWorkflow(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows', organizationId] })
    },
  })
}

export function useUpdateWorkflow() {
  const organizationId = useCurrentOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workflowId, data }: { workflowId: number; data: Partial<Workflow> }) =>
      workflowsService.updateWorkflow(organizationId, workflowId, data),
    onSuccess: (_, { workflowId }) => {
      queryClient.invalidateQueries({ queryKey: ['workflows', organizationId] })
      queryClient.invalidateQueries({ queryKey: ['workflow', organizationId, workflowId] })
    },
  })
}
