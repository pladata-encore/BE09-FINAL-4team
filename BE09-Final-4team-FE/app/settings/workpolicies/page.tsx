"use client";

import { useState, useEffect, type ReactElement } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";

import { colors, typography } from "@/lib/design-tokens";
import {
  Edit,
  Trash2,
  Briefcase,
  Home,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Target,
  ArrowRight,
  Save,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { workPolicyApi } from "@/lib/services/attendance";
import { toast } from "sonner";

// Type definitions
interface WorkPolicy {
  id: string;
  name: string;
  details: string;
  type: string;
  status: "active" | "pending" | "inactive";
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  workHours?: number;
  workMinutes?: number;
  breakTime?: number;
  weeklyWorkingDays?: number;
  coreTimeStartText?: string;
  coreTimeEndText?: string;
  isHolidayFixed?: boolean;
  isFlexibleWork?: boolean;
  isShiftWork?: boolean;
  isOptionalWork?: boolean;
  isFixedWork?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PolicyListProps {
  policies: WorkPolicy[];
  onEditPolicy: (policyId: string, data: Partial<WorkPolicy>) => void;
  onDeletePolicy: (policyId: string) => void;
}

// 정책 목록 컴포넌트
function PolicyList({
  policies,
  onEditPolicy,
  onDeletePolicy,
}: PolicyListProps): ReactElement {
  const [editingPolicy, setEditingPolicy] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<WorkPolicy>>({});

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string): ReactElement => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "inactive":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleEditPolicy = (policyId: string): void => {
    const policy = policies.find((p) => p.id === policyId);
    if (policy) {
      setEditingPolicy(policyId);
      setEditingData({ ...policy });
    }
  };

  const handleSavePolicy = (): void => {
    if (editingPolicy && editingData) {
      onEditPolicy(editingPolicy, editingData);
      setEditingPolicy(null);
      setEditingData({});
    }
  };

  const handleCancelEdit = (): void => {
    setEditingPolicy(null);
    setEditingData({});
  };

  const handleDeletePolicy = (policyId: string): void => {
    if (window.confirm("정말로 이 정책을 삭제하시겠습니까?")) {
      onDeletePolicy(policyId);
    }
  };

  const handleInputChange = (field: keyof WorkPolicy, value: any): void => {
    setEditingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`${typography.h1} text-gray-800 mb-2`}>
              근무 정책 관리
            </h1>
          </div>
          <Link href="/settings/workpolicies/create">
            <GradientButton variant="primary" className="px-6">
              정책 생성 <ArrowRight className="w-4 h-4 ml-2" />
            </GradientButton>
          </Link>
        </div>
      </div>

      {/* Policy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map((policy) => {
          const IconComponent = policy.icon;
          const isEditing = editingPolicy === policy.id;
          const displayData = isEditing ? editingData : policy;

          return (
            <GlassCard key={policy.id} className="p-6 relative">
              {/* Edit/Delete Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                {!isEditing && (
                  <>
                    <button
                      onClick={() => handleEditPolicy(policy.id)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      title="편집"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePolicy(policy.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Policy Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 bg-gradient-to-r ${displayData.color} rounded-lg flex items-center justify-center`}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayData.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full text-lg font-semibold text-gray-800 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <h3 className={`${typography.h3} text-gray-800`}>
                      {displayData.name}
                    </h3>
                  )}
                </div>
              </div>

              {/* Policy Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">정책 유형</span>
                  <span className="font-medium text-gray-800">
                    {displayData.type}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">주 근무일</span>
                  <span className="font-medium text-gray-800">
                    {displayData.weeklyWorkingDays != null
                      ? `${displayData.weeklyWorkingDays}일`
                      : "-"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">근무 시간</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={displayData.workHours || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "workHours",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-20 text-right font-medium text-gray-800 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <span className="font-medium text-gray-800">
                      {displayData.workHours != null
                        ? `${displayData.workHours}시간`
                        : "-"}{" "}
                      {displayData.workMinutes != null
                        ? `${displayData.workMinutes}분`
                        : ""}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">휴식 시간</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={displayData.breakTime || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "breakTime",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-20 text-right font-medium text-gray-800 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-xl px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <span className="font-medium text-gray-800">
                      {displayData.breakTime != null
                        ? `${displayData.breakTime}분`
                        : "-"}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">코어타임</span>
                  <span className="font-medium text-gray-800">
                    {displayData.coreTimeStartText &&
                    displayData.coreTimeEndText
                      ? `${displayData.coreTimeStartText} ~ ${displayData.coreTimeEndText}`
                      : "-"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">휴일 고정</span>
                  <span className="font-medium text-gray-800">
                    {displayData.isHolidayFixed ? "예" : "아니오"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {displayData.isFixedWork && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      고정
                    </span>
                  )}
                  {displayData.isFlexibleWork && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                      유연
                    </span>
                  )}
                  {displayData.isShiftWork && (
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                      교대
                    </span>
                  )}
                  {displayData.isOptionalWork && (
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                      선택
                    </span>
                  )}
                </div>
              </div>

              {/* Edit Actions */}
              {isEditing && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSavePolicy}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    저장
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    취소
                  </button>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </>
  );
}

