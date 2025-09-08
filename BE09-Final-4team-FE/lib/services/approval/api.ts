import apiClient from '../common/api-client'
import {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  BulkCategoryRequest,
  BulkCategoryResponse,
  TemplateResponse,
  TemplateSummaryResponse,
  TemplatesByCategoryResponse,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  DocumentResponse,
  DocumentSummaryResponse,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  ApprovalActionRequest,
  DocumentCommentResponse,
  CreateCommentRequest,
  GetDocumentsParams,
  GetTemplatesParams,
} from './types'
import { PageResult } from '../common/types'

// 카테고리 관련 API
export const categoryApi = {
  // 카테고리 목록 조회
  getCategories: async (): Promise<CategoryResponse[]> => {
    const response = await apiClient.get<CategoryResponse[]>('/api/approval/categories')
    return response.data
  },

  // 카테고리 상세 조회
  getCategoryById: async (id: number): Promise<CategoryResponse> => {
    const response = await apiClient.get<CategoryResponse>(`/api/approval/categories/${id}`)
    return response.data
  },

  // 카테고리 생성
  createCategory: async (request: CreateCategoryRequest): Promise<CategoryResponse> => {
    const response = await apiClient.post<CategoryResponse>('/api/approval/categories', request)
    return response.data
  },

  // 카테고리 수정
  updateCategory: async (id: number, request: UpdateCategoryRequest): Promise<CategoryResponse> => {
    const response = await apiClient.put<CategoryResponse>(`/api/approval/categories/${id}`, request)
    return response.data
  },

  // 카테고리 삭제
  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete<void>(`/api/approval/categories/${id}`)
  },

  // 카테고리 벌크 작업
  bulkProcessCategories: async (request: BulkCategoryRequest): Promise<BulkCategoryResponse> => {
    const response = await apiClient.post<BulkCategoryResponse>('/api/approval/categories/bulk', request)
    return response.data
  },
}

// 템플릿 관련 API
export const templateApi = {
  // 템플릿 목록 조회
  getTemplates: async (params?: GetTemplatesParams): Promise<TemplateSummaryResponse[]> => {
    const queryParams = params?.categoryId ? { categoryId: params.categoryId } : {}
    const response = await apiClient.get<TemplateSummaryResponse[]>('/api/approval/templates', {
      params: queryParams
    })
    return response.data
  },

  // 카테고리별 템플릿 조회
  getTemplatesByCategory: async (): Promise<TemplatesByCategoryResponse[]> => {
    const response = await apiClient.get<TemplatesByCategoryResponse[]>('/api/approval/templates/by-category')
    return response.data
  },

  // 템플릿 상세 조회
  getTemplateById: async (id: number): Promise<TemplateResponse> => {
    const response = await apiClient.get<TemplateResponse>(`/api/approval/templates/${id}`)
    return response.data
  },

  // 템플릿 생성
  createTemplate: async (request: CreateTemplateRequest): Promise<TemplateResponse> => {
    const response = await apiClient.post<TemplateResponse>('/api/approval/templates', request)
    return response.data
  },

  // 템플릿 수정
  updateTemplate: async (id: number, request: UpdateTemplateRequest): Promise<TemplateResponse> => {
    const response = await apiClient.put<TemplateResponse>(`/api/approval/templates/${id}`, request)
    return response.data
  },

  // 템플릿 삭제
  deleteTemplate: async (id: number): Promise<void> => {
    await apiClient.delete<void>(`/api/approval/templates/${id}`)
  },

  // 템플릿 공개/숨김 설정
  updateTemplateVisibility: async (id: number, isHidden: boolean): Promise<void> => {
    await apiClient.put<void>(`/api/approval/templates/${id}/visibility`, null, {
      params: { isHidden }
    })
  },
}

// 문서 관련 API
export const documentApi = {
  // 문서 목록 조회
  getDocuments: async (params: GetDocumentsParams): Promise<PageResult<DocumentSummaryResponse>> => {
    const queryParams: any = {
      page: params.pageable.page,
      size: params.pageable.size,
    }
    
    if (params.pageable.sort && params.pageable.sort.length > 0) {
      queryParams.sort = params.pageable.sort.join(',')
    }
    if (params.status && params.status.length > 0) {
      queryParams.status = params.status.join(',')
    }
    if (params.search) {
      queryParams.search = params.search
    }
    if (params.startDate) {
      queryParams.startDate = params.startDate
    }
    if (params.endDate) {
      queryParams.endDate = params.endDate
    }

    const response = await apiClient.get<PageResult<DocumentSummaryResponse>>('/api/approval/documents', {
      params: queryParams
    })
    return response.data
  },

  // 문서 상세 조회
  getDocumentById: async (id: number): Promise<DocumentResponse> => {
    const response = await apiClient.get<DocumentResponse>(`/api/approval/documents/${id}`)
    return response.data
  },

  // 문서 작성
  createDocument: async (request: CreateDocumentRequest): Promise<DocumentResponse> => {
    const response = await apiClient.post<DocumentResponse>('/api/approval/documents', request)
    return response.data
  },

  // 문서 수정
  updateDocument: async (id: number, request: UpdateDocumentRequest): Promise<DocumentResponse> => {
    const response = await apiClient.put<DocumentResponse>(`/api/approval/documents/${id}`, request)
    return response.data
  },

  // 문서 제출
  submitDocument: async (id: number): Promise<void> => {
    await apiClient.post<void>(`/api/approval/documents/${id}/submit`)
  },

  // 문서 승인
  approveDocument: async (id: number, request?: ApprovalActionRequest): Promise<void> => {
    await apiClient.post<void>(`/api/approval/documents/${id}/approve`, request || {})
  },

  // 문서 반려
  rejectDocument: async (id: number, request?: ApprovalActionRequest): Promise<void> => {
    await apiClient.post<void>(`/api/approval/documents/${id}/reject`, request || {})
  },

  // 문서 삭제
  deleteDocument: async (id: number): Promise<void> => {
    await apiClient.delete<void>(`/api/approval/documents/${id}`)
  },
}

// 댓글 관련 API
export const commentApi = {
  // 문서 댓글 목록 조회
  getComments: async (documentId: number): Promise<DocumentCommentResponse[]> => {
    const response = await apiClient.get<DocumentCommentResponse[]>(`/api/approval/documents/${documentId}/comments`)
    return response.data
  },

  // 문서 댓글 작성
  createComment: async (documentId: number, request: CreateCommentRequest): Promise<DocumentCommentResponse> => {
    const response = await apiClient.post<DocumentCommentResponse>(`/api/approval/documents/${documentId}/comments`, request)
    return response.data
  },
}

// 모든 API를 하나의 객체로 내보내기
export const approvalApi = {
  category: categoryApi,
  template: templateApi,
  document: documentApi,
  comment: commentApi,
}

export default approvalApi