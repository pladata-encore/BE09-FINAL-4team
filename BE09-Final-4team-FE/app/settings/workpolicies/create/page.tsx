"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { WorkTypeSelector } from "../components/WorkTypeSelector";
import { FixedWorkForm } from "../components/FixedWorkForm";
import { ShiftWorkForm } from "../components/ShiftWorkForm";
import { TimeWorkForm } from "../components/TimeWorkForm";
import { SelectWorkForm } from "../components/SelectWorkForm";
import { typography } from "@/lib/design-tokens";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { workPolicyApi } from "@/lib/services/attendance";
import {
  DayOfWeek,
  WorkCycle,
  WorkPolicyType,
  AnnualLeaveRequestDto,
  WorkPolicyRequestDto,
} from "@/lib/services/attendance";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Type definitions
interface AnnualLeavePolicy {
  id?: string;
  name: string;
  minYears: number;
  maxYears: number;
  leaveDays: number;
  holidayDays: number;
}

interface FormData {
  [key: string]: any;
  annualLeaves?: AnnualLeavePolicy[];
}

interface PolicyData {
  workType: string;
  [key: string]: any;
}

export default function CreateWorkPolicyPage(): JSX.Element {
  const [workType, setWorkType] = useState<string>("fixed");
  const [formData, setFormData] = useState<FormData>({
    annualLeaves: [
      {
        id: "1",
        name: "정책 1",
        minYears: 0,
        maxYears: 2,
        leaveDays: 15,
        holidayDays: 0,
      },
    ],
  });
  const router = useRouter();

  // 근무 유형별 폼 컴포넌트 렌더링
  const renderWorkForm = (): JSX.Element => {
    const commonProps = {
      formData,
      setFormData,
    };

    switch (workType) {
      case "fixed":
        return <FixedWorkForm {...commonProps} />;
      case "shift":
        return <ShiftWorkForm {...commonProps} />;
      case "time":
        return (
          <TimeWorkForm
            {...commonProps}
            formData={formData as any}
            setFormData={setFormData as any}
          />
        );
      case "select":
        return <SelectWorkForm {...commonProps} />;
      default:
        return <FixedWorkForm {...commonProps} />;
    }
  };

  const toTimeString = (timeStr?: string): string | undefined => {
    if (!timeStr) return undefined;
    const [hh, mm] = timeStr.split(":");
    const h = String(hh ?? "00").padStart(2, "0");
    const m = String(mm ?? "00").padStart(2, "0");
    return `${h}:${m}:00`;
  };

  const toEnumDay = (key: string): DayOfWeek | null => {
    switch (key) {
      case "monday":
        return DayOfWeek.MONDAY;
      case "tuesday":
        return DayOfWeek.TUESDAY;
      case "wednesday":
        return DayOfWeek.WEDNESDAY;
      case "thursday":
        return DayOfWeek.THURSDAY;
      case "friday":
        return DayOfWeek.FRIDAY;
      case "saturday":
        return DayOfWeek.SATURDAY;
      case "sunday":
        return DayOfWeek.SUNDAY;
      default:
        return null;
    }
  };

  const mapWorkTypeToEnum = (t: string): WorkPolicyType => {
    switch (t) {
      case "fixed":
        return WorkPolicyType.FIXED;
      case "shift":
        return WorkPolicyType.SHIFT;
      case "time":
        return WorkPolicyType.FLEXIBLE;
      case "select":
        return WorkPolicyType.OPTIONAL;
      default:
        return WorkPolicyType.FIXED;
    }
  };

  const handleSave = async (): Promise<void> => {
    try {
      const policyData: PolicyData = {
        workType,
        ...formData,
      };

      const name: string = policyData.workName || "근무 정책";
      const type: WorkPolicyType = mapWorkTypeToEnum(workType);

      const workingDaysMap = (policyData.workingDays as Record<
        string,
        boolean
      >) || {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      };
      const workDays: DayOfWeek[] = Object.keys(workingDaysMap)
        .filter((key) => workingDaysMap[key])
        .map(toEnumDay)
        .filter((day): day is DayOfWeek => day !== null);

      // totalRequiredMinutes 계산
      const workHours = policyData.workHours || 8;
      const workMinutes = policyData.workMinutes || 0;
      const totalRequiredMinutes = workHours * 60 + workMinutes;

      // 근무 타입별 필수 필드 검증 및 설정
      let additionalFields = {};

      const request: any = {
        name,
        type,
        workCycle: policyData.workCycle,
        startDayOfWeek: policyData.startDayOfWeek || DayOfWeek.MONDAY,
        workCycleStartDay: policyData.workCycleStartDay,
        workDays,
        weeklyWorkingDays: workDays.length,
        workHours: workHours,
        workMinutes: workMinutes,
        coreTimeStart: toTimeString(policyData.coreTimeStart),
        coreTimeEnd: toTimeString(policyData.coreTimeEnd),
        avgWorkTime: toTimeString(policyData.avgWorkTime),
        totalRequiredMinutes: totalRequiredMinutes,
        annualLeaves: policyData.annualLeaves || [],
      };

      // 근무 타입별 필수 필드 설정
      if (type === WorkPolicyType.FLEXIBLE) {
        if (!policyData.startTime || !policyData.startTimeEnd) {
          toast.error(
            "시차 근무는 출근 시작 시간과 출근 종료 시간이 필수입니다."
          );
          return;
        }
        request.startTime = toTimeString(policyData.startTime);
        request.startTimeEnd = toTimeString(policyData.startTimeEnd);
        request.breakStartTime = toTimeString(policyData.breakStartTime);
        request.breakEndTime = toTimeString(policyData.breakEndTime);
      } else if (type === WorkPolicyType.OPTIONAL) {
        // 선택 근무: coreTimeStart, coreTimeEnd 필수
        if (!policyData.coreTimeStart || !policyData.coreTimeEnd) {
          toast.error(
            "선택 근무는 코어 타임 시작 시간과 종료 시간이 필수입니다."
          );
          return;
        }
        additionalFields = {
          coreTimeStart: toTimeString(policyData.coreTimeStart),
          coreTimeEnd: toTimeString(policyData.coreTimeEnd),
        };
      } else if (type === WorkPolicyType.SHIFT) {
        // 교대 근무: weeklyWorkingDays 필수
        additionalFields = {
          weeklyWorkingDays: policyData.weeklyWorkingDays || workDays.length,
        };
      }

      // 일반적인 startTime/endTime은 FLEXIBLE이 아닐 때만 설정
      if (type !== WorkPolicyType.FLEXIBLE) {
        request.startTime = toTimeString(policyData.startTime);
        request.endTime = toTimeString(policyData.endTime);
      }

      // OPTIONAL(선택 근무) 외 타입에서만 휴게 시작/종료 시간을 전송
      if (type !== WorkPolicyType.OPTIONAL) {
        const firstBreak = (formData.breakTimes || [
          { start: "12:00", end: "13:00" },
        ])[0];
        request.breakStartTime = toTimeString(firstBreak?.start) || "12:00:00";
        request.breakEndTime = toTimeString(firstBreak?.end) || "13:00:00";
      }

      // FLEXIBLE(시차 근무)에서는 endTime을 전송하지 않음
      if (type === WorkPolicyType.FLEXIBLE) {
        delete request.endTime;
      }

      console.log("정책 생성 요청 데이터:", request);
      console.log("근무 타입별 추가 필드:", additionalFields);
      console.log("원본 폼 데이터:", policyData);

      const created = await workPolicyApi.createWorkPolicy(request);

      console.log("정책 생성 응답:", created);

      // 안전한 응답 처리
      if (created && created.name) {
        toast.success(`정책이 생성되었습니다: ${created.name}`);
      } else if (created) {
        toast.success("정책이 생성되었습니다.");
        console.warn("정책 생성 응답에 name 속성이 없습니다:", created);
      } else {
        toast.success("정책이 생성되었습니다.");
        console.error("정책 생성 응답이 null/undefined입니다:", created);
      }

      router.push("/settings/workpolicies");
    } catch (error: any) {
      console.error("정책 생성 실패:", error);
      console.error("오류 상세:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });

      const errorMessage =
        error?.response?.data?.message || error?.message || "알 수 없는 오류";
      toast.error(`정책 생성 실패: ${errorMessage}`);
    }
  };

  return (
    <MainLayout>
      {/* Page Header - 개선된 디자인 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/settings/workpolicies"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">뒤로</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className={`${typography.h1} text-gray-800`}>근무 정책 생성</h1>
        </div>
      </div>

      {/* 메인 컨텐츠 - 반응형 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 근무 유형 선택 */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 h-fit sticky top-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                근무 유형
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                적용할 근무 유형을 선택하세요
              </p>
            </div>
            <WorkTypeSelector
              selectedType={workType}
              onTypeChange={setWorkType}
            />
          </GlassCard>
        </div>

        {/* 오른쪽: 폼 영역 */}
        <div className="lg:col-span-2">
          <GlassCard className="p-8">
            {/* 폼 헤더 */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {workType === "fixed" && "고정 근무 설정"}
                {workType === "shift" && "교대 근무 설정"}
                {workType === "time" && "시차 근무 설정"}
                {workType === "select" && "선택 근무 설정"}
              </h3>
            </div>

            {/* 동적으로 변경되는 폼 영역 */}
            <div className="transition-all duration-300 ease-in-out">
              {renderWorkForm()}
            </div>

            {/* Action Buttons - 개선된 디자인 */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-200/50 mt-8">
              <div className="text-sm text-gray-500">
                * 모든 필드는 필수 입력 사항입니다
              </div>
              <div className="flex gap-3">
                <Link href="/settings/workpolicies">
                  <button className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 rounded-xl transition-all duration-200 border border-gray-300">
                    취소
                  </button>
                </Link>
                <GradientButton
                  variant="primary"
                  className="px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={handleSave}
                >
                  <Save className="w-4 h-4 mr-2" />
                  정책 저장
                </GradientButton>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </MainLayout>
  );
}
