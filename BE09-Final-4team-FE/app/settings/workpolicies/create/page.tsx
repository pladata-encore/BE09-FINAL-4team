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
        return <TimeWorkForm {...commonProps} />;
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
        .filter((k) => workingDaysMap[k])
        .map((k) => toEnumDay(k)!)
        .filter(Boolean) as DayOfWeek[];

      const weeklyWorkingDays = workDays.filter(
        (d) => d !== DayOfWeek.SATURDAY && d !== DayOfWeek.SUNDAY
      ).length;

      const startTimeStr: string = policyData.workTime || "09:00";
      const startTime = toTimeString(startTimeStr);
      const workHours = Number(policyData.workHours ?? 8);
      const workMinutes = Number(policyData.workMinutes ?? 0);

      const breakTimes = (policyData.breakTimes as Array<{
        start: string;
        end: string;
      }>) || [{ start: "12:00", end: "13:00" }];
      const breakStartTime = toTimeString(breakTimes[0]?.start);
      const breakEndTime = toTimeString(breakTimes[0]?.end);

      const totalRequiredMinutes = workHours * 60 + workMinutes;

      const request = {
        name,
        type,
        workCycle: undefined as WorkCycle | undefined,
        startDayOfWeek: toEnumDay(
          String(policyData.cycleStartDay || "monday")
        ) as DayOfWeek,
        workCycleStartDay: undefined as number | undefined,
        workDays,
        weeklyWorkingDays,
        startTime, // string "HH:mm:ss"
        startTimeEnd: undefined,
        workHours,
        workMinutes,
        coreTimeStart: undefined,
        coreTimeEnd: undefined,
        breakStartTime, // string "HH:mm:ss"
        breakEndTime, // string "HH:mm:ss"
        avgWorkTime: undefined,
        totalRequiredMinutes,
        annualLeaves: policyData.annualLeaves || [],
      };

      const created = await workPolicyApi.createWorkPolicy(request as any);
      toast.success(`정책이 생성되었습니다: ${created.name}`);
      router.push("/settings/workpolicies");
    } catch (error: any) {
      console.error("정책 생성 실패:", error);
      toast.error(`정책 생성 실패: ${error?.message || "알 수 없는 오류"}`);
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
        <p className="text-gray-600 mt-2 ml-4">
          새로운 근무 정책을 생성하고 설정하세요
        </p>
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
              <p className="text-gray-600">
                {workType === "fixed" &&
                  "정해진 시간에 고정적으로 근무하는 정책을 설정합니다"}
                {workType === "shift" &&
                  "교대 근무를 위한 시간대와 패턴을 설정합니다"}
                {workType === "time" &&
                  "시차 근무를 위한 시간대와 통신 방식을 설정합니다"}
                {workType === "select" &&
                  "유연한 근무 시간을 선택할 수 있는 정책을 설정합니다"}
              </p>
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
