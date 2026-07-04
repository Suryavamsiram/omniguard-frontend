import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { documentsService, DocumentListResponse, CreateDocumentRequest, UpdateDocumentRequest } from '@/services/documents.service'
import { useCurrentOrganizationId } from '@/context'
import type { Document } from '@/types'

export function useDocuments(params?: {
  page?: number
  per_page?: number
  document_type?: string
  category?: string
  search?: string
}, options?: UseQueryOptions<DocumentListResponse>) {
  const organizationId = useCurrentOrganizationId()

  return useQuery({
    queryKey: ['documents', organizationId, params],
    queryFn: () => documentsService.getDocuments(organizationId, params),
    ...options,
  })
}

export function useDocument(documentId: number, options?: UseQueryOptions<Document>) {
  const organizationId = useCurrentOrganizationId()

  return useQuery({
    queryKey: ['document', organizationId, documentId],
    queryFn: () => documentsService.getDocument(organizationId, documentId),
    enabled: documentId > 0,
    ...options,
  })
}

export function useCreateDocument() {
  const organizationId = useCurrentOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDocumentRequest) => documentsService.createDocument(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', organizationId] })
    },
  })
}

export function useUpdateDocument() {
  const organizationId = useCurrentOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: number; data: UpdateDocumentRequest }) =>
      documentsService.updateDocument(organizationId, documentId, data),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents', organizationId] })
      queryClient.invalidateQueries({ queryKey: ['document', organizationId, documentId] })
    },
  })
}

export function useDeleteDocument() {
  const organizationId = useCurrentOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentId: number) => documentsService.deleteDocument(organizationId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', organizationId] })
    },
  })
}
