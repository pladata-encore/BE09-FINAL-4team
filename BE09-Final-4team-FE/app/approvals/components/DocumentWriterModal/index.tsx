"use client"

import { useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Trash2 } from "lucide-react"
import { typography } from "@/lib/design-tokens"
import { TemplateIcon } from "../common/TemplateIcon"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useDocumentWriter } from "./hooks/useDocumentWriter"
import { useTemplate } from "../../hooks/useApproval"
import { DesktopLayout } from "./layouts/DesktopLayout"
import { MobileLayout } from "./layouts/MobileLayout"
import { DocumentWriterModalProps } from "./types"

export function DocumentWriterModal({
  isOpen,
  onClose,
  onBack,
  templateId,
  templateSummary,
  draftDocumentId
}: DocumentWriterModalProps) {
  // 템플릿 전체 정보 로드
  const { data: formTemplate, isLoading: templateLoading } = useTemplate(templateId)
  const {
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
    setContent,
    setAttachments,
    setApprovalStages,
    setReferences,
    setFormFieldValues,
    setShowDeleteConfirm,
    
    // 핸들러
    handleSaveDraft,
    handleDelete,
    handleSubmit,
    
    // 훅들의 로딩 상태
    isCreating,
    isUpdating,
    isSubmittingDocument,
    isDeletingDocument
  } = useDocumentWriter(isOpen, formTemplate, draftDocumentId)

  // 삭제 처리 (성공시 모달 닫기)
  const onDelete = async () => {
    const success = await handleDelete()
    if (success) {
      onClose()
    }
  }

  // 제출 처리 (성공시 모달 닫기)
  const onSubmit = async () => {
    const success = await handleSubmit()
    if (success) {
      onClose()
    }
  }

  // templateSummary 또는 formTemplate 중 하나라도 있어야 함
  const displayTemplate = formTemplate || templateSummary
  if (!displayTemplate) return null

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="!max-w-6xl !w-[95vw] h-[85vh] flex flex-col p-0">
          {/* 헤더 */}
          <DialogHeader className="pb-0 px-6 pt-6 flex-shrink-0">
            <DialogTitle className="sr-only">{displayTemplate.title}</DialogTitle>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-4 flex-1">
                <TemplateIcon
                  icon={typeof displayTemplate.icon === 'string' ? displayTemplate.icon : 'FileText'}
                  color={displayTemplate.color}
                />
                <div className="min-w-0 flex-1">
                  <h2 className={`${typography.h3} text-gray-800 truncate`}>{displayTemplate.title}</h2>
                  <p className="text-sm text-gray-600 truncate">{displayTemplate.description}</p>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* 에러 메시지 */}
          {error && (
            <div className="mx-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* 레이아웃 컴포넌트 */}
          <>
            {/* 데스크탑 레이아웃 */}
            <DesktopLayout 
              templateSummary={templateSummary}
              formTemplate={formTemplate}
              templateLoading={templateLoading}
              contentRef={contentRef}
              setContent={setContent}
              attachments={attachments}
              setAttachments={setAttachments}
              approvalStages={approvalStages}
              setApprovalStages={setApprovalStages}
              references={references}
              setReferences={setReferences}
              formFieldValues={formFieldValues}
              setFormFieldValues={setFormFieldValues}
              availableUsers={availableUsers}
              usersLoading={usersLoading}
              isSubmitting={isSubmitting}
              currentDraftId={currentDraftId}
              error={error}
              onSaveDraft={handleSaveDraft}
              onSubmit={onSubmit}
              onDelete={onDelete}
              isDeleting={isDeleting}
              setShowDeleteConfirm={setShowDeleteConfirm}
              isCreating={isCreating}
              isUpdating={isUpdating}
              isSubmittingDocument={isSubmittingDocument}
              isDeletingDocument={isDeletingDocument}
            />
            
            {/* 모바일 레이아웃 */}
            <MobileLayout 
              templateSummary={templateSummary}
              formTemplate={formTemplate}
              templateLoading={templateLoading}
              contentRef={contentRef}
              setContent={setContent}
              attachments={attachments}
              setAttachments={setAttachments}
              approvalStages={approvalStages}
              setApprovalStages={setApprovalStages}
              references={references}
              setReferences={setReferences}
              formFieldValues={formFieldValues}
              setFormFieldValues={setFormFieldValues}
              availableUsers={availableUsers}
              usersLoading={usersLoading}
              isSubmitting={isSubmitting}
              currentDraftId={currentDraftId}
              error={error}
              onSaveDraft={handleSaveDraft}
              onSubmit={onSubmit}
              onDelete={onDelete}
              isDeleting={isDeleting}
              setShowDeleteConfirm={setShowDeleteConfirm}
              isCreating={isCreating}
              isUpdating={isUpdating}
              isSubmittingDocument={isSubmittingDocument}
              isDeletingDocument={isDeletingDocument}
            />
          </>
        </DialogContent>

        {/* 삭제 확인 다이얼로그 */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>문서 삭제 확인</AlertDialogTitle>
              <AlertDialogDescription>
                이 임시저장된 문서를 완전히 삭제하시겠습니까?
                <br />
                삭제된 문서는 복구할 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting || isDeletingDocument}>
                취소
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                disabled={isDeleting || isDeletingDocument}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting || isDeletingDocument ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    삭제 중...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제하기
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Dialog>
    </TooltipProvider>
  )
}