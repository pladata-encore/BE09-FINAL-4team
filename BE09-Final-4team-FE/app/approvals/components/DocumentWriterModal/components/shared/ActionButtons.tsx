"use client"

import { memo } from "react"
import { GradientButton } from "@/components/ui/gradient-button"
import { Button } from "@/components/ui/button"
import { Loader2, Send, Save, Trash2 } from "lucide-react"

interface ActionButtonsProps {
  onSaveDraft: () => void
  onSubmit: () => void
  onDelete?: () => void
  isSubmitting: boolean
  currentDraftId: string | null
  isCreating: boolean
  isUpdating: boolean
  isSubmittingDocument: boolean
  isDeleting: boolean
  isDeletingDocument: boolean
  setShowDeleteConfirm?: (show: boolean) => void
  isMobile?: boolean
}

const ActionButtonsComponent = ({
  onSaveDraft,
  onSubmit,
  onDelete,
  isSubmitting,
  currentDraftId,
  isCreating,
  isUpdating,
  isSubmittingDocument,
  isDeleting,
  isDeletingDocument,
  setShowDeleteConfirm,
  isMobile = false
}: ActionButtonsProps) => {
  const saveButtonText = currentDraftId ? (isMobile ? "저장" : "저장하기") : "임시저장"

  return (
    <>
      <div className="flex gap-3">
        {/* 임시저장 버튼 */}
        <Button
          variant="outline"
          onClick={onSaveDraft}
          disabled={isSubmitting || isCreating || isUpdating}
          className="flex-1 flex items-center justify-center gap-2 h-12"
        >
          {(isSubmitting && !currentDraftId) || isUpdating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saveButtonText}
        </Button>
        
        {/* 결재 요청 버튼 */}
        <GradientButton
          variant="primary"
          onClick={onSubmit}
          disabled={isSubmitting || isCreating || isSubmittingDocument}
          className="flex-1 flex items-center justify-center gap-2 h-12"
        >
          {(isSubmitting && currentDraftId) || isCreating || isSubmittingDocument ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          결재 요청하기
        </GradientButton>
      </div>

      {/* 삭제 버튼 - DRAFT 문서일 때만 표시 */}
      {currentDraftId && setShowDeleteConfirm && (
        <div className={isMobile ? "mt-3" : "mt-2"}>
          <Button
            variant="ghost"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting || isDeletingDocument}
            className="w-full flex items-center justify-center gap-2 h-10 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            {isDeleting || isDeletingDocument ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            임시저장 문서 삭제
          </Button>
        </div>
      )}
    </>
  )
}

export const ActionButtons = memo(ActionButtonsComponent)