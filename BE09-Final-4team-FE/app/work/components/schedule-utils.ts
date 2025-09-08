// Backend ScheduleType(enum) → 한글 라벨 매핑
export const SCHEDULE_TYPE_LABEL: Record<string, string> = {
  WORK: "근무",
  CORETIME: "코어타임",
  SICK_LEAVE: "병가",
  VACATION: "휴가",
  BUSINESS_TRIP: "출장",
  OUT_OF_OFFICE: "외근",
  OVERTIME: "초과근무",
  RESTTIME: "휴게시간",
  REMOTE: "재택", // CoworkerComponent에서 사용
};

// Backend ScheduleType(enum) → 색상 매핑 (모두 구분 가능한 색상)
export const SCHEDULE_TYPE_COLOR: Record<string, string> = {
  WORK: "#3B82F6", // 파란색 (기본 근무)
  CORETIME: "#28A745", // 진한 초록색 (코어타임)
  RESTTIME: "#FFC107", // 노란색 (휴게시간)
  SICK_LEAVE: "#DC3545", // 빨간색 (병가)
  VACATION: "#FD7E14", // 주황색 (휴가)
  BUSINESS_TRIP: "#6F42C1", // 보라색 (출장)
  OUT_OF_OFFICE: "#20C997", // 청록색 (외근)
  OVERTIME: "#E83E8C", // 핑크색 (초과근무)
  REMOTE: "#6C757D", // 회색 (재택)
};

// ScheduleType → 한글 라벨 변환 함수
export const toLabelFromEnum = (
  scheduleType?: string,
  fallback?: string
): string => {
  if (!scheduleType) return fallback || "";
  return SCHEDULE_TYPE_LABEL[scheduleType] || fallback || scheduleType;
};

// ScheduleType → 색상 변환 함수
export const toColorFromEnum = (
  scheduleType?: string,
  fallback?: string
): string => {
  if (!scheduleType) return fallback || "#4FC3F7";
  return SCHEDULE_TYPE_COLOR[scheduleType] || fallback || "#4FC3F7";
};

// 시간 변환 함수 (LocalTime 객체 또는 문자열 → HH:mm:ss)
export const toTimeString = (
  t?: string | { hour: number; minute: number; second: number }
): string => {
  if (!t) return "00:00:00";
  if (typeof t === "string") return t; // "09:00:00" 형태
  const hh = String(t.hour).padStart(2, "0");
  const mm = String(t.minute).padStart(2, "0");
  const ss = String(t.second).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};
