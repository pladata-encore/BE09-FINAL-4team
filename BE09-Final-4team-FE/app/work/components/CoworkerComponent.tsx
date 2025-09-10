"use client";

import { useState, useEffect } from "react";
import { User, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DateNavigation } from "@/components/ui/date-navigation";
import { GlassCard } from "@/components/ui/glass-card";
import dynamic from "next/dynamic";
import { userApi } from "@/lib/services/user/api";
import { ColleagueResponseDto } from "@/lib/services/user/types";
import { workScheduleApi } from "@/lib/services/attendance/api";
import {
  SCHEDULE_TYPE_COLOR,
  toLabelFromEnum,
  toTimeString,
} from "./schedule-utils";
import "./schedulecalendar.css";

interface CoworkerEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  allDay: boolean;
  extendedProps: {
    employeeId?: string;
    employeeName?: string;
    type?: string;
  };
}

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  workType?: string;
}

interface WeekDates {
  [key: number]: string;
}

const ScheduleCalendar = dynamic(
  () => import("@/components/calendar/schedule-calendar"),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">스케줄 로딩 중...</p>
        </div>
      </div>
    ),
  }
);

export default function CoworkerComponent(): JSX.Element {
  const [currentWeek, setCurrentWeek] = useState<string>("");
  const [currentMondayDate, setCurrentMondayDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CoworkerEvent[]>([]);
  const [weekDates, setWeekDates] = useState<WeekDates>({});
  const [isClient, setIsClient] = useState<boolean>(false);
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

  const mapColleagueToEmployee = (c: ColleagueResponseDto): Employee => ({
    id: String(c.userId),
    name: c.name,
    position: c.position ?? "",
    department: c.department ?? "",
    email: c.email,
    phone: c.phoneNumber,
    avatar: c.avatar,
    status: (c.status as Employee["status"]) ?? "offline",
    workType: undefined,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 동료 목록 로드 + 검색
  useEffect(() => {
    if (!isClient) return;
    const controller = new AbortController();
    const handler = setTimeout(async () => {
      try {
        const data = await userApi.getColleagues({
          searchKeyword: searchTerm || undefined,
          page: 0,
          size: 20,
        });
        const mapped = data.map(mapColleagueToEmployee);
        setEmployees(mapped);
        setFilteredEmployees(mapped);
      } catch (e) {
        setEmployees([]);
        setFilteredEmployees([]);
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(handler);
    };
  }, [isClient, searchTerm]);

  // 주간 범위 계산 (일요일 ~ 토요일)
  useEffect(() => {
    if (!isClient) return;
    const currentDay = baseDate.getDay(); // 0: Sun ~ 6: Sat
    const sundayOffset = -currentDay; // 주 시작: 일요일
    const sunday = new Date(baseDate);
    sunday.setDate(baseDate.getDate() + sundayOffset);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const sundayStr = formatDate(sunday);
    const saturdayStr = formatDate(saturday);
    setCurrentWeek(`${sundayStr} ~ ${saturdayStr}`);
    setCurrentMondayDate(sunday); // 캘린더 기준일을 주 시작(일)으로 설정

    const weekMapping: WeekDates = {};
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(sunday);
      currentDate.setDate(sunday.getDate() + i);
      const dayKey = currentDate.getDate();
      weekMapping[dayKey] = formatDate(currentDate);
    }
    setWeekDates(weekMapping);
  }, [isClient, baseDate]);

  // 동료 스케줄 로드 (선택 시, 3주 범위: 지난 주 ~ 이번 주(일~토) ~ 다음 주)
  useEffect(() => {
    if (!isClient || !currentWeek || Object.keys(weekDates).length === 0)
      return;

    const targetId =
      selectedEmployee === "all" ? employees[0]?.id : selectedEmployee;
    if (!targetId) {
      setEvents([]);
      return;
    }

    // 현재 주의 일요일과 토요일 계산
    const days = Object.values(weekDates).sort();
    const currentStart = new Date(days[0]); // Sunday
    const currentEnd = new Date(days[days.length - 1]); // Saturday

    // 3주 범위: 지난 주 일요일 ~ 다음 주 토요일
    const prevSunday = new Date(currentStart);
    prevSunday.setDate(currentStart.getDate() - 7);
    const nextSaturday = new Date(currentEnd);
    nextSaturday.setDate(currentEnd.getDate() + 7);

    const toYmd = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const startDate = toYmd(prevSunday);
    const endDate = toYmd(nextSaturday);

    let isCancelled = false;
    (async () => {
      try {
        const schedules = await workScheduleApi.getUserSchedulesByDateRange(
          Number(targetId), // 선택한 동료의 ID
          startDate,
          endDate
        );

        const converted: CoworkerEvent[] = (schedules || []).map(
          (s: any, idx: number) => {
            const startHHmmss = toTimeString(s.startTime);
            const endHHmmss = toTimeString(s.endTime);
            const startIso = `${s.startDate}T${startHHmmss}`;
            const endIso = `${s.endDate}T${endHHmmss}`;
            const title = toLabelFromEnum(
              s.scheduleType,
              s.title || s.scheduleType
            );
            const color = SCHEDULE_TYPE_COLOR[s.scheduleType] || "#94a3b8";
            return {
              id: String(s.id ?? `${s.scheduleType}-${s.startDate}-${idx}`),
              title,
              start: startIso,
              end: endIso,
              backgroundColor: color,
              borderColor: color,
              textColor: "#ffffff",
              allDay: !!s.isAllDay,
              extendedProps: {
                employeeId: String(targetId),
                employeeName: undefined, // 동료 이름은 별도로 가져와야 함
                type: s.scheduleType,
              },
            } as CoworkerEvent;
          }
        );

        if (!isCancelled) setEvents(converted);
      } catch (e) {
        if (!isCancelled) setEvents([]);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [isClient, currentWeek, weekDates, selectedEmployee, employees]);

  const handlePreviousWeek = (): void => {
    const newBaseDate = new Date(baseDate);
    newBaseDate.setDate(baseDate.getDate() - 7);
    setBaseDate(newBaseDate);
  };
  const handleNextWeek = (): void => {
    const newBaseDate = new Date(baseDate);
    newBaseDate.setDate(baseDate.getDate() + 7);
    setBaseDate(newBaseDate);
  };

  const handleEmployeeSelect = (employeeId: string): void => {
    setSelectedEmployee(employeeId);
  };

  return (
    <div className="-mt-16">
      <div className="flex items-center justify-end mb-6">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="직원 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {filteredEmployees.slice(0, 4).map((employee) => (
          <GlassCard
            key={employee.id}
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedEmployee === employee.id ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => handleEmployeeSelect(employee.id)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{employee.name}</h3>
                <p className="text-sm text-gray-600">{employee.position}</p>
                <p className="text-xs text-gray-500">{employee.department}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="flex justify-center mb-6">
        <DateNavigation
          currentPeriod={currentWeek}
          onPrevious={handlePreviousWeek}
          onNext={handleNextWeek}
        />
      </div>

      <GlassCard className="p-6">
        <div className="calendar-container schedule-calendar-container">
          {isClient && (
            <ScheduleCalendar
              events={events}
              onEventDrop={() => {}}
              onEventResize={() => {}}
              onSelect={() => {}}
              onEventClick={() => {}}
              dayCellDidMount={() => {}}
              eventContent={(arg: any) => (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    padding: "4px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: "rgba(255, 255, 255, 0.8)",
                      marginBottom: "1px",
                      fontWeight: "normal",
                      lineHeight: "1",
                    }}
                  >
                    {new Date(arg.event.start).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}{" "}
                    -{" "}
                    {new Date(arg.event.end).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </div>
                  <div
                    style={{
                      fontSize: "inherit",
                      fontWeight: "inherit",
                      color: "white",
                      width: "100%",
                      lineHeight: "1.1",
                    }}
                  >
                    {arg.event.title}
                  </div>
                </div>
              )}
              editable={false}
              currentDate={currentMondayDate}
            />
          )}
        </div>
      </GlassCard>
    </div>
  );
}
