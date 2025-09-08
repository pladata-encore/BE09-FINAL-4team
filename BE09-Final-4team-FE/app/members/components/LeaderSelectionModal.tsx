"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import modalStyles from "./members-modal.module.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Search, User, ArrowLeft, X } from "lucide-react";
import { userApi } from "@/lib/services/user/api";
import { UserResponseDto } from "@/lib/services/user/types";
import { organizationApi } from "@/lib/services/organization/api";
import { EmployeeAssignmentDto } from "@/lib/services/organization/types";

interface Member {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  currentMainOrg?: string;
  currentMainOrgName?: string;
}

interface SelectedLeader {
  member: Member;
  assignmentType: "main" | "concurrent";
}

interface LeaderSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (leaders: SelectedLeader[]) => void;
  selectedLeader: SelectedLeader | null;
  excludeMemberIds?: string[];
}

export default function LeaderSelectionModal({
  isOpen,
  onClose,
  onSelect,
  selectedLeader,
  excludeMemberIds = [],
}: LeaderSelectionModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 중복 선택을 위해 Set으로 변경
  const [selectedLeaderIds, setSelectedLeaderIds] = useState<Set<string>>(
    new Set(selectedLeader ? [selectedLeader.member.id] : [])
  );
  const [selectedAssignmentTypes, setSelectedAssignmentTypes] = useState<
    Map<string, "main" | "concurrent">
  >(
    new Map(
      selectedLeader
        ? [[selectedLeader.member.id, selectedLeader.assignmentType]]
        : []
    )
  );

  useEffect(() => {
    const loadMembers = async () => {
      try {
        // 사용자 데이터와 조직 배정 데이터를 병렬로 가져오기
        const [users, assignments] = await Promise.all([
          userApi.getAllUsers(),
          organizationApi.getAllAssignments()
        ]);

        // 각 사용자의 메인 조직 정보 찾기
        const convertedMembers: Member[] = users.map(user => {
          const userAssignments = assignments.filter(assignment => 
            assignment.employeeId === user.id && assignment.isPrimary
          );
          const mainAssignment = userAssignments[0]; // 메인 조직은 하나여야 함

          return {
            id: user.id.toString(),
            name: user.name,
            role: user.role || "직원",
            email: user.email,
            phone: user.phone || "",
            currentMainOrg: mainAssignment?.organizationId.toString(),
            currentMainOrgName: mainAssignment?.organizationName,
          };
        });

        setMembers(convertedMembers);
      } catch (error) {
        console.error('구성원 데이터 로드 실패:', error);
        // API 실패 시 샘플 데이터 사용
        const sampleMembers: Member[] = [
          {
            id: "1",
            name: "비니비니",
            role: "CEO",
            email: "binibini@hermesai.com",
            phone: "010-1234-5678",
            currentMainOrg: "org1",
            currentMainOrgName: "개발팀",
          },
          {
            id: "2",
            name: "이혜빈",
            role: "CTO",
            email: "lee.hb@company.com",
            phone: "010-2345-6789",
            currentMainOrg: "org2",
            currentMainOrgName: "기획팀",
          },
        ];
        setMembers(sampleMembers);
      }
    };

    if (isOpen) {
      loadMembers();
    }
  }, [isOpen]);

  // 멤버 선택/해제 토글 - 중복 선택 가능
  const toggleMemberSelection = (memberId: string) => {
    setSelectedLeaderIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(memberId)) {
        newSet.delete(memberId);
        // 선택 해제 시 assignmentType도 제거
        setSelectedAssignmentTypes((prevTypes) => {
          const newTypes = new Map(prevTypes);
          newTypes.delete(memberId);
          return newTypes;
        });
      } else {
        newSet.add(memberId);
        // 새로 선택 시 기본값은 'main'
        setSelectedAssignmentTypes((prevTypes) => {
          const newTypes = new Map(prevTypes);
          newTypes.set(memberId, "main");
          return newTypes;
        });
      }
      return newSet;
    });
  };

  // assignmentType 변경
  const handleAssignmentTypeChange = (
    memberId: string,
    type: "main" | "concurrent"
  ) => {
    setSelectedAssignmentTypes((prev) => {
      const newTypes = new Map(prev);
      newTypes.set(memberId, type);
      return newTypes;
    });
  };

  // 저장 시 호출 - 경고 없이 바로 저장
  const handleSave = () => {
    if (selectedLeaderIds.size === 0) return;

    // 선택된 모든 조직장들을 배열로 변환하여 전달
    const selectedLeaders = Array.from(selectedLeaderIds).map((id) => {
      const member = members.find((m) => m.id === id)!;
      const assignmentType = selectedAssignmentTypes.get(id) || "main";
      return { member, assignmentType };
    });

    onSelect(selectedLeaders);
    onClose();
  };

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedLeader) {
      setSelectedLeaderIds(new Set([selectedLeader.member.id]));
      setSelectedAssignmentTypes(
        new Map([[selectedLeader.member.id, selectedLeader.assignmentType]])
      );
    } else {
      setSelectedLeaderIds(new Set());
      setSelectedAssignmentTypes(new Map());
    }
  }, [selectedLeader]);

  const filteredMembers = members.filter((member) => {
    if (excludeMemberIds.includes(member.id)) return false;

    if (!debouncedSearch) return true;
    const term = debouncedSearch.toLowerCase();
    return (
      member.name.toLowerCase().includes(term) ||
      member.role.toLowerCase().includes(term)
    );
  });

  const hasSelectedLeader = selectedLeaderIds.size > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        data-hide-default-close
        className={`max-w-2xl max-h-[80vh] overflow-y-auto ${modalStyles.membersModal}`}
      >
        <DialogHeader>
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              className="absolute left-0 p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded cursor-pointer z-10"
              onClick={onClose}
              aria-label="뒤로가기"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <DialogTitle className="text-center text-2xl font-bold text-gray-900 transform -translate-x-1">
              조직장 선택
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="조직장명을 입력하여 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredMembers.map((member) => {
              const isSelected = selectedLeaderIds.has(member.id);
              const assignmentType =
                selectedAssignmentTypes.get(member.id) || "main";

              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                    isSelected
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => toggleMemberSelection(member.id)}
                >
                  <Avatar
                    className={`w-10 h-10 ${
                      isSelected ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  >
                    <AvatarImage src="" alt={member.name} />
                    <AvatarFallback
                      className={isSelected ? "bg-blue-500 text-white" : ""}
                    >
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="font-medium text-sm">{member.name}</div>
                    <div className="text-xs text-gray-500">{member.role}</div>
                    {member.currentMainOrgName && (
                      <div className="text-xs text-orange-600">
                        현재 메인: {member.currentMainOrgName}
                      </div>
                    )}
                  </div>

                  {/* 메인/겸직 선택 UI - 먼저 배치 */}
                  <div className="w-32 flex-shrink-0">
                    {isSelected && (
                      <div
                        className="flex items-center gap-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <RadioGroup
                          value={assignmentType}
                          onValueChange={(value) =>
                            handleAssignmentTypeChange(
                              member.id,
                              value as "main" | "concurrent"
                            )
                          }
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="main"
                              id={`leader-main-${member.id}`}
                            />
                            <Label
                              htmlFor={`leader-main-${member.id}`}
                              className="text-sm font-medium"
                            >
                              메인
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="concurrent"
                              id={`leader-concurrent-${member.id}`}
                            />
                            <Label
                              htmlFor={`leader-concurrent-${member.id}`}
                              className="text-sm font-medium"
                            >
                              겸직
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                  </div>

                  {/* 연락처 정보 - 마지막에 배치 */}
                  <div className="w-48 text-right text-xs text-gray-500 flex-shrink-0">
                    <div>{member.email}</div>
                    <div>{member.phone}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={!hasSelectedLeader}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
            >
              저장하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
