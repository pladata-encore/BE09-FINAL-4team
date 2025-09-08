"use client"

import { memo, useRef, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { typography } from "@/lib/design-tokens"

import { ApprovalStagesManager } from "../components/ApprovalStagesManager"
import { ReferencesManager } from "../components/ReferencesManager"
import { ReferenceFilesManager } from "../components/ReferenceFilesManager"
import { FormFields } from "../components/shared/FormFields"
import { ContentEditor, ContentEditorRef } from "../components/shared/ContentEditor"
import { AttachmentSection } from "../components/shared/AttachmentSection"
import { ActionButtons } from "../components/shared/ActionButtons"
import { LoadingSkeletons, LoadingContent, ReferencesLoadingContent } from "../components/shared/LoadingSkeletons"
import { DocumentWriterLayoutProps } from "../types"

const DesktopLayoutComponent = ({
  templateSummary,
  formTemplate,
  templateLoading,
  contentRef,
  setContent,
  attachments,
  setAttachments,
  approvalStages,
  setApprovalStages,
  references,
  setReferences,
  formFieldValues,
  setFormFieldValues,
  availableUsers,
  usersLoading,
  isSubmitting,
  currentDraftId,
  error,
  onSaveDraft,
  onSubmit,
  onDelete,
  isDeleting,
  setShowDeleteConfirm,
  isCreating,
  isUpdating,
  isSubmittingDocument,
  isDeletingDocument
}: DocumentWriterLayoutProps & {
  isCreating: boolean
  isUpdating: boolean
  isSubmittingDocument: boolean
  isDeletingDocument: boolean
}) => {
  const editorRef = useRef<ContentEditorRef>(null)

  // contentRef 값이 변경되면 editor에 반영
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setValue(contentRef.current)
    }
  }, [contentRef.current])
  
  // templateSummary 또는 formTemplate 중 우선순위에 따라 사용
  const displayTemplate = formTemplate || templateSummary

  return (
    <div className="hidden lg:flex flex-1 overflow-hidden gap-6 p-6 pt-4 min-h-0">
      {/* 왼쪽 컬럼 - 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* 양식 필드 */}
        {(templateLoading || !formTemplate || (formTemplate.fields && formTemplate.fields.length > 0)) && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg flex-shrink-0">
            <FormFields
              formTemplate={formTemplate}
              templateLoading={templateLoading}
              formFieldValues={formFieldValues}
              setFormFieldValues={setFormFieldValues}
              isMobile={false}
            />
          </div>
        )}

        {/* 본문 작성 */}
        {displayTemplate?.useBody && (
          <ContentEditor
            ref={editorRef}
            initialContent={contentRef.current}
            setContent={(content) => {
              contentRef.current = content
              setContent(content)
            }}
            isMobile={false}
          />
        )}

        {/* 첨부파일 */}
        <AttachmentSection
          displayTemplate={displayTemplate}
          attachments={attachments}
          setAttachments={setAttachments}
          isMobile={false}
        />
      </div>

      {/* 오른쪽 컬럼 - 참고파일, 승인 단계 및 참조자 */}
      <div className="w-80 flex-shrink-0 flex flex-col min-h-0">
        <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 rounded-lg p-4 min-h-0">
          {/* 참고파일 */}
          {templateLoading || !formTemplate ? (
            <LoadingSkeletons isMobile={false} />
          ) : (
            formTemplate.referenceFiles && formTemplate.referenceFiles.length > 0 && (
              <>
                <div className="space-y-3">
                  <h3 className={`${typography.h4} text-gray-800`}>참고 파일</h3>
                  <ReferenceFilesManager referenceFiles={formTemplate.referenceFiles} />
                </div>
                <Separator />
              </>
            )
          )}

          {/* 승인 단계 */}
          <div className="space-y-3">
            <h3 className={`${typography.h4} text-gray-800`}>승인 단계</h3>
            {templateLoading || usersLoading ? (
              <LoadingContent templateLoading={templateLoading} usersLoading={usersLoading} />
            ) : (
              <ApprovalStagesManager
                stages={approvalStages}
                onStagesChange={setApprovalStages}
                availableUsers={availableUsers}
              />
            )}
          </div>

          <Separator />

          {/* 참조자 */}
          <div className="space-y-3">
            <h3 className={`${typography.h4} text-gray-800`}>참조자</h3>
            {templateLoading || usersLoading ? (
              <ReferencesLoadingContent templateLoading={templateLoading} />
            ) : (
              <ReferencesManager
                references={references}
                onReferencesChange={setReferences}
                availableUsers={availableUsers}
              />
            )}
          </div>
        </div>

        {/* 임시저장 및 결재 요청 버튼 */}
        <div className="mt-4 flex-shrink-0">
          <ActionButtons
            onSaveDraft={onSaveDraft}
            onSubmit={onSubmit}
            onDelete={onDelete}
            isSubmitting={isSubmitting}
            currentDraftId={currentDraftId}
            isCreating={isCreating}
            isUpdating={isUpdating}
            isSubmittingDocument={isSubmittingDocument}
            isDeleting={isDeleting}
            isDeletingDocument={isDeletingDocument}
            setShowDeleteConfirm={setShowDeleteConfirm}
            isMobile={false}
          />
        </div>
      </div>
    </div>
  )
}

// React.memo로 컴포넌트 최적화
export const DesktopLayout = memo(DesktopLayoutComponent)