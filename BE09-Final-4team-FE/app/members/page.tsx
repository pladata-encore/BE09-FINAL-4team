"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Settings,
  Building2,
  ChevronDown,
  ChevronRight,
  Expand,
  Minimize,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import AddMemberModal from "./components/AddMemberModal";
import SettingsModal from "./components/SettingsModal";
import MemberList from "./components/MemberList";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { organizationApi } from "@/lib/services/organization/api";
import { OrganizationHierarchyDto } from "@/lib/services/organization/types";
import { apiClient } from "@/lib/services/common/api-client";
import { userApi } from "@/lib/services/user/api";
import { UserResponseDto, UserCreateDto } from "@/lib/services/user/types";
import { useTitlesFromAPI } from "@/hooks/use-members-derived-data";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  joinDate: string;
  organization?: string;
  organizations?: string[];
  position: string;
  role: string;
  job: string;
  rank?: string;
  isAdmin: boolean;
  teams: string[];
  profileImage?: string;
  workPolicies?: string[];
}

const convertUserToEmployee = (user: UserResponseDto): Employee => ({
  id: user.id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  address: user.address || '',
  joinDate: user.joinDate || '',
  organization: user.organizations?.find(org => org.isPrimary)?.organizationName,
  organizations: user.organizations?.map(org => org.organizationName) || [],
  position: user.position?.name || '',
  role: user.role || '',
  job: user.job?.name || '',
  rank: user.rank?.name || '',
  isAdmin: user.isAdmin,
  teams: [],
  profileImage: user.profileImageUrl,
  workPolicies: user.workPolicyId ? [user.workPolicyId.toString()] : undefined,
});

interface OrgStructure {
  name: string;
  children?: OrgStructure[];
  employeeCount: number;
  isExpanded?: boolean;
}

