"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import styles from "./date-input.module.css";
import modalStyles from "./members-modal.module.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SimpleDropdown from "./SimpleDropdown";
import { Badge } from "@/components/ui/badge";
import {
  useOrganizationsList,
  useTitlesFromAPI,
  useWorkPoliciesList,
} from "@/hooks/use-members-derived-data";
import { titleApi } from "@/lib/services/title/api";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Crown,
  Shield,
  Copy,
  RefreshCw,
  Trash2,
  ArrowLeft,
  Clock,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { apiClient } from "@/lib/services/common/api-client";
import { organizationApi } from "@/lib/services/organization/api"; // 추가
import { userApi } from "@/lib/services/user/api";
import {
  workScheduleApi,
  employeeLeaveBalanceApi,
} from "@/lib/services/attendance/api";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  joinDate: string;
  organizations: string[];
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
  workPolicies?: string[];
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onUpdate?: (updatedEmployee: Employee) => void;
  onDelete?: (employeeId: string) => void;
}

export default function EditModal({
  isOpen,
  onClose,
  employee,
  onUpdate,
  onDelete,
}: EditModalProps) {
  const { user, isAdmin } = useAuth();
  const [editedEmployee, setEditedEmployee] = useState<Employee | null>(null);
  const joinDateRef = useRef<HTMLInputElement | null>(null);
  const [tempPassword, setTempPassword] = useState<string>("");
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);
  const [workPolicyDropdownOpen, setWorkPolicyDropdownOpen] = useState(false);
  const [organizationDropdownOpen, setOrganizationDropdownOpen] =
    useState(false);
  const [concurrentDropdownOpen, setConcurrentDropdownOpen] = useState(false);
  const orgTriggerRef = useRef<HTMLDivElement | null>(null);
  const orgButtonRef = useRef<HTMLButtonElement | null>(null);
  const [orgContentWidth, setOrgContentWidth] = useState<number | undefined>(
    undefined
  );
  const policyTriggerRef = useRef<HTMLDivElement | null>(null);
  const policyButtonRef = useRef<HTMLButtonElement | null>(null);
  const [policyContentWidth, setPolicyContentWidth] = useState<
    number | undefined
  >(undefined);
  const concurrentTriggerRef = useRef<HTMLDivElement | null>(null);
  const concurrentButtonRef = useRef<HTMLButtonElement | null>(null);
  const [concurrentContentWidth, setConcurrentContentWidth] = useState<
    number | undefined
  >(undefined);
  const [memberOrganizations, setMemberOrganizations] = useState<{
    main: string | null;
    concurrent: string[];
  }>({ main: null, concurrent: [] });
  const {
    organizations,
    loading: orgLoading,
    error: orgError,
  } = useOrganizationsList();
  const {
    workPolicies,
    loading: workPolicyLoading,
    error: workPolicyError,
  } = useWorkPoliciesList();
  const {
    ranks,
    positions,
    jobs,
    loading: titleLoading,
    error: titleError,
  } = useTitlesFromAPI();

  const recomputePopoverWidths = () => {
    const readWidth = (el?: HTMLElement | null) => {
      if (!el) return undefined;
      const rect = el.getBoundingClientRect();
      return rect.width || el.offsetWidth;
    };
    const w1 =
      readWidth(orgButtonRef.current) ??
      readWidth(orgTriggerRef.current as any);
    if (w1) setOrgContentWidth(w1);
    const w2 =
      readWidth(policyButtonRef.current) ??
      readWidth(policyTriggerRef.current as any);
    if (w2) setPolicyContentWidth(w2);
    const w3 =
      readWidth(concurrentButtonRef.current) ??
      readWidth(concurrentTriggerRef.current as any);
    if (w3) setConcurrentContentWidth(w3);
  };

  useLayoutEffect(() => {
    const readWidth = (el?: HTMLElement | null) => {
      if (!el) return undefined;
      const rect = el.getBoundingClientRect();
      return rect.width || el.offsetWidth;
    };
    const update = () => recomputePopoverWidths();
    update();
    const ro = new ResizeObserver(update);
    if (orgTriggerRef.current) ro.observe(orgTriggerRef.current);
    if (policyTriggerRef.current) ro.observe(policyTriggerRef.current);
    if (concurrentTriggerRef.current) ro.observe(concurrentTriggerRef.current);
    return () => ro.disconnect();
  }, [orgContentWidth, policyContentWidth]);

  const isOwnProfile = user?.email === employee?.email;
  const canEdit = isOwnProfile || isAdmin;
  const canDelete = isAdmin;
  const canResetPassword = isAdmin;

  // 선택 정책 ID까지 확인하는 근무정책 매핑 대기 (기본 10회, 1초 간격)
  const waitForUserWorkPolicyReady = async (
    userId: number,
    expectedWorkPolicyId: string,
    maxAttempts = 10,
    delayMs = 1000
  ) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const wp = await workScheduleApi.getUserWorkPolicy(userId);
        if (wp && String(wp.workPolicyId) === expectedWorkPolicyId) return true;
      } catch {}
      await new Promise((r) => setTimeout(r, delayMs));
    }
    return false;
  };

  // 근무 정책 자동 적용 함수 (ID 일치 확인 + 순차 실행)
  const applyWorkPolicyAutomatically = async (
    userId: number,
    previousWorkPolicyId?: string
  ) => {
    const selectedWorkPolicyId = editedEmployee?.workPolicies?.[0];
    if (!selectedWorkPolicyId) return;

    // 근무정책이 변경된 경우에만 자동 실행
    if (previousWorkPolicyId === selectedWorkPolicyId) return;

    // 현재 월 범위 계산
    const today = new Date();
    const startDate = today.toISOString().split("T")[0];
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    // 0) 사용자 근무정책 매핑이 선택 ID로 반영될 때까지 대기
    const ready = await waitForUserWorkPolicyReady(
      userId,
      selectedWorkPolicyId
    );
    if (!ready) {
      toast.warning(
        "근무정책이 아직 반영되지 않았습니다. 잠시 후 다시 시도해주세요."
      );
      return;
    }

    // 1) 스케줄 반영 (기존 스케줄 초기화 포함)
    await workScheduleApi.applyWorkPolicyToSchedule(userId, startDate, endDate);
    toast.success("근무 정책이 스케줄에 성공적으로 적용되었습니다.");

    // 2) 연차 부여 (근무년수 기준)
    await employeeLeaveBalanceApi.grantAnnualLeaveByWorkYears(userId);
    toast.success("연차 정책이 성공적으로 부여되었습니다.");
  };

  useEffect(() => {
    if (employee) {
      setEditedEmployee((prev) => {
        const newEmployee = {
          ...employee,
          workPolicies: employee.workPolicies || [],
          address: prev?.address || employee.address || "",
          joinDate: prev?.joinDate || employee.joinDate || "",
          rank:
            typeof employee.rank === "object"
              ? employee.rank?.name
              : employee.rank,
          position:
            typeof employee.position === "object"
              ? employee.position?.name
              : employee.position,
          job:
            typeof employee.job === "object"
              ? employee.job?.name
              : employee.job,
        };
        return newEmployee;
      });
      const initialOrgs =
        employee.organizations && employee.organizations.length > 0
          ? employee.organizations
          : [];
      const main = initialOrgs.length > 0 ? initialOrgs[0] : null;
      const concurrent = initialOrgs.length > 1 ? initialOrgs.slice(1) : [];
      setMemberOrganizations({ main, concurrent });
      setTempPassword("");
    }
  }, [employee]);

  const [detailInfoLoaded, setDetailInfoLoaded] = useState(false);

  useEffect(() => {
    const fetchDetailInfo = async () => {
      if (employee?.id && canEdit && !detailInfoLoaded) {
        try {
          const detailResponse = await userApi.getDetailProfile(employee.id);
          if (detailResponse.data) {
            setEditedEmployee((prev) => {
              const updated = {
                ...prev,
                address: detailResponse.data.address || prev?.address || "",
                joinDate: detailResponse.data.joinDate || prev?.joinDate || "",
              };
              return updated;
            });
            setDetailInfoLoaded(true);
          }
        } catch (error) {
          console.error("상세정보 조회 실패:", error);
        }
      }
    };

    if (isOpen && employee?.id) {
      fetchDetailInfo();
    }
  }, [isOpen, employee?.id, canEdit, detailInfoLoaded]);

  useEffect(() => {
    setDetailInfoLoaded(false);
  }, [employee?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (workPolicyDropdownOpen && !target.closest(".work-policy-dropdown")) {
        setWorkPolicyDropdownOpen(false);
      }

      if (
        organizationDropdownOpen &&
        !target.closest(".organization-dropdown")
      ) {
        setOrganizationDropdownOpen(false);
      }
    };

    if (workPolicyDropdownOpen || organizationDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [workPolicyDropdownOpen, organizationDropdownOpen]);

  const generateRandomPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGeneratePassword = () => {
    setIsGeneratingPassword(true);
    setTimeout(() => {
      const newPassword = generateRandomPassword();
      setTempPassword(newPassword);
      setIsGeneratingPassword(false);
      toast.success("임시 비밀번호가 생성되었습니다.");
    }, 500);
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(tempPassword);
      toast.success("비밀번호가 클립보드에 복사되었습니다.");
    } catch (error) {
      toast.error("클립보드 복사에 실패했습니다.");
    }
  };

  const handleSave = async () => {
    if (!editedEmployee) return;

    // 기존 근무정책 ID 저장 (자동화 로직 실행 여부 판단용)
    const previousWorkPolicyId = employee?.workPolicies?.[0];

    try {
      let positionId = null;
      let jobId = null;
      let rankId = null;

      if (editedEmployee.position) {
        try {
          const positions = await titleApi.getPositions();
          const position = positions.find(
            (p) => p.name === editedEmployee.position
          );
          positionId = position?.id || null;
        } catch (error) {
          console.error("직위 조회 실패:", error);
        }
      }

      if (editedEmployee.job) {
        try {
          const jobs = await titleApi.getJobs();
          const job = jobs.find((j) => j.name === editedEmployee.job);
          jobId = job?.id || null;
        } catch (error) {
          console.error("직책 조회 실패:", error);
        }
      }

      if (editedEmployee.rank) {
        try {
          const ranks = await titleApi.getRanks();
          const rank = ranks.find((r) => r.name === editedEmployee.rank);
          rankId = rank?.id || null;
        } catch (error) {
          console.error("직급 조회 실패:", error);
        }
      }

      const updateData = {
        name: editedEmployee.name,
        email: editedEmployee.email,
        phone: editedEmployee.phone || null,
        address: editedEmployee.address || null,
        joinDate: editedEmployee.joinDate,
        isAdmin: editedEmployee.isAdmin,
        role: editedEmployee.role || null,
        workPolicyId: editedEmployee.workPolicies?.[0]
          ? parseInt(editedEmployee.workPolicies[0])
          : null,
        profileImageUrl: editedEmployee.profileImage || null,
        position: positionId
          ? { id: positionId, name: editedEmployee.position, sortOrder: 0 }
          : null,
        job: jobId
          ? { id: jobId, name: editedEmployee.job, sortOrder: 0 }
          : null,
        rank: rankId
          ? { id: rankId, name: editedEmployee.rank, sortOrder: 0 }
          : null,
        ...(tempPassword && {
          password: tempPassword,
          needsPasswordReset: true,
        }),
      };

      const response = await apiClient.patch(
        `/api/users/${editedEmployee.id}`,
        updateData
      );
      const result = response.data;

      if (result.status === "SUCCESS") {
        const updatedEmployeeData = result.data;

        // 저장 성공 직후: 응답의 workPolicyId가 선택한 정책과 일치할 때만 자동화 실행
        const selectedId = editedEmployee.workPolicies?.[0];
        if (
          selectedId &&
          String(updatedEmployeeData.workPolicyId || "") === selectedId
        ) {
          await applyWorkPolicyAutomatically(
            parseInt(editedEmployee.id),
            previousWorkPolicyId
          );
        }

        if (
          editedEmployee.organizations &&
          editedEmployee.organizations.length > 0
        ) {
          try {
            const allOrganizations =
              await organizationApi.getAllOrganizations();

            for (let i = 0; i < editedEmployee.organizations.length; i++) {
              const orgName = editedEmployee.organizations[i];

              const organization = allOrganizations.find(
                (org) => org.name === orgName
              );

              if (!organization) {
                console.warn(`조직을 찾을 수 없습니다: ${orgName}`);
                continue;
              }

              try {
                await organizationApi.createAssignment({
                  employeeId: parseInt(editedEmployee.id),
                  organizationId: organization.organizationId,
                  isPrimary: i === 0,
                  isLeader: false,
                });
              } catch (assignmentError) {
                console.error(`조직 할당 실패: ${orgName}`, assignmentError);
              }
            }
          } catch (orgError) {
            console.error("조직 할당 실패:", orgError);
          }
        }

        const updatedEmployee: Employee = {
          id: updatedEmployeeData.id.toString(),
          name: updatedEmployeeData.name,
          email: updatedEmployeeData.email,
          phone: updatedEmployeeData.phone || "",
          address: updatedEmployeeData.address || "",
          joinDate: updatedEmployeeData.joinDate || "",
          organizations: editedEmployee.organizations || [],
          position: updatedEmployeeData.position?.name || "",
          role: updatedEmployeeData.role || "",
          job: updatedEmployeeData.job?.name || "",
          rank: updatedEmployeeData.rank?.name || "",
          isAdmin: updatedEmployeeData.isAdmin,
          teams: [],
          profileImage: updatedEmployeeData.profileImageUrl,
          workPolicies: updatedEmployeeData.workPolicyId
            ? [updatedEmployeeData.workPolicyId.toString()]
            : [],
        };

        onUpdate?.(updatedEmployee);
        window.dispatchEvent(
          new CustomEvent("employeeUpdated", {
            detail: updatedEmployee,
          })
        );

        onClose();

        if (tempPassword) {
          toast.success(
            "구성원 정보와 임시 비밀번호가 성공적으로 업데이트되었습니다."
          );
          setTempPassword("");
        } else {
          toast.success("구성원 정보가 성공적으로 업데이트되었습니다.");
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("구성원 업데이트 오류:", error);
      toast.error("구성원 업데이트 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!employee || !canDelete) return;

    if (!confirm("정말로 이 구성원을 삭제하시겠습니까?")) return;

    try {
      const response = await apiClient.delete(`/api/users/${employee.id}`);
      const result = response.data;

      if (result.status === "SUCCESS") {
        onDelete?.(employee.id);
        window.dispatchEvent(
          new CustomEvent("employeeDeleted", {
            detail: { id: employee.id },
          })
        );
        onClose();
        toast.success("구성원이 성공적으로 삭제되었습니다.");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("구성원 삭제 오류:", error);
      toast.error("구성원 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleInputChange = (
    field: keyof Employee,
    value: string | boolean | string[]
  ) => {
    if (!editedEmployee) return;
    setEditedEmployee({
      ...editedEmployee,
      [field]: value,
    });
  };

  const handleWorkPolicyToggle = (policyId: string) => {
    if (!editedEmployee) return;
    const currentSelected =
      editedEmployee.workPolicies && editedEmployee.workPolicies[0]
        ? editedEmployee.workPolicies[0]
        : null;
    const newPolicies: string[] =
      currentSelected === policyId ? [] : [policyId];

    setEditedEmployee({
      ...editedEmployee,
      workPolicies: newPolicies,
    });
    setWorkPolicyDropdownOpen(false);
  };

  const updateEditedEmployeeOrgs = (next: {
    main: string | null;
    concurrent: string[];
  }) => {
    if (!editedEmployee) return;
    const legacy = [next.main, ...next.concurrent].filter(Boolean) as string[];
    setEditedEmployee({ ...editedEmployee, organizations: legacy });
  };

  const handleSelectMainOrg = (orgName: string) => {
    setMemberOrganizations((prev) => {
      const next = {
        main: orgName,
        concurrent: prev.concurrent.filter((o) => o !== orgName),
      };
      updateEditedEmployeeOrgs(next);
      return next;
    });
    setOrganizationDropdownOpen(false);
  };

  const handleToggleConcurrentOrg = (orgName: string) => {
    setMemberOrganizations((prev) => {
      if (prev.main === orgName) return prev;
      const isSelected = prev.concurrent.includes(orgName);
      const next = {
        main: prev.main,
        concurrent: isSelected
          ? prev.concurrent.filter((o) => o !== orgName)
          : [...prev.concurrent, orgName],
      };
      updateEditedEmployeeOrgs(next);
      return next;
    });
  };

  if (!employee || !canEdit) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        data-hide-default-close
        className={`max-w-6xl w-[96vw] max-h-screen overflow-y-auto bg-white text-gray-900 border border-gray-200 shadow-2xl ${modalStyles.membersModal}`}
      >
        <DialogHeader>
          <div className="flex items-center justify-between bg-white border-b border-gray-200 pb-3">
            <button
              type="button"
              className="p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded cursor-pointer"
              onClick={onClose}
              aria-label="뒤로가기"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 text-center">
              <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
                구성원 정보 수정
              </DialogTitle>
              <DialogDescription className="text-center">
                구성원의 개인정보, 조직정보, 근무정책을 수정할 수 있습니다.
              </DialogDescription>
            </div>
            <button
              type="button"
              className="p-2 -mr-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded cursor-pointer"
              onClick={onClose}
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                기본 정보
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름 *</Label>
                  <Input
                    id="name"
                    value={editedEmployee?.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="이름을 입력하세요"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일 *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedEmployee?.email || ""}
                    readOnly
                    className="bg-gray-50 cursor-not-allowed"
                    placeholder="이메일은 수정할 수 없습니다"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호</Label>
                  <Input
                    id="phone"
                    value={editedEmployee?.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="전화번호를 입력하세요"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">주소</Label>
                  <Input
                    id="address"
                    value={editedEmployee?.address || ""}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="주소를 입력하세요"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                조직 정보
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-semibold">메인 조직 *</Label>
                  <Popover
                    open={organizationDropdownOpen}
                    onOpenChange={(open) => {
                      setOrganizationDropdownOpen(open);
                      if (open) recomputePopoverWidths();
                    }}
                  >
                    <div ref={orgTriggerRef} className="w-full">
                      <PopoverTrigger asChild>
                        <Button
                          ref={orgButtonRef}
                          type="button"
                          variant="outline"
                          className="w-full justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {memberOrganizations.main ||
                              "메인 조직을 선택하세요"}
                          </div>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                    </div>
                    <PopoverContent
                      align="start"
                      side="bottom"
                      className="p-0 max-h-[60vh] overflow-y-auto overscroll-contain"
                      style={{
                        width: orgContentWidth,
                        minWidth: orgContentWidth,
                        maxWidth: orgContentWidth,
                      }}
                    >
                      {orgLoading && (
                        <div className="p-3 text-sm text-gray-500">
                          조직을 불러오는 중...
                        </div>
                      )}
                      {orgError && !orgLoading && (
                        <div className="p-3 text-sm text-red-500">
                          조직을 불러오지 못했습니다.
                        </div>
                      )}
                      {!orgLoading &&
                        !orgError &&
                        organizations.map((org) => {
                          const selected = memberOrganizations.main === org;
                          return (
                            <div
                              key={org}
                              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleSelectMainOrg(org)}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  selected ? "bg-blue-50" : ""
                                }`}
                              >
                                {selected && (
                                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {org}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">겸직 조직</Label>
                  <Popover
                    open={concurrentDropdownOpen}
                    onOpenChange={setConcurrentDropdownOpen}
                  >
                    <div ref={concurrentTriggerRef} className="w-full">
                      <PopoverTrigger asChild>
                        <Button
                          ref={concurrentButtonRef}
                          type="button"
                          variant="outline"
                          className="w-full justify-between"
                        >
                          <div className="truncate">
                            {memberOrganizations.concurrent.length > 0
                              ? `${memberOrganizations.concurrent.length}개 선택됨`
                              : "겸직 조직을 선택하세요"}
                          </div>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                    </div>
                    <PopoverContent
                      align="start"
                      side="bottom"
                      className="p-0 max-h-[60vh] overflow-y-auto overscroll-contain"
                      style={{
                        width: concurrentContentWidth,
                        minWidth: concurrentContentWidth,
                        maxWidth: concurrentContentWidth,
                      }}
                    >
                      {orgLoading && (
                        <div className="p-3 text-sm text-gray-500">
                          조직을 불러오는 중...
                        </div>
                      )}
                      {orgError && !orgLoading && (
                        <div className="p-3 text-sm text-red-500">
                          조직을 불러오지 못했습니다.
                        </div>
                      )}
                      {!orgLoading &&
                        !orgError &&
                        organizations.map((org) => {
                          if (memberOrganizations.main === org) return null;
                          const selected =
                            memberOrganizations.concurrent.includes(org);
                          return (
                            <div
                              key={org}
                              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleToggleConcurrentOrg(org)}
                            >
                              <div
                                className={`w-4 h-4 border border-gray-300 rounded flex items-center justify-center ${
                                  selected ? "bg-blue-50" : ""
                                }`}
                              >
                                {selected && (
                                  <Check className="w-3 h-3 text-blue-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {org}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </PopoverContent>
                  </Popover>
                  {memberOrganizations.concurrent.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {memberOrganizations.concurrent.map((org) => (
                        <span
                          key={org}
                          className="px-2 py-1 text-xs rounded border bg-gray-50 cursor-pointer"
                          onClick={() => handleToggleConcurrentOrg(org)}
                        >
                          {org}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rank">직급</Label>
                  <SimpleDropdown
                    options={ranks}
                    value={editedEmployee?.rank || ""}
                    onChange={(value) => handleInputChange("rank", value)}
                    placeholder="선택(선택사항)"
                    triggerClassName="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                    menuClassName="bg-white border border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">직위</Label>
                  <SimpleDropdown
                    options={positions}
                    value={editedEmployee?.position || ""}
                    onChange={(value) => handleInputChange("position", value)}
                    placeholder="선택(선택사항)"
                    triggerClassName="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                    menuClassName="bg-white border border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job">직책</Label>
                  <SimpleDropdown
                    options={jobs}
                    value={editedEmployee?.job || ""}
                    onChange={(value) => handleInputChange("job", value)}
                    placeholder="선택(선택사항)"
                    triggerClassName="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                    menuClassName="bg-white border border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">직무</Label>
                  <Input
                    id="role"
                    value={editedEmployee?.role || ""}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    placeholder="직무를 입력하세요"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                계정 정보
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="joinDate">입사일 *</Label>
                  <div
                    className="relative"
                    onPointerDown={() => {
                      const input = joinDateRef.current;
                      if (!input) return;
                      input.focus();
                      try {
                        input.showPicker?.();
                      } catch {}
                      input.click();
                    }}
                  >
                    <Input
                      id="joinDate"
                      ref={joinDateRef}
                      type="date"
                      placeholder="연도-월-일"
                      value={editedEmployee?.joinDate || ""}
                      onChange={(e) =>
                        handleInputChange("joinDate", e.target.value)
                      }
                      className={`cursor-pointer ${styles.dateInput}`}
                    />
                    <button
                      type="button"
                      aria-label="달력 열기"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                      // wrapper handles opening
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>관리자 권한</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editedEmployee?.isAdmin}
                      onCheckedChange={(checked) =>
                        handleInputChange("isAdmin", checked)
                      }
                      className="cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">
                      관리자 권한 부여
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>근무 정책</Label>
                  <Popover
                    open={workPolicyDropdownOpen}
                    onOpenChange={(open) => {
                      setWorkPolicyDropdownOpen(open);
                      if (open) recomputePopoverWidths();
                    }}
                  >
                    <div ref={policyTriggerRef} className="w-full">
                      <PopoverTrigger asChild>
                        <Button
                          ref={policyButtonRef}
                          type="button"
                          variant="outline"
                          className="w-full justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {editedEmployee?.workPolicies?.[0]
                              ? workPolicies.find(
                                  (p) =>
                                    p.id.toString() ===
                                    editedEmployee.workPolicies?.[0]
                                )?.name ?? "근무 정책을 선택하세요"
                              : "근무 정책을 선택하세요"}
                          </div>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                    </div>
                    <PopoverContent
                      align="start"
                      side="bottom"
                      className="p-0 max-h-[300px] overflow-y-auto overscroll-contain"
                      style={{
                        width: policyContentWidth,
                        minWidth: policyContentWidth,
                        maxWidth: policyContentWidth,
                      }}
                    >
                      {workPolicyLoading && (
                        <div className="p-3 text-sm text-gray-500">
                          근무 정책을 불러오는 중...
                        </div>
                      )}
                      {workPolicyError && !workPolicyLoading && (
                        <div className="p-3 text-sm text-red-500">
                          근무 정책을 불러오지 못했습니다.
                        </div>
                      )}
                      {!workPolicyLoading &&
                        !workPolicyError &&
                        workPolicies.map((policy) => {
                          const isSelected =
                            editedEmployee?.workPolicies?.includes(
                              policy.id.toString()
                            );
                          return (
                            <div
                              key={policy.id.toString()}
                              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() =>
                                handleWorkPolicyToggle(policy.id.toString())
                              }
                            >
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? "bg-blue-50 border-blue-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {policy.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {policy.type} - {policy.workHours}시간{" "}
                                  {policy.workMinutes}분
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </PopoverContent>
                  </Popover>
                </div>

                {canResetPassword && (
                  <div className="space-y-2">
                    <Label>임시 비밀번호 재설정</Label>
                    <div className="flex gap-2">
                      <Input
                        value={tempPassword}
                        placeholder="임시 비밀번호가 여기에 표시됩니다"
                        readOnly
                      />
                      <Button
                        onClick={handleGeneratePassword}
                        disabled={isGeneratingPassword}
                        variant="outline"
                        size="sm"
                      >
                        {isGeneratingPassword ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        onClick={handleCopyPassword}
                        disabled={!tempPassword}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      생성된 임시 비밀번호는 구성원에게 전달해주세요.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between pt-6 border-t">
          <div className="flex gap-2">
            {canDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </Button>
            )}
          </div>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            저장하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
