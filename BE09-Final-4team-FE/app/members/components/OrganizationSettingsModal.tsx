"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Building2, ChevronRight, ChevronDown, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { organizationApi } from "@/lib/services/organization";
import { OrganizationDto } from "@/lib/services/organization/types";
import { userApi } from "@/lib/services/user/api";
import { UserResponseDto } from "@/lib/services/user/types";
import modalStyles from "./members-modal.module.css";
import AddOrganizationModal from "./AddOrganizationModal";

interface Member {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  currentMainOrg?: string;
  currentMainOrgName?: string;
}

interface SelectedMember {
  member: Member;
  assignmentType: "main" | "concurrent";
}

interface SelectedLeader {
  member: Member;
  assignmentType: "main" | "concurrent";
}

interface Organization {
  id: string;
  name: string;
  parentId?: string;
  members: SelectedMember[];
  leader?: Member;
  children?: Organization[];
}

interface OrganizationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrganizationSettingsModal({
  isOpen,
  onClose,
}: OrganizationSettingsModalProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    const loadData = async () => {
      try {
        const [data, allUsers] = await Promise.all([
          organizationApi.getAllOrganizations(),
          userApi.getAllUsers()
        ]);
        console.log('🔍 원본 조직 데이터:', data);
        
        const userMap = new Map(allUsers.map((user: UserResponseDto) => [user.id.toString(), user]));
        
        const convert = async (org: OrganizationDto): Promise<Organization> => {
          try {
            const allAssignments = await organizationApi.getAssignmentsByOrganizationId(org.organizationId);

            const members = allAssignments.filter(assignment => !assignment.isLeader);
            const leaders = allAssignments.filter(assignment => assignment.isLeader);

            const convertedMembers: SelectedMember[] = members
              .map((member: any) => {
                const userInfo = userMap.get(member.employeeId.toString());
                const finalName = userInfo?.name || member.employeeName;
                
                return {
                  member: {
                    id: member.employeeId.toString(),
                    name: finalName,
                    role: userInfo?.role || "직원",
                    email: userInfo?.email || "",
                    phone: userInfo?.phone || "",
                    currentMainOrg: member.organizationId.toString(),
                    currentMainOrgName: member.organizationName,
                  },
                  assignmentType: member.isPrimary ? "main" as const : "concurrent" as const
                };
              })
              .filter(item => item.member.name && item.member.name.trim() !== "");

            const leader = leaders.length > 0 ? (() => {
              const leaderAssignment = leaders[0];
              const leaderUserInfo = userMap.get(leaderAssignment.employeeId.toString());
              const finalName = leaderUserInfo?.name || leaderAssignment.employeeName;
              
              if (!finalName || finalName.trim() === "") {
                return undefined;
              }
              
              return {
                id: leaderAssignment.employeeId.toString(),
                name: finalName,
                role: leaderUserInfo?.role || "조직장",
                email: leaderUserInfo?.email || "",
                phone: leaderUserInfo?.phone || "",
                currentMainOrg: leaderAssignment.organizationId.toString(),
                currentMainOrgName: leaderAssignment.organizationName,
                isPrimary: leaderAssignment.isPrimary,
              };
            })() : undefined;

            const result = {
              id: org.organizationId.toString(),
              name: org.name,
              parentId: org.parentId?.toString(),
              members: convertedMembers,
              leader: leader,
              children: org.children ? await Promise.all(org.children.map(convert)) : undefined
            };
            
            console.log(`🔍 조직 ${org.name} 변환 결과:`, {
              id: result.id,
              name: result.name,
              membersCount: result.members.length,
              leader: result.leader,
              hasChildren: !!result.children
            });
            
            return result;
          } catch (error) {
            console.error(`조직 ${org.name}의 구성원 정보 로드 실패:`, error);
            return {
              id: org.organizationId.toString(),
              name: org.name,
              parentId: org.parentId?.toString(),
              members: [],
              leader: undefined,
              children: org.children ? await Promise.all(org.children.map(convert)) : undefined
            };
          }
        };

        const convertedOrganizations = await Promise.all(data.map(convert));
        console.log('🔍 변환된 조직 데이터:', convertedOrganizations);
        
        const buildHierarchy = (orgs: Organization[]): Organization[] => {
          const orgMap = new Map(orgs.map(org => [org.id, org]));
          const rootOrgs: Organization[] = [];
          
          orgs.forEach(org => {
            if (org.parentId && orgMap.has(org.parentId)) {
              const parent = orgMap.get(org.parentId)!;
              if (!parent.children) {
                parent.children = [];
              }
              parent.children.push(org);
            } else {
              rootOrgs.push(org);
            }
          });
          
          return rootOrgs;
        };
        
        const hierarchicalOrganizations = buildHierarchy(convertedOrganizations);
        console.log('🔍 계층 구조로 구성된 조직 데이터:', hierarchicalOrganizations);
        setOrganizations(hierarchicalOrganizations);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        toast.error('데이터를 불러올 수 없습니다.');
      }
    };
    
    loadData();
  }, [isOpen]);

  const handleOrgClick = (org: Organization) => {
    console.log('🔍 클릭된 조직 데이터:', org);
    setEditingOrg(org);
    setShowAddModal(true);
  };

  const toggleExpanded = (orgId: string) => {
    setExpandedOrgs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orgId)) {
        newSet.delete(orgId);
      } else {
        newSet.add(orgId);
      }
      return newSet;
    });
  };

  const handleOrgSave = async (org: Organization) => {
    try {
      let organizationId: number;
      
      if (editingOrg) {
        const updateData = {
          name: org.name,
          parentId: org.parentId ? parseInt(org.parentId) : undefined
        };
        const updatedOrg = await organizationApi.updateOrganization(parseInt(org.id), updateData);
        organizationId = updatedOrg.organizationId;
        console.log('🔍 조직 수정 응답:', updatedOrg);
        toast.success("조직이 성공적으로 수정되었습니다.");
      } else {
        const createData = {
          name: org.name,
          parentId: org.parentId ? parseInt(org.parentId) : undefined
        };
        const createdOrg = await organizationApi.createOrganization(createData);
        organizationId = createdOrg.organizationId;
        console.log('🔍 조직 생성 응답:', createdOrg);
        toast.success("조직이 성공적으로 추가되었습니다.");
      }

      console.log('🔍 사용할 organizationId:', organizationId);

      if (!organizationId && editingOrg) {
        organizationId = parseInt(editingOrg.id);
        console.log('🔍 기존 조직 ID 사용:', organizationId);
      }

      if (editingOrg && organizationId) {
        const allExistingAssignments = await organizationApi.getAssignmentsByOrganizationId(organizationId);
        
        for (const assignment of allExistingAssignments) {
          await organizationApi.deleteAssignment(assignment.assignmentId);
        }
      }

      if (organizationId) {
        if (org.leader) {
          const leaderInMembers = org.members.find(member => member.member.id === org.leader!.id);
          const isLeaderConcurrent = leaderInMembers && leaderInMembers.assignmentType === "concurrent";
          
          await organizationApi.createAssignment({
            employeeId: parseInt(org.leader.id),
            organizationId: organizationId,
            isPrimary: !isLeaderConcurrent,
            isLeader: true
          });
        }

        for (const member of org.members) {
          await organizationApi.createAssignment({
            employeeId: parseInt(member.member.id),
            organizationId: organizationId,
            isPrimary: member.assignmentType === "main",
            isLeader: false
          });
        }
      } else {
        console.error('❌ organizationId가 없어서 배정을 생성할 수 없습니다.');
        toast.error("조직 ID를 가져올 수 없어 배정을 저장할 수 없습니다.");
      }
      
      const [data, allUsers] = await Promise.all([
        organizationApi.getAllOrganizations(),
        userApi.getAllUsers()
      ]);
      
      const userMap = new Map(allUsers.map((user: UserResponseDto) => [user.id.toString(), user]));
      
      const convert = async (orgDto: OrganizationDto): Promise<Organization> => {
        try {
          const [members, leaders] = await Promise.all([
            organizationApi.getAssignmentsByOrganizationId(orgDto.organizationId),
            organizationApi.getLeadersByOrganizationId(orgDto.organizationId)
          ]);

          const convertedMembers: SelectedMember[] = members
            .map((member: any) => {
              const userInfo = userMap.get(member.employeeId.toString());
              const finalName = userInfo?.name || member.employeeName;
              
              return {
                member: {
                  id: member.employeeId.toString(),
                  name: finalName,
                  role: userInfo?.role || "직원",
                  email: userInfo?.email || "",
                  phone: userInfo?.phone || "",
                  currentMainOrg: member.organizationId.toString(),
                  currentMainOrgName: member.organizationName,
                },
                assignmentType: member.isPrimary ? "main" as const : "concurrent" as const
              };
            })
            .filter(item => item.member.name && item.member.name.trim() !== "");

          const leader = leaders.length > 0 ? (() => {
            const leaderAssignment = leaders[0];
            const leaderUserInfo = userMap.get(leaderAssignment.employeeId);
            return {
              id: leaderAssignment.employeeId.toString(),
                name: leaderUserInfo?.name || leaderAssignment.employeeName,
              role: leaderUserInfo?.role || "조직장",
              email: leaderUserInfo?.email || "",
              phone: leaderUserInfo?.phone || "",
              currentMainOrg: leaderAssignment.organizationId.toString(),
              currentMainOrgName: leaderAssignment.organizationName,
            };
          })() : undefined;

          return {
            id: orgDto.organizationId.toString(),
            name: orgDto.name,
            parentId: orgDto.parentId?.toString(),
            members: convertedMembers,
            leader: leader,
            children: orgDto.children ? await Promise.all(orgDto.children.map(convert)) : undefined
          };
        } catch (error) {
          console.error(`조직 ${orgDto.name}의 구성원 정보 로드 실패:`, error);
          return {
            id: orgDto.organizationId.toString(),
            name: orgDto.name,
            parentId: orgDto.parentId?.toString(),
            members: [],
            leader: undefined,
            children: orgDto.children ? await Promise.all(orgDto.children.map(convert)) : undefined
          };
        }
      };

      const convertedOrganizations = await Promise.all(data.map(convert));
      
      const buildHierarchy = (orgs: Organization[]): Organization[] => {
        const orgMap = new Map(orgs.map(org => [org.id, org]));
        const rootOrgs: Organization[] = [];
        
        orgs.forEach(org => {
          if (org.parentId && orgMap.has(org.parentId)) {
            const parent = orgMap.get(org.parentId)!;
            if (!parent.children) {
              parent.children = [];
            }
            parent.children.push(org);
          } else {
            rootOrgs.push(org);
          }
        });
        return rootOrgs;
      };
      
      const hierarchicalOrganizations = buildHierarchy(convertedOrganizations);
      console.log('🔍 저장 후 계층 구조로 구성된 조직 데이터:', hierarchicalOrganizations);
      setOrganizations(hierarchicalOrganizations);
      
    } catch (error) {
      console.error('조직 저장 실패:', error);
      toast.error("조직 저장에 실패했습니다.");
    }
    setShowAddModal(false);
    setEditingOrg(null);
  };

  const handleOrgDelete = async (id: string) => {
    try {
      await organizationApi.deleteOrganization(parseInt(id));
      toast.success("조직이 삭제되었습니다.");
      
      const [data, allUsers] = await Promise.all([
        organizationApi.getAllOrganizations(),
        userApi.getAllUsers()
      ]);
      
      const userMap = new Map(allUsers.map((user: UserResponseDto) => [user.id.toString(), user]));
      
      const convert = async (org: OrganizationDto): Promise<Organization> => {
        try {
          const [members, leaders] = await Promise.all([
            organizationApi.getAssignmentsByOrganizationId(org.organizationId),
            organizationApi.getLeadersByOrganizationId(org.organizationId)
          ]);

          const convertedMembers: SelectedMember[] = members.map((member: any) => {
            const userInfo = userMap.get(member.employeeId);
            return {
              member: {
                id: member.employeeId.toString(),
                name: userInfo?.name || member.employeeName, 
                role: userInfo?.role || "직원",
                email: userInfo?.email || "",
                phone: userInfo?.phone || "",
                currentMainOrg: member.organizationId.toString(),
                currentMainOrgName: member.organizationName,
              },
              assignmentType: member.isPrimary ? "main" : "concurrent"
            };
          });

          const leader = leaders.length > 0 ? (() => {
            const leaderAssignment = leaders[0];
            const leaderUserInfo = userMap.get(leaderAssignment.employeeId);
            return {
              id: leaderAssignment.employeeId.toString(),
                name: leaderUserInfo?.name || leaderAssignment.employeeName,
              role: leaderUserInfo?.role || "조직장",
              email: leaderUserInfo?.email || "",
              phone: leaderUserInfo?.phone || "",
              currentMainOrg: leaderAssignment.organizationId.toString(),
              currentMainOrgName: leaderAssignment.organizationName,
            };
          })() : undefined;

          return {
            id: org.organizationId.toString(),
            name: org.name,
            parentId: org.parentId?.toString(),
            members: convertedMembers,
            leader: leader,
            children: org.children ? await Promise.all(org.children.map(convert)) : undefined
          };
        } catch (error) {
          console.error(`조직 ${org.name}의 구성원 정보 로드 실패:`, error);
          return {
            id: org.organizationId.toString(),
            name: org.name,
            parentId: org.parentId?.toString(),
            members: [],
            leader: undefined,
            children: org.children ? await Promise.all(org.children.map(convert)) : undefined
          };
        }
      };

      const convertedOrganizations = await Promise.all(data.map(convert));
      setOrganizations(convertedOrganizations);
      
    } catch (error) {
      console.error('조직 삭제 실패:', error);
      toast.error("조직 삭제에 실패했습니다.");
    }
  };

  const handleAddModalClose = () => {
    setShowAddModal(false);
    setEditingOrg(null);
  };

  useEffect(() => {
    if (isOpen) {
      setShowAddModal(false);
      setEditingOrg(null);
    }
  }, [isOpen]);

  const renderTree = (orgs: Organization[], level = 0) => {
    return orgs.map(org => {
      const isExpanded = expandedOrgs.has(org.id);
      const hasChildren = org.children && org.children.length > 0;
      
      return (
        <div key={org.id}>
          <div
            className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b ${
              level > 0 ? "ml-6" : ""
            }`}
            onClick={() => handleOrgClick(org)}
          >
              {hasChildren ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(org.id);
                  }}
                  className="mr-2 p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              ) : (
                <div className="mr-2 p-1 w-6 h-6 flex items-center justify-center">
                  <span className="text-gray-400 text-lg">·</span>
                </div>
              )}
            <Building2 className="w-4 h-4 text-gray-500 mr-2" />
              <span className="font-medium">{org.name}</span>
          </div>
          {hasChildren && isExpanded && (
            <div className="border-l border-gray-200 ml-3">
              {renderTree(org.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const filteredOrgs = searchTerm
    ? organizations.filter(org => org.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : organizations;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent data-hide-default-close className={`max-w-4xl w-[96vw] max-h-[80vh] overflow-y-auto bg-white text-gray-900 border border-gray-200 shadow-2xl ${modalStyles.membersModal}`}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded cursor-pointer"
                onClick={onClose}
                aria-label="뒤로가기"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <DialogTitle className="text-2xl font-bold text-gray-900 text-center flex-1">
                조직 설정
              </DialogTitle>
              <div className="w-10"></div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="조직 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {renderTree(filteredOrgs)}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setEditingOrg(null);
                  setShowAddModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                조직 추가
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddOrganizationModal
        isOpen={showAddModal}
        onClose={handleAddModalClose}
        organization={editingOrg}
        onSave={handleOrgSave}
        onDelete={handleOrgDelete}
        organizations={organizations}
      />
    </>
  );
}