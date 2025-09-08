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
  currentMainOrg?: string; // 현재 메인 조직 ID
  currentMainOrgName?: string; // 현재 메인 조직명
}

interface SelectedMember {
  member: Member;
  assignmentType: "main" | "concurrent"; // 'main' 또는 'concurrent'
}

interface MemberSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedMembers: SelectedMember[]) => void;
  selectedMembers: SelectedMember[];
  excludeMemberIds?: string[];
}

export default function MemberSelectionModal({
  isOpen,
  onClose,
  onSelect,
  selectedMembers,
  excludeMemberIds = [],
}: MemberSelectionModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedMemberAssignments, setSelectedMemberAssignments] = useState<
    Map<string, "main" | "concurrent">
  >(
    new Map(
      selectedMembers.map((item) => [item.member.id, item.assignmentType])
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

  const handleAssignmentTypeChange = (
    memberId: string,
    type: "main" | "concurrent"
  ) => {
    const newAssignments = new Map(selectedMemberAssignments);
    newAssignments.set(memberId, type);
    setSelectedMemberAssignments(newAssignments);
  };

  const handleMemberClick = (member: Member) => {
    const newAssignments = new Map(selectedMemberAssignments);
    if (newAssignments.has(member.id)) {
      newAssignments.delete(member.id);
    } else {
      // 기본값은 'main'으로 설정
      newAssignments.set(member.id, "main");
    }
    setSelectedMemberAssignments(newAssignments);
  };

  const handleSave = () => {
    if (selectedMemberAssignments.size === 0) return;

    // 선택된 모든 조직원들을 배열로 변환하여 전달
    const selectedMembers = Array.from(selectedMemberAssignments.entries()).map(
      ([id, assignmentType]) => {
        const member = members.find((m) => m.id === id)!;
        return { member, assignmentType };
      }
    );

    onSelect(selectedMembers);
    onClose();
  };

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  useEffect(() => {
    const newAssignments = new Map(
      selectedMembers.map((item) => [item.member.id, item.assignmentType])
    );
    setSelectedMemberAssignments(newAssignments);
  }, [selectedMembers, isOpen]);

  const filteredMembers = members.filter((member) => {
    if (excludeMemberIds.includes(member.id)) return false;

    if (!debouncedSearch) return true;
    const term = debouncedSearch.toLowerCase();
    return (
      member.name.toLowerCase().includes(term) ||
      member.role.toLowerCase().includes(term)
    );
  });

  const hasSelectedMembers = selectedMemberAssignments.size > 0;

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
              조직원 선택
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="조직원명을 입력하여 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredMembers.map((member) => {
              const isSelected = selectedMemberAssignments.has(member.id);
              const assignmentType = selectedMemberAssignments.get(member.id);

              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                    isSelected
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => handleMemberClick(member)}
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

                  {/* 메인/겸직 선택 UI - 고정된 위치 */}
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
                              id={`member-main-${member.id}`}
                            />
                            <Label
                              htmlFor={`member-main-${member.id}`}
                              className="text-sm font-medium"
                            >
                              메인
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="concurrent"
                              id={`member-concurrent-${member.id}`}
                            />
                            <Label
                              htmlFor={`member-concurrent-${member.id}`}
                              className="text-sm font-medium"
                            >
                              겸직
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                  </div>

                  {/* 연락처 정보 - 고정된 위치 */}
                  <div className="w-48 text-right text-xs text-gray-500 flex-shrink-0">
                    <div>{member.email}</div>
                    <div>{member.phone}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            {/* 뒤로가기 버튼 제거 */}
            <Button
              onClick={handleSave}
              disabled={!hasSelectedMembers}
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
