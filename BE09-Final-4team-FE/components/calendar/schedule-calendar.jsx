// components/calendar/schedule-calendar.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function ScheduleCalendar({
  events,
  onEventDrop,
  onEventResize,
  onSelect,
  onEventClick,
  dayCellDidMount,
  eventContent,
  editable = true,
  currentDate, // 현재 표시할 날짜 (주차 변경 시 사용)
}) {
  const [isMounted, setIsMounted] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => setIsMounted(true), []);

  // currentDate가 변경되면 캘린더 날짜 업데이트
  useEffect(() => {
    if (isMounted && calendarRef.current && currentDate) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(currentDate);
    }
  }, [currentDate, isMounted]);

  if (!isMounted) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">캘린더 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-calendar">
      <style jsx global>{`
        /* 일요일 강조 예시 */
        .fc-day-sun .fc-col-header-cell-cushion {
          color: red !important;
        }
        .fc-day-sun .fc-timegrid-col-frame {
          background-color: rgba(255, 0, 0, 0.05) !important;
        }
        .fc-day-sun .fc-timegrid-slot {
          background-color: rgba(255, 0, 0, 0.03) !important;
        }

        /* 종일 휴식 밴드 예시 */
        .fc-event.allday-rest {
          position: absolute !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
          z-index: 10 !important;
          background: rgba(255, 99, 132, 0.8) !important;
          border: 2px solid rgba(255, 99, 132, 1) !important;
        }

        /* 코어타임 스타일링 */
        .fc-event.coretime {
          background: rgba(40, 167, 69, 0.9) !important;
          border: 2px solid #28a745 !important;
          color: white !important;
          font-weight: bold !important;
        }

        .fc-event.coretime .fc-event-title {
          font-size: 0.85em !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
        }

        /* 일반 근무 시간 스타일 */
        .fc-event.work {
          background: rgba(59, 130, 246, 0.9) !important;
          border: 2px solid #3b82f6 !important;
          color: white !important;
        }

        /* 휴게시간 스타일 */
        .fc-event.resttime {
          background: rgba(255, 193, 7, 0.9) !important;
          border: 2px solid #ffc107 !important;
          color: #212529 !important;
          font-weight: 500 !important;
        }

        /* 병가 스타일 */
        .fc-event.sick_leave {
          background: rgba(220, 53, 69, 0.9) !important;
          border: 2px solid #dc3545 !important;
          color: white !important;
        }

        /* 휴가 스타일 */
        .fc-event.vacation {
          background: rgba(253, 126, 20, 0.9) !important;
          border: 2px solid #fd7e14 !important;
          color: white !important;
        }

        /* 출장 스타일 */
        .fc-event.business_trip {
          background: rgba(111, 66, 193, 0.9) !important;
          border: 2px solid #6f42c1 !important;
          color: white !important;
        }

        /* 외근 스타일 */
        .fc-event.out_of_office {
          background: rgba(32, 201, 151, 0.9) !important;
          border: 2px solid #20c997 !important;
          color: white !important;
        }

        /* 초과근무 스타일 */
        .fc-event.overtime {
          background: rgba(232, 62, 140, 0.9) !important;
          border: 2px solid #e83e8c !important;
          color: white !important;
        }

        /* 재택근무 스타일 */
        .fc-event.remote {
          background: rgba(108, 117, 125, 0.9) !important;
          border: 2px solid #6c757d !important;
          color: white !important;
        }
      `}</style>

      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={false}
        height="auto"
        date={currentDate} // 현재 표시할 날짜 설정
        /* 데이터 및 상호작용 핸들러 */
        events={events}
        editable={editable}
        eventStartEditable={editable}
        eventDurationEditable={editable}
        eventResizableFromStart={true}
        droppable={editable}
        eventDrop={onEventDrop}
        eventResize={onEventResize}
        select={onSelect}
        eventClick={onEventClick}
        dayCellDidMount={dayCellDidMount}
        eventContent={eventContent}
        /* 이벤트 CSS 클래스 설정 */
        eventClassNames={(arg) => {
          const scheduleType = arg.event.extendedProps?.type;
          if (scheduleType) {
            return [scheduleType.toLowerCase()];
          }
          return [];
        }}
        /* 타임그리드 설정 */
        slotMinTime="08:00:00"
        slotMaxTime="24:00:00"
        allDaySlot={false}
        slotDuration="00:30:00"
        slotLabelInterval="01:00"
        dayHeaderFormat={{ weekday: "short", day: "numeric" }}
        firstDay={0}
        weekends={true}
        nowIndicator={true}
        selectable={editable}
        selectMirror={editable}
        selectConstraint={{
          daysOfWeek: [1, 2, 3, 4, 5, 6], // 월~토만 선택 가능 (일요일 제외)
        }}
        eventConstraint={{
          daysOfWeek: [1, 2, 3, 4, 5, 6], // 월~토만 이벤트 이동 가능 (일요일 제외)
        }}
        dayMaxEvents={true}
        moreLinkClick="popover"
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
        slotLabelFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
        eventDisplay="block"
        /* 겹침 제어: '휴게' 또는 type==='break' 만 겹치기 허용 */
        eventOverlap={(stillEvent, movingEvent) => {
          const aTitle = stillEvent.title;
          const bTitle = movingEvent.title;
          const aType = stillEvent.extendedProps?.type;
          const bType = movingEvent.extendedProps?.type;
          return (
            aTitle === "휴게" ||
            bTitle === "휴게" ||
            aTitle === "휴게시간" ||
            bTitle === "휴게시간" ||
            aType === "break" ||
            bType === "break" ||
            aType === "RESTTIME" ||
            bType === "RESTTIME" ||
            aType === "CORETIME" ||
            bType === "CORETIME" ||
            aTitle === "코어타임" ||
            bTitle === "코어타임"
          );
        }}
        slotEventOverlap={true}
        /* 마운트 시 공통 스타일 */
        eventDidMount={(info) => {
          info.el.style.borderRadius = "12px";
          info.el.style.fontWeight = "700";
          info.el.style.fontSize = "12px";
          info.el.style.padding = "6px 10px";

          if (info.event.extendedProps?.isAllDayRest) {
            info.el.classList.add("allday-rest");
            info.el.style.height = "100%";
            info.el.style.top = "0";
            info.el.style.bottom = "0";
          }

          const isBreak =
            info.event.title === "휴게" ||
            info.event.title === "휴게시간" ||
            info.event.extendedProps?.type === "break" ||
            info.event.extendedProps?.type === "RESTTIME";

          if (isBreak) {
            info.el.style.boxShadow = "0 6px 16px rgba(0,0,0,.18)";
            // 위치 계산 이후 보정: 다음 프레임에서 DOM 조정
            requestAnimationFrame(() => {
              const harness = info.el.closest(".fc-timegrid-event-harness");
              if (harness) {
                harness.style.removeProperty("left");
                harness.style.removeProperty("right");
                harness.style.removeProperty("width");
                harness.style.removeProperty("transform");
                harness.style.removeProperty("margin-left");

                harness.style.setProperty("left", "0", "important");
                harness.style.setProperty("right", "0", "important");
                harness.style.setProperty("width", "100%", "important");
                harness.style.setProperty("transform", "none", "important");
                harness.style.setProperty("z-index", "60", "important");

                const inset = harness.querySelector(
                  ".fc-timegrid-event-harness-inset"
                );
                if (inset) {
                  inset.style.removeProperty("left");
                  inset.style.removeProperty("right");
                  inset.style.removeProperty("width");
                  inset.style.removeProperty("transform");
                  inset.style.removeProperty("margin-left");

                  inset.style.setProperty("left", "0", "important");
                  inset.style.setProperty("right", "0", "important");
                  inset.style.setProperty("width", "100%", "important");
                  inset.style.setProperty("transform", "none", "important");
                }
              }

              info.el.style.setProperty("left", "0", "important");
              info.el.style.setProperty("right", "0", "important");
              info.el.style.setProperty("width", "100%", "important");
            });
          }
        }}
        /* 위치 계산이 끝난 직후 최종 보정 */
        eventPositioned={(info) => {
          const isBreak =
            info.event.title === "휴게" ||
            info.event.title === "휴게시간" ||
            info.event.extendedProps?.type === "break" ||
            info.event.extendedProps?.type === "RESTTIME";
          if (!isBreak) {
            // 겹치는 이벤트 묶음을 좌우 한정에서 가운데 정렬
            requestAnimationFrame(() => {
              const harness = info.el.closest(".fc-timegrid-event-harness");
              if (!harness) return;
              const col =
                harness.closest(".fc-timegrid-col-frame") ||
                harness.closest(".fc-timegrid-col");
              if (!col) return;

              // 초기 transform 제거 후 측정
              const resetTransform = (el) => {
                el.style.transform = "";
              };
              resetTransform(harness);

              const colRect = col.getBoundingClientRect();
              const allHarness = Array.from(
                col.querySelectorAll(".fc-timegrid-event-harness")
              );
              const myRect = harness.getBoundingClientRect();

              // 같은 세로 구간과 겹치는 하네스들만 그룹핑
              const group = allHarness.filter((h) => {
                const r = h.getBoundingClientRect();
                const vertOverlap = !(
                  r.bottom <= myRect.top || r.top >= myRect.bottom
                );
                return vertOverlap;
              });
              if (group.length <= 1) return;

              // 그룹의 좌우 범위 계산
              let minLeft = Infinity;
              let maxRight = -Infinity;
              group.forEach((h) => {
                const r = h.getBoundingClientRect();
                const left = r.left - colRect.left;
                const right = r.right - colRect.left;
                if (left < minLeft) minLeft = left;
                if (right > maxRight) maxRight = right;
              });
              const groupWidth = maxRight - minLeft;
              const containerWidth = colRect.width;
              if (groupWidth >= containerWidth) return;

              const offset = (containerWidth - groupWidth) / 2 - minLeft; // px 기준 가운데 보정

              // 그룹 전체에 동일 오프셋 적용
              group.forEach((h) => {
                // 기존 transform 제거 후 적용해 누적 방지
                h.style.transform = `translateX(${offset}px)`;
              });
            });
          } else {
            // 휴게는 풀폭 유지
            const harness = info.el.closest(".fc-timegrid-event-harness");
            if (harness) {
              harness.style.setProperty("left", "0", "important");
              harness.style.setProperty("right", "0", "important");
              harness.style.setProperty("width", "100%", "important");
              harness.style.setProperty("transform", "none", "important");
            }
            info.el.style.setProperty("left", "0", "important");
            info.el.style.setProperty("right", "0", "important");
            info.el.style.setProperty("width", "100%", "important");
          }
        }}
      />
    </div>
  );
}
