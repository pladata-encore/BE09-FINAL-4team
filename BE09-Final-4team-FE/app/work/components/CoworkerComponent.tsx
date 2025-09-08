"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  Calendar,
  Users,
  Settings,
  FileText,
  Megaphone,
  ClipboardList,
  Briefcase,
  Home,
  Search,
  Mail,
  Phone,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/main-layout";
import { DateNavigation } from "@/components/ui/date-navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { colors } from "@/lib/design-tokens";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { userApi } from "@/lib/services/user/api";
import { ColleagueResponseDto } from "@/lib/services/user/types";
import { workScheduleApi } from "@/lib/services/attendance/api";
import {
  SCHEDULE_TYPE_COLOR,
  toLabelFromEnum,
  toColorFromEnum,
  toTimeString,
} from "./schedule-utils";
import "./schedulecalendar.css";

// Type definitions
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

interface ScheduleEvent {
  startTime?: string;
  endTime?: string;
  title: string;
  color: string;
  type: string;
  employeeId?: string;
}

interface ScheduleData {
  [key: number]: ScheduleEvent[];
}

// ScheduleCalendar를 클라이언트에서만 로드
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

// EditableEvent 컴포넌트
const EditableEvent = ({
  event,
  onTitleChange,
}: {
  event: CoworkerEvent;
  onTitleChange: (eventId: string, newTitle: string) => void;
}): JSX.Element => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>(event.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = (): void => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const handleSave = (): void => {
    if (editValue.trim()) {
      onTitleChange(event.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(event.title);
      setIsEditing(false);
    }
  };

  const handleBlur = (): void => {
    handleSave();
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        padding: "4px",
      }}
    >
      {/* 시간 표시 */}
      <div
        style={{
          fontSize: "10px",
          color: "rgba(255, 255, 255, 0.8)",
          marginBottom: "1px", // 간격을 최소화
          fontWeight: "normal",
          lineHeight: "1",
        }}
      >
        {new Date(event.start).toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}{" "}
        -{" "}
        {new Date(event.end).toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </div>

      {/* 제목 (편집 가능) */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          style={{
            fontSize: "inherit",
            fontWeight: "inherit",
            color: "white",
            background: "transparent",
            border: "none",
            outline: "none",
            width: "100%",
            lineHeight: "1.1",
          }}
        />
      ) : (
        <div
          onDoubleClick={handleDoubleClick}
          style={{
            fontSize: "inherit",
            fontWeight: "inherit",
            color: "white",
            width: "100%",
            lineHeight: "1.1",
            cursor: "pointer",
          }}
          title="더블클릭하여 편집"
        >
          {event.title}
        </div>
      )}
    </div>
  );
};

