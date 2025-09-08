import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { approvalApi } from '@/lib/services/approval/api'
import { 
  GetDocumentsParams, 
  DocumentSummaryResponse,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  ApprovalActionRequest,
  CreateCommentRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  BulkCategoryRequest,
  CreateTemplateRequest,
  UpdateTemplateRequest
} from '@/lib/services/approval/types'
import { toast } from 'sonner'

// 문서 목록 조회
export const useDocuments = (params: GetDocumentsParams) => {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => approvalApi.document.getDocuments(params),
    staleTime: 1000 * 60 * 2, // 2분
  })
}

// 문서 상세 조회
export const useDocument = (id: number | null) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => id ? approvalApi.document.getDocumentById(id) : Promise.reject('No ID'),
    enabled: !!id,
  })
}

// 문서 생성
export const useCreateDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (request: CreateDocumentRequest) => 
      approvalApi.document.createDocument(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('문서가 성공적으로 생성되었습니다.')
    },
    onError: () => {
      toast.error('문서 생성에 실패했습니다.')
    },
  })
}

// 문서 수정
export const useUpdateDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateDocumentRequest }) =>
      approvalApi.document.updateDocument(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('문서가 성공적으로 수정되었습니다.')
    },
    onError: () => {
      toast.error('문서 수정에 실패했습니다.')
    },
  })
}

// 문서 제출
export const useSubmitDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => approvalApi.document.submitDocument(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['document', id] })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('문서가 성공적으로 제출되었습니다.')
    },
    onError: () => {
      toast.error('문서 제출에 실패했습니다.')
    },
  })
}

// 문서 승인
export const useApproveDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request?: ApprovalActionRequest }) =>
      approvalApi.document.approveDocument(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('문서가 승인되었습니다.')
    },
    onError: () => {
      toast.error('문서 승인에 실패했습니다.')
    },
  })
}

// 문서 반려
export const useRejectDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request?: ApprovalActionRequest }) =>
      approvalApi.document.rejectDocument(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('문서가 반려되었습니다.')
    },
    onError: () => {
      toast.error('문서 반려에 실패했습니다.')
    },
  })
}

// 댓글 목록 조회
export const useComments = (documentId: number | null) => {
  return useQuery({
    queryKey: ['comments', documentId],
    queryFn: () => documentId ? approvalApi.comment.getComments(documentId) : Promise.reject('No document ID'),
    enabled: !!documentId,
  })
}

// 댓글 생성
export const useCreateComment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ documentId, request }: { documentId: number; request: CreateCommentRequest }) =>
      approvalApi.comment.createComment(documentId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document', variables.documentId] })
      queryClient.invalidateQueries({ queryKey: ['comments', variables.documentId] })
      toast.success('댓글이 작성되었습니다.')
    },
    onError: () => {
      toast.error('댓글 작성에 실패했습니다.')
    },
  })
}

// 문서 삭제
export const useDeleteDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => approvalApi.document.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('문서가 성공적으로 삭제되었습니다.')
    },
    onError: () => {
      toast.error('문서 삭제에 실패했습니다.')
    },
  })
}

// 템플릿 목록 조회
export const useTemplates = (categoryId?: number) => {
  return useQuery({
    queryKey: ['templates', categoryId],
    queryFn: () => approvalApi.template.getTemplates({ categoryId }),
  })
}

// 카테고리별 템플릿 조회
export const useTemplatesByCategory = () => {
  return useQuery({
    queryKey: ['templates-by-category'],
    queryFn: () => approvalApi.template.getTemplatesByCategory(),
  })
}

// 템플릿 상세 조회
export const useTemplate = (id: number | null) => {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => id ? approvalApi.template.getTemplateById(id) : Promise.reject('No ID'),
    enabled: !!id,
  })
}

// 템플릿 생성
export const useCreateTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (request: CreateTemplateRequest) => 
      approvalApi.template.createTemplate(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      queryClient.invalidateQueries({ queryKey: ['templates-by-category'] })
      toast.success('템플릿이 성공적으로 생성되었습니다.')
    },
    onError: () => {
      toast.error('템플릿 생성에 실패했습니다.')
    },
  })
}

// 템플릿 수정
export const useUpdateTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateTemplateRequest }) =>
      approvalApi.template.updateTemplate(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['template', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      queryClient.invalidateQueries({ queryKey: ['templates-by-category'] })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('템플릿이 성공적으로 수정되었습니다.')
    },
    onError: () => {
      toast.error('템플릿 수정에 실패했습니다.')
    },
  })
}

// 템플릿 삭제
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => approvalApi.template.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      queryClient.invalidateQueries({ queryKey: ['templates-by-category'] })
      toast.success('템플릿이 성공적으로 삭제되었습니다.')
    },
    onError: () => {
      toast.error('템플릿 삭제에 실패했습니다.')
    },
  })
}

// 템플릿 공개/숨김 설정
export const useUpdateTemplateVisibility = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, isHidden }: { id: number; isHidden: boolean }) =>
      approvalApi.template.updateTemplateVisibility(id, isHidden),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['template', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      queryClient.invalidateQueries({ queryKey: ['templates-by-category'] })
      toast.success(variables.isHidden ? '템플릿이 숨김 처리되었습니다.' : '템플릿이 공개되었습니다.')
    },
    onError: () => {
      toast.error('템플릿 공개 설정에 실패했습니다.')
    },
  })
}

// 카테고리 목록 조회
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => approvalApi.category.getCategories(),
  })
}

// 카테고리 상세 조회
export const useCategory = (id: number | null) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => id ? approvalApi.category.getCategoryById(id) : Promise.reject('No ID'),
    enabled: !!id,
  })
}

// 카테고리 생성
export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: approvalApi.category.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('카테고리가 성공적으로 생성되었습니다.')
    },
    onError: () => {
      toast.error('카테고리 생성에 실패했습니다.')
    },
  })
}

// 카테고리 수정
export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateCategoryRequest }) =>
      approvalApi.category.updateCategory(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['category', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('카테고리가 성공적으로 수정되었습니다.')
    },
    onError: () => {
      toast.error('카테고리 수정에 실패했습니다.')
    },
  })
}

// 카테고리 삭제
export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => approvalApi.category.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('카테고리가 성공적으로 삭제되었습니다.')
    },
    onError: () => {
      toast.error('카테고리 삭제에 실패했습니다.')
    },
  })
}

// 카테고리 벌크 작업
export const useBulkProcessCategories = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (request: BulkCategoryRequest) => approvalApi.category.bulkProcessCategories(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      console.log(`총 ${data.totalOperations}개 작업 중 ${data.successfulOperations}개 성공, ${data.failedOperations}개 실패`)
      
      if (data.failedOperations > 0) {
        toast.warning(`일부 분류 편집이 실패했습니다.`)
      } else {
        toast.success('분류 편집을 완료했습니다.')
      }
    },
    onError: () => {
      toast.error('분류 편집에 실패했습니다.')
    },
  })
}