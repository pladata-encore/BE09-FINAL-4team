import { DocumentStatus, DocumentRole } from '@/lib/services/approval/types'

// 상태 표시 텍스트
export const getStatusText = (status: DocumentStatus, myRole: DocumentRole) => {
  switch (status) {
    case DocumentStatus.DRAFT:
      return "임시저장"
    case DocumentStatus.IN_PROGRESS:
      return myRole === DocumentRole.APPROVER ? "승인 필요" : "진행중"
    case DocumentStatus.APPROVED:
      return "승인됨"
    case DocumentStatus.REJECTED:
      return "반려됨"
    default:
      return status
  }
}