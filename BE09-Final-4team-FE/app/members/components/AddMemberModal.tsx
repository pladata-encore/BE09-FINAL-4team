"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import styles from "./date-input.module.css";
import modalStyles from "./members-modal.module.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SimpleDropdown from "./SimpleDropdown";
import {
  useOrganizationsList,
  useTitlesFromAPI,
  useWorkPoliciesList,
} from "@/hooks/use-members-derived-data";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Crown,
  Shield,
  Copy,
  RefreshCw,
  ArrowLeft,
  Save,
  X,
  Clock,
  ChevronDown,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { userApi } from "@/lib/services/user/api";
import {
  workScheduleApi,
  employeeLeaveBalanceApi,
} from "@/lib/services/attendance/api";

interface MemberOrganizations {
  main: string | null;
  concurrent: string[];
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: any) => void;
  onBack?: () => void;
}

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  joinDate: "",
  organizations: [] as string[],
  position: "",
  role: "",
  job: "",
  rank: "",
  tempPassword: "",
  isAdmin: false,
  workPolicies: [] as string[],
};

const checkEmailDuplicate = async (email: string) => {
  try {
    const users = await userApi.getAllUsers();
    return users.some((user) => user.email === email);
  } catch (error) {
    console.error("이메일 중복 검증 오류:", error);
    return false;
  }
};

