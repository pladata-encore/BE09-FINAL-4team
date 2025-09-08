"use client"

import { useState, memo, useCallback, useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { UserResponseDto } from "@/lib/services/user/types"
import { ReferencesManagerProps, LocalReference } from "../types"

const ReferencesManagerComponent = ({
  references,
  onReferencesChange,
  availableUsers
}: ReferencesManagerProps) => {
  const [selectedReference, setSelectedReference] = useState("")
  
  const addReference = useCallback((user: UserResponseDto) => {
    if (references.some(ref => ref.id === user.id)) {
      return
    }
    
    const reference: LocalReference = {
      id: user.id,
      name: user.name,
      avatar: user.profileImageUrl,
      position: user.position?.name || ""
    }
    onReferencesChange([...references, reference])
  }, [references, onReferencesChange])

  const removeReference = useCallback((referenceId: number) => {
    onReferencesChange(references.filter(ref => ref.id !== referenceId))
  }, [references, onReferencesChange])

  const availableReferences = useMemo(() => {
    return availableUsers.filter(user =>
      !references.some(ref => ref.id === user.id)
    )
  }, [availableUsers, references])

  return (
    <div className="space-y-4">
      {/* 참조자 목록 */}
      <div className="space-y-2">
        {references.map((reference) => (
          <div key={reference.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={reference.avatar} alt={reference.name} />
                <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                  {reference.name?.charAt(0) || "R"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-800">{reference.name}</p>
                <p className="text-xs text-gray-500">{reference.position}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeReference(reference.id)}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* 참조자 추가 */}
      {availableReferences.length > 0 ? (
        <Select
          value={selectedReference}
          onValueChange={(userId) => {
            const user = availableUsers.find(u => u.id === Number(userId))
            if (user) {
              addReference(user)
              setSelectedReference("")
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="참조자 추가" />
          </SelectTrigger>
          <SelectContent>
            {availableReferences.map((user) => (
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
          추가할 수 있는 참조자가 없습니다
        </div>
      )}
    </div>
  )
}

// React.memo로 컴포넌트 최적화
export const ReferencesManager = memo(ReferencesManagerComponent, (prevProps, nextProps) => {
  return (
    prevProps.references === nextProps.references &&
    prevProps.availableUsers === nextProps.availableUsers &&
    prevProps.onReferencesChange === nextProps.onReferencesChange
  )
})