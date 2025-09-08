"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, Calendar, Building2, Briefcase } from "lucide-react";
import ProfileModal from "./ProfileModal";
import { MemberProfile } from "./profile/types";
import { getAccessToken } from "@/lib/services/common/api-client";

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

  remainingLeave?: number;
  weeklyWorkHours?: number;
  weeklySchedule?: Array<{
    title: string;
    date: string;
    time?: string;
  }>;
}

interface MemberListProps {
  employees: Employee[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearchSubmit: (term: string) => void;
  selectedOrg: string | null;
  placeholder?: string;
  onEmployeeUpdate?: (updatedEmployee: Employee) => void;
  isSearching?: boolean;
  isSearchMode?: boolean;
  onEmployeeDelete?: (employeeId: string) => void;
}

const getDefaultProfileImage = (name: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ec4899&color=fff&size=96&font-size=0.4&length=1`;
};

export default function MemberList({
  employees,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  selectedOrg,
  placeholder,
  onEmployeeUpdate,
  onEmployeeDelete,
  isSearching = false,
  isSearchMode = false,
}: MemberListProps) {
  const [displayedCount, setDisplayedCount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [authenticatedImageUrls, setAuthenticatedImageUrls] = useState<Record<string, string>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // 인증된 이미지 URL 생성 함수
  const getAuthenticatedImageUrl = async (fileId: string) => {
    try {
      const token = getAccessToken();
      if (!token) return null

      const response = await fetch(`http://localhost:9000/api/attachments/${fileId}/view`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        return URL.createObjectURL(blob)
      }
    } catch (error) {
      console.error('이미지 로드 실패:', error)
    }
    return null
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          displayedCount < employees.length
        ) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [displayedCount, employees.length, isLoading]);

  useEffect(() => {
    setDisplayedCount(10);
  }, [searchTerm, selectedOrg]);

  // employees가 변경될 때마다 인증된 이미지 URL 생성
  useEffect(() => {
    const loadAuthenticatedImages = async () => {
      const newUrls: Record<string, string> = {};
      
      for (const employee of employees) {
        if (employee.profileImage && !employee.profileImage.startsWith('http')) {
          const url = await getAuthenticatedImageUrl(employee.profileImage);
          if (url) {
            newUrls[employee.id] = url;
          }
        }
      }
      
      setAuthenticatedImageUrls(newUrls);
    };

    loadAuthenticatedImages();
  }, [employees]);

  const loadMore = () => {
    if (isLoading || displayedCount >= employees.length) return;

    setIsLoading(true);

    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + 10, employees.length));
      setIsLoading(false);
    }, 300);
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowProfileModal(true);
  };

  const handleProfileModalClose = () => {
    setShowProfileModal(false);
    setSelectedEmployee(null);
  };

  const handleProfileUpdate = (updatedEmployee: MemberProfile) => {
    
    const convertedEmployee: Employee = {
      id: updatedEmployee.id || "",
      name: updatedEmployee.name || "",
      email: updatedEmployee.email || "",
      phone: updatedEmployee.phone || "",
      address: updatedEmployee.address || "",
      joinDate: updatedEmployee.joinDate || "",
      organization: updatedEmployee.organizations?.[0] || updatedEmployee.organization || "",
      organizations: updatedEmployee.organizations || [],
      position: updatedEmployee.position || "",
      role: updatedEmployee.role || "",
      job: updatedEmployee.job || "",
      rank: updatedEmployee.rank || "",
      isAdmin: updatedEmployee.isAdmin || false,
      teams: (updatedEmployee.organizations || [updatedEmployee.organization]).filter(Boolean) as string[],
      profileImage: updatedEmployee.profileImage || "",
      workPolicies: updatedEmployee.workPolicies || [],
    };
    
    onEmployeeUpdate?.(convertedEmployee);
  };

  const handleEmployeeDelete = (employeeId: string) => {
    onEmployeeDelete?.(employeeId);
    setShowProfileModal(false);
    setSelectedEmployee(null);
  };

  useEffect(() => {
    const handleEmployeeDeleted = (event: any) => {
      const { id } = event.detail;
      handleEmployeeDelete(id);
    };

    window.addEventListener('employeeDeleted', handleEmployeeDeleted);
    return () => window.removeEventListener('employeeDeleted', handleEmployeeDeleted);
  }, []);

  useEffect(() => {
    const handleEmployeeUpdated = (event: any) => {
      const updatedEmployee = event.detail;
      handleProfileUpdate(updatedEmployee);
    };

    window.addEventListener('employeeUpdated', handleEmployeeUpdated);
    return () => window.removeEventListener('employeeUpdated', handleEmployeeUpdated);
  }, []);

  const displayedEmployees = employees.slice(0, displayedCount);

  const EmployeeCard = ({ employee }: { employee: Employee }) => {
    return (
      <Card
        className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        onClick={() => handleEmployeeClick(employee)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 bg-transparent">
                <AvatarImage
                  src={
                    employee.profileImage && employee.profileImage.startsWith('http')
                      ? employee.profileImage 
                      : authenticatedImageUrls[employee.id] || getDefaultProfileImage(employee.name)
                  }
                  className="bg-transparent"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getDefaultProfileImage(employee.name);
                  }}
                />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {employee.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {employee.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {typeof employee.position === 'object' ? employee.position?.name : employee.position}
                </p>
              </div>
            </div>

          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{employee.email}</span>
            </div>
            {employee.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{employee.phone}</span>
              </div>
            )}
            
            {employee.organization && (
              <div className="flex items-center gap-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                <span>소속: {employee.organization}</span>
              </div>
            )}
            {employee.job && (
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="w-4 h-4" />
                <span>직무: {typeof employee.job === 'object' ? employee.job?.name : employee.job}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder={placeholder || "직원명을 입력하여 검색"}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSearchSubmit(searchTerm);
            }
          }}
          className="pl-10"
          disabled={isSearching}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {isSearchMode && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          💡 <strong>검색 모드</strong>: 전체 데이터베이스에서 검색된 결과입니다.
          {searchTerm && (
            <span className="ml-2">
              "{searchTerm}" 검색 결과: {employees.length}명
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedEmployees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>

      {displayedCount < employees.length && (
        <div ref={loadingRef} className="flex justify-center py-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span>로딩 중...</span>
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm">
              스크롤하여 더 많은 직원 보기 ({employees.length - displayedCount}
              명 남음)
            </div>
          )}
        </div>
      )}

      {employees.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>검색 결과가 없습니다.</p>
          {(selectedOrg || searchTerm) && (
            <p className="text-sm mt-2">필터 조건을 변경해보세요.</p>
          )}
        </div>
      )}

      {showProfileModal && selectedEmployee && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={handleProfileModalClose}
          employee={selectedEmployee}
          onUpdate={handleProfileUpdate}
          onDelete={handleEmployeeDelete}
        />
      )}
    </div>
  );
}