export default function AddMemberModal({
  isOpen,
  onClose,
  onSave,
  onBack,
}: AddMemberModalProps) {
  const [formData, setFormData] = useState(initialFormData);
  const joinDateRef = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validFields, setValidFields] = useState<Record<string, boolean>>({});
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [workPolicyDropdownOpen, setWorkPolicyDropdownOpen] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
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
  const [memberOrganizations, setMemberOrganizations] =
    useState<MemberOrganizations>({ main: null, concurrent: [] });
  const [submitted, setSubmitted] = useState(false);
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

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...initialFormData });
      setErrors({});
      setValidFields({});
      setTouched({});
      setSubmitted(false);
      setShowSaveConfirm(false);
      setShowBackConfirm(false);
      setWorkPolicyDropdownOpen(false);
      setOrganizationDropdownOpen(false);
      setConcurrentDropdownOpen(false);
      setMemberOrganizations({ main: null, concurrent: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [workPolicyDropdownOpen, organizationDropdownOpen]);

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

  const updateOrganizationsFromMemberOrgs = (next: MemberOrganizations) => {
    const legacy = [next.main, ...next.concurrent].filter(Boolean) as string[];
    setFormData((prev) => ({ ...prev, organizations: legacy }));
    setTimeout(() => {
      validateField("organizations", legacy as unknown as string);
    }, 0);
  };

  const handleSelectMainOrg = (orgName: string) => {
    setMemberOrganizations((prev) => {
      const next: MemberOrganizations = {
        main: orgName,
        concurrent: (prev.concurrent || []).filter((o) => o !== orgName),
      };
      updateOrganizationsFromMemberOrgs(next);
      return next;
    });
    setOrganizationDropdownOpen(false);
  };

  const handleToggleConcurrentOrg = (orgName: string) => {
    setMemberOrganizations((prev) => {
      if (prev.main === orgName) return prev;
      const isSelected = prev.concurrent.includes(orgName);
      const next: MemberOrganizations = {
        main: prev.main,
        concurrent: isSelected
          ? prev.concurrent.filter((o) => o !== orgName)
          : [...prev.concurrent, orgName],
      };
      updateOrganizationsFromMemberOrgs(next);
      return next;
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (typeof value === "string")
      setValidFields((prev) => ({ ...prev, [field]: value.trim().length > 0 }));
  };

  const handleWorkPolicyToggle = (policyId: string) => {
    setFormData((prev) => {
      const currentPolicies = prev.workPolicies || [];
      const currentSelected = currentPolicies[0] ?? null;
      const newPolicies = currentSelected === policyId ? [] : [policyId];

      setTimeout(() => {
        validateField("workPolicies", newPolicies);
      }, 0);

      return {
        ...prev,
        workPolicies: newPolicies,
      };
    });
    setWorkPolicyDropdownOpen(false);
  };

  const handleOrganizationToggle = (orgName: string) => {
    setFormData((prev) => {
      const currentOrgs = prev.organizations || [];
      const isSelected = currentOrgs.includes(orgName);

      let newOrgs;
      if (isSelected) {
        newOrgs = currentOrgs.filter((org) => org !== orgName);
      } else {
        newOrgs = [...currentOrgs, orgName];
      }

      setTimeout(() => {
        validateField("organizations", "");
      }, 0);

      return {
        ...prev,
        organizations: newOrgs,
      };
    });
  };

  const validateField = (field: string, value: string | string[]) => {
    let isValid = false;
    let errorMessage = "";

    switch (field) {
      case "name":
        isValid = typeof value === "string" && value.trim().length >= 2;
        errorMessage = isValid ? "" : "이름을 2자 이상 입력해주세요.";
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = typeof value === "string" && emailRegex.test(value);
        errorMessage = isValid ? "" : "올바른 이메일 형식을 입력해주세요.";
        break;
      case "organizations":
        isValid =
          Array.isArray(formData.organizations) &&
          formData.organizations.length > 0;
        errorMessage = isValid ? "" : "최소 1개 이상의 조직을 선택해주세요.";
        break;
      case "position":
      case "rank":
      case "role":
      case "job":
        isValid = true;
        errorMessage = "";
        break;
      case "joinDate":
        isValid = typeof value === "string" && value.trim().length > 0;
        errorMessage = isValid ? "" : "입사일을 선택해주세요.";
        break;
      case "workPolicies": {
        const selected = Array.isArray(value) ? value : formData.workPolicies;
        isValid = Array.isArray(selected) && selected.length > 0;
        errorMessage = isValid ? "" : "필수 입력 항목입니다.";
        break;
      }
      default:
        isValid = true;
        errorMessage = "";
    }

    setValidFields((prev) => ({ ...prev, [field]: isValid }));
    if (field === "workPolicies") {
      if (isValid) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      } else if (submitted) {
        setErrors((prev) => ({ ...prev, [field]: errorMessage }));
      }
    } else {
      setErrors((prev) => ({ ...prev, [field]: errorMessage }));
    }

    return isValid;
  };

  const handleFieldBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (submitted) {
      validateField(field, value);
    }
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, tempPassword: password }));
    toast.success("임시 비밀번호가 생성되었습니다.");
  };

  const copyPassword = () => {
    if (formData.tempPassword) {
      navigator.clipboard.writeText(formData.tempPassword);
      toast.success("비밀번호가 클립보드에 복사되었습니다.");
    }
  };

  const validateForm = () => {
    const requiredFields = ["name", "email", "organizations", "joinDate"];
    let isValid = true;
    const newErrors: Record<string, string> = {};

    requiredFields.forEach((field) => {
      const value = formData[field as keyof typeof formData] as string;
      if (!validateField(field, value)) {
        isValid = false;
        if (submitted) newErrors[field] = "필수 항목입니다.";
      }
    });

    if (!formData.workPolicies || formData.workPolicies.length === 0) {
      isValid = false;
      if (submitted) newErrors["workPolicies"] = "필수 입력 항목입니다.";
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    setSubmitted(true);
    if (validateForm()) {
      setShowSaveConfirm(true);
    } else {
      toast.error("필수 항목을 모두 입력해주세요.");
    }
  };

  const hasData = () => {
    const {
      name,
      email,
      joinDate,
      organizations,
      isAdmin,
      workPolicies,
      ...rest
    } = formData as any;
    const textChanged = [name, email, joinDate].some(
      (v) => typeof v === "string" && v.trim() !== ""
    );
    const orgChanged = Array.isArray(organizations) && organizations.length > 0;
    const policiesChanged =
      Array.isArray(workPolicies) && workPolicies.length > 0;
    const othersChanged = Object.values(rest).some(
      (v) => typeof v === "string" && v.trim() !== ""
    );
    return textChanged || orgChanged || policiesChanged || othersChanged;
  };

  const [initialSnapshot] = useState(JSON.stringify(initialFormData));
  const handleClose = () => {
    const currentSnapshot = JSON.stringify(formData);
    if (currentSnapshot !== initialSnapshot && hasData()) {
      setShowBackConfirm(true);
    } else {
      onClose();
    }
  };

  // 근무 정책 자동 적용 함수
  const applyWorkPolicyAutomatically = async (userId: number) => {
    if (!formData.workPolicies.length) return;

    // 현재 날짜부터 한 달간의 스케줄 적용
    const today = new Date();
    const startDate = today.toISOString().split("T")[0]; // YYYY-MM-DD
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0]; // 이번 달 마지막 날

    try {
      // 1. 기존 스케줄이 있다면 초기화하고 새 근무 정책 적용
      await workScheduleApi.applyWorkPolicyToSchedule(
        userId,
        startDate,
        endDate
      );
      toast.success("근무 정책이 스케줄에 성공적으로 적용되었습니다.");

      // 2. 연차 정책 부여 (근무년수 기반)
      await employeeLeaveBalanceApi.grantAnnualLeaveByWorkYears(userId);
      toast.success("연차 정책이 성공적으로 부여되었습니다.");
    } catch (error) {
      console.error("자동화 로직 실행 중 오류:", error);
      toast.warning(
        "사용자는 생성되었지만, 근무 정책 적용 중 일부 오류가 발생했습니다. 관리자에게 문의해주세요."
      );
    }
  };

  const handleSaveConfirm = async () => {
    if (!formData.email) {
      toast.error("이메일을 입력해주세요.");
      return;
    }

    const isDuplicate = await checkEmailDuplicate(formData.email);
    if (isDuplicate) {
      toast.error("이미 존재하는 이메일입니다.");
      return;
    }

    // 사용자 생성 (원래 로직 유지)
    onSave(formData);
    setShowSaveConfirm(false);

    // TODO: 실제 프로덕션에서는 다음과 같이 구현하세요:
    // 1. 사용자 생성 API 호출 후 사용자 ID를 받아옴
    // 2. 받아온 사용자 ID로 applyWorkPolicyAutomatically(userId) 호출
    //
    // 예시:
    // try {
    //   const createdUser = await userApi.createUser(processedFormData);
    //   toast.success("사용자가 성공적으로 생성되었습니다.");
    //
    //   if (createdUser?.id && formData.workPolicies.length > 0) {
    //     await applyWorkPolicyAutomatically(createdUser.id);
    //   }
    // } catch (error) {
    //   toast.error("사용자 생성에 실패했습니다.");
    // }
  };

  const handleSaveCancel = () => {
    setShowSaveConfirm(false);
  };

  const handleBackConfirm = () => {
    onClose();
    setShowBackConfirm(false);
  };

  const handleBackCancel = () => {
    setShowBackConfirm(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent
          data-hide-default-close
          className={`max-w-[75vw] max-h-[95vh] overflow-y-auto ${modalStyles.membersModal}`}
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded cursor-pointer"
                onClick={onBack || handleClose}
                aria-label="뒤로가기"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <DialogTitle className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2 transform -translate-x-1">
                  <User className="w-5 h-5" />
                  구성원 추가
                </div>
              </DialogTitle>
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
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      onBlur={(e) => handleFieldBlur("name", e.target.value)}
                      placeholder="이름을 입력하세요"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {touched.name && errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">이메일 *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      onBlur={(e) => handleFieldBlur("email", e.target.value)}
                      placeholder="이메일을 입력하세요"
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {touched.email && errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">전화번호</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="전화번호를 입력하세요"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">주소</Label>
                    <Input
                      id="address"
                      value={formData.address}
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
                            className={`w-full justify-between ${
                              errors.organizations ? "border-red-500" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {memberOrganizations.main
                                ? memberOrganizations.main
                                : "메인 조직을 선택하세요"}
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
                    {touched.organizations && errors.organizations && (
                      <p className="text-sm text-red-500">
                        {errors.organizations}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold">겸직 조직</Label>
                    <Popover
                      open={concurrentDropdownOpen}
                      onOpenChange={(open) => {
                        setConcurrentDropdownOpen(open);
                        if (open) recomputePopoverWidths();
                      }}
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
                      value={formData.rank}
                      onChange={(value) => handleInputChange("rank", value)}
                      placeholder="선택(선택사항)"
                      triggerClassName={cn(
                        "bg-white border-gray-300 text-gray-900 hover:bg-gray-50",
                        errors.rank && "border-red-500"
                      )}
                      menuClassName="bg-white border border-gray-200"
                    />
                    {errors.rank && (
                      <p className="text-sm text-red-500">{errors.rank}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">직위</Label>
                    <SimpleDropdown
                      options={positions}
                      value={formData.position}
                      onChange={(value) => handleInputChange("position", value)}
                      placeholder="선택(선택사항)"
                      triggerClassName={cn(
                        "bg-white border-gray-300 text-gray-900 hover:bg-gray-50",
                        errors.position && "border-red-500"
                      )}
                      menuClassName="bg-white border border-gray-200"
                    />
                    {errors.position && (
                      <p className="text-sm text-red-500">{errors.position}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job">직책</Label>
                    <SimpleDropdown
                      options={jobs}
                      value={formData.job}
                      onChange={(value) => handleInputChange("job", value)}
                      placeholder="선택(선택사항)"
                      triggerClassName={cn(
                        "bg-white border-gray-300 text-gray-900 hover:bg-gray-50",
                        errors.job && "border-red-500"
                      )}
                      menuClassName="bg-white border border-gray-200"
                    />
                    {errors.job && (
                      <p className="text-sm text-red-500">{errors.job}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">직무</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) =>
                        handleInputChange("role", e.target.value)
                      }
                      placeholder="직무를 입력하세요"
                      className={errors.role ? "border-red-500" : ""}
                    />
                    {errors.role && (
                      <p className="text-sm text-red-500">{errors.role}</p>
                    )}
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
                        // Fallback for browsers requiring a native click
                        input.click();
                      }}
                    >
                      <Input
                        id="joinDate"
                        ref={joinDateRef}
                        type="date"
                        placeholder="연도-월-일"
                        value={formData.joinDate}
                        onChange={(e) =>
                          handleInputChange("joinDate", e.target.value)
                        }
                        onBlur={(e) =>
                          handleFieldBlur("joinDate", e.target.value)
                        }
                        className={`${
                          errors.joinDate ? "border-red-500" : ""
                        } cursor-pointer ${styles.dateInput}`}
                      />
                      <button
                        type="button"
                        aria-label="달력 열기"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                        // Let the wrapper handle opening via event bubbling
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                    {touched.joinDate && errors.joinDate && (
                      <p className="text-sm text-red-500">{errors.joinDate}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>관리자 권한</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.isAdmin}
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
                    <Label>근무 정책 *</Label>
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
                            className={`w-full justify-between ${
                              errors.workPolicies ? "border-red-500" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {formData.workPolicies?.length > 0
                                ? workPolicies.find(
                                    (p) =>
                                      p.id.toString() ===
                                      formData.workPolicies[0]
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
                        className="p-0 max-h-[60vh] overflow-y-auto overscroll-contain"
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
                            const isSelected = formData.workPolicies?.includes(
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
                </div>

                <div className="mt-4 space-y-2">
                  <Label>임시 비밀번호</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.tempPassword}
                      onChange={(e) =>
                        handleInputChange("tempPassword", e.target.value)
                      }
                      placeholder="임시 비밀번호를 생성하세요"
                      readOnly
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generatePassword}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyPassword}
                      disabled={!formData.tempPassword}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    임시 비밀번호는 구성원이 최초 로그인 시 변경해야 합니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 pt-6 border-t">
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>구성원 추가</DialogTitle>
          </DialogHeader>
          <p>입력한 정보로 구성원을 추가하시겠습니까?</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleSaveCancel}>
              취소
            </Button>
            <Button onClick={handleSaveConfirm}>확인</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBackConfirm} onOpenChange={setShowBackConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>변경사항 저장</DialogTitle>
          </DialogHeader>
          <p>입력한 정보가 저장되지 않습니다. 정말 나가시겠습니까?</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleBackCancel}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleBackConfirm}>
              나가기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
