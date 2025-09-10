"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { DateNavigation } from "@/components/ui/date-navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { colors } from "@/lib/design-tokens";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { workScheduleApi } from "@/lib/services/attendance";
import { useAuth } from "@/hooks/use-auth";
import { ScheduleType } from "@/lib/services/attendance";
import {
  SCHEDULE_TYPE_LABEL,
  SCHEDULE_TYPE_COLOR,
  toLabelFromEnum,
  toColorFromEnum,
} from "./schedule-utils";
import "./schedulecalendar.css";

// Type definitions
interface WorkEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  allDay: boolean;
  status?: string;
  isNewEvent?: boolean;
  extendedProps: {
    originalTime?: string;
    originalStartTime?: string;
    originalEndTime?: string;
    originalTitle?: string;
    originalColor?: string;
    isAllDayRest?: boolean;
    type?: string;
    isNewEvent?: boolean;
  };
}

interface WorkTimeSummary {
  totalHours: number;
  averageHours: number;
  percentage: number;
}

interface WeekDates {
  [key: number]: string;
}

interface DropdownPosition {
  x: number;
  y: number;
}

interface ScheduleEvent {
  startTime?: string;
  endTime?: string;
  title: string;
  color: string;
  type: string;
  time?: string;
  isAllDayRest?: boolean;
}

interface ScheduleData {
  [key: number]: ScheduleEvent[];
}

interface TimeRange {
  start: string;
  end: string;
}

interface TimePattern {
  start: string;
  end: string;
  title: string;
  type: string;
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

export default function MyWorkComponent(): JSX.Element {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState<string>("");
  const [currentMondayDate, setCurrentMondayDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<WorkEvent[]>([]);
  const [originalEvents, setOriginalEvents] = useState<WorkEvent[]>([]);
  const [weekDates, setWeekDates] = useState<WeekDates>({});
  const [isClient, setIsClient] = useState<boolean>(false);
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);
  const [workTimeSummary, setWorkTimeSummary] = useState<WorkTimeSummary>({
    totalHours: 0,
    averageHours: 40,
    percentage: 0,
  });
  const [isApplyingWorkPolicy, setIsApplyingWorkPolicy] =
    useState<boolean>(false);

  // NEW: Pending operation queues (create/update/delete)
  const [pendingCreates, setPendingCreates] = useState<WorkEvent[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());

  // 드롭다운 상태
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [dropdownEventId, setDropdownEventId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({
    x: 0,
    y: 0,
  });

  const router = useRouter();

  // 클라이언트 사이드에서만 실행
  useEffect(() => {
    setIsClient(true);
  }, []);

  // baseDate를 기준으로 주차 계산
  useEffect(() => {
    if (!isClient) return;

    const currentDay = baseDate.getDay(); // 0: 일요일 ~ 6: 토요일
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
    setCurrentMondayDate(sunday); // 현재 주의 일요일 날짜로 업데이트

    const weekMapping: WeekDates = {};
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(sunday);
      currentDate.setDate(sunday.getDate() + i);
      const dayKey = currentDate.getDate();
      weekMapping[dayKey] = formatDate(currentDate);
    }
    setWeekDates(weekMapping);
  }, [isClient, baseDate]);

  // 스케줄 데이터 로드 함수
  const loadScheduleData = async () => {
    try {
      if (!user?.id || !isClient) return;

      // 주의 월요일~일요일 계산
      const d = new Date(baseDate);
      const currentDay = d.getDay();
      const sundayOffset = -currentDay; // 주 시작: 일요일
      const sunday = new Date(d);
      sunday.setDate(d.getDate() + sundayOffset);
      const saturday = new Date(sunday);
      saturday.setDate(sunday.getDate() + 6);

      const toStr = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };

      const startDate = toStr(sunday);
      const endDate = toStr(saturday);

      // 기간 스케줄 조회 (정책 적용 없이)
      const schedules = await workScheduleApi.getUserSchedulesByDateRange(
        Number(user.id),
        startDate,
        endDate
      );

      // LocalTime(string/object) → HH:mm 변환
      const timeToHHmm = (t: any): string | undefined => {
        if (!t) return undefined;
        if (typeof t === "string") {
          // "HH:mm:ss" 또는 "HH:mm" → 앞 5자리
          return t.slice(0, 5);
        }
        if (typeof t.hour === "number" && typeof t.minute === "number") {
          return `${String(t.hour).padStart(2, "0")}:${String(
            t.minute
          ).padStart(2, "0")}`;
        }
        return undefined;
      };

      // 스케줄 → 캘린더 이벤트 매핑
      const mapped: WorkEvent[] = schedules
        .map((s) => {
          // LocalTime(string/object) → HH:mm 변환 (기본값 제거)
          const timeToHHmm = (t: any): string | undefined => {
            if (!t) return undefined;
            if (typeof t === "string") return t.slice(0, 5);
            if (typeof t?.hour === "number" && typeof t?.minute === "number") {
              return `${String(t.hour).padStart(2, "0")}:${String(
                t.minute
              ).padStart(2, "0")}`;
            }
            return undefined;
          };

          const startTime = timeToHHmm(s.startTime);
          const endTime = timeToHHmm(s.endTime);
          if (!startTime || !endTime) return null; // 시간 정보가 없으면 제외

          const startDateTime = `${s.startDate}T${startTime}:00`;
          const endDateTime = `${s.endDate}T${endTime}:00`;

          return {
            id: String(s.id),
            title: toLabelFromEnum(s.scheduleType, s.title || s.scheduleType),
            start: startDateTime,
            end: endDateTime,
            backgroundColor: toColorFromEnum(s.scheduleType),
            borderColor: toColorFromEnum(s.scheduleType),
            textColor: "#ffffff",
            allDay: !!s.isAllDay,
            status: s.status || "ACTIVE",
            extendedProps: {
              originalTime: `${startTime} - ${endTime}`,
              originalStartTime: startTime,
              originalEndTime: endTime,
              originalTitle: s.title || s.scheduleType,
              originalColor: toColorFromEnum(s.scheduleType),
              type: s.scheduleType,
            },
          };
        })
        .filter((e): e is WorkEvent => e !== null);

      setEvents(mapped);
      setOriginalEvents(mapped);
      setPendingCreates([]);
      setPendingUpdates(new Set());
      setPendingDeletes(new Set());
      setHasPendingChanges(false);
    } catch (error) {
      console.error("스케줄 로딩 오류:", error);
      setEvents([]);
      setOriginalEvents([]);
    }
  };

