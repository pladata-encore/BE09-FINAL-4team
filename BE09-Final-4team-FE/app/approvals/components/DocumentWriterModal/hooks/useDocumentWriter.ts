import { useEffect, useCallback, useMemo, useRef, useState } from "react"
import { 
  TemplateResponse,
  DocumentFieldValueRequest,
  ApprovalStageRequest,
  ApprovalTargetRequest,
  TargetType,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentStatus,
  AttachmentUsageType
} from "@/lib/services/approval/types"
import { UserResponseDto } from "@/lib/services/user/types"
import { userApi } from "@/lib/services/user/api"
import { useCreateDocument, useUpdateDocument, useSubmitDocument, useDocument, useDeleteDocument } from "../../../hooks/useApproval"
import { Attachment } from "@/components/ui/attachments-manager"
import { LocalApprovalStage, LocalReference } from "../types"


export function useDocumentWriter(
  isOpen: boolean,
  formTemplate: TemplateResponse | null,
  draftDocumentId?: number
) {
  // 개별 상태 관리
  const contentRef = useRef("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [approvalStages, setApprovalStages] = useState<LocalApprovalStage[]>([{
    id: "stage-1",
    name: "1단계",
    approvers: []
  }])
  const [references, setReferences] = useState<LocalReference[]>([])
  const [formFieldValues, setFormFieldValues] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<UserResponseDto[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentDraftId, setCurrentDraftId] = useState<number | null>(draftDocumentId || null)
  const [isDraft, setIsDraft] = useState(!!draftDocumentId)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  // Approval 훅들
  const createDocument = useCreateDocument()
  const updateDocument = useUpdateDocument()
  const submitDocument = useSubmitDocument()
  const deleteDocument = useDeleteDocument()
  const { data: draftDocument, isLoading: draftLoading } = useDocument(currentDraftId)

  // 모달이 열릴 때/닫힐 때 상태 관리
  useEffect(() => {
    if (isOpen && formTemplate && !draftDocument) {
      // 초기화
      contentRef.current = formTemplate.bodyTemplate || ""
      setAttachments([])
      setApprovalStages([{
        id: "stage-1",
        name: "1단계",
        approvers: []
      }])
      setReferences([])
      setFormFieldValues({})
      setIsSubmitting(false)
      setError(null)
      setCurrentDraftId(draftDocumentId || null)
      setIsDraft(!!draftDocumentId)
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    } else if (!isOpen) {
      // 리셋
      contentRef.current = ""
      setAttachments([])
      setApprovalStages([{
        id: "stage-1",
        name: "1단계",
        approvers: []
      }])
      setReferences([])
      setFormFieldValues({})
      setIsSubmitting(false)
      setAvailableUsers([])
      setUsersLoading(false)
      setError(null)
      setCurrentDraftId(null)
      setIsDraft(false)
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }, [isOpen, formTemplate, draftDocument, draftDocumentId])

  // DRAFT 문서 로드 시 필드 초기화
  useEffect(() => {
    if (draftDocument && draftDocument.status === DocumentStatus.DRAFT) {
      contentRef.current = draftDocument.content || ""
      
      // 양식 필드 값 설정
      const fieldValues: Record<string, any> = {}
      draftDocument.fieldValues.forEach(fieldValue => {
        try {
          const value = fieldValue.fieldValue
          if (!value) {
            fieldValues[fieldValue.fieldName] = ""
            return
          }
          
          const parsedValue = value.startsWith('[') && value.endsWith(']') 
            ? JSON.parse(value)
            : value
          fieldValues[fieldValue.fieldName] = parsedValue
        } catch {
          fieldValues[fieldValue.fieldName] = fieldValue.fieldValue || ""
        }
      })
      setFormFieldValues(fieldValues)
      
      // 승인 단계 설정
      const stages: LocalApprovalStage[] = draftDocument.approvalStages.map((stage, index) => ({
        id: `stage-${stage.stageOrder}`,
        name: stage.stageName,
        approvers: stage.approvalTargets.filter(target => !target.isReference).map((target, targetIndex) => ({
          id: target.user?.id || (Date.now() + index * 1000 + targetIndex),
          name: target.user?.name || '',
          profileImageUrl: target.user?.profileImageUrl,
          position: (target.user as any)?.position || undefined
        } as UserResponseDto))
      }))
      
      if (stages.length === 0) {
        stages.push({
          id: "stage-1",
          name: "1단계",
          approvers: []
        })
      }
      setApprovalStages(stages)
      
      // 참조자 설정
      const referenceTargets = draftDocument.referenceTargets.map((target, index) => ({
        id: target.user?.id || Date.now() + index,
        name: target.user?.name || '',
        avatar: target.user?.profileImageUrl,
        position: (target.user as any)?.position?.name || ''
      }))
      
      const uniqueReferences = referenceTargets.filter((reference, index, self) => 
        self.findIndex(r => r.id === reference.id) === index
      )
      setReferences(uniqueReferences)
      
      // 첨부파일 설정
      const attachmentList: Attachment[] = draftDocument.attachments.map(attachment => ({
        id: attachment.fileId,
        name: attachment.fileName,
        size: (attachment.fileSize / 1024).toFixed(1) + 'KB',
        url: `/api/files/${attachment.fileId}/download`
      }))
      setAttachments(attachmentList)
    }
  }, [draftDocument])

  // 사용자 목록 로드
  useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true)
      setError(null)
      try {
        const users = await userApi.getAllUsers()
        setAvailableUsers(users)
      } catch (error) {
        console.error("사용자 목록 로드 실패:", error)
        setError("사용자 목록을 불러오는데 실패했습니다.")
      } finally {
        setUsersLoading(false)
      }
    }

    if (isOpen) {
      loadUsers()
    }
  }, [isOpen])

  // 임시저장 처리
  const handleSaveDraft = useCallback(async () => {
    if (!formTemplate) {
      setError("템플릿 정보를 불러오는 중입니다. 잠시만 기다려주세요.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    try {
      const fieldValues: DocumentFieldValueRequest[] = Object.entries(formFieldValues)
        .map(([fieldName, fieldValue]) => {
          const templateField = formTemplate.fields?.find(f => f.name === fieldName)
          if (!templateField?.id) return null // templateFieldId가 없으면 제외
          return {
            templateFieldId: templateField.id,
            fieldValue: Array.isArray(fieldValue) ? JSON.stringify(fieldValue) : String(fieldValue)
          }
        })
        .filter(Boolean) as DocumentFieldValueRequest[]

      const approvalStageRequests: ApprovalStageRequest[] = approvalStages.map((stage, index) => ({
        stageOrder: index + 1,
        stageName: stage.name,
        approvalTargets: stage.approvers.map(approver => ({
          targetType: TargetType.USER,
          userId: approver.id,
          isReference: false
        }))
      }))

      const referenceTargetRequests: ApprovalTargetRequest[] = references.map(reference => ({
        targetType: TargetType.USER,
        userId: reference.id,
        isReference: true
      }))

      const attachmentIds = attachments.map(attachment => attachment.id || '')

      if (currentDraftId) {
        // 기존 DRAFT 수정
        const updateRequest: UpdateDocumentRequest = {
          content: formTemplate.useBody ? contentRef.current : undefined,
          fieldValues,
          approvalStages: approvalStageRequests,
          referenceTargets: referenceTargetRequests,
          attachments: attachmentIds.length > 0 ? attachmentIds : undefined,
        }

        await updateDocument.mutateAsync({ id: currentDraftId, request: updateRequest })
      } else {
        // 새 DRAFT 생성
        const createRequest: CreateDocumentRequest = {
          templateId: formTemplate.id,
          content: formTemplate.useBody ? contentRef.current : undefined,
          fieldValues,
          approvalStages: approvalStageRequests,
          referenceTargets: referenceTargetRequests,
          attachments: attachmentIds.length > 0 ? attachmentIds : undefined,
          submitImmediately: false
        }

        const result = await createDocument.mutateAsync(createRequest)
        setCurrentDraftId(result.id)
        setIsDraft(true)
      }
    } catch (error) {
      console.error("문서 임시저장 중 오류:", error)
      const errorMessage = error instanceof Error ? error.message : "문서 임시저장 중 오류가 발생했습니다."
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }, [formTemplate, formFieldValues, approvalStages, references, attachments, currentDraftId, updateDocument, createDocument])

  // 문서 삭제
  const handleDelete = useCallback(async () => {
    if (!currentDraftId) return

    setIsDeleting(true)
    setError(null)
    
    try {
      await deleteDocument.mutateAsync(currentDraftId)
      return true // 성공 시 true 반환
    } catch (error) {
      console.error("문서 삭제 중 오류:", error)
      const errorMessage = error instanceof Error ? error.message : "문서 삭제 중 오류가 발생했습니다."
      setError(errorMessage)
      return false
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }, [currentDraftId, deleteDocument])

  // 제출 처리
  const handleSubmit = useCallback(async () => {
    if (!formTemplate) {
      setError("템플릿 정보를 불러오는 중입니다. 잠시만 기다려주세요.")
      return
    }

    // 유효성 검증
    if (formTemplate.useBody && !contentRef.current.trim()) {
      alert("내용을 입력해주세요.")
      return
    }

    if (approvalStages.some(stage => stage.approvers.length === 0)) {
      alert("모든 승인 단계에 승인자를 지정해주세요.")
      return
    }

    if (formTemplate.fields) {
      const missingFields = formTemplate.fields
        .filter(field => field.required)
        .filter(field => !formFieldValues[field.name] ||
          (Array.isArray(formFieldValues[field.name]) && formFieldValues[field.name].length === 0)
        )

      if (missingFields.length > 0) {
        alert(`다음 필수 필드를 입력해주세요: ${missingFields.map(f => f.name).join(', ')}`)
        return
      }
    }

    if (formTemplate.useAttachment === AttachmentUsageType.REQUIRED && attachments.length === 0) {
      alert("첨부파일을 업로드해주세요.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    try {
      if (currentDraftId) {
        // DRAFT 문서 제출
        await submitDocument.mutateAsync(currentDraftId)
        return true
      } else {
        // 새 문서 생성 후 바로 제출
        const fieldValues: DocumentFieldValueRequest[] = Object.entries(formFieldValues)
          .map(([fieldName, fieldValue]) => {
            const templateField = formTemplate.fields?.find(f => f.name === fieldName)
            if (!templateField?.id) return null // templateFieldId가 없으면 제외
            return {
              templateFieldId: templateField.id,
              fieldValue: Array.isArray(fieldValue) ? JSON.stringify(fieldValue) : String(fieldValue)
            }
          })
          .filter(Boolean) as DocumentFieldValueRequest[]

        const approvalStageRequests: ApprovalStageRequest[] = approvalStages.map((stage, index) => ({
          stageOrder: index + 1,
          stageName: stage.name,
          approvalTargets: stage.approvers.map(approver => ({
            targetType: TargetType.USER,
            userId: approver.id,
            isReference: false
          }))
        }))

        const referenceTargetRequests: ApprovalTargetRequest[] = references.map(reference => ({
          targetType: TargetType.USER,
          userId: reference.id,
          isReference: true
        }))

        const attachmentIds = attachments.map(attachment => attachment.id || '')

        const createDocumentRequest: CreateDocumentRequest = {
          templateId: formTemplate.id,
          content: formTemplate.useBody ? contentRef.current : undefined,
          fieldValues,
          approvalStages: approvalStageRequests,
          referenceTargets: referenceTargetRequests,
          attachments: attachmentIds.length > 0 ? attachmentIds : undefined,
          submitImmediately: true
        }

        await createDocument.mutateAsync(createDocumentRequest)
        return true
      }
    } catch (error) {
      console.error("문서 제출 중 오류:", error)
      const errorMessage = error instanceof Error ? error.message : "문서 제출 중 오류가 발생했습니다."
      setError(errorMessage)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [formTemplate, approvalStages, formFieldValues, attachments, currentDraftId, submitDocument, createDocument])

  const setContentCallback = useCallback((content: string) => {
    contentRef.current = content
  }, [])
  
  const setFormFieldValuesCallback = useCallback((values: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => {
    if (typeof values === 'function') {
      setFormFieldValues(prev => values(prev))
    } else {
      setFormFieldValues(values)
    }
  }, [])

  return {
    // 상태
    contentRef,
    attachments,
    approvalStages,
    references,
    formFieldValues,
    isSubmitting,
    availableUsers,
    usersLoading,
    error,
    currentDraftId,
    isDraft,
    isDeleting,
    showDeleteConfirm,
    
    // 액션
    setContent: setContentCallback,
    setAttachments,
    setApprovalStages,
    setReferences,
    setFormFieldValues: setFormFieldValuesCallback,
    setShowDeleteConfirm,
    
    // 핸들러
    handleSaveDraft,
    handleDelete,
    handleSubmit,

    // 훅들의 로딩 상태
    isCreating: createDocument.isPending,
    isUpdating: updateDocument.isPending,
    isSubmittingDocument: submitDocument.isPending,
    isDeletingDocument: deleteDocument.isPending,
    isDraftLoading: draftLoading
  }
}