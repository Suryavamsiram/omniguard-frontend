import { useMutation, useQueryClient } from '@tanstack/react-query'
import { searchService, SearchResponse } from '@/services/search.service'
import { useCurrentOrganizationId } from '@/context'

export function useSemanticSearch() {
  const organizationId = useCurrentOrganizationId()

  return useMutation({
    mutationFn: (params: { query: string; top_k?: number; similarity_threshold?: number }) =>
      searchService.semanticSearch(organizationId, params),
  })
}