export default function CoworkerComponent(): JSX.Element {
  const [currentWeek, setCurrentWeek] = useState<string>("");
  const [events, setEvents] = useState<CoworkerEvent[]>([]);
  const [weekDates, setWeekDates] = useState<WeekDates>({});
  const [isClient, setIsClient] = useState<boolean>(false);
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

  const router = useRouter();

  // API 동료 → UI Employee 변환
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

  // 클라이언트 사이드에서만 실행
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 동료 검색 (마운트 및 검색어 변경 시)
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

  // baseDate를 기준으로 주차 계산
  useEffect(() => {
    if (!isClient) return;

    const currentDay = baseDate.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const mondayStr = formatDate(monday);
    const sundayStr = formatDate(sunday);
    setCurrentWeek(`${mondayStr} ~ ${sundayStr}`);

    const weekMapping: WeekDates = {};
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);
      const dayKey = currentDate.getDate();
      weekMapping[dayKey] = formatDate(currentDate);
    }
    setWeekDates(weekMapping);
  }, [isClient, baseDate]);

  // scheduleData → FullCalendar events 변환
  useEffect(() => {
    if (!isClient || !currentWeek || Object.keys(weekDates).length === 0)
      return;

    const targetId =
      selectedEmployee === "all" ? employees[0]?.id ?? "1" : selectedEmployee;
    const targetName =
      employees.find((e) => e.id === targetId)?.name ||
      employees[0]?.name ||
      "직원";

    const dates = Object.values(weekDates);
    const startDate = dates.sort()[0];
    const endDate = dates.sort()[dates.length - 1];

    let isCancelled = false;

    const fetchSchedules = async () => {
      try {
        const data = await workScheduleApi.getColleagueSchedule(
          Number(targetId),
          startDate,
          endDate
        );

        const mapTypeToLabelAndColor = (
          type: string
        ): { title: string; color: string } => {
          const title = toLabelFromEnum(type, type);
          const color = SCHEDULE_TYPE_COLOR[type] || "#94a3b8";
          return { title, color };
        };

        const converted: CoworkerEvent[] = [];

        // 안전한 null 체크
        if (!data || !data.dailySchedules) {
          console.warn("동료 스케줄 데이터가 없습니다:", data);
          if (!isCancelled) {
            setEvents([]);
          }
          return;
        }

        data.dailySchedules.forEach((daily) => {
          const dateStr = daily.date; // YYYY-MM-DD
          // events 배열 null 체크
          if (!daily.events || !Array.isArray(daily.events)) {
            return;
          }
          daily.events.forEach((evt, idx) => {
            const { title, color } = mapTypeToLabelAndColor(evt.scheduleType);
            const start = `${dateStr}T${toTimeString(evt.startTime)}`;
            const end = `${dateStr}T${toTimeString(evt.endTime)}`;
            converted.push({
              id: `${evt.scheduleType}-${dateStr}-${idx}`,
              title,
              start,
              end,
              backgroundColor: color,
              borderColor: color,
              textColor: "#ffffff",
              allDay: false,
              extendedProps: {
                employeeId: String(targetId),
                employeeName: targetName,
                type: evt.scheduleType,
              },
            });
          });
        });

        if (!isCancelled) {
          setEvents(converted);
        }
      } catch (e) {
        console.error("스케줄 조회 실패:", e);
        if (!isCancelled) {
          setEvents([]);
        }
      }
    };

    fetchSchedules();

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

  const handleEventTitleChange = (eventId: string, newTitle: string): void => {
    const updated = events.map((event) =>
      event.id === eventId ? { ...event, title: newTitle } : event
    );
    setEvents(updated);
  };

  const eventContent = (arg: any): JSX.Element => (
    <EditableEvent event={arg.event} onTitleChange={handleEventTitleChange} />
  );

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "online":
        return "#10b981";
      case "away":
        return "#f59e0b";
      case "offline":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "online":
        return "온라인";
      case "away":
        return "자리비움";
      case "offline":
        return "오프라인";
      default:
        return "알 수 없음";
    }
  };

  return (
    <div className="-mt-16">
      {/* Header with Search and Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
        </div>
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

      {/* Employee List (상위 4명 미리보기) */}
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
                <div
                  className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                  style={{ backgroundColor: getStatusColor(employee.status) }}
                ></div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{employee.name}</h3>
                <p className="text-sm text-gray-600">{employee.position}</p>
                <p className="text-xs text-gray-500">{employee.department}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {getStatusText(employee.status)}
              </span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {employee.workType}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Date Navigation */}
      <div className="flex justify-center mb-6">
        <DateNavigation
          currentPeriod={currentWeek}
          onPrevious={handlePreviousWeek}
          onNext={handleNextWeek}
        />
      </div>

      {/* Calendar */}
      <GlassCard className="p-6">
        <div className="calendar-container schedule-calendar-container">
          {isClient && (
            <ScheduleCalendar
              events={events}
              onEventDrop={() => {}} // 드래그 이동 비활성화
              onEventResize={() => {}} // 크기 조정 비활성화
              onSelect={() => {}} // 드래그 선택 비활성화
              onEventClick={() => {}} // 이벤트 클릭 비활성화
              dayCellDidMount={() => {}}
              eventContent={eventContent}
              editable={false} // 편집 비활성화 (드래그, 리사이즈, 선택 모두 비활성화)
            />
          )}
        </div>
      </GlassCard>
    </div>
  );
}