  // 스케줄 불러오기 (정책 적용 없이 단순 조회)
  useEffect(() => {
    loadScheduleData();
  }, [user?.id, isClient, baseDate]);

  // 현재 주 기준으로 scheduleData 생성
  const generateScheduleData = (): ScheduleData => {
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const scheduleData: ScheduleData = {};
    for (let i = 0; i < 7; i++) {
      const dateKey = new Date(monday);
      dateKey.setDate(monday.getDate() + i);
      const key = dateKey.getDate();
      scheduleData[key] = [];
    }

    return scheduleData;
  };

  // 이 useEffect는 제거 - 서버에서 가져온 실제 데이터를 사용

  // 근무 시간 계산 (근무, 외근, 출장, 재택 모두 포함, 휴가 제외)
  const calculateWorkTime = (events: WorkEvent[]): WorkTimeSummary => {
    let totalMinutes = 0;
    const workTypes = ["근무", "외근", "출장", "재택"];

    events.forEach((event) => {
      if (workTypes.includes(event.title) && event.start && event.end) {
        const start = new Date(event.start);
        const end = new Date(event.end);
        const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
        totalMinutes += diffMinutes;
      }
    });

    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const averageHours = 40;
    const percentage = Math.min((totalHours / averageHours) * 100, 100);
    return { totalHours, averageHours, percentage };
  };

  useEffect(() => {
    if (events.length > 0) {
      const summary = calculateWorkTime(events);
      setWorkTimeSummary(summary);
    }
  }, [events]);

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

