"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import SelectTime from "@/components/clock/SelectTime";

// 백엔드와 매핑되는 타입 정의
interface AnnualLeavePolicy {
  name: string;
  minYears: number;
  maxYears: number;
  leaveDays: number;
  holidayDays?: number; // user-service에서는 필수, attendance-service에서는 선택
}

interface FlexibleWorkFormData {
  // 필수 필드들
  name: string; // 근무정책 이름
  type: "FLEXIBLE"; // 시차근무 고정
  startDayOfWeek: string; // 근무 시작 요일 (MONDAY, TUESDAY, etc.)
  workDays: string[]; // 근무 요일 리스트
  startTime: string; // 출근 시작 시간 (HH:mm)
  startTimeEnd: string; // 출근 종료 시간 (HH:mm)
  workHours: number; // 근무 시간
  workMinutes: number; // 근무 분
  breakStartTime: string; // 휴게 시작 시간
  breakEndTime: string; // 휴게 종료 시간
  totalRequiredMinutes: number; // 총 필요 분 (주간 기준)
  annualLeaves: AnnualLeavePolicy[]; // 연차 목록

  // 선택 필드들
  holidayDays?: string[]; // 휴일 요일 리스트
  workCycle?: string; // 근무 주기 (시차근무에서는 선택사항)
  workCycleStartDay?: number; // 근무 주기 시작일
}

interface TimeWorkFormProps {
  formData: FlexibleWorkFormData;
  setFormData: (
    data:
      | FlexibleWorkFormData
      | ((prev: FlexibleWorkFormData) => FlexibleWorkFormData)
  ) => void;
}

interface TimePickerState {
  startTime: boolean;
  startTimeEnd: boolean;
  breakStartTime: boolean;
  breakEndTime: boolean;
}

interface TimePickerRefs {
  startTime: React.RefObject<HTMLDivElement | null>;
  startTimeEnd: React.RefObject<HTMLDivElement | null>;
  breakStartTime: React.RefObject<HTMLDivElement | null>;
  breakEndTime: React.RefObject<HTMLDivElement | null>;
}

interface WeekDay {
  id: string;
  name: string;
  short: string;
  value: string; // MONDAY, TUESDAY, etc.
}

interface CycleStartOption {
  value: string;
  label: string;
}

