import { api } from './api'
import type { SearchResult } from '@/types'

export interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
}

class SearchService {
  async semanticSearch(organizationId: string, params: {
    query: string
    top_k?: number
    similarity_threshold?: number
  }): Promise<SearchResponse> {
    const query = new URLSearchParams({
      organization_id: organizationId,
      query: params.query,
      top_k: (params.top_k ?? 10).toString(),
      similarity_threshold: (params.similarity_threshold ?? 0.6).toString(),
    })

    return api.get(`/search/semantic?${query.toString()}`)
  }
}

export const searchService = new SearchService()
