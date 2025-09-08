"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { X, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import SelectTime from "@/components/clock/SelectTime";
import Calendar from "./components/calendar";

// Type definitions
interface VacationType {
  value: string;
  label: string;
}

interface VacationData {
  type: string;
  dates: string[];
  startTime: string;
  endTime: string;
  reason: string;
  days: number;
}

interface VacationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: VacationData) => void;
  defaultVacationType?: string;
  vacationTypes?: VacationType[];
  onCalendarToggle?: () => void;
  isCalendarOpen?: boolean;
  startDate?: string;
  endDate?: string;
  onDateSelect?: (date: Date) => void;
}

export default function VacationModal({
  isOpen,
  onClose,
  onSubmit,
  defaultVacationType = "기본 연차",
  vacationTypes: propVacationTypes,
  onCalendarToggle,
  isCalendarOpen,
  startDate: propStartDate,
  endDate: propEndDate,
  onDateSelect,
}: VacationModalProps): JSX.Element {
  const [vacationType, setVacationType] = useState<string>(defaultVacationType);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("18:00");
  const [reason, setReason] = useState<string>("");
  const [showStartTimeDropdown, setShowStartTimeDropdown] =
    useState<boolean>(false);
  const [showEndTimeDropdown, setShowEndTimeDropdown] =
    useState<boolean>(false);

  // defaultVacationType 동기화 (드래프트가 없는 일반 케이스)
  useEffect(() => {
    if (!isOpen) {
      setVacationType(defaultVacationType);
    }
  }, [defaultVacationType, isOpen]);

  // 드래프트로 자동 채우기
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const raw = localStorage.getItem("aichat:vacationDraft");
      if (raw) {
        try {
          const draft = JSON.parse(raw);
          if (draft.type && typeof draft.type === "string") {
            setVacationType(draft.type);
          }
          const s = draft.startDate || draft.start_date || draft.date;
          const e = draft.endDate || draft.end_date || draft.toDate || s;
          if (s) {
            const sd = new Date(s);
            setStartDate(sd);
            if (e) {
              const ed = new Date(e);
              setEndDate(ed);
              updateSelectedDates(sd, ed);
            } else {
              setEndDate(sd);
              updateSelectedDates(sd, sd);
            }
          }
          if (draft.startTime) setStartTime(draft.startTime);
          if (draft.endTime) setEndTime(draft.endTime);
          if (draft.reason) setReason(String(draft.reason));
        } catch {}
        localStorage.removeItem("aichat:vacationDraft");
      }
    }
  }, [isOpen]);

  const defaultVacationTypes: VacationType[] = [
    { value: "기본 연차", label: "기본 연차" },
    { value: "보상 연차", label: "보상 연차" },
    { value: "특별 연차", label: "특별 연차" },
  ];

  const vacationTypes = propVacationTypes || defaultVacationTypes;

  const handleStartDateChange = (newStartDate: Date | null): void => {
    setStartDate(newStartDate);

    // 시작일만 선택된 경우에도 해당 날짜를 selectedDates에 추가
    if (newStartDate && !endDate) {
      setSelectedDates([newStartDate]);
    } else if (newStartDate && endDate) {
      updateSelectedDates(newStartDate, endDate);
    } else {
      setSelectedDates([]);
    }
  };

  const handleEndDateChange = (newEndDate: Date | null): void => {
    setEndDate(newEndDate);

    // 종료일만 선택된 경우에도 해당 날짜를 selectedDates에 추가
    if (newEndDate && !startDate) {
      setSelectedDates([newEndDate]);
    } else if (newEndDate && startDate) {
      updateSelectedDates(startDate, newEndDate);
    } else {
      setSelectedDates([]);
    }
  };

  const updateSelectedDates = (start: Date, end: Date): void => {
    if (start && end) {
      const startDate = start instanceof Date ? start : new Date(start);
      const endDate = end instanceof Date ? end : new Date(end);
      const dates: Date[] = [];
      const current = new Date(startDate);

      // 시작일과 종료일이 같은 경우
      if (startDate.getTime() === endDate.getTime()) {
        dates.push(startDate);
      } else {
        // 시작일부터 종료일까지 모든 날짜 추가
        while (current <= endDate) {
          dates.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
      }
      setSelectedDates(dates);
    } else if (start) {
      // 시작일만 있는 경우
      setSelectedDates([start instanceof Date ? start : new Date(start)]);
    } else if (end) {
      // 종료일만 있는 경우
      setSelectedDates([end instanceof Date ? end : new Date(end)]);
    } else {
      setSelectedDates([]);
    }
  };

  const handleSubmit = (): void => {
    if (selectedDates.length === 0) {
      alert("날짜를 선택해주세요.");
      return;
    }
    if (!reason.trim()) {
      alert("연차 사유를 입력해주세요.");
      return;
    }

    const vacationData: VacationData = {
      type: vacationType,
      dates: selectedDates.map((date) => format(date, "yyyy-MM-dd")),
      startTime,
      endTime,
      reason: reason.trim(),
      days: selectedDates.length,
    };

    if (onSubmit) {
      onSubmit(vacationData);
    }
    handleClose();
  };

  const handleClose = (): void => {
    setVacationType(defaultVacationType);
    setSelectedDates([]);
    setStartDate(null);
    setEndDate(null);
    setStartTime("09:00");
    setEndTime("18:00");
    setReason("");
    setShowStartTimeDropdown(false);
    setShowEndTimeDropdown(false);
    onClose();
  };

  const handleStartTimeSelect = (time: string): void => {
    setStartTime(time);
    setShowStartTimeDropdown(false);
  };

  const handleEndTimeSelect = (time: string): void => {
    setEndTime(time);
    setShowEndTimeDropdown(false);
  };

  const handleDialogOpenChange = (open: boolean): void => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="w-full max-w-lg mx-4 p-4 bg-white/80 backdrop-blur-md border-gray-200/50 rounded-2xl max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-gray-800">
              휴가 신청
            </DialogTitle>
          </DialogHeader>

          {/* Vacation Type Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              휴가 종류
            </label>
            <Select value={vacationType} onValueChange={setVacationType}>
              <SelectTrigger className="w-full bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {vacationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Calendar */}
          <Calendar
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            selectedDates={selectedDates}
          />

          {/* Date Range Info - 범위 선택 시에만 표시 */}
          {startDate &&
            endDate &&
            startDate.getTime() !== endDate.getTime() && (
              <div className="mb-4 p-3 bg-blue-50/50 border border-blue-200/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-blue-700">
                    <span className="font-medium">선택된 기간:</span>{" "}
                    {format(startDate, "yyyy.MM.dd")} ~{" "}
                    {format(endDate, "yyyy.MM.dd")}
                  </div>
                  <div className="text-sm font-medium text-blue-700">
                    {selectedDates.length}일
                  </div>
                </div>
              </div>
            )}

          {/* Single Date Info - 단일 날짜 선택 시에만 표시 */}
          {startDate &&
            (!endDate || startDate.getTime() === endDate.getTime()) && (
              <div className="mb-4 p-3 bg-green-50/50 border border-green-200/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-green-700">
                    <span className="font-medium">선택된 날짜:</span>{" "}
                    {format(startDate, "yyyy.MM.dd")}
                  </div>
                  <div className="text-sm font-medium text-green-700">1일</div>
                </div>
              </div>
            )}

          {/* Time Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시간 선택
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Button
                  variant="outline"
                  className="w-full justify-between bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl"
                  onClick={() =>
                    setShowStartTimeDropdown(!showStartTimeDropdown)
                  }
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {startTime}
                  </span>
                </Button>
                {showStartTimeDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <SelectTime
                      onTimeSelect={handleStartTimeSelect}
                      onClose={() => setShowStartTimeDropdown(false)}
                      isDropdown={true}
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 relative">
                <Button
                  variant="outline"
                  className="w-full justify-between bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl"
                  onClick={() => setShowEndTimeDropdown(!showEndTimeDropdown)}
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {endTime}
                  </span>
                </Button>
                {showEndTimeDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <SelectTime
                      onTimeSelect={handleEndTimeSelect}
                      onClose={() => setShowEndTimeDropdown(false)}
                      isDropdown={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              휴가 사유
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="휴가 사유를 입력해주세요..."
              className="w-full bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl resize-none"
              rows={3}
            />
          </div>

          {/* Footer */}
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 bg-white/60 backdrop-blur-sm border-gray-200/50 rounded-xl"
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              신청하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