export function TimeWorkForm({
  formData,
  setFormData,
}: TimeWorkFormProps): JSX.Element {
  const [showTimePicker, setShowTimePicker] = useState<TimePickerState>({
    startTime: false,
    startTimeEnd: false,
    breakStartTime: false,
    breakEndTime: false,
  });

  const timePickerRefs: TimePickerRefs = {
    startTime: useRef<HTMLDivElement>(null),
    startTimeEnd: useRef<HTMLDivElement>(null),
    breakStartTime: useRef<HTMLDivElement>(null),
    breakEndTime: useRef<HTMLDivElement>(null),
  };

  const updateFormData = (
    field: keyof FlexibleWorkFormData,
    value: any
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTimeSelect = (
    field: keyof TimePickerState,
    time: string
  ): void => {
    updateFormData(field as keyof FlexibleWorkFormData, time);
    setShowTimePicker((prev) => ({ ...prev, [field]: false }));
  };

  const openTimePicker = (field: keyof TimePickerState): void => {
    setShowTimePicker((prev) => ({ ...prev, [field]: true }));
  };

  const closeTimePicker = (field: keyof TimePickerState): void => {
    setShowTimePicker((prev) => ({ ...prev, [field]: false }));
  };

  // 연차 정책 관리 함수들
  const addAnnualLeave = (): void => {
    const newPolicy: AnnualLeavePolicy = {
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

  // 바깥 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      Object.keys(showTimePicker).forEach((field) => {
        const key = field as keyof TimePickerState;
        if (showTimePicker[key] && timePickerRefs[key].current) {
          if (!timePickerRefs[key].current?.contains(event.target as Node)) {
            closeTimePicker(key);
          }
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTimePicker]);

  const weekDays: WeekDay[] = [
    { id: "monday", name: "월", short: "월", value: "MONDAY" },
    { id: "tuesday", name: "화", short: "화", value: "TUESDAY" },
    { id: "wednesday", name: "수", short: "수", value: "WEDNESDAY" },
    { id: "thursday", name: "목", short: "목", value: "THURSDAY" },
    { id: "friday", name: "금", short: "금", value: "FRIDAY" },
    { id: "saturday", name: "토", short: "토", value: "SATURDAY" },
    { id: "sunday", name: "일", short: "일", value: "SUNDAY" },
  ];

  const cycleStartOptions: CycleStartOption[] = [
    { value: "MONDAY", label: "월요일" },
    { value: "TUESDAY", label: "화요일" },
    { value: "WEDNESDAY", label: "수요일" },
    { value: "THURSDAY", label: "목요일" },
    { value: "FRIDAY", label: "금요일" },
    { value: "SATURDAY", label: "토요일" },
    { value: "SUNDAY", label: "일요일" },
  ];

  const handleWorkDayToggle = (dayValue: string): void => {
    const currentWorkDays = formData.workDays || [];
    const updatedWorkDays = currentWorkDays.includes(dayValue)
      ? currentWorkDays.filter((day) => day !== dayValue)
      : [...currentWorkDays, dayValue];
    updateFormData("workDays", updatedWorkDays);
  };

  const handleHolidayDayToggle = (dayValue: string): void => {
    const currentHolidayDays = formData.holidayDays || [];
    const updatedHolidayDays = currentHolidayDays.includes(dayValue)
      ? currentHolidayDays.filter((day) => day !== dayValue)
      : [...currentHolidayDays, dayValue];
    updateFormData("holidayDays", updatedHolidayDays);
  };

  // 총 필요 분 계산 (주간 기준)
  const calculateTotalRequiredMinutes = (): number => {
    const workDaysCount = formData.workDays?.length || 0;
    const dailyWorkMinutes =
      (formData.workHours || 0) * 60 + (formData.workMinutes || 0);
    return workDaysCount * dailyWorkMinutes;
  };

  // totalRequiredMinutes 자동 계산
  useEffect(() => {
    const totalMinutes = calculateTotalRequiredMinutes();
    if (totalMinutes > 0) {
      updateFormData("totalRequiredMinutes", totalMinutes);
    }
  }, [formData.workDays, formData.workHours, formData.workMinutes]);

  return (
    <div className="space-y-8">
      {/* 근무유형 이름 */}
      <div>
        <p className="text-sm text-gray-500 mb-2">근무 유형 이름</p>
        <Input
          value={formData.name || ""}
          onChange={(e) => updateFormData("name", e.target.value)}
          className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl"
          placeholder="시차 근무"
          required
        />
      </div>

      {/* 일하는 방식 */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">일하는 방식</h3>
        </div>

        {/* 근무 요일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            근무 요일 <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">
            구성원이 근무해야하는 요일
          </p>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const isSelected =
                formData.workDays?.includes(day.value) || false;

              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => handleWorkDayToggle(day.value)}
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
              const isSelected =
                formData.holidayDays?.includes(day.value) || false;

              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => handleHolidayDayToggle(day.value)}
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

        {/* 근무 주기 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            근무 주기 <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">
            근무 주기가 시작되는 요일
          </p>
          <Select
            value={formData.startDayOfWeek || "MONDAY"}
            onValueChange={(value) => updateFormData("startDayOfWeek", value)}
          >
            <SelectTrigger className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cycleStartOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 근무 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            근무 시간 <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">출근 시각 및 근무 시간</p>

          {/* 출근 */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">출근</span>
            <div className="flex items-center gap-2">
              <div className="relative" ref={timePickerRefs.startTime}>
                <button
                  type="button"
                  onClick={() => openTimePicker("startTime")}
                  className="w-40 px-3 py-2 text-sm bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg hover:bg-white/80 transition-colors text-center"
                >
                  {formData.startTime || "09:00"}
                </button>

                {/* 시작 시간 드롭다운 */}
                {showTimePicker.startTime && (
                  <div className="absolute top-full left-0 z-50 mt-1">
                    <SelectTime
                      onTimeSelect={(time: string) =>
                        handleTimeSelect("startTime", time)
                      }
                      onClose={() => closeTimePicker("startTime")}
                      isDropdown={true}
                    />
                  </div>
                )}
              </div>
              <span className="text-gray-400">-</span>
              <div className="relative" ref={timePickerRefs.startTimeEnd}>
                <button
                  type="button"
                  onClick={() => openTimePicker("startTimeEnd")}
                  className="w-40 px-3 py-2 text-sm bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg hover:bg-white/80 transition-colors text-center"
                >
                  {formData.startTimeEnd || "11:00"}
                </button>

                {/* 종료 시간 드롭다운 */}
                {showTimePicker.startTimeEnd && (
                  <div className="absolute top-full left-0 z-50 mt-1">
                    <SelectTime
                      onTimeSelect={(time: string) =>
                        handleTimeSelect("startTimeEnd", time)
                      }
                      onClose={() => closeTimePicker("startTimeEnd")}
                      isDropdown={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 근무 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">근무</span>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="24"
                value={formData.workHours || 8}
                onChange={(e) =>
                  updateFormData("workHours", parseInt(e.target.value) || 0)
                }
                className="w-16 text-center bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-lg"
                required
              />
              <span className="text-sm text-gray-600">시간</span>
              <Input
                type="number"
                min="0"
                max="59"
                value={formData.workMinutes || 0}
                onChange={(e) =>
                  updateFormData("workMinutes", parseInt(e.target.value) || 0)
                }
                className="w-16 text-center bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-lg"
                required
              />
              <span className="text-sm text-gray-600">분</span>
            </div>
          </div>
        </div>

        {/* 추천 휴게 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            추천 휴게 시간 <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">
            휴게로 자동 기록되는 시간대
          </p>

          <div className="flex items-center gap-2">
            <div className="relative" ref={timePickerRefs.breakStartTime}>
              <button
                type="button"
                onClick={() => openTimePicker("breakStartTime")}
                className="w-40 px-3 py-2 text-sm bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg hover:bg-white/80 transition-colors text-center"
              >
                {formData.breakStartTime || "12:00"}
              </button>

              {/* 휴게 시작 시간 드롭다운 */}
              {showTimePicker.breakStartTime && (
                <div className="absolute top-full left-0 z-50 mt-1">
                  <SelectTime
                    onTimeSelect={(time: string) =>
                      handleTimeSelect("breakStartTime", time)
                    }
                    onClose={() => closeTimePicker("breakStartTime")}
                    isDropdown={true}
                  />
                </div>
              )}
            </div>
            <span className="text-gray-400">-</span>
            <div className="relative" ref={timePickerRefs.breakEndTime}>
              <button
                type="button"
                onClick={() => openTimePicker("breakEndTime")}
                className="w-40 px-3 py-2 text-sm bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg hover:bg-white/80 transition-colors text-center"
              >
                {formData.breakEndTime || "13:00"}
              </button>

              {/* 휴게 종료 시간 드롭다운 */}
              {showTimePicker.breakEndTime && (
                <div className="absolute top-full left-0 z-50 mt-1">
                  <SelectTime
                    onTimeSelect={(time: string) =>
                      handleTimeSelect("breakEndTime", time)
                    }
                    onClose={() => closeTimePicker("breakEndTime")}
                    isDropdown={true}
                  />
                </div>
              )}
            </div>
          </div>
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
              key={index}
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
                  value={policy.holidayDays || 0}
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
                  {(policy.holidayDays || 0) > 0 &&
                    `, 휴일 ${policy.holidayDays}일`}
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

      {/* 숨겨진 필드들 (백엔드 전송용) */}
      <input type="hidden" value="FLEXIBLE" />
      <input type="hidden" value={formData.totalRequiredMinutes || 0} />
    </div>
  );
}
