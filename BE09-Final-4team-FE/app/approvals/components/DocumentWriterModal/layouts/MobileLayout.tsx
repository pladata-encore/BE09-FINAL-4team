"use client"

import { memo, useRef, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { AttachmentUsageType } from "@/lib/services/approval/types"
import { CollapsibleSection } from "../components/CollapsibleSection"
import { ApprovalStagesManager } from "../components/ApprovalStagesManager"
import { ReferencesManager } from "../components/ReferencesManager"
import { ReferenceFilesManager } from "../components/ReferenceFilesManager"
import { FormFields } from "../components/shared/FormFields"
import { ContentEditor, ContentEditorRef } from "../components/shared/ContentEditor"
import { AttachmentSection } from "../components/shared/AttachmentSection"
import { ActionButtons } from "../components/shared/ActionButtons"
import { LoadingSkeletons, LoadingContent, ReferencesLoadingContent } from "../components/shared/LoadingSkeletons"
import { DocumentWriterLayoutProps } from "../types"

const MobileLayoutComponent = ({
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
    <div className="lg:hidden flex-1 overflow-y-auto min-h-0">
      <div className="space-y-6 px-6 py-4">
        {/* 양식 필드 */}
        {(templateLoading || !formTemplate || (formTemplate.fields && formTemplate.fields.length > 0)) && (
          <CollapsibleSection title="양식 항목" defaultOpen={true}>
            <FormFields
              formTemplate={formTemplate}
              templateLoading={templateLoading}
              formFieldValues={formFieldValues}
              setFormFieldValues={setFormFieldValues}
              isMobile={true}
            />
          </CollapsibleSection>
        )}

        {/* 참고파일 */}
        {templateLoading || !formTemplate ? (
          <CollapsibleSection title="참고 파일">
            <LoadingSkeletons isMobile={true} />
          </CollapsibleSection>
        ) : (
          formTemplate.referenceFiles && formTemplate.referenceFiles.length > 0 && (
            <CollapsibleSection title="참고 파일">
              <ReferenceFilesManager referenceFiles={formTemplate.referenceFiles} />
            </CollapsibleSection>
          )
        )}

        {/* 본문 작성 */}
        {displayTemplate?.useBody && (
          <CollapsibleSection title="내용 작성" defaultOpen={true}>
            <ContentEditor
              ref={editorRef}
              initialContent={contentRef.current}
              setContent={(content) => {
                contentRef.current = content
                setContent(content)
              }}
              isMobile={true}
            />
          </CollapsibleSection>
        )}

        {/* 승인 단계 */}
        <CollapsibleSection title="승인 단계" defaultOpen={true}>
          {templateLoading || usersLoading ? (
            <LoadingContent templateLoading={templateLoading} usersLoading={usersLoading} />
          ) : (
            <ApprovalStagesManager
              stages={approvalStages}
              onStagesChange={setApprovalStages}
              availableUsers={availableUsers}
            />
          )}
        </CollapsibleSection>

        {/* 참조자 */}
        <CollapsibleSection title="참조자">
          {templateLoading || usersLoading ? (
            <ReferencesLoadingContent templateLoading={templateLoading} />
          ) : (
            <ReferencesManager
              references={references}
              onReferencesChange={setReferences}
              availableUsers={availableUsers}
            />
          )}
        </CollapsibleSection>

        {/* 첨부파일 */}
        {displayTemplate?.useAttachment !== AttachmentUsageType.DISABLED && (
          <CollapsibleSection
            title={
              <div className="flex items-center gap-2">
                <span>첨부파일</span>
                {displayTemplate?.useAttachment === AttachmentUsageType.REQUIRED && (
                  <Badge variant="destructive" className="text-xs">필수</Badge>
                )}
              </div>
            }
            defaultOpen={displayTemplate?.useAttachment === AttachmentUsageType.REQUIRED}
          >
            <AttachmentSection
              displayTemplate={displayTemplate}
              attachments={attachments}
              setAttachments={setAttachments}
              isMobile={true}
            />
          </CollapsibleSection>
        )}

        {/* 임시저장 및 결재 요청 버튼 - 모바일에서는 하단 고정 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 mt-4">
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
            isMobile={true}
          />
        </div>
      </div>
    </div>
  )
}

// React.memo로 컴포넌트 최적화
export const MobileLayout = memo(MobileLayoutComponent)