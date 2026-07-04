import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { repositoriesService, RepositoryListResponse } from '@/services/repositories.service'
import { useCurrentOrganizationId } from '@/context'
import type { Repository } from '@/types'

export function useRepositories(options?: UseQueryOptions<RepositoryListResponse>) {
  const organizationId = useCurrentOrganizationId()

  return useQuery({
    queryKey: ['repositories', organizationId],
    queryFn: () => repositoriesService.getRepositories(organizationId),
    ...options,
  })
}

export function useRepository(repositoryId: string, options?: UseQueryOptions<Repository>) {
  const organizationId = useCurrentOrganizationId()

  return useQuery({
    queryKey: ['repository', organizationId, repositoryId],
    queryFn: () => repositoriesService.getRepository(organizationId, repositoryId),
    enabled: !!repositoryId,
    ...options,
  })
}

export function useConnectRepository() {
  const organizationId = useCurrentOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { provider: 'github' | 'gitlab'; url: string; name: string }) =>
      repositoriesService.connectRepository(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositories', organizationId] })
    },
  })
}

export function useSyncRepository() {
  const organizationId = useCurrentOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (repositoryId: string) =>
      repositoriesService.syncRepository(organizationId, repositoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositories', organizationId] })
    },
  })
}

export function useDisconnectRepository() {
  const organizationId = useCurrentOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (repositoryId: string) =>
      repositoriesService.disconnectRepository(organizationId, repositoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositories', organizationId] })
    },
  })
}
