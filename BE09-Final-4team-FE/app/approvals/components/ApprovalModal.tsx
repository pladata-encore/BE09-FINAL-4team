"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { GradientButton } from "@/components/ui/gradient-button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { colors, typography } from "@/lib/design-tokens"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Check,
  X,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
} from "lucide-react"
import { AttachmentsSection } from "@/components/ui/attachments-section"
import { ApprovalStageResponse, ApprovalTargetResponse, DocumentResponse, DocumentSummaryResponse, ApprovalStatus, ActivityType, DocumentStatus, DocumentRole, DocumentFieldValueResponse, FieldType, DocumentBase } from "@/lib/services/approval/types"
import { getStatusText } from "../utils"
import { useDocument, useApproveDocument, useRejectDocument, useCreateComment } from "../hooks/useApproval"
import { Separator } from "@/components/ui/separator"
import { getRelativeTime } from "@/lib/utils/datetime"
import { TemplateIcon } from "./common/TemplateIcon"

interface ApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  documentSummary: DocumentSummaryResponse | null
  documentId: number | null
}

// 서브 컴포넌트들
function ApprovalHeader({ document }: { 
  document: DocumentSummaryResponse | DocumentResponse
}) {
  const StatusIcon = getStatusIcon(document.status, document.myRole === "APPROVER")
  const statusBgColor = getStatusColor(document.status, document.myRole === "APPROVER")
  const statusTextColor = getStatusTextColor(document.status, document.myRole === "APPROVER")

  return (
    <div className="flex items-center gap-5">
      <TemplateIcon
        icon={document.template.icon}
        color={document.template.color}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className={`${typography.h3} text-gray-800 truncate`}>
            {document.template.title}
          </h2>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${statusBgColor} ${statusTextColor} font-medium text-sm border ${statusTextColor.replace('text-', 'border-')} border-opacity-30 flex-shrink-0`}>
            <StatusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{getStatusText(document.status, document.myRole)}</span>
            <span className="sm:hidden">{getStatusText(document.status, document.myRole)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ApprovalInfo({ document }: { document: DocumentBase }) {
  if (!document) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').replace(/\.$/, '')
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500 font-medium">신청자</p>
          <p className="text-sm font-semibold text-gray-800 truncate">{document.author?.name || "알 수 없음"}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Calendar className="w-5 h-5 text-green-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500 font-medium">신청일</p>
          <p className="text-sm font-semibold text-gray-800">{formatDate(document.submittedAt || document.createdAt)}</p>
        </div>
      </div>
    </div>
  )
}

// 필드별 값 표시 컴포넌트
function FormFieldDisplay({ field }: { field: DocumentFieldValueResponse }) {
  const formatValue = () => {
    const value = field.fieldValue
    if (!value) return '-'

    switch (field.fieldType) {
      case FieldType.MONEY:
        return `${value}원`
      case FieldType.DATE:
        return new Date(value).toLocaleDateString()
      case FieldType.MULTISELECT:
        try {
          const options = JSON.parse(value)
          return Array.isArray(options) ? options.join(', ') : value
        } catch {
          return value
        }
      case FieldType.SELECT:
      case FieldType.TEXT:
      case FieldType.NUMBER:
      default:
        return value
    }
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 font-medium">{field.fieldName}</p>
      <p className="text-sm font-semibold text-gray-800 break-words">
        {formatValue()}
      </p>
    </div>
  )
}

// 양식 필드 섹션 컴포넌트
function FormFieldsSection({ documentDetail }: { documentDetail: DocumentResponse | undefined }) {
  if (!documentDetail?.fieldValues || documentDetail.fieldValues.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        {documentDetail.fieldValues.map((field, index) => (
          <FormFieldDisplay key={field.id || index} field={field} />
        ))}
      </div>
    </div>
  )
}

function TimelineSection({
  timeline,
  newComment,
  setNewComment,
  onAddComment,
  isSubmitting,
  canComment
}: {
  timeline: TimelineItem[]
  newComment: string
  setNewComment: (comment: string) => void
  onAddComment: () => Promise<void>
  isSubmitting: boolean
  canComment: boolean
}) {
  const getHistoryText = (action: ActivityType | string) => {
    switch (action) {
      case ActivityType.CREATE: return "문서를 생성"
      case ActivityType.UPDATE: return "문서를 수정"
      case ActivityType.SUBMIT: return "문서를 제출"
      case ActivityType.APPROVE: return "승인"
      case ActivityType.REJECT: return "반려"
      case ActivityType.MODIFY_APPROVAL: return "승인자를 수정"
      case ActivityType.COMMENT: return "댓글을 작성"
      case "comment": return "댓글을 작성"
      default: return String(action)
    }
  }

  return (
    <div className="space-y-3">
      {/* 타임라인 목록 */}
      <div className="space-y-0">
        {timeline.map((item) => (
          <div key={item.uniqueId || item.id} className="flex items-start gap-3 p-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-1">
                <span className="font-medium text-sm text-gray-900 truncate">{item.user.name}</span>
                {item.action !== "comment" && (
                  <span className="text-sm text-gray-800">
                    님이 {getHistoryText(item.action)}했어요.
                  </span>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-gray-500 cursor-help ml-2">{getRelativeTime(item.date)}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{new Date(item.date).toLocaleString()}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {item.changes && (
                <div className="mt-2 mb-1 text-xs text-gray-600 space-y-1">
                  {item.changes.map((change, index) => (
                    <div key={`${item.id}-change-${index}`} className="flex items-center gap-1 flex-wrap">
                      <span className="font-medium">{change.field}:</span>
                      <span className="line-through">{change.oldValue}</span>
                      <ArrowRight className="w-2 h-2 text-gray-400" />
                      {change.newValue}
                    </div>
                  ))}
                </div>
              )}

              {item.action === "comment" && (
                <p className="text-sm text-gray-800 break-words bg-gray-50 rounded px-3 py-2 mb-1">{item.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 댓글 작성 섹션 */}
      {canComment && (
        <div className="p-3">
          <div className="flex gap-2">
            <Textarea
              placeholder="댓글을 입력하세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 text-sm py-2 min-h-[36px] h-auto resize-none overflow-hidden"
              rows={1}
              style={{ height: "auto" }}
              onInput={e => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = target.scrollHeight + "px";
              }}
            />
            <Button
              onClick={onAddComment}
              disabled={isSubmitting || !newComment.trim()}
              className="flex items-center gap-1 px-3"
              size="sm"
            >
              {isSubmitting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
              작성
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ApprovalStagesSection({ documentDetail }: { documentDetail: DocumentResponse }) {
  if (!documentDetail?.approvalStages) return null
  
  const stages = documentDetail.approvalStages
  const references = documentDetail.referenceTargets
  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {stages.map((stage: ApprovalStageResponse, stageIndex: number) => (
          <div 
            key={stage.id || `stage-${stageIndex}`} 
            className={`p-3 rounded-lg transition-all duration-300 ${
              !stage.isCompleted && stageIndex === 0
                ? "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 shadow-md" 
                : ""
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  stage.isCompleted ? "bg-green-100" :
                  !stage.isCompleted && stageIndex === 0 ? "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg" :
                  "bg-yellow-100"
                }`}>
                  {stage.isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : !stage.isCompleted && stageIndex === 0 ? (
                    <Clock className="w-4 h-4 text-white animate-pulse" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${!stage.isCompleted && stageIndex === 0 ? "text-blue-800" : "text-gray-800"}`}>
                    {stageIndex + 1}단계 승인
                    <span className={`text-sm ml-2 font-semibold ${
                      stage.isCompleted ? "text-green-600" :
                      !stage.isCompleted && stageIndex === 0 ? "text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent" :
                      "text-yellow-600"
                    }`}>
                      {stage.isCompleted ? "완료" :
                        !stage.isCompleted && stageIndex === 0 ? "진행중" : "대기중"}
                    </span>
                  </p>
                </div>
              </div>
              <div className={`text-sm flex-shrink-0 ${
                !stage.isCompleted && stageIndex === 0 ? "text-blue-700 font-medium" : "text-gray-500"
              }`}>
                {stage.approvalTargets?.filter((t: ApprovalTargetResponse) => t.approvalStatus === ApprovalStatus.APPROVED).length || 0}/{stage.approvalTargets?.length || 0} 승인
              </div>
            </div>

            <div className="space-y-1">
              {stage.approvalTargets?.map((target: ApprovalTargetResponse, targetIndex: number) => (
                <div key={target.id || `target-${stageIndex}-${targetIndex}`} className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={target.user?.profileImageUrl} alt={target.user?.name} />
                      <AvatarFallback className="text-xs">
                        {target.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{target.user?.name || "알 수 없음"}</p>
                      <p className="text-xs text-gray-500 truncate">{target.user?.email || ""}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 justify-end mb-1">
                      {target.approvalStatus === ApprovalStatus.APPROVED ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : target.approvalStatus === ApprovalStatus.REJECTED ? (
                        <XCircle className="w-3 h-3 text-red-600" />
                      ) : (
                        <Clock className="w-3 h-3 text-yellow-600" />
                      )}
                      <p className="text-xs text-gray-500">
                        {target.approvalStatus === ApprovalStatus.APPROVED ? "승인됨" :
                          target.approvalStatus === ApprovalStatus.REJECTED ? "반려됨" : "대기중"}
                      </p>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-2 text-gray-500 text-sm">승인자가 없습니다.</div>
              )}
            </div>
          </div>
        ))}

        {/* 참조자 섹션을 승인 단계 아래에 통합 */}
        {references && references.length > 0 && (
          <div className="p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-800">
                  참조자 <span className="text-gray-400 ml-1">{references.length}</span>
                </p>
              </div>
            </div>

            <div className="space-y-1">
              {references.map((reference: any, index: number) => (
                <div key={reference.id || `reference-${index}`} className="flex items-center gap-3 p-2">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={reference.user?.profileImageUrl} alt={reference.user?.name} />
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                      {reference.user?.name?.charAt(0) || "R"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{reference.user?.name || "알 수 없음"}</p>
                    <p className="text-xs text-gray-500 truncate">{reference.user?.email || ""}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                      참조
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 모바일용 접을 수 있는 섹션 컴포넌트
function CollapsibleSection({
  title,
  children,
  defaultOpen = false
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className={`${typography.h4} text-gray-800`}>{title}</h3>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}

// 유틸리티 함수들
function getStatusIcon(status: string, isMyApproval?: boolean) {
  switch (status) {
    case "pending":
      return isMyApproval ? AlertCircle : Clock
    case "approved":
      return CheckCircle
    case "rejected":
      return XCircle
    default:
      return AlertCircle
  }
}

function getStatusColor(status: string, isMyApproval?: boolean) {
  switch (status) {
    case "pending":
      return isMyApproval ? colors.status.warning.bg : colors.status.info.bg
    case "approved":
      return colors.status.success.bg
    case "rejected":
      return colors.status.error.bg
    default:
      return colors.status.info.bg
  }
}

function getStatusTextColor(status: string, isMyApproval?: boolean) {
  switch (status) {
    case "pending":
      return isMyApproval ? colors.status.warning.text : colors.status.info.text
    case "approved":
      return colors.status.success.text
    case "rejected":
      return colors.status.error.text
    default:
      return colors.status.info.text
  }
}


export function ApprovalModal({
  isOpen,
  onClose,
  documentSummary,
  documentId,
}: ApprovalModalProps) {
  const [newComment, setNewComment] = useState("")

  // API 훅들
  const { data: documentDetail, isLoading, error } = useDocument(documentId)
  const approveMutation = useApproveDocument()
  const rejectMutation = useRejectDocument()
  const commentMutation = useCreateComment()

  // DocumentSummary와 DocumentDetail을 조합해서 표시할 데이터 생성
  const document = documentDetail || documentSummary
  if (!document) return null

  const getCurrentStage = () => {
    if (!documentDetail?.approvalStages) return null
    return documentDetail.approvalStages.find((stage) =>
      !stage.isCompleted
    )
  }

  const canApprove = () => {
    // 승인 권한 체크: APPROVER 역할이면서 문서 상태가 IN_PROGRESS여야 함
    const hasApproverRole = documentSummary?.myRole === "APPROVER" || documentDetail?.myRole === "APPROVER"
    const isApprovableStatus = document.status === "IN_PROGRESS"
    return hasApproverRole && isApprovableStatus
  }

  const canComment = () => {
    return true // 실제로는 권한 체크 로직 필요
  }

  const handleApprove = async () => {
    if (!document.id) return
    try {
      await approveMutation.mutateAsync({
        id: document.id,
        request: { reason: "" } // 승인 사유는 선택사항
      })
      onClose()
    } catch (error) {
      console.error("승인 처리 중 오류:", error)
    }
  }

  const handleReject = async () => {
    if (!document.id) return
    try {
      await rejectMutation.mutateAsync({
        id: document.id,
        request: { reason: "" } // 반려 사유는 선택사항
      })
      onClose()
    } catch (error) {
      console.error("반려 처리 중 오류:", error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !document.id) return
    try {
      await commentMutation.mutateAsync({
        documentId: document.id,
        request: { content: newComment }
      })
      setNewComment("")
    } catch (error) {
      console.error("댓글 작성 중 오류:", error)
    }
  }

  // 로딩 상태 체크
  const isSubmitting = approveMutation.isPending || rejectMutation.isPending || commentMutation.isPending

  // DocumentResponse의 activities와 comments를 타임라인으로 변환
  const timeline = [
    ...(documentDetail?.activities || []).map((activity, index) => ({
      id: activity.id?.toString() || index.toString(),
      date: activity.createdAt,
      user: activity.user,
      action: activity.activityType,
      content: activity.reason,
      type: 'history' as const,
      uniqueId: `activity-${activity.id || index}`
    })),
    ...(documentDetail?.comments || []).map((comment, index) => ({
      id: comment.id?.toString() || index.toString(),
      date: comment.createdAt,
      user: comment.author,
      action: "comment",
      content: comment.content,
      type: "comment" as const,
      uniqueId: `comment-${comment.id || index}`
    }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // 에러 처리
  if (error && !documentSummary) {
    return (
      <TooltipProvider>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="!max-w-md !w-[90vw] flex flex-col p-6">
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-500 mb-4">문서를 불러오는 중 오류가 발생했습니다.</p>
              <Button onClick={onClose}>닫기</Button>
            </div>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="!max-w-5xl !w-[95vw] max-h-[90vh] flex flex-col p-0 sm:p-6">
          <DialogHeader className="pb-4 px-4 sm:px-0">
            <DialogTitle>
              <ApprovalHeader document={document} />
            </DialogTitle>
          </DialogHeader>

          {/* 데스크톱 레이아웃 */}
          <div className="hidden lg:flex flex-1 overflow-hidden gap-4">
            {/* 왼쪽 컬럼 - 메인 콘텐츠 */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 pl-2">
              <ApprovalInfo document={document} />

              {/* 양식 필드 */}
              {isLoading && !documentDetail ? (
                <div className="p-4 bg-gray-50 rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : (
                <FormFieldsSection documentDetail={documentDetail} />
              )}

              {/* 상세 내용 */}
              <div className="space-y-2">
                <div className="p-3">
                  <div className="text-base leading-relaxed whitespace-pre-wrap break-words">
                    {document.content || '내용이 없습니다.'}
                  </div>
                </div>
              </div>

              {/* 첨부 파일 */}
              {documentDetail?.attachments && documentDetail.attachments.length > 0 && (
                <>
                  <AttachmentsSection attachments={documentDetail.attachments} />
                </>
              )}

              {/* 타임라인 및 댓글 */}
              {timeline.length > 0 && (
                <>
                  <Separator />
                  <TimelineSection
                    timeline={timeline}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    onAddComment={handleAddComment}
                    isSubmitting={isSubmitting}
                    canComment={canComment()}
                  />
                </>
              )}
            </div>

            {/* 오른쪽 컬럼 - 승인 단계 및 참조자 */}
            <div className="w-80 flex-shrink-0 flex flex-col p-0">
              <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 rounded-lg p-2">
                {/* 승인 단계 정보 (참조자 포함) */}
                {isLoading && !documentDetail ? (
                  <div className="space-y-3">
                    <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : documentDetail ? (
                  <ApprovalStagesSection documentDetail={documentDetail} />
                ) : null}
              </div>

              {/* 승인/반려 버튼 */}
              {canApprove() && (
                <div className="mt-4">
                  <div className="flex gap-3">
                    <GradientButton
                      variant="success"
                      onClick={handleApprove}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      승인
                    </GradientButton>
                    <GradientButton
                      variant="error"
                      onClick={handleReject}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      반려
                    </GradientButton>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 모바일 레이아웃 */}
          <div className="lg:hidden flex-1 overflow-y-auto">
            <div className="space-y-3 p-3">
              <ApprovalInfo document={document} />

              {/* 양식 필드 */}
              {documentDetail?.fieldValues && (
                <FormFieldsSection documentDetail={documentDetail} />
              )}

              {/* 상세 내용 */}
              <div className="space-y-2">
                <div className="p-3">
                  <div className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                    {document.content || '내용이 없습니다.'}
                  </div>
                </div>
              </div>

              {/* 승인 단계 정보 (참조자 포함) */}
              {documentDetail && (
                <CollapsibleSection title="승인 단계" defaultOpen={true}>
                  <ApprovalStagesSection documentDetail={documentDetail} />
                </CollapsibleSection>
              )}

              {/* 첨부 파일 */}
              {documentDetail?.attachments && documentDetail.attachments.length > 0 && (
                <CollapsibleSection title="첨부파일">
                  <AttachmentsSection attachments={documentDetail.attachments} />
                </CollapsibleSection>
              )}

              {/* 타임라인 및 댓글 */}
              {timeline.length > 0 && (
                <CollapsibleSection title="활동 내역 및 댓글">
                  <TimelineSection
                    timeline={timeline}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    onAddComment={handleAddComment}
                    isSubmitting={isSubmitting}
                    canComment={canComment()}
                  />
                </CollapsibleSection>
              )}

              {/* 승인/반려 버튼 - 모바일에서는 하단 고정 */}
              {canApprove() && (
                <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-3 mt-4">
                  <div className="flex gap-3">
                    <GradientButton
                      variant="success"
                      onClick={handleApprove}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 h-12"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      승인
                    </GradientButton>
                    <GradientButton
                      variant="error"
                      onClick={handleReject}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 h-12"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      반려
                    </GradientButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
} 