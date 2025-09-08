"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  X,
  Calendar as CalendarIcon,
  Briefcase,
  User,
  Mail,
  Phone,
  Crown,
  Edit3,
  Shield,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { getAccessToken } from "@/lib/services/common/api-client";
import {
  useOrganizationsList,
  useTitlesFromAPI,
  useWorkPoliciesList,
} from "@/hooks/use-members-derived-data";
import { useRouter } from "next/navigation";
import modalStyles from "../members-modal.module.css";
import { MemberProfile, TeamInfo, WorkPolicy } from "./types";
import OrganizationBlock from "./OrganizationBlock";
import OrganizationDetailBlock from "./OrganizationDetailBlock";
import DetailBlock from "./DetailBlock";
import PolicyBlock from "./PolicyBlock";
import EditModal from "../EditModal";
import { WorkPolicyResponseDto } from "@/lib/services/attendance/types";
import { userApi } from "@/lib/services/user/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employee: MemberProfile | null;
  onUpdate?: (updatedEmployee: MemberProfile) => void;
  onDelete?: (employeeId: string) => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  employee,
  onUpdate,
  onDelete,
}: Props) {
  const { user, isAdmin } = useAuth();
  const { organizations: orgOptions } = useOrganizationsList();
  const { workPolicies } = useWorkPoliciesList();
  const {
    ranks,
    positions,
    jobs,
  } = useTitlesFromAPI();
  const router = useRouter();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");
  const [currentEmployee, setCurrentEmployee] = useState<MemberProfile | null>(employee);
  const [detailInfo, setDetailInfo] = useState<{address?: string, joinDate?: string} | null>(null);
  const [authenticatedImageUrl, setAuthenticatedImageUrl] = useState<string | null>(null);

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
    setCurrentEmployee(employee);
  }, [employee]);

  useEffect(() => {
    const handleEmployeeUpdate = (event: any) => {
      const updatedEmployee = event.detail;
      if (updatedEmployee && currentEmployee?.id === updatedEmployee.id) {
        setCurrentEmployee(updatedEmployee);
        onUpdate?.(updatedEmployee);
      }
    };

    window.addEventListener('employeeUpdated', handleEmployeeUpdate);
    return () => window.removeEventListener('employeeUpdated', handleEmployeeUpdate);
  }, [currentEmployee?.id, onUpdate]);

  const isOwnProfile = user?.email === currentEmployee?.email;
  const canEdit = isAdmin;
  const canEditProfileImage = isOwnProfile;
  const canViewDetails = isOwnProfile || isAdmin;

  useEffect(() => {
    if (!currentEmployee) return;
    const imageUrl = currentEmployee.profileImage || currentEmployee.avatarUrl || "";
    setProfileImage(imageUrl);
    
    if (imageUrl && !imageUrl.startsWith('http')) {
      getAuthenticatedImageUrl(imageUrl).then(url => {
        setAuthenticatedImageUrl(url);
      });
    } else {
      setAuthenticatedImageUrl(imageUrl);
    }
  }, [currentEmployee]);

  const handleModalOpen = async () => {
    if (employee?.id) {
      try {
        // 공개 프로필 조회 (모든 사용자) - 근무정책 정보를 위해
        const mainResponse = await userApi.getMainProfile(employee.id);
        console.log('API 응답:', mainResponse);
        console.log('rank:', mainResponse.data?.rank);
        console.log('position:', mainResponse.data?.position);
        console.log('job:', mainResponse.data?.job);
        
        if (mainResponse && mainResponse.data) {
          // workPolicies 배열 설정 (workPolicyId가 있는 경우)
          const workPolicies = mainResponse.data.workPolicyId ? [mainResponse.data.workPolicyId.toString()] : [];
          
          setCurrentEmployee(prev => ({
            ...prev,
            rank: mainResponse.data.rank,
            position: mainResponse.data.position,
            job: mainResponse.data.job,
            workPolicy: mainResponse.data.workPolicy,
            workPolicies: workPolicies
          }));
        }

        // 상세 정보 조회 (본인 또는 관리자만)
        if (canViewDetails) {
          const detailResponse = await userApi.getDetailProfile(employee.id);
          if (detailResponse.data) {
            setDetailInfo({
              address: detailResponse.data.address,
              joinDate: detailResponse.data.joinDate
            });
          }
        }
      } catch (error) {
        console.error('프로필 정보 조회 실패:', error);
      }
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (employee?.id) {
        try {
          // 공개 프로필 조회 (모든 사용자) - 근무정책 정보를 위해
          const mainResponse = await userApi.getMainProfile(employee.id);
          console.log('API 응답:', mainResponse);
          console.log('rank:', mainResponse.data?.rank);
          console.log('position:', mainResponse.data?.position);
          console.log('job:', mainResponse.data?.job);
          
          if (mainResponse && mainResponse.data) {
            // workPolicies 배열 설정 (workPolicyId가 있는 경우)
            const workPolicies = mainResponse.data.workPolicyId ? [mainResponse.data.workPolicyId.toString()] : [];
            
            setCurrentEmployee(prev => ({
              ...prev,
              rank: mainResponse.data.rank,
              position: mainResponse.data.position,
              job: mainResponse.data.job,
              workPolicy: mainResponse.data.workPolicy,
              workPolicies: workPolicies,
              profileImage: mainResponse.data.profileImageUrl
            }));
          }

          // 상세 정보 조회 (본인 또는 관리자만)
          if (canViewDetails) {
            const detailResponse = await userApi.getDetailProfile(employee.id);
            if (detailResponse.data) {
              setDetailInfo({
                address: detailResponse.data.address,
                joinDate: detailResponse.data.joinDate
              });
            }
          }
        } catch (error) {
          console.error('프로필 정보 조회 실패:', error);
        }
      }
    };

    if (isOpen && !detailInfo && employee?.id) {
      fetchProfileData();
    }
  }, [isOpen, detailInfo, employee?.id, canViewDetails]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentEmployee) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const size = 512;

        canvas.width = size;
        canvas.height = size;

        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, size, size);

          const scale = Math.max(size / img.width, size / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (size - scaledWidth) / 2;
          const y = (size - scaledHeight) / 2;

          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

          const croppedImageUrl = canvas.toDataURL("image/jpeg", 0.8);
          setProfileImage(croppedImageUrl);

          try {
            const token = getAccessToken();
            
            const formData = new FormData();
            const blob = await fetch(croppedImageUrl).then(r => r.blob());
            
            const timestamp = new Date().getTime();
            const fileName = `profile_${currentEmployee.name}_${timestamp}.jpg`;
            formData.append('files', blob, fileName);
            
            const uploadResponse = await fetch(`http://localhost:9000/api/attachments/upload`, {
              method: "POST",
              headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
              },
              body: formData,
            });
            
            if (!uploadResponse.ok) {
              throw new Error("이미지 업로드에 실패했습니다.");
            }
            
            const uploadResult = await uploadResponse.json();
            const fileId = uploadResult[0].fileId;
            
            const response = await fetch(`http://localhost:9000/api/users/${currentEmployee.id}/profile-image`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
              },
              body: JSON.stringify({
                profileImageUrl: fileId,
              }),
            });

            if (!response.ok) {
              throw new Error("프로필 이미지 업데이트에 실패했습니다.");
            }

            const updatedEmployee = {
              ...currentEmployee,
              profileImage: fileId,
            };
            setCurrentEmployee(updatedEmployee);
            onUpdate?.(updatedEmployee);

            getAuthenticatedImageUrl(fileId).then(url => {
              setAuthenticatedImageUrl(url);
            });

            window.dispatchEvent(
              new CustomEvent("employeeUpdated", {
                detail: updatedEmployee,
              }) as Event
            );

            toast.success("프로필 이미지가 성공적으로 업데이트되었습니다.");
          } catch (error) {
            console.error("프로필 이미지 업데이트 오류:", error);
            toast.error("프로필 이미지 업데이트에 실패했습니다.");
          }
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleWorkScheduleClick = () => {
    router.push("/work");
  };

  const teamsOptions: TeamInfo[] = (orgOptions || []).map((org) => ({
    teamId: org,
    name: org,
  }));

  if (!currentEmployee) return null;

  const transformEmployeeForEdit = (emp: any) => {
    if (!emp) return emp;
    
    return {
      ...emp,
      organizations: emp.organizations?.map((org: any) => {
        if (typeof org === 'object' && org.organizationName) {
          return org.organizationName;
        }
        return org;
      }) || []
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        data-hide-default-close
        className={`max-w-6xl w-[96vw] max-h-screen bg-white text-gray-900 border border-gray-200 shadow-2xl ${modalStyles.membersModal} p-0 flex flex-col overflow-hidden`}
      >
        <DialogTitle className="sr-only">프로필</DialogTitle>

        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 pr-17">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 text-left">
              <h2 className="text-2xl font-bold text-gray-900 transform -translate-x-6px]">
                프로필
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                구성원 정보를 확인하고 편집할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && (
                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  편집하기
                </Button>
              )}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
          onClick={onClose}
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-hidden">
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-800 text-sm md:text-base">
              <div className="flex flex-col gap-4">
                <div className="bg-white shadow p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage
                          src={authenticatedImageUrl || currentEmployee.avatarUrl}
                          alt={currentEmployee.name}
                        />
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-2xl">
                          <User className="w-12 h-12" />
                        </AvatarFallback>
                      </Avatar>
                      {canEditProfileImage && (
                        <div className="absolute -bottom-2 -right-2">
                          <label
                            htmlFor="profile-image-input"
                            className="cursor-pointer"
                          >
                            <div className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-full shadow-lg transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </div>
                            <input
                              id="profile-image-input"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-semibold mb-2">
                        {currentEmployee.name}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span className="break-all">
                            {currentEmployee.email}
                          </span>
                        </div>
                        {currentEmployee.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{currentEmployee.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow p-4 rounded-lg border border-gray-200">
                  <div className="text-gray-700 font-semibold mb-3">
                    내 직무/직책 정보
                  </div>
                  <OrganizationDetailBlock
                    main={(() => {
                      const orgs =
                        currentEmployee.organizations ??
                        (currentEmployee.organization ? [currentEmployee.organization] : []);
                      const mainOrg = orgs[0];
                      if (!mainOrg) return null;
                      
                      if (typeof mainOrg === 'object' && mainOrg.organizationName) {
                        return { teamId: mainOrg.organizationName, name: mainOrg.organizationName };
                      }
                      
                      return { teamId: mainOrg, name: mainOrg };
                    })()}
                    user={currentEmployee}
                  />
                </div>

                {canViewDetails && (
                  <div className="bg-white shadow p-4 rounded-lg border border-gray-200">
                    <div className="text-gray-700 font-semibold mb-3">
                      상세 정보
                    </div>
                    <DetailBlock
                      joinDate={detailInfo?.joinDate || (async () => {
                        if (employee?.id && !detailInfo) {
                          try {
                            const response = await userApi.getDetailProfile(employee.id);
                            if (response.data) {
                              setDetailInfo({
                                address: response.data.address,
                                joinDate: response.data.joinDate
                              });
                            }
                          } catch (error) {
                            console.error('상세 정보 조회 실패:', error);
                          }
                        }
                        return detailInfo?.joinDate;
                      })()}
                      address={detailInfo?.address}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <div
                  className="bg-white shadow p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={handleWorkScheduleClick}
                >
                  <div className="text-gray-700 font-semibold mb-3">
                    근무 일정
                  </div>
                  <div className="flex items-end justify-between gap-2 h-20">
                    {(() => {
                      const today = new Date();
                      const currentDay = today.getDay();
                      const sunday = new Date(today);
                      sunday.setDate(today.getDate() - currentDay);
                      const workHours = [
                        "0h",
                        "8h",
                        "8h",
                        "8h",
                        "8h",
                        "8h",
                        "0h",
                      ];
                      return [...Array(7)].map((_, i) => {
                        const date = new Date(sunday);
                        date.setDate(sunday.getDate() + i);
                        const isToday =
                          date.toDateString() === today.toDateString();
                        const isWeekend =
                          date.getDay() === 0 || date.getDay() === 6;
                        const height = isWeekend ? "25%" : "100%";
                        const dayIndex = date.getDay();
                        return (
                          <div
                            key={i}
                            className="flex-1 flex flex-col items-center"
                          >
                            <div
                              className={`text-xs mb-1 ${
                                isToday
                                  ? "text-blue-600 font-bold"
                                  : "text-gray-600"
                              }`}
                            >
                              {workHours[dayIndex]}
                            </div>
                            <div
                              className={`w-full rounded-t-sm ${
                                isToday
                                  ? "bg-blue-500"
                                  : isWeekend
                                  ? "bg-gray-300"
                                  : "bg-gray-500"
                              }`}
                              style={{ height }}
                            />
                            <div
                              className={`text-xs mt-1 ${
                                isToday
                                  ? "text-blue-600 font-bold"
                                  : "text-gray-500"
                              }`}
                            >
                              {
                                ["일", "월", "화", "수", "목", "금", "토"][
                                  date.getDay()
                                ]
                              }
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                <div className="bg-white shadow p-4 rounded-lg border border-gray-200">
                  <div className="text-gray-500 text-sm mb-1">남은 연차</div>
                  <div className="text-2xl font-bold">
                    {currentEmployee.remainingLeave ||
                      currentEmployee.remainingLeaveDays ||
                      12}
                    일
                  </div>
                </div>

                <div className="bg-white shadow p-4 rounded-lg border border-gray-200">
                  <div className="text-gray-500 text-sm mb-1">
                    이번 주 근무시간
                  </div>
                  <div className="text-2xl font-bold">
                    {currentEmployee.weeklyWorkHours || currentEmployee.thisWeekHours || 42}h
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="bg-white shadow p-4 rounded-lg border border-gray-200">
                  <div className="text-gray-700 font-semibold mb-3">
                    조직 정보
                  </div>
                  <OrganizationBlock
                    main={(() => {
                      const orgs =
                        currentEmployee.organizations ??
                        (currentEmployee.organization ? [currentEmployee.organization] : []);
                      const mainOrg = orgs[0];
                      if (!mainOrg) return null;
                      
                      if (typeof mainOrg === 'object' && mainOrg.organizationName) {
                        return { teamId: mainOrg.organizationName, name: mainOrg.organizationName };
                      }
                      
                      return { teamId: mainOrg, name: mainOrg };
                    })()}
                    concurrent={(() => {
                      const orgs =
                        currentEmployee.organizations ??
                        (currentEmployee.organization ? [currentEmployee.organization] : []);
                      return orgs
                        .slice(1)
                        .map((org) => {
                          if (typeof org === 'object' && org.organizationName) {
                            return { teamId: org.organizationName, name: org.organizationName };
                          }
                          
                          return { teamId: org, name: org };
                        });
                    })()}
                    user={currentEmployee}
                  />
                </div>

                <div className="bg-white shadow p-4 rounded-lg border border-gray-200">
                  <div className="text-gray-700 font-semibold mb-3">
                    근무 정책
                  </div>
                  <PolicyBlock
                    workPolicies={currentEmployee.workPolicies}
                    availablePolicies={workPolicies}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <EditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          employee={transformEmployeeForEdit(currentEmployee)}
          onUpdate={(updated) => {
            console.log('ProfileModal에서 받은 업데이트 데이터:', updated);
            setCurrentEmployee(updated as any);
            onUpdate?.(updated as any);
            window.dispatchEvent(
              new CustomEvent("employeeUpdated", { detail: updated }) as Event
            );
          }}
          onDelete={onDelete}
        />
      </DialogContent>
    </Dialog>
  );
}