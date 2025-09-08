"use client"

import { useState, memo, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, X } from "lucide-react"
import { UserResponseDto } from "@/lib/services/user/types"
import { ApprovalStagesManagerProps, LocalApprovalStage } from "../types"

const ApprovalStagesManagerComponent = ({
  stages,
  onStagesChange,
  availableUsers
}: ApprovalStagesManagerProps) => {
  const [selectedApprover, setSelectedApprover] = useState<{ [stageId: string]: string }>({})
  
  const addStage = useCallback(() => {
    if (stages.length >= 5) return
    const newStage: LocalApprovalStage = {
      id: `stage-${Date.now()}`,
      name: `${stages.length + 1}단계`,
      approvers: []
    }
    onStagesChange([...stages, newStage])
  }, [stages, onStagesChange])

  const removeStage = useCallback((stageId: string) => {
    const filteredStages = stages.filter(stage => stage.id !== stageId)
    // 삭제 후 남은 단계들의 이름을 순서대로 재정렬
    const reorderedStages = filteredStages.map((stage, index) => ({
      ...stage,
      name: `${index + 1}단계`
    }))
    onStagesChange(reorderedStages)
  }, [stages, onStagesChange])

  const addApprover = useCallback((stageId: string, user: UserResponseDto) => {
    onStagesChange(stages.map(stage =>
      stage.id === stageId
        ? { ...stage, approvers: [...stage.approvers, user] }
        : stage
    ))
  }, [stages, onStagesChange])

  const removeApprover = useCallback((stageId: string, userId: number) => {
    onStagesChange(stages.map(stage =>
      stage.id === stageId
        ? { ...stage, approvers: stage.approvers.filter(approver => approver.id !== userId) }
        : stage
    ))
  }, [stages, onStagesChange])

  return (
    <div className="space-y-4">
      {stages.map((stage, index) => (
        <div key={stage.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">{stage.name}</h4>
            {stages.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeStage(stage.id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* 승인자 목록 */}
          <div className="space-y-2 mb-3">
            {stage.approvers.map((approver) => (
              <div key={approver.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={approver.profileImageUrl} alt={approver.name} />
                    <AvatarFallback className="text-xs">
                      {approver.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{approver.name}</p>
                    <p className="text-xs text-gray-500">{approver.position?.name || ""}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeApprover(stage.id, approver.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* 승인자 추가 */}
          {(() => {
            const availableApprovers = availableUsers.filter(user =>
              !stage.approvers.some(approver => approver.id === user.id)
            );

            return availableApprovers.length > 0 ? (
              <Select
                value={selectedApprover[stage.id] || ""}
                onValueChange={(userId) => {
                  const user = availableUsers.find(u => u.id === Number(userId))
                  if (user) {
                    addApprover(stage.id, user)
                    setSelectedApprover(prev => ({ ...prev, [stage.id]: "" }))
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="승인자 추가" />
                </SelectTrigger>
                <SelectContent>
                  {availableApprovers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user.profileImageUrl} alt={user.name} />
                          <AvatarFallback className="text-xs">
                            {user.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.position?.name || ""}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="w-full p-3 text-center text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-md">
                추가할 수 있는 승인자가 없습니다
              </div>
            )
          })()}
        </div>
      ))}

      {stages.length < 5 && (
        <Button
          variant="outline"
          onClick={addStage}
          className="w-full flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          승인 단계 추가
        </Button>
      )}
    </div>
  )
}

// React.memo로 컴포넌트 최적화
export const ApprovalStagesManager = memo(ApprovalStagesManagerComponent, (prevProps, nextProps) => {
  return (
    prevProps.stages === nextProps.stages &&
    prevProps.availableUsers === nextProps.availableUsers &&
    prevProps.onStagesChange === nextProps.onStagesChange
  )
})