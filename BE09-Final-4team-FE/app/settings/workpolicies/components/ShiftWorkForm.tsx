"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { AnnualLeaveRequestDto } from "@/lib/services/attendance";

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
  workName?: string;
  annualLeaves?: AnnualLeavePolicy[];
  workingDaysPerWeek?: string;
  weeklyHoliday?: Record<string, boolean>;
  workHours?: string;
  workMinutes?: string;
  breakHours?: string;
  breakMinutes?: string;
}

interface ShiftWorkFormProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

interface WeekDay {
  id: string;
  name: string;
  short: string;
}

interface WorkingDaysOption {
  value: string;
  label: string;
}

export function ShiftWorkForm({
  formData,
  setFormData,
}: ShiftWorkFormProps): JSX.Element {
  const updateFormData = (field: string, value: any): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 연차 정책 관리 함수들
  const addAnnualLeave = (): void => {
    const newPolicy: AnnualLeavePolicy = {
      id: Date.now().toString(),
      name: `정책 ${(formData.annualLeaves || []).length + 1}`,
      minYears: 0,
      maxYears: 1,
      leaveDays: 15,
      holidayDays: 0,
    };

    const currentPolicies = formData.annualLeaves || [];
    updateFormData("annualLeaves", [...currentPolicies, newPolicy]);
  };

  const removeAnnualLeave = (index: number): void => {
    const currentPolicies = formData.annualLeaves || [];
    const updatedPolicies = currentPolicies.filter((_, i) => i !== index);
    updateFormData("annualLeaves", updatedPolicies);
  };

  const updateAnnualLeave = (
    index: number,
    field: keyof AnnualLeavePolicy,
    value: string | number
  ): void => {
    const currentPolicies = formData.annualLeaves || [];
    const updatedPolicies = currentPolicies.map((policy, i) =>
      i === index ? { ...policy, [field]: value } : policy
    );
    updateFormData("annualLeaves", updatedPolicies);
  };

  const weekDays: WeekDay[] = [
    { id: "monday", name: "월", short: "월" },
    { id: "tuesday", name: "화", short: "화" },
    { id: "wednesday", name: "수", short: "수" },
    { id: "thursday", name: "목", short: "목" },
    { id: "friday", name: "금", short: "금" },
    { id: "saturday", name: "토", short: "토" },
    { id: "sunday", name: "일", short: "일" },
  ];

  const workingDaysOptions: WorkingDaysOption[] = [
    { value: "1", label: "1일" },
    { value: "2", label: "2일" },
    { value: "3", label: "3일" },
    { value: "4", label: "4일" },
    { value: "5", label: "5일" },
    { value: "6", label: "6일" },
    { value: "7", label: "7일" },
  ];

  const handleDayToggle = (field: string, dayId: string): void => {
    const currentDays = formData[field] || {
      monday: field === "workingDays" ? true : false,
      tuesday: field === "workingDays" ? true : false,
      wednesday: field === "workingDays" ? true : false,
      thursday: field === "workingDays" ? true : false,
      friday: field === "workingDays" ? true : false,
      saturday: false,
      sunday: field === "weeklyHoliday" ? true : false,
    };

    updateFormData(field, {
      ...currentDays,
      [dayId]: !currentDays[dayId],
    });
  };

  return (
    <div className="space-y-6">
      {/* 근무유형 이름 */}
      <div>
        <p className="text-sm text-gray-500 mb-2">근무 유형 이름</p>
        <Input
          value={formData.workName || ""}
          onChange={(e) => updateFormData("workName", e.target.value)}
          className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl"
          placeholder="교대 근무"
        />
      </div>

      {/* 일하는 방식 */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">일하는 방식</h3>
        </div>
      </div>

      {/* 한 주의 근무일 수 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">한 주의 근무일 수</p>
        </div>
        <div className="w-32">
          <Select
            value={formData.workingDaysPerWeek || "1"}
            onValueChange={(value) =>
              updateFormData("workingDaysPerWeek", value)
            }
          >
            <SelectTrigger className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workingDaysOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 주휴일 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          주휴일
        </label>
        <p className="text-xs text-gray-500 mb-3">
          1주마다 부여하는 유급 휴일의 요일
        </p>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const weeklyHoliday = formData.weeklyHoliday || {
              monday: false,
              tuesday: false,
              wednesday: false,
              thursday: false,
              friday: false,
              saturday: false,
              sunday: true,
            };
            const isSelected = weeklyHoliday[day.id];

            return (
              <button
                key={day.id}
                onClick={() => handleDayToggle("weeklyHoliday", day.id)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? `border-blue-500 bg-blue-500 text-white`
                    : `border-gray-200 bg-white/60 text-gray-600 hover:border-gray-300`
                }`}
              >
                <span className="text-sm font-medium">{day.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 근무 시간 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">근무 시간</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">근무</span>
          <div className="w-20">
            <Input
              type="number"
              min="0"
              max="24"
              value={formData.workHours || "8"}
              onChange={(e) => updateFormData("workHours", e.target.value)}
              className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl text-center"
              placeholder="8"
            />
          </div>
          <span className="text-sm text-gray-600">시간</span>
          <div className="w-20">
            <Input
              type="number"
              min="0"
              max="59"
              value={formData.workMinutes || "0"}
              onChange={(e) => updateFormData("workMinutes", e.target.value)}
              className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl text-center"
              placeholder="0"
            />
          </div>
          <span className="text-sm text-gray-600">분</span>
        </div>
      </div>

      {/* 휴게 시간 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">휴게 시간</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">휴게</span>
          <div className="w-20">
            <Input
              type="number"
              min="0"
              max="24"
              value={formData.breakHours || "1"}
              onChange={(e) => updateFormData("breakHours", e.target.value)}
              className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl text-center"
              placeholder="1"
            />
          </div>
          <span className="text-sm text-gray-600">시간</span>
          <div className="w-20">
            <Input
              type="number"
              min="0"
              max="59"
              value={formData.breakMinutes || "0"}
              onChange={(e) => updateFormData("breakMinutes", e.target.value)}
              className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl text-center"
              placeholder="0"
            />
          </div>
          <span className="text-sm text-gray-600">분</span>
        </div>
      </div>

      {/* 연차 정책 설정 */}
      <div className="space-y-4 bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-gray-200/50">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            연차 설정
          </label>
          {(formData.annualLeaves || []).map((policy, index) => (
            <div
              key={policy.id || index}
              className="grid grid-cols-10 gap-2 mb-3 p-3 bg-gray-50 rounded-lg"
            >
              {/* 최소 근무년수 */}
              <div className="col-span-3">
                <label className="block text-xs text-gray-600 mb-1">
                  최소 년수
                </label>
                <Input
                  type="number"
                  value={policy.minYears}
                  onChange={(e) =>
                    updateAnnualLeave(
                      index,
                      "minYears",
                      parseInt(e.target.value) || 0
                    )
                  }
                  min="0"
                  className="text-sm"
                />
              </div>

              {/* 최대 근무년수 */}
              <div className="col-span-3">
                <label className="block text-xs text-gray-600 mb-1">
                  최대 년수
                </label>
                <Input
                  type="number"
                  value={policy.maxYears}
                  onChange={(e) =>
                    updateAnnualLeave(
                      index,
                      "maxYears",
                      parseInt(e.target.value) || 0
                    )
                  }
                  min="0"
                  className="text-sm"
                />
              </div>

              {/* 연차 일수 */}
              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">
                  연차 일수
                </label>
                <Input
                  type="number"
                  value={policy.leaveDays}
                  onChange={(e) =>
                    updateAnnualLeave(
                      index,
                      "leaveDays",
                      parseInt(e.target.value) || 0
                    )
                  }
                  min="0"
                  max="365"
                  className="text-sm"
                />
              </div>

              {/* 휴일 일수 */}
              <div className="col-span-1">
                <label className="block text-xs text-gray-600 mb-1">휴일</label>
                <Input
                  type="number"
                  value={policy.holidayDays}
                  onChange={(e) =>
                    updateAnnualLeave(
                      index,
                      "holidayDays",
                      parseInt(e.target.value) || 0
                    )
                  }
                  min="0"
                  className="text-sm"
                />
              </div>

              {/* 삭제 버튼 */}
              <div className="col-span-1 flex items-end">
                {(formData.annualLeaves || []).length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeAnnualLeave(index)}
                    className="text-red-500 hover:text-red-700 px-2"
                  >
                    ×
                  </Button>
                )}
              </div>

              {/* 표시 텍스트 */}
              <div className="col-span-10 mt-2">
                <p className="text-xs text-gray-600">
                  근무 {policy.minYears}년 ~ {policy.maxYears}년: 연차{" "}
                  {policy.leaveDays}일
                  {policy.holidayDays > 0 && `, 휴일 ${policy.holidayDays}일`}
                </p>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={addAnnualLeave}
            className="flex items-center gap-2 mt-2"
          >
            <Plus className="w-4 h-4" />
            연차 정책 추가
          </Button>
        </div>
      </div>
    </div>
  );
}
