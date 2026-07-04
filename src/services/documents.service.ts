import { api } from './api'
import type { Document } from '@/types'

export interface DocumentListResponse {
  data: Document[]
  total: number
  page: number
  per_page: number
}

export interface CreateDocumentRequest {
  title: string
  document_type: string
  category?: string
  content?: string
  tags?: string[]
}

export interface UpdateDocumentRequest {
  title?: string
  category?: string
  is_approved?: boolean
  tags?: string[]
}

class DocumentsService {
  async getDocuments(organizationId: string, params?: {
    page?: number
    per_page?: number
    document_type?: string
    category?: string
    search?: string
  }): Promise<DocumentListResponse> {
    const query = new URLSearchParams({ organization_id: organizationId })

    if (params?.page) query.append('page', params.page.toString())
    if (params?.per_page) query.append('per_page', params.per_page.toString())
    if (params?.document_type) query.append('document_type', params.document_type)
    if (params?.category) query.append('category', params.category)
    if (params?.search) query.append('search', params.search)

    return api.get(`/documents?${query.toString()}`)
  }

  async getDocument(organizationId: string, documentId: number): Promise<Document> {
    return api.get(`/documents/${documentId}?organization_id=${organizationId}`)
  }

  async createDocument(organizationId: string, data: CreateDocumentRequest): Promise<Document> {
    return api.post(`/documents?organization_id=${organizationId}`, data)
  }

  async updateDocument(organizationId: string, documentId: number, data: UpdateDocumentRequest): Promise<Document> {
    return api.patch(`/documents/${documentId}?organization_id=${organizationId}`, data)
  }

  async deleteDocument(organizationId: string, documentId: number): Promise<void> {
    return api.delete(`/documents/${documentId}?organization_id=${organizationId}`)
  }

  async uploadDocument(organizationId: string, file: File, metadata: CreateDocumentRequest): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('metadata', JSON.stringify(metadata))

    return api.post(`/documents/upload?organization_id=${organizationId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }
}

export const documentsService = new DocumentsService()