export default function WorkPoliciesPage(): ReactElement {
  const [policies, setPolicies] = useState<WorkPolicy[]>([]);

  const mapTypeToColor = (type: string): string => {
    switch (type) {
      case "FIXED":
        return "from-blue-500 to-blue-600";
      case "FLEXIBLE":
        return "from-green-500 to-green-600";
      case "SHIFT":
        return "from-purple-500 to-purple-600";
      case "OPTIONAL":
        return "from-orange-500 to-orange-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const mapTypeToIcon = (type: string) => {
    switch (type) {
      case "FIXED":
        return Briefcase;
      case "FLEXIBLE":
        return Home;
      case "SHIFT":
        return RotateCcw;
      case "OPTIONAL":
        return Clock;
      default:
        return Briefcase;
    }
  };

  const formatTime = (t?: any): string => {
    if (!t) return "";
    if (typeof t === "string") {
      const parts = t.split(":");
      if (parts.length >= 2) {
        const hh = parts[0]?.padStart(2, "0");
        const mm = parts[1]?.padStart(2, "0");
        return `${hh}:${mm}`;
      }
      return t;
    }
    if (typeof t.hour === "number" && typeof t.minute === "number") {
      const hh = String(t.hour).padStart(2, "0");
      const mm = String(t.minute).padStart(2, "0");
      return `${hh}:${mm}`;
    }
    return "";
  };

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const data = await workPolicyApi.getAllWorkPolicies();
        const mapped: WorkPolicy[] = data.map((p) => ({
          id: String(p.id),
          name: p.name,
          details: `${p.type} 정책, 주 ${p.weeklyWorkingDays}일, 근무 ${p.workHours}h ${p.workMinutes}m`,
          type: String(p.type),
          status: "active",
          color: mapTypeToColor(String(p.type)),
          icon: mapTypeToIcon(String(p.type)),
          workHours: p.workHours,
          workMinutes: p.workMinutes,
          breakTime: p.breakMinutes ?? undefined,
          weeklyWorkingDays: p.weeklyWorkingDays,
          coreTimeStartText: formatTime(p.coreTimeStart),
          coreTimeEndText: formatTime(p.coreTimeEnd),
          isHolidayFixed: !!p.isHolidayFixed,
          isFlexibleWork: !!p.isFlexibleWork,
          isShiftWork: !!p.isShiftWork,
          isOptionalWork: !!p.isOptionalWork,
          isFixedWork: !!p.isFixedWork,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }));
        setPolicies(mapped);
      } catch (error: any) {
        console.error("Failed to load work policies:", error);
        toast.error(
          `근무 정책 조회 실패: ${error?.message || "알 수 없는 오류"}`
        );
      }
    };

    fetchPolicies();
  }, []);

  const handleEditPolicy = (
    policyId: string,
    data: Partial<WorkPolicy>
  ): void => {
    setPolicies((prev) =>
      prev.map((policy) =>
        policy.id === policyId
          ? { ...policy, ...data, updatedAt: new Date().toISOString() }
          : policy
      )
    );
  };

  const handleDeletePolicy = (policyId: string): void => {
    setPolicies((prev) => prev.filter((policy) => policy.id !== policyId));
  };

  return (
    <MainLayout>
      <PolicyList
        policies={policies}
        onEditPolicy={handleEditPolicy}
        onDeletePolicy={handleDeletePolicy}
      />
    </MainLayout>
  );
}
