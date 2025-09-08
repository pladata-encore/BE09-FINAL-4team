"use client"

import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { AttachmentUsageType } from "@/lib/services/approval/types"
import { AttachmentsManager } from "@/components/ui/attachments-manager"

interface AttachmentSectionProps {
  displayTemplate: any
  attachments: any[]
  setAttachments: (attachments: any[]) => void
  isMobile?: boolean
}

const AttachmentSectionComponent = ({
  displayTemplate,
  attachments,
  setAttachments,
  isMobile = false
}: AttachmentSectionProps) => {
  if (displayTemplate?.useAttachment === AttachmentUsageType.DISABLED) {
    return null
  }

  if (isMobile) {
    return (
      <div className="max-h-64 overflow-y-auto">
        <AttachmentsManager
          attachments={attachments}
          onAttachmentsChange={setAttachments}
        />
      </div>
    )
  }

  return (
    <div className="space-y-2 flex-shrink-0 mt-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-gray-700">
          첨부파일{attachments.length > 0 && ` (${attachments.length}개)`}
        </h3>
        {displayTemplate?.useAttachment === AttachmentUsageType.REQUIRED && (
          <Badge variant="destructive" className="text-xs">필수</Badge>
        )}
      </div>
      <AttachmentsManager
        attachments={attachments}
        onAttachmentsChange={setAttachments}
      />
    </div>
  )
}

export const AttachmentSection = memo(AttachmentSectionComponent)