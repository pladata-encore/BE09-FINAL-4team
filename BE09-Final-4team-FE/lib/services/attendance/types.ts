// Attendance Service Types

// LocalTime 타입
export interface LocalTime {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

// 출근 상태 열거형
export enum AttendanceStatus {
  NOT_CLOCKIN = "NOT_CLOCKIN",
  REGULAR = "REGULAR",
  LATE = "LATE",
  ABSENT = "ABSENT",
}

// 근무 상태 열거형
export enum WorkStatus {
  OFFICE = "OFFICE",
  REMOTE = "REMOTE",
  BUSINESS_TRIP = "BUSINESS_TRIP",
  OUT_OF_OFFICE = "OUT_OF_OFFICE",
  VACATION = "VACATION",
  SICK_LEAVE = "SICK_LEAVE",
  EARLY_LEAVE = "EARLY_LEAVE",
}

// 스케줄 타입 열거형
export enum ScheduleType {
  WORK = "WORK",
  SICK_LEAVE = "SICK_LEAVE",
  VACATION = "VACATION",
  BUSINESS_TRIP = "BUSINESS_TRIP",
  OUT_OF_OFFICE = "OUT_OF_OFFICE",
  OVERTIME = "OVERTIME",
  RESTTIME = "RESTTIME",
}

// 근무 정책 타입 열거형
export enum WorkPolicyType {
  FIXED = "FIXED",
  SHIFT = "SHIFT",
  FLEXIBLE = "FLEXIBLE",
  OPTIONAL = "OPTIONAL",
}

// 요일 열거형
export enum DayOfWeek {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

// 근무 사이클 열거형
export enum WorkCycle {
  ONE_WEEK = "ONE_WEEK",
  TWO_WEEKS = "TWO_WEEKS",
  THREE_WEEKS = "THREE_WEEKS",
  FOUR_WEEKS = "FOUR_WEEKS",
  ONE_MONTH = "ONE_MONTH",
}

// 휴가 타입 열거형
export enum LeaveType {
  BASIC_ANNUAL = "BASIC_ANNUAL",
  COMPENSATION_ANNUAL = "COMPENSATION_ANNUAL",
  SPECIAL_ANNUAL = "SPECIAL_ANNUAL",
}

// 출근 응답 타입
export interface AttendanceResponse {
  id: number;
  userId: number;
  date: string;
  checkIn?: string;
  checkOut?: string;
  attendanceStatus: AttendanceStatus;
  workStatus: WorkStatus;
  autoRecorded: boolean;
}

// 출근 체크인 요청 타입
export interface CheckInRequest {
  userId: number;
  checkIn: string;
}

// 출근 체크아웃 요청 타입
export interface CheckOutRequest {
  userId: number;
  checkOut: string;
}

// 스케줄 응답 타입
export interface ScheduleResponseDto {
  id: number;
  userId: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime?: LocalTime;
  endTime?: LocalTime;
  scheduleType: ScheduleType;
  color?: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurrencePattern?: string;
  recurrenceInterval?: number;
  recurrenceDays?: string[];
  recurrenceEndDate?: string;
  workPolicyId?: number;
  priority?: number;
  location?: string;
  attendees?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  isFixed: boolean;
  isEditable: boolean;
  fixedReason?: string;
}

// 스케줄 생성 요청 타입
export interface CreateScheduleRequestDto {
  userId: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime?: string; // HH:mm:ss
  endTime?: string; // HH:mm:ss
  scheduleType: ScheduleType;
  color?: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurrencePattern?: string;
  recurrenceInterval?: number;
  recurrenceDays?: string[];
  recurrenceEndDate?: string;
  workPolicyId?: number;
  priority?: number;
  location?: string;
  attendees?: string[];
  notes?: string;
}

// 스케줄 수정 요청 타입
export interface UpdateScheduleRequestDto {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime?: string; // HH:mm:ss
  endTime?: string; // HH:mm:ss
  scheduleType: ScheduleType;
  color?: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurrencePattern?: string;
  recurrenceInterval?: number;
  recurrenceDays?: string[];
  recurrenceEndDate?: string;
  workPolicyId?: number;
  priority?: number;
  location?: string;
  attendees?: string[];
  notes?: string;
}

// 근무 정책 응답 타입
export interface WorkPolicyResponseDto {
  id: number;
  name: string;
  type: WorkPolicyType;
  workCycle?: WorkCycle;
  startDayOfWeek?: DayOfWeek;
  workCycleStartDay?: number;
  workDays: DayOfWeek[];
  weeklyWorkingDays: number;
  startTime?: LocalTime;
  startTimeEnd?: LocalTime;
  workHours: number;
  workMinutes: number;
  coreTimeStart?: LocalTime;
  coreTimeEnd?: LocalTime;
  breakStartTime?: LocalTime;
  breakEndTime?: LocalTime;
  breakMinutes?: number;
  avgWorkTime?: LocalTime;
  totalRequiredMinutes: number;
  holidayDays?: DayOfWeek[];
  holidays?: string[];
  isHolidayFixed?: boolean;
  isBreakFixed?: boolean;
  annualLeaves?: AnnualLeaveResponseDto[];
  createdAt: string;
  updatedAt: string;
  totalWorkMinutes: number;
  isCompliantWithLaborLaw: boolean;
  isOptionalWork: boolean;
  isShiftWork: boolean;
  isFlexibleWork: boolean;
  isFixedWork: boolean;
}

// 근무 정책 요청 타입
export interface WorkPolicyRequestDto {
  name: string;
  type: WorkPolicyType;
  workCycle?: WorkCycle;
  startDayOfWeek?: DayOfWeek;
  workCycleStartDay?: number;
  workDays: DayOfWeek[];
  weeklyWorkingDays?: number;
  startTime?: LocalTime;
  startTimeEnd?: LocalTime;
  workHours: number;
  workMinutes: number;
  coreTimeStart?: LocalTime;
  coreTimeEnd?: LocalTime;
  breakStartTime?: LocalTime;
  avgWorkTime?: LocalTime;
  totalRequiredMinutes: number;
  annualLeaves?: AnnualLeaveRequestDto[];
}

// 연차 정책 응답 타입
export interface AnnualLeaveResponseDto {
  id: number;
  workPolicyId: number;
  name: string;
  minYears: number;
  maxYears: number;
  leaveDays: number;
  holidayDays: number;
  rangeDescription: string;
  createdAt: string;
  updatedAt: string;
}

// 연차 정책 요청 타입
export interface AnnualLeaveRequestDto {
  name: string;
  minYears: number;
  maxYears: number;
  leaveDays: number;
  holidayDays: number;
}

// 연차 정책 수정 타입
export interface AnnualLeaveUpdateDto {
  name?: string;
  minYears?: number;
  maxYears?: number;
  leaveDays?: number;
  holidayDays?: number;
}

// 휴가 신청 응답 타입
export interface LeaveRequestResponseDto {
  requestId: number;
  employeeId: number;
  employeeName: string;
  leaveType: LeaveType;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  startTime?: LocalTime;
  endTime?: LocalTime;
  totalDays: number;
  totalHours: number;
  reason: string;
  status: string;
  statusName: string;
  approverId?: number;
  approverName?: string;
  requestedAt: string;
  approvedAt?: string;
}

// 휴가 신청 생성 타입
export interface CreateLeaveRequestDto {
  employeeId: number;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  startTime?: LocalTime;
  endTime?: LocalTime;
  reason: string;
}

// 근무 모니터링 타입
export interface WorkMonitorDto {
  id: number;
  date: string;
  totalEmployees: number;
  attendanceCount: number;
  lateCount: number;
  vacationCount: number;
}

// 근무 시간 조정 요청 타입
export interface AdjustWorkTimeRequestDto {
  userId: number;
  adjustDate: string;
  adjustType: string;
  startTime: LocalTime;
  endTime: LocalTime;
  reason: string;
  description?: string;
}

// 근무 시간 조정 응답 타입
export interface WorkTimeAdjustment {
  id: number;
  userId: number;
  adjustDate: string;
  adjustType: string;
  startTime: LocalTime;
  endTime: LocalTime;
  reason: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  workMinutes: number;
  workHours: number;
}

// 사용자 근무 정책 타입
export interface UserWorkPolicyDto {
  workPolicyId: number;
  workPolicy: WorkPolicyDto;
}

// 근무 정책 DTO 타입
export interface WorkPolicyDto {
  id: number;
  name: string;
  type: string;
  workCycle?: string;
  startDayOfWeek?: string;
  workCycleStartDay?: number;
  workDays: string[];
  holidayDays?: string[];
  weeklyWorkingDays: number;
  startTime?: LocalTime;
  startTimeEnd?: LocalTime;
  workHours: number;
  workMinutes: number;
  coreTimeStart?: LocalTime;
  coreTimeEnd?: LocalTime;
  breakStartTime?: LocalTime;
  breakEndTime?: LocalTime;
  breakMinutes?: number;
  avgWorkTime?: LocalTime;
  totalRequiredMinutes: number;
  holidays?: string[];
  isHolidayFixed?: boolean;
  isBreakFixed?: boolean;
}

// 동료 스케줄 응답 타입
export interface ColleagueScheduleResponseDto {
  colleagueId: number;
  colleagueName: string;
  colleaguePosition: string;
  colleagueDepartment: string;
  colleagueAvatar: string;
  startDate: string;
  endDate: string;
  dailySchedules: DailyScheduleDto[];
}

// 일일 스케줄 타입
export interface DailyScheduleDto {
  date: string;
  dayOfWeek: string;
  events: ScheduleEventDto[];
}

// 스케줄 이벤트 타입
export interface ScheduleEventDto {
  scheduleId: number;
  startTime: LocalTime;
  endTime: LocalTime;
  scheduleType: string;
}

// 일일 근무 요약 타입
export interface DailyWorkSummary {
  date: string;
  attendanceStatus: string;
  workStatus: string;
  workHours: number;
  workMinutes: number;
  checkInTime: string;
  checkOutTime: string;
  workDuration: string;
}

// 주간 근무 상세 타입
export interface WeeklyWorkDetail {
  userId: number;
  weekStart: string;
  weekEnd: string;
  dailySummaries: DailyWorkSummary[];
}

// API 응답 래퍼 타입들
export interface ApiResult<T> {
  status: string;
  message: string;
  data: T;
}

// 직원 연차 잔액 응답 타입
export interface EmployeeLeaveBalanceResponseDto {
  id: number;
  employeeId: number;
  leaveType: LeaveType;
  grantedDays: number;
  usedDays: number;
  remainingDays: number;
  grantedAt?: string;
  updatedAt?: string;
}

// 직원 연차 잔액 요약 타입
export interface EmployeeLeaveBalanceSummaryDto {
  totalGrantedDays: number;
  totalUsedDays: number;
  totalRemainingDays: number;
}