  // 근무 정책을 스케줄에 적용 (4주 기간)
  const handleApplyWorkPolicy = async (): Promise<void> => {
    if (!user?.id) {
      return;
    }

    if (isApplyingWorkPolicy) {
      return; // 이미 진행 중인 경우 중복 실행 방지
    }

    setIsApplyingWorkPolicy(true);

    try {
      // 현재 날짜 기준으로 4주 기간 계산
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(
        today.getDate() - (today.getDay() === 0 ? 7 : today.getDay())
      ); // 이번 주 월요일

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 27); // 4주 후 (28일 = 4주)

      const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const startDateStr = formatDate(startDate);
      const endDateStr = formatDate(endDate);

      console.log(`근무 정책 적용: ${startDateStr} ~ ${endDateStr}`);

      await workScheduleApi.applyWorkPolicyToSchedule(
        user.id,
        startDateStr,
        endDateStr
      );

      // 스케줄 다시 로드 (페이지 새로고침 대신)
      await loadScheduleData();
    } catch (error: any) {
      console.error("근무 정책 적용 실패:", error);

      let errorMessage = "근무 정책 적용 중 오류가 발생했습니다.";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setIsApplyingWorkPolicy(false);
    }
  };

  const handleEventDrop = (info: any): void => {
    if (info.event.start.getDay() === 0) {
      alert("일요일에는 일정을 이동할 수 없습니다.");
      info.revert();
      return;
    }

    const eventId = info.event.id;
    const originalEvent = events.find((e) => e.id === eventId);
    if (!originalEvent) {
      info.revert();
      return;
    }

    // Optimistic update only; do not persist yet
    const updated = events.map((event) =>
      event.id === eventId
        ? {
            ...event,
            start: info.event.start.toISOString(),
            end: info.event.end ? info.event.end.toISOString() : event.end,
            status: "pending",
          }
        : event
    );
    setEvents(updated);
    setHasPendingChanges(true);

    // Stage update op
    setPendingUpdates((prev) => new Set(prev).add(eventId));
  };

  const handleEventResize = (info: any): void => {
    if (info.event.start.getDay() === 0) {
      alert("일요일에는 일정을 수정할 수 없습니다.");
      info.revert();
      return;
    }

    const eventId = info.event.id;
    const originalEvent = events.find((e) => e.id === eventId);
    if (!originalEvent) {
      info.revert();
      return;
    }

    // Optimistic update only; do not persist yet
    const updated = events.map((event) =>
      event.id === eventId
        ? {
            ...event,
            start: info.event.start.toISOString(),
            end: info.event.end.toISOString(),
            status: "pending",
          }
        : event
    );
    setEvents(updated);
    setHasPendingChanges(true);

    // Stage update op
    setPendingUpdates((prev) => new Set(prev).add(eventId));
  };

  const handleSelect = (selectInfo: any): void => {
    if (selectInfo.start.getDay() === 0) {
      alert("일요일에는 일정을 추가할 수 없습니다.");
      selectInfo.view.calendar.unselect();
      return;
    }

    // Client-side overlap check
    const selStart = selectInfo.start as Date;
    const selEnd = selectInfo.end as Date;
    const conflicts = events.some((e) => {
      const es = new Date(e.start);
      const ee = new Date(e.end);
      return es < selEnd && selStart < ee;
    });
    if (conflicts) {
      alert(
        "선택한 시간이 기존 스케줄과 겹칩니다. 다른 시간대를 선택해 주세요."
      );
      return;
    }

    const calendarApi = selectInfo.view.calendar;
    const tempId = new Date().getTime().toString();
    const workColor = SCHEDULE_TYPE_COLOR.WORK || "#4FC3F7";
    const newEvent: WorkEvent = {
      id: tempId,
      title: "근무",
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
      backgroundColor: workColor,
      borderColor: workColor,
      textColor: "#ffffff",
      status: "pending",
      isNewEvent: true,
      extendedProps: { isNewEvent: true },
    } as any;

    // Optimistic add
    calendarApi.addEvent(newEvent as any);
    setEvents((prev) => [...prev, newEvent]);
    setHasPendingChanges(true);
    calendarApi.unselect();

    // Stage create op
    setPendingCreates((prev) => [...prev, newEvent]);
  };

  const handleEventClick = (clickInfo: any): void => {
    // 이벤트 클릭 시에는 아무것도 하지 않음 (삭제는 쓰레기통 아이콘으로만)
    return;
  };

  const handleDeleteEvent = (
    eventId: string,
    event: React.MouseEvent
  ): void => {
    event.stopPropagation();

    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) return;

    const eventDate = new Date(targetEvent.start);
    if (eventDate.getDay() === 0) {
      alert("일요일에는 일정을 삭제할 수 없습니다.");
      return;
    }

    if (confirm("이 일정을 삭제하시겠습니까?")) {
      // Remove from calendar view
      const calendarApi = document
        .querySelector(".fc")
        ?.querySelector(".fc-view")?.parentElement;
      if (calendarApi) {
        const fcEvent = (calendarApi as any).calendar?.getEventById(eventId);
        if (fcEvent) fcEvent.remove();
      }

      // Update local state
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setHasPendingChanges(true);

      // Stage delete or cancel staged create
      if (isNaN(Number(eventId))) {
        // Temp event from create -> cancel the staged creation
        setPendingCreates((prev) => prev.filter((e) => e.id !== eventId));
      } else {
        setPendingDeletes((prev) => new Set(prev).add(eventId));
      }

      // Also remove from pendingUpdates if present
      setPendingUpdates((prev) => {
        const copy = new Set(prev);
        copy.delete(eventId);
        return copy;
      });
    }
  };

  const dayCellDidMountHandler = (arg: any): void => {
    if (arg.date.getDay() === 0) {
      arg.el.classList.add("sunday-disabled");
    }
  };

  const handleCancelChanges = (): void => {
    // Rollback to the last confirmed snapshot
    setEvents(originalEvents);
    setHasPendingChanges(false);
    setPendingCreates([]);
    setPendingDeletes(new Set());
    setPendingUpdates(new Set());
  };

  const handleSubmitChanges = async (): Promise<void> => {
    // Apply staged operations: creates -> updates -> deletes
    if (!user?.id) {
      alert("사용자 정보를 확인할 수 없습니다.");
      return;
    }

    const toHHmmss = (iso: string) => {
      const d = new Date(iso);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}:00`;
    };

    try {
      // 1) Creates
      for (const ev of pendingCreates) {
        const startDate = ev.start.slice(0, 10);
        const endDate = ev.end.slice(0, 10);
        const created = await workScheduleApi.createSchedule({
          userId: Number(user.id),
          title: ev.title,
          description: undefined,
          startDate,
          endDate,
          startTime: toHHmmss(ev.start),
          endTime: toHHmmss(ev.end),
          scheduleType: ScheduleType.WORK,
          color: ev.backgroundColor,
          isAllDay: !!ev.allDay,
          isRecurring: false,
        });

        // Replace temp id with server id
        setEvents((prev) =>
          prev.map((e) =>
            e.id === ev.id
              ? {
                  ...e,
                  id: String(created.id),
                  start: `${created.startDate}T${String(
                    created.startTime?.hour ?? 0
                  )
                    .toString()
                    .padStart(2, "0")}:${String(created.startTime?.minute ?? 0)
                    .toString()
                    .padStart(2, "0")}:00`,
                  end: `${created.endDate}T${String(created.endTime?.hour ?? 0)
                    .toString()
                    .padStart(2, "0")}:${String(created.endTime?.minute ?? 0)
                    .toString()
                    .padStart(2, "0")}:00`,
                  status: undefined,
                  extendedProps: {
                    ...(e.extendedProps || {}),
                    isNewEvent: false,
                  },
                }
              : e
          )
        );
      }

      // 2) Updates
      for (const id of Array.from(pendingUpdates)) {
        // Skip if event was deleted
        if (pendingDeletes.has(id)) continue;
        const ev = events.find((e) => e.id === id);
        if (!ev) continue;
        const startDate = ev.start.slice(0, 10);
        const endDate = ev.end.slice(0, 10);
        await workScheduleApi.updateSchedule(Number(user.id), Number(id), {
          title: ev.extendedProps?.originalTitle || ev.title,
          description: undefined,
          startDate,
          endDate,
          startTime: toHHmmss(ev.start),
          endTime: toHHmmss(ev.end),
          scheduleType:
            (ev.extendedProps?.type as ScheduleType) || ScheduleType.WORK,
          color: ev.backgroundColor,
          isAllDay: !!ev.allDay,
          isRecurring: false,
        });
        // Clear pending flag visually
        setEvents((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: undefined } : e))
        );
      }

      // 3) Deletes
      for (const id of Array.from(pendingDeletes)) {
        await workScheduleApi.deleteSchedule(Number(user.id), Number(id));
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }

      // Finalize
      setPendingCreates([]);
      setPendingUpdates(new Set());
      setPendingDeletes(new Set());
      setHasPendingChanges(false);
      setOriginalEvents(events);
      console.log("변경사항 적용 완료");
    } catch (err) {
      console.error("변경사항 저장 실패:", err);
      alert("변경사항 저장에 실패했습니다.");
    }
  };

  const handleEventTitleEdit = (eventId: string, newTitle: string): void => {
    const updated = events.map((event) =>
      event.id === eventId
        ? { ...event, title: newTitle, status: "pending" }
        : event
    );
    setEvents(updated);
    setHasPendingChanges(true);
  };

  // 드롭다운에서 유형 선택 시 호출: 색상은 매핑에서 조회
  const handleTitleSelect = (eventId: string, selectedType: string): void => {
    const target = events.find((e) => e.id === eventId);
    if (!target) return;

    const label = toLabelFromEnum(selectedType, selectedType);
    const selectedColor = SCHEDULE_TYPE_COLOR[selectedType] || "#4FC3F7";

    // Optimistic update
    const prev = target;
    const optimistic: WorkEvent = {
      ...target,
      title: label,
      backgroundColor: selectedColor,
      borderColor: selectedColor,
      status: "pending",
      isNewEvent: false,
      extendedProps: {
        ...target.extendedProps,
        type: selectedType,
      },
    };
    setEvents((list) => list.map((e) => (e.id === eventId ? optimistic : e)));
    setShowDropdown(false);
    setDropdownEventId(null);

    // Persist to backend if event has a numeric id (saved on server)
    const isPersisted = !isNaN(Number(eventId));
    if (!user?.id || !isPersisted) {
      return;
    }

    const toHHmmss = (iso: string) => {
      const d = new Date(iso);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}:00`;
    };

    (async () => {
      try {
        const startDate = optimistic.start.slice(0, 10);
        const endDate = optimistic.end.slice(0, 10);
        await workScheduleApi.updateSchedule(Number(user.id), Number(eventId), {
          title: label,
          description: undefined,
          startDate,
          endDate,
          startTime: toHHmmss(optimistic.start),
          endTime: toHHmmss(optimistic.end),
          scheduleType: selectedType as unknown as ScheduleType,
          color: selectedColor,
          isAllDay: !!optimistic.allDay,
          isRecurring: false,
        });
      } catch (err) {
        console.error("Failed to update schedule type:", err);
        // Revert
        setEvents((list) => list.map((e) => (e.id === eventId ? prev : e)));
        alert("근무 유형 변경에 실패했습니다.");
      }
    })();
  };

  // 드롭다운 메뉴 컴포넌트 (텍스트만, fixed 포지셔닝, 내부 클릭 보호)
  const TitleDropdown = ({
    eventId,
    position,
    onSelect,
    onClose,
  }: {
    eventId: string;
    position: DropdownPosition;
    onSelect: (eventId: string, selectedType: string) => void;
    onClose: () => void;
  }): JSX.Element => {
    const options = [
      { key: "WORK", label: SCHEDULE_TYPE_LABEL.WORK },
      { key: "OUT_OF_OFFICE", label: SCHEDULE_TYPE_LABEL.OUT_OF_OFFICE },
      { key: "BUSINESS_TRIP", label: SCHEDULE_TYPE_LABEL.BUSINESS_TRIP },
      { key: "VACATION", label: SCHEDULE_TYPE_LABEL.VACATION },
      { key: "SICK_LEAVE", label: SCHEDULE_TYPE_LABEL.SICK_LEAVE },
      { key: "OVERTIME", label: SCHEDULE_TYPE_LABEL.OVERTIME },
      { key: "RESTTIME", label: SCHEDULE_TYPE_LABEL.RESTTIME },
    ];
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleDocMouseDown = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          onClose();
        }
      };
      document.addEventListener("mousedown", handleDocMouseDown);
      return () =>
        document.removeEventListener("mousedown", handleDocMouseDown);
    }, [onClose]);

    // 화면 끝 보정
    const padding = 8;
    const left = Math.min(position.x, window.innerWidth - padding);
    const top = Math.min(position.y, window.innerHeight - padding);

    return (
      <div
        ref={ref}
        className="fixed z-50 bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden whitespace-nowrap"
        style={{
          left,
          top,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onSelect(eventId, opt.key)}
            className="block w-full text-left px-2 py-1 text-sm border-b border-gray-100 bg-white hover:bg-gray-50 cursor-pointer"
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  };

  // SimpleEvent: 제목 클릭 → 드롭다운, 쓰레기통 클릭 → 삭제
  const SimpleEvent = ({ event }: { event: WorkEvent }): JSX.Element => {
    const handleTitleClick = (e: React.MouseEvent): void => {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPosition({ x: rect.left, y: rect.bottom + 5 }); // 텍스트 바로 아래
      setDropdownEventId(event.id);
      setShowDropdown(true);
    };

    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          padding: "4px",
          position: "relative",
        }}
      >
        {/* 상단 영역: 시간 + 삭제 버튼 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2px",
          }}
        >
          {/* 시간 표시 */}
          <div
            style={{
              fontSize: "10px",
              color: "rgba(255, 255, 255, 0.9)",
              fontWeight: "normal",
              lineHeight: "1",
              flex: 1,
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

          {/* 삭제 버튼 */}
          <button
            onClick={(e) => handleDeleteEvent(event.id, e)}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "3px",
              padding: "2px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "16px",
              height: "16px",
              flexShrink: 0,
            }}
            title="일정 삭제"
          >
            <Trash2
              size={10}
              style={{
                color: "rgba(255, 255, 255, 0.9)",
              }}
            />
          </button>
        </div>

        {/* 제목 (클릭 시 드롭다운) */}
        <div
          onClick={handleTitleClick}
          style={{
            fontSize: "inherit",
            fontWeight: "inherit",
            color: "white",
            width: "100%",
            lineHeight: "1.1",
            cursor: event.extendedProps?.isNewEvent ? "pointer" : "default",
            textDecoration: event.extendedProps?.isNewEvent
              ? "underline"
              : "none",
          }}
          title={event.extendedProps?.isNewEvent ? "유형 선택" : undefined}
        >
          {event.title}
        </div>
      </div>
    );
  };

  const eventContent = (arg: any): JSX.Element => (
    <SimpleEvent event={arg.event} />
  );

  // 게이지 컴포넌트
  const WorkTimeGauge = ({
    percentage,
    totalHours,
    averageHours,
  }: {
    percentage: number;
    totalHours: number;
    averageHours: number;
  }): JSX.Element => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getGaugeColor = (p: number): string => {
      if (p >= 80) return "#10b981";
      if (p >= 60) return "#f59e0b";
      return "#ef4444";
    };

    return (
      <div className="flex items-center space-x-4">
        <div className="relative">
          <svg width="80" height="80" className="transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={getGaugeColor(percentage)}
              strokeWidth="6"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-700">
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-600 mb-1">이번주 근무 시간</div>
          <div className="text-2xl font-bold text-gray-800 mb-1">
            {totalHours}시간
          </div>
          <div className="text-xs text-gray-500">
            평균 {averageHours}시간 대비
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="-mt-16">
      {/* Date Navigation and Work Time Summary Row */}
      <div className="flex items-start justify-between mb-2">
        <div className="w-80 flex-shrink-0"></div>
        <div className="flex-1 flex justify-center items-center space-x-4 mt-2">
          <DateNavigation
            currentPeriod={currentWeek}
            onPrevious={handlePreviousWeek}
            onNext={handleNextWeek}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleApplyWorkPolicy}
            disabled={isApplyingWorkPolicy}
            className="flex items-center space-x-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 disabled:opacity-50"
          >
            <RotateCcw
              className={`w-4 h-4 ${
                isApplyingWorkPolicy ? "animate-spin" : ""
              }`}
            />
            <span>
              {isApplyingWorkPolicy ? "적용 중..." : "근무표 새로고침"}
            </span>
          </Button>
        </div>
        <div className="w-80 flex-shrink-0 -mt-6">
          <GlassCard className="p-4 border-2 border-gray-300 shadow-none">
            <div className="flex items-center space-x-3 mb-3"></div>
            <WorkTimeGauge
              percentage={workTimeSummary.percentage}
              totalHours={workTimeSummary.totalHours}
              averageHours={workTimeSummary.averageHours}
            />
          </GlassCard>
        </div>
      </div>

      {/* FullCalendar Schedule */}
      <GlassCard className="p-6">
        <div className="calendar-container schedule-calendar-container">
          {isClient && (
            <ScheduleCalendar
              events={events}
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
              onSelect={handleSelect}
              onEventClick={handleEventClick}
              dayCellDidMount={dayCellDidMountHandler}
              eventContent={eventContent}
              editable={true}
              currentDate={currentMondayDate}
            />
          )}
        </div>
      </GlassCard>

      {/* 드롭다운 메뉴 */}
      {showDropdown && (
        <TitleDropdown
          eventId={dropdownEventId!}
          position={dropdownPosition}
          onSelect={handleTitleSelect}
          onClose={() => setShowDropdown(false)}
        />
      )}

      {/* 변경 사항 배너 */}
      {hasPendingChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 border-t border-yellow-200 p-4 z-50">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="text-gray-800 font-medium">
              변경 사항이 있습니다. 근무 변경을 신청하시겠습니까?
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancelChanges}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmitChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                변경 신청
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
