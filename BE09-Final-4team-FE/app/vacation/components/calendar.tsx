"use client";

import { useState, useEffect } from "react";
import {
  format,
  isSameDay,
  getDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Type definitions
interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface CalendarProps {
  startDate?: Date | null;
  endDate?: Date | null;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date | null) => void;
  selectedDates: Date[];
  isFilterMode?: boolean;
}

export default function Calendar({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  selectedDates,
  isFilterMode = false,
}: CalendarProps): JSX.Element {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [range, setRange] = useState<DateRange>({
    from: startDate ? new Date(startDate) : null,
    to: endDate ? new Date(endDate) : null,
  });

  // 부모 컴포넌트의 날짜가 변경될 때 로컬 상태 업데이트
  useEffect(() => {
    setRange({
      from: startDate ? new Date(startDate) : null,
      to: endDate ? new Date(endDate) : null,
    });
  }, [startDate, endDate]);

  const handleDateClick = (date: Date): void => {
    if (!range.from || (range.from && range.to)) {
      // 새로운 범위 시작
      setRange({ from: date, to: null });
      onStartDateChange(date);
      onEndDateChange(null);
    } else {
      // 범위 완성
      const from = range.from;
      const to = date;

      if (from && from > to) {
        setRange({ from: to, to: from });
        onStartDateChange(to);
        onEndDateChange(from);
      } else if (from) {
        setRange({ from, to });
        onStartDateChange(from);
        onEndDateChange(to);
      }
    }
  };

  const handleMonthChange = (direction: "prev" | "next"): void => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "next") {
        newMonth.setMonth(newMonth.getMonth() + 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() - 1);
      }
      return newMonth;
    });
  };

  const getCalendarDays = (): CalendarDay[] => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const startDay = getDay(start);

    const days: CalendarDay[] = [];

    // 이전 달의 마지막 날들
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthEnd = endOfMonth(prevMonth);

    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(prevMonthEnd.getTime() - i * 24 * 60 * 60 * 1000),
        isCurrentMonth: false,
      });
    }

    // 현재 달의 날들
    const currentMonthDays = eachDayOfInterval({ start, end });
    days.push(
      ...currentMonthDays.map((date) => ({
        date,
        isCurrentMonth: true,
      }))
    );

    // 다음 달의 첫 날들 (42개 셀을 채우기 위해)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(i);
      days.push({
        date: nextMonth,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const isInRange = (date: Date): boolean => {
    if (!range.from) return false;
    if (!range.to) return isSameDay(date, range.from);
    return date >= range.from && date <= range.to;
  };

  const isRangeStart = (date: Date): boolean => {
    return range.from ? isSameDay(date, range.from) : false;
  };

  const isRangeEnd = (date: Date): boolean => {
    return range.to ? isSameDay(date, range.to) : false;
  };

  const weekdays: string[] = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className={isFilterMode ? "mb-0" : "mb-4"}>
      {!isFilterMode && (
        <label className="block text-sm font-medium text-foreground mb-2">
          날짜 선택
        </label>
      )}

      {/* Desktop Calendar */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleMonthChange("prev")}
            className="h-8 w-8 p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <h3 className="text-sm font-semibold text-foreground">
            {format(currentMonth, "yyyy년 M월", { locale: ko })}
          </h3>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleMonthChange("next")}
            className="h-8 w-8 p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1">
          {weekdays.map((day, index) => (
            <div
              key={day}
              className={`text-xs font-medium h-8 w-8 flex items-center justify-center ${
                index === 0
                  ? "text-red-500"
                  : index === 6
                  ? "text-blue-500"
                  : "text-muted-foreground"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {getCalendarDays().map((day, index) => {
            const isTodayDate = isToday(day.date);
            const inRange = isInRange(day.date);
            const isStart = isRangeStart(day.date);
            const isEnd = isRangeEnd(day.date);
            const dayOfWeek = getDay(day.date);

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day.date)}
                className={`
                  h-8 w-8 text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center
                  ${
                    !day.isCurrentMonth
                      ? "text-muted-foreground/30"
                      : isTodayDate
                      ? "bg-orange-500 text-white font-bold border-2 border-orange-600 shadow-md"
                      : inRange
                      ? isStart || isEnd
                        ? "bg-blue-600 text-white font-semibold shadow-sm"
                        : "bg-blue-100 text-blue-800 border border-blue-200"
                      : dayOfWeek === 0
                      ? "text-red-500 hover:bg-red-50"
                      : dayOfWeek === 6
                      ? "text-blue-500 hover:bg-blue-50"
                      : "text-foreground hover:bg-accent"
                  }
                  ${!day.isCurrentMonth ? "cursor-default" : "cursor-pointer"}
                `}
                disabled={!day.isCurrentMonth}
              >
                {format(day.date, "d")}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
