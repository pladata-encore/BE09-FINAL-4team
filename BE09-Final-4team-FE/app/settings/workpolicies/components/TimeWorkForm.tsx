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
import { Calendar, Plus } from "lucide-react";
import SelectTime from "@/components/clock/SelectTime";
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
  workingDays?: Record<string, boolean>;
  weeklyHoliday?: Record<string, boolean>;
  cycleStartDay?: string;
  startTimeStart?: string;
  startTimeEnd?: string;
  workHours?: string;
  workMinutes?: string;
  breakTimes?: Array<{ start: string; end: string }>;
}

interface TimeWorkFormProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

interface TimePickerState {
  startTimeStart: boolean;
  startTimeEnd: boolean;
  breakTimeStart: boolean;
  breakTimeEnd: boolean;
}

interface TimePickerRefs {
  startTimeStart: React.RefObject<HTMLDivElement | null>;
  startTimeEnd: React.RefObject<HTMLDivElement | null>;
  breakTimeStart: React.RefObject<HTMLDivElement | null>;
  breakTimeEnd: React.RefObject<HTMLDivElement | null>;
}

interface WeekDay {
  id: string;
  name: string;
  short: string;
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
    startTimeStart: false,
    startTimeEnd: false,
    breakTimeStart: false,
    breakTimeEnd: false,
  });

  const timePickerRefs: TimePickerRefs = {
    startTimeStart: useRef<HTMLDivElement>(null),
    startTimeEnd: useRef<HTMLDivElement>(null),
    breakTimeStart: useRef<HTMLDivElement>(null),
    breakTimeEnd: useRef<HTMLDivElement>(null),
  };

  const updateFormData = (field: string, value: any): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTimeSelect = (field: string, time: string): void => {
    updateFormData(field, time);
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
    { id: "monday", name: "월", short: "월" },
    { id: "tuesday", name: "화", short: "화" },
    { id: "wednesday", name: "수", short: "수" },
    { id: "thursday", name: "목", short: "목" },
    { id: "friday", name: "금", short: "금" },
    { id: "saturday", name: "토", short: "토" },
    { id: "sunday", name: "일", short: "일" },
  ];

  const cycleStartOptions: CycleStartOption[] = [
    { value: "monday", label: "월요일" },
    { value: "tuesday", label: "화요일" },
    { value: "wednesday", label: "수요일" },
    { value: "thursday", label: "목요일" },
    { value: "friday", label: "금요일" },
    { value: "saturday", label: "토요일" },
    { value: "sunday", label: "일요일" },
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

  const addBreakTime = (): void => {
    const currentBreaks = formData.breakTimes || [];
    updateFormData("breakTimes", [
      ...currentBreaks,
      { start: "12:00", end: "13:00" },
    ]);
  };

  const removeBreakTime = (index: number): void => {
    const currentBreaks = formData.breakTimes || [];
    updateFormData(
      "breakTimes",
      currentBreaks.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-8">
      {/* 근무유형 이름 */}
      <div>
        <p className="text-sm text-gray-500 mb-2">근무 유형 이름</p>
        <Input
          value={formData.workName || ""}
          onChange={(e) => updateFormData("workName", e.target.value)}
          className="bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl"
          placeholder="시차 근무"
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
            근무 요일
          </label>
          <p className="text-xs text-gray-500 mb-3">
            구성원이 근무해야하는 요일
          </p>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const workingDays = formData.workingDays || {
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: false,
                sunday: false,
              };
              const isSelected = workingDays[day.id];

              return (
                <button
                  key={day.id}
                  onClick={() => handleDayToggle("workingDays", day.id)}
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

        {/* 근무 주기 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            근무 주기
          </label>
          <p className="text-xs text-gray-500 mb-3">
            근무 주기가 시작되는 요일
          </p>
          <Select
            value={formData.cycleStartDay || "monday"}
            onValueChange={(value) => updateFormData("cycleStartDay", value)}
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
            근무 시간
          </label>
          <p className="text-xs text-gray-500 mb-3">출근 시각 및 근무 시간</p>

          {/* 출근 */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">출근</span>
            <div className="flex items-center gap-2">
              <div className="relative" ref={timePickerRefs.startTimeStart}>
                <button
                  type="button"
                  onClick={() => openTimePicker("startTimeStart")}
                  className="w-40 px-3 py-2 text-sm bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg hover:bg-white/80 transition-colors text-center"
                >
                  {formData.startTimeStart || "09:00"}
                </button>

                {/* 시작 시간 드롭다운 */}
                {showTimePicker.startTimeStart && (
                  <div className="absolute top-full left-0 z-50 mt-1">
                    <SelectTime
                      onTimeSelect={(time: string) =>
                        handleTimeSelect("startTimeStart", time)
                      }
                      onClose={() => closeTimePicker("startTimeStart")}
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
                value={formData.workHours || "8"}
                onChange={(e) => updateFormData("workHours", e.target.value)}
                className="w-16 text-center bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-lg"
              />
              <span className="text-sm text-gray-600">시간</span>
              <Input
                type="number"
                min="0"
                max="59"
                value={formData.workMinutes || "0"}
                onChange={(e) => updateFormData("workMinutes", e.target.value)}
                className="w-16 text-center bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-lg"
              />
              <span className="text-sm text-gray-600">분</span>
            </div>
          </div>
        </div>

        {/* 추천 휴게 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            추천 휴게 시간
          </label>
          <p className="text-xs text-gray-500 mb-3">
            휴게로 자동 기록되는 시간대
          </p>

          {(formData.breakTimes || [{ start: "12:00", end: "13:00" }]).map(
            (breakTime, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <div className="relative" ref={timePickerRefs.breakTimeStart}>
                  <button
                    type="button"
                    onClick={() => openTimePicker("breakTimeStart")}
                    className="w-40 px-3 py-2 text-sm bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg hover:bg-white/80 transition-colors text-center"
                  >
                    {breakTime.start}
                  </button>

                  {/* 휴게 시작 시간 드롭다운 */}
                  {showTimePicker.breakTimeStart && (
                    <div className="absolute top-full left-0 z-50 mt-1">
                      <SelectTime
                        onTimeSelect={(time: string) =>
                          handleTimeSelect("breakTimeStart", time)
                        }
                        onClose={() => closeTimePicker("breakTimeStart")}
                        isDropdown={true}
                      />
                    </div>
                  )}
                </div>
                <span className="text-gray-400">-</span>
                <div className="relative" ref={timePickerRefs.breakTimeEnd}>
                  <button
                    type="button"
                    onClick={() => openTimePicker("breakTimeEnd")}
                    className="w-40 px-3 py-2 text-sm bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg hover:bg-white/80 transition-colors text-center"
                  >
                    {breakTime.end}
                  </button>

                  {/* 휴게 종료 시간 드롭다운 */}
                  {showTimePicker.breakTimeEnd && (
                    <div className="absolute top-full left-0 z-50 mt-1">
                      <SelectTime
                        onTimeSelect={(time: string) =>
                          handleTimeSelect("breakTimeEnd", time)
                        }
                        onClose={() => closeTimePicker("breakTimeEnd")}
                        isDropdown={true}
                      />
                    </div>
                  )}
                </div>
                {(formData.breakTimes || []).length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeBreakTime(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    삭제
                  </Button>
                )}
              </div>
            )
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={addBreakTime}
            className="flex items-center gap-2 mt-2"
          >
            <Plus className="w-4 h-4" />
            추가하기
          </Button>
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