export default function MembersPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [orgStructure, setOrgStructure] = useState<OrgStructure[]>([]);
  const [orgSearchTerm, setOrgSearchTerm] = useState("");
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [orgLoading, setOrgLoading] = useState(false);
  const [isSearchingMembers, setIsSearchingMembers] = useState(false);

  const {
    ranks,
    positions,
    jobs,
    loading: titleLoading,
    error: titleError,
  } = useTitlesFromAPI();

  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter((emp) => {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = emp.name.toLowerCase().includes(searchLower);
        const orgMatch = (emp.organization && emp.organization.toLowerCase().includes(searchLower)) ||
          (Array.isArray(emp.organizations) && emp.organizations.some((o) => o.toLowerCase().includes(searchLower)));
        const teamMatch = emp.teams && emp.teams.some((team) => team.toLowerCase().includes(searchLower));
        return nameMatch || orgMatch || teamMatch;
      });
    }

    if (selectedOrg) {
      filtered = filtered.filter((emp) => {
        const orgMatch = emp.organization === selectedOrg ||
          (Array.isArray(emp.organizations) && emp.organizations.includes(selectedOrg));
        const teamMatch = emp.teams && emp.teams.includes(selectedOrg);
        return orgMatch || teamMatch;
      });
    }

    return filtered;
  }, [employees, searchTerm, selectedOrg]);

  const calculateEmployeeCounts = (employees: Employee[]) => {
    const orgCounts: Record<string, number> = {};
    const teamCounts: Record<string, number> = {};

    employees.forEach((emp) => {
      const orgList = Array.isArray(emp.organizations) && emp.organizations.length > 0
        ? emp.organizations
        : emp.organization ? [emp.organization] : [];
     
      orgList.forEach((orgName) => {
        orgCounts[orgName] = (orgCounts[orgName] || 0) + 1;
      });

      if (emp.teams) {
        emp.teams.forEach((team) => {
          teamCounts[team] = (teamCounts[team] || 0) + 1;
        });
      }
    });

    return { orgCounts, teamCounts };
  };

  const buildOrgStructure = useCallback((employees: Employee[]): OrgStructure[] => {
    const { orgCounts, teamCounts } = calculateEmployeeCounts(employees);
   
    const orgs = Object.keys(orgCounts).map(orgName => ({
      name: orgName,
      employeeCount: orgCounts[orgName],
      isExpanded: false,
      children: Object.keys(teamCounts)
        .filter(teamName => teamName.includes(orgName) || orgName.includes(teamName))
        .map(teamName => ({
          name: teamName,
          employeeCount: teamCounts[teamName],
          isExpanded: false
        }))
    }));

    return orgs;
  }, [calculateEmployeeCounts]);

  const fetchOrganizationStructure = useCallback(async () => {
    try {
      setOrgLoading(true);
      console.log('조직 구조 API 호출 시작...');
     
      const response = await organizationApi.getOrganizationHierarchy();
      console.log('조직 구조 API 응답:', response);
     
      let orgData: OrganizationHierarchyDto[];

      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        orgData = response.data;
      } else if (Array.isArray(response)) {
        orgData = response;
      } else {
        throw new Error('예상치 못한 응답 형식입니다.');
      }
      console.log('추출된 조직 데이터:', orgData);
     
      const convertToOrgStructure = (org: OrganizationHierarchyDto): OrgStructure => ({
        name: org.name,
        employeeCount: org.memberCount,
        isExpanded: false,
        children: org.children ? org.children.map(convertToOrgStructure) : undefined
      });
     
      const convertedStructure = orgData.map(convertToOrgStructure);
      console.log('변환된 조직 구조:', convertedStructure);
     
      setOrgStructure(convertedStructure);
      toast.success('조직 구조를 성공적으로 불러왔습니다.');
    } catch (error) {
      console.error('조직 구조 로딩 실패:', error);
      toast.error('조직 구조를 불러올 수 없습니다. 기존 데이터를 사용합니다.');
     
      const fallbackStructure = buildOrgStructure([]);
      setOrgStructure(fallbackStructure);
    } finally {
      setOrgLoading(false);
    }
  }, [buildOrgStructure]);

  const fetchEmployees = useCallback(async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

  setDataLoading(true);
  try {
    const users = await userApi.getAllUsers();
    
    if (Array.isArray(users)) {
      const convertedUsers = users.map(convertUserToEmployee);
      
      const sortedUsers = convertedUsers.sort((a, b) => {
        return a.name.localeCompare(b.name, 'ko', { numeric: true });
      });
      
      setEmployees(sortedUsers);
      if (orgStructure.length === 0 && !orgLoading) {
        await fetchOrganizationStructure();
      }
    } else {
      console.warn('Users is not an array:', users);
      toast.error("직원 데이터를 불러올 수 없습니다.");
      setEmployees([]);
    }
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error);
    
    if (error.response?.status === 403) {
      toast.error('구성원 목록을 조회할 권한이 없습니다.');
      return;
    }
    
    if (error.response?.status === 500) {
      toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    
    toast.error('구성원 목록을 불러오는데 실패했습니다.');
  } finally {
    setDataLoading(false);
  }
}, [isLoggedIn, router, orgStructure.length, orgLoading]);

  const handleMemberSearchSubmit = useCallback(async (term: string) => {
    setIsSearchingMembers(true);
    try {
      if (!term.trim()) {
        await fetchEmployees();
      } else {
        const searchResults = await userApi.searchUsers(term);
        if (Array.isArray(searchResults)) {
          const convertedResults = searchResults.map(convertUserToEmployee);
          setEmployees(convertedResults);
        } else {
          console.warn('검색 결과가 배열이 아님:', searchResults);
          setEmployees([]);
        }
      }
    } catch (error) {
      console.error('직원 검색 오류:', error);
      toast.error('직원 검색 중 오류가 발생했습니다.');
      setEmployees([]);
    } finally {
      setIsSearchingMembers(false);
    }
  }, [fetchEmployees]);

  if (isLoggedIn && employees.length === 0 && !dataLoading) {
    fetchEmployees();
  }

  const handleOrgSelect = (orgName: string) => {
    setSelectedOrg(orgName === selectedOrg ? null : orgName);
  };

  const handleOrgToggle = (orgName: string) => {
    setOrgStructure((prev) => {
      const updateOrg = (orgs: OrgStructure[]): OrgStructure[] => {
        return orgs.map((org) => {
          if (org.name === orgName) {
            return { ...org, isExpanded: !org.isExpanded };
          }
          if (org.children) {
            return { ...org, children: updateOrg(org.children) };
          }
          return org;
        });
      };
      return updateOrg(prev);
    });
  };

  const handleExpandAllToggle = () => {
    const newExpandedState = !isAllExpanded;
    setIsAllExpanded(newExpandedState);
    setOrgStructure((prev) => {
      const updateOrg = (orgs: OrgStructure[]): OrgStructure[] => {
        return orgs.map((org) => ({
          ...org,
          isExpanded: newExpandedState,
          children: org.children ? updateOrg(org.children) : undefined,
        }));
      };
      return updateOrg(prev);
    });
  };

  const filteredOrgStructure = useMemo(() => {
    if (!orgSearchTerm) return orgStructure;
   
    const term = orgSearchTerm.toLowerCase();
    const filterTree = (orgs: OrgStructure[]): OrgStructure[] => {
      const result: OrgStructure[] = [];
      for (const org of orgs) {
        const selfMatch = org.name.toLowerCase().includes(term);
        const filteredChildren = org.children ? filterTree(org.children) : undefined;

        if (selfMatch) {
          result.push({
            ...org,
            isExpanded: true,
            children: filteredChildren,
          });
        } else if (filteredChildren && filteredChildren.length > 0) {
          result.push({ ...org, isExpanded: true, children: filteredChildren });
        }
      }
      return result;
    };

    return filterTree(orgStructure);
  }, [orgStructure, orgSearchTerm]);

  const handleEmployeeUpdate = (updatedEmployee: Employee) => {
    setEmployees((prev) => {
      const updated = prev.map((emp) => {
        if (emp.id === updatedEmployee.id) {
          return updatedEmployee;
        }
        return emp;
      });
      
      const sorted = updated.sort((a, b) => {
        return a.name.localeCompare(b.name, 'ko', { numeric: true });
      });
      
      return sorted;
    });
  };

  const handleAddMemberSave = async (memberData: any) => {
    let createdUserId: number | null = null;
    
    try {
      console.log('memberData:', memberData);
      console.log('ranks:', ranks);
      console.log('positions:', positions);
      console.log('jobs:', jobs);
      
      // memberData에서 rank, position, job 값 확인
      console.log('memberData.rank:', memberData.rank);
      console.log('memberData.position:', memberData.position);
      console.log('memberData.job:', memberData.job);
      
      // rank, position, job의 실제 ID를 찾기 - 이미 객체이므로 직접 ID 사용
      const rankId = memberData.rank?.id;
      const positionId = memberData.position?.id;
      const jobId = memberData.job?.id;

      console.log('찾은 ID들:', { rankId, positionId, jobId });
      
      // 각 배열의 첫 번째 요소 구조 확인
      if (ranks.length > 0) {
        console.log('첫 번째 rank 구조:', ranks[0]);
      }
      if (positions.length > 0) {
        console.log('첫 번째 position 구조:', positions[0]);
      }
      if (jobs.length > 0) {
        console.log('첫 번째 job 구조:', jobs[0]);
      }

      const newUserData: UserCreateDto = {
        name: memberData.name,
        email: memberData.email,
        password: memberData.tempPassword || "temporaryPassword123!",
        phone: memberData.phone || "",
        address: memberData.address || "",
        joinDate: memberData.joinDate,
        isAdmin: Boolean(memberData.isAdmin),
        role: memberData.role,
        position: positionId ? { id: positionId, name: memberData.position.name, sortOrder: 0 } : undefined,
        job: jobId ? { id: jobId, name: memberData.job.name, sortOrder: 0 } : undefined,
        rank: rankId ? { id: rankId, name: memberData.rank.name, sortOrder: 0 } : undefined,
        workPolicyId: memberData.workPolicies?.[0] ? parseInt(memberData.workPolicies[0]) : undefined,
        needsPasswordReset: Boolean(memberData.tempPassword),
      };

      console.log('전송할 데이터:', newUserData);

      const result = await userApi.createUser(newUserData);
      createdUserId = result.id;

      console.log('생성 결과:', result);

      if (!result || !result.id) {
        throw new Error("사용자 생성 실패: 응답 데이터 없음");
      }

      console.log('사용자 생성 결과:', result);
      console.log('생성된 사용자의 근무 정책 ID:', result.workPolicyId);

      if (memberData.organizations && memberData.organizations.length > 0) {

        const allOrganizations = await organizationApi.getAllOrganizations();

        for (let i = 0; i < memberData.organizations.length; i++) {
          const orgName = memberData.organizations[i];
          const organization = allOrganizations.find(org => org.name === orgName);
          
          if (!organization) {
            throw new Error(`조직을 찾을 수 없습니다: ${orgName}`);
          }
          
          await organizationApi.createAssignment({
            employeeId: result.id,
            organizationId: organization.organizationId,
            isPrimary: i === 0,
            isLeader: false
          });
        }
        
      }

      const newMember: Employee = {
        id: result.id.toString(),
        name: result.name,
        email: result.email,
        phone: result.phone || "",
        address: result.address || "",
        joinDate: result.joinDate || "",
        organization: memberData.organizations?.[0] || "",
        organizations: memberData.organizations || [],
        position: memberData.position || "",
        role: memberData.role || "",
        job: memberData.job || "",
        rank: memberData.rank || "",
        isAdmin: result.isAdmin,
        teams: [],
        profileImage: result.profileImageUrl,
        workPolicies: result.workPolicyId ? [result.workPolicyId.toString()] : [],
      };


      const updatedEmployees = [...employees, newMember];

      const sortedEmployees = updatedEmployees.sort((a, b) => {
        return a.name.localeCompare(b.name, 'ko', { numeric: true });
      });

      setEmployees(sortedEmployees);
      await fetchOrganizationStructure();
      setShowAddMemberModal(false);
      toast.success("구성원이 성공적으로 추가되었습니다.");

    } catch (error) {
      console.error("구성원 추가 오류:", error);
      
      if (createdUserId) {
        try {
          await userApi.deleteUser(createdUserId);
        } catch (deleteError) {
          console.error("사용자 삭제 실패:", deleteError);
        }
      }
      
      toast.error("구성원 추가 중 오류가 발생했습니다: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleEmployeeDelete = (employeeId: string) => {
    setEmployees((prev) => {
      const filtered = prev.filter((emp) => emp.id !== employeeId);
      
      const sorted = filtered.sort((a, b) => {
        return a.name.localeCompare(b.name, 'ko', { numeric: true });
      });
      
      return sorted;
    });
    toast.success("구성원이 삭제되었습니다.");
  };

  const OrgTreeItem = ({ org, level = 0 }: { org: OrgStructure; level?: number }) => (
    <div className="ml-4">
      <button
        onClick={() => handleOrgSelect(org.name)}
        className={`group w-full text-left p-2 rounded-lg transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 ${
          selectedOrg === org.name
            ? "bg-blue-50 text-blue-800 ring-1 ring-blue-200 hover:ring-blue-300"
            : "bg-white hover:bg-gray-50 ring-1 ring-transparent hover:ring-gray-200 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {org.children ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleOrgToggle(org.name);
                }}
                className="p-1 hover:bg-gray-200 rounded cursor-pointer"
              >
                {org.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            ) : (
              <div className="p-1 w-6 h-6 flex items-center justify-center">
                <span className="text-gray-400 text-lg">·</span>
              </div>
            )}
            <Building2 className="w-4 h-4" />
            <span className="font-medium">{org.name}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {org.employeeCount}명
          </Badge>
        </div>
      </button>
      {org.children && org.isExpanded && (
        <div className="mt-1">
          {org.children.map((child, index) => (
            <OrgTreeItem key={index} org={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );

  if (dataLoading) {
    return (
      <MainLayout requireAuth={true}>
        <div className="flex justify-center items-center h-screen w-full">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout requireAuth={true}>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedOrg ? `구성원 - ${selectedOrg}` : "구성원"}
          </h1>
          <div className="flex items-center gap-2">
            <GradientButton variant="primary" onClick={() => setShowSettingsModal(true)}>
              <Settings className="w-4 h-4 mr-2" />
              설정
            </GradientButton>
          </div>
        </div>
        <p className="text-gray-600">
          직원 수: {filteredEmployees.length}
          {selectedOrg && ` (${selectedOrg} 필터링됨)`}
          {searchTerm && ` (검색어: "${searchTerm}")`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">구성원 목록</h3>
            </div>
            <MemberList
              employees={filteredEmployees}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onSearchSubmit={handleMemberSearchSubmit}
              selectedOrg={selectedOrg}
              placeholder="직원명, 조직명, 이메일로 검색"
              onEmployeeUpdate={handleEmployeeUpdate}
              onEmployeeDelete={handleEmployeeDelete}
              isSearching={isSearchingMembers}
              isSearchMode={!!searchTerm && !isSearchingMembers}
            />
          </GlassCard>
        </div>

        <div>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">조직도</h3>
              {orgLoading && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm text-gray-500">로딩 중...</span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="조직명을 입력하여 검색"
                  value={orgSearchTerm}
                  onChange={(e) => setOrgSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExpandAllToggle}
                className="flex items-center gap-1"
              >
                {isAllExpanded ? <Minimize className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
                모두 {isAllExpanded ? "접기" : "펼치기"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchOrganizationStructure}
                disabled={orgLoading}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`w-4 h-4 ${orgLoading ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
            </div>

            <div className="space-y-1">
              {filteredOrgStructure.map((org, index) => (
                <OrgTreeItem key={index} org={org} />
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onSave={handleAddMemberSave}
        onBack={() => {
          setShowAddMemberModal(false);
          setShowSettingsModal(true);
        }}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onAddMember={() => {
          setShowSettingsModal(false);
          setShowAddMemberModal(true);
        }}
      />
    </MainLayout>
  );
}