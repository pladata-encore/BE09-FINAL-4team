# Attendance Service

근태 관리 서비스 API 클라이언트입니다.

## 개요

Attendance Service는 다음과 같은 기능을 제공합니다:

- **출근/퇴근 관리**: 체크인, 체크아웃, 근무 상태 기록
- **근무 스케줄 관리**: 스케줄 생성, 조회, 수정, 삭제
- **근무 정책 관리**: 근무 정책 생성, 조회
- **연차 정책 관리**: 연차 정책 CRUD
- **휴가 신청 관리**: 휴가 신청 생성, 조회, 수정
- **근무 모니터링**: 근무 현황 조회 및 갱신

## 사용 방법

### 1. 전체 서비스 임포트

```typescript
import {
  attendanceApi,
  workScheduleApi,
  workPolicyApi,
  annualLeaveApi,
  leaveApi,
  workMonitorApi,
} from "@/lib/services/attendance";
```

### 2. 특정 API만 임포트

```typescript
import { attendanceApi } from "@/lib/services/attendance";
```

### 3. 타입만 임포트

```typescript
import {
  AttendanceStatus,
  WorkStatus,
  ScheduleType,
  AttendanceResponse,
} from "@/lib/services/attendance";
```

## API 카테고리

### Attendance API (출근/퇴근 관리)

```typescript
// 출근 체크인
const attendance = await attendanceApi.checkIn({
  userId: 1,
  checkIn: "2024-01-15T09:00:00Z",
});

// 퇴근 체크아웃
const attendance = await attendanceApi.checkOut({
  userId: 1,
  checkOut: "2024-01-15T18:00:00Z",
});

// 출근 상태 수동 기록
const attendance = await attendanceApi.markAttendanceStatus(
  1, // userId
  "2024-01-15", // date
  AttendanceStatus.REGULAR, // attendanceStatus
  true, // autoRecorded
  "2024-01-15T09:00:00Z", // checkInTime (optional)
  "2024-01-15T18:00:00Z" // checkOutTime (optional)
);

// 근무 상태 수동 기록
const attendance = await attendanceApi.markWorkStatus(
  1, // userId
  "2024-01-15", // date
  WorkStatus.REMOTE, // workStatus
  true, // autoRecorded
  "2024-01-15T09:00:00Z", // checkInTime (optional)
  "2024-01-15T18:00:00Z" // checkOutTime (optional)
);

// 주간 근무 조회
const weeklyWork = await attendanceApi.getWeeklyAttendance(1, "2024-01-15");

// 이번 주 근무 조회
const thisWeekWork = await attendanceApi.getThisWeekAttendance(1);

// 출근 가능 시간 조회
const availableTime = await attendanceApi.getCheckInAvailableTime(1);
```

### Work Schedule API (근무 스케줄 관리)

```typescript
// 스케줄 생성
const schedule = await workScheduleApi.createSchedule({
  userId: 1,
  title: "회의",
  startDate: "2024-01-15",
  endDate: "2024-01-15",
  startTime: { hour: 14, minute: 0, second: 0, nano: 0 },
  endTime: { hour: 15, minute: 0, second: 0, nano: 0 },
  scheduleType: ScheduleType.WORK,
});

// 사용자 스케줄 조회
const schedules = await workScheduleApi.getUserSchedules(1);

// 날짜 범위로 스케줄 조회
const schedules = await workScheduleApi.getUserSchedulesByDateRange(
  1, // userId
  "2024-01-01", // startDate
  "2024-01-31" // endDate
);

// 스케줄 수정
const updatedSchedule = await workScheduleApi.updateSchedule(
  1, // userId
  123, // scheduleId
  {
    title: "수정된 회의",
    startDate: "2024-01-15",
    endDate: "2024-01-15",
    scheduleType: ScheduleType.WORK,
  }
);

// 스케줄 삭제
await workScheduleApi.deleteSchedule(1, 123);

// 고정 스케줄 생성
const fixedSchedules = await workScheduleApi.createFixedSchedules(
  1, // userId
  "2024-01-01", // startDate
  "2024-01-31" // endDate
);

// 근무 정책 적용
const schedules = await workScheduleApi.applyWorkPolicyToSchedule(
  1, // userId
  "2024-01-01", // startDate
  "2024-01-31" // endDate
);

// 사용자 근무 정책 조회
const userWorkPolicy = await workScheduleApi.getUserWorkPolicy(1);

// 동료 스케줄 조회
const colleagueSchedule = await workScheduleApi.getColleagueSchedule(
  2, // colleagueId
  "2024-01-01", // startDate
  "2024-01-31" // endDate
);

// 근무 시간 조정
const adjustment = await workScheduleApi.createWorkTimeAdjustment({
  userId: 1,
  adjustDate: "2024-01-15",
  adjustType: "OVERTIME",
  startTime: { hour: 18, minute: 0, second: 0, nano: 0 },
  endTime: { hour: 20, minute: 0, second: 0, nano: 0 },
  reason: "긴급 업무",
});
```

### Work Policy API (근무 정책 관리)

```typescript
// 전체 근무 정책 목록 조회
const policies = await workPolicyApi.getAllWorkPolicies();

// 근무 정책 조회 (ID)
const policy = await workPolicyApi.getWorkPolicyById(1);

// 근무 정책 생성
const newPolicy = await workPolicyApi.createWorkPolicy({
  name: "기본 근무 정책",
  type: WorkPolicyType.FIXED,
  workDays: [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
  ],
  workHours: 8,
  workMinutes: 0,
  totalRequiredMinutes: 480,
});
```

### Annual Leave API (연차 정책 관리)

```typescript
// 연차 정책 조회 (ID)
const annualLeave = await annualLeaveApi.getAnnualLeaveById(1);

// 연차 정책 수정
const updatedAnnualLeave = await annualLeaveApi.updateAnnualLeave(1, {
  name: "수정된 연차 정책",
  leaveDays: 20,
});

// 연차 정책 삭제
await annualLeaveApi.deleteAnnualLeave(1);

// 근무 정책별 연차 정책 목록 조회
const annualLeaves = await annualLeaveApi.getAnnualLeavesByWorkPolicyId(1);

// 연차 정책 생성
const newAnnualLeave = await annualLeaveApi.createAnnualLeave(1, {
  name: "신입 연차 정책",
  minYears: 0,
  maxYears: 1,
  leaveDays: 15,
  holidayDays: 0,
});

// 근무 정책별 총 연차 일수 계산
const totalLeaveDays = await annualLeaveApi.calculateTotalLeaveDays(1);

// 근무 정책별 총 휴일 일수 계산
const totalHolidayDays = await annualLeaveApi.calculateTotalHolidayDays(1);
```

### Leave API (휴가 신청 관리)

```typescript
// 휴가 신청 생성
const leaveRequest = await leaveApi.createLeaveRequest({
  employeeId: 1,
  leaveType: LeaveType.BASIC_ANNUAL,
  startDate: "2024-01-15",
  endDate: "2024-01-16",
  reason: "개인 휴가",
});

// 휴가 신청 조회
const leaveRequest = await leaveApi.getLeaveRequest(123);

// 휴가 신청 수정
const updatedLeaveRequest = await leaveApi.modifyLeaveRequest(123, {
  employeeId: 1,
  leaveType: LeaveType.BASIC_ANNUAL,
  startDate: "2024-01-15",
  endDate: "2024-01-17",
  reason: "수정된 휴가 사유",
});
```

### Work Monitor API (근무 모니터링)

```typescript
// 특정 날짜 근무 모니터링 조회
const workMonitor = await workMonitorApi.getWorkMonitorByDate("2024-01-15");

// 오늘 근무 모니터링 조회
const todayMonitor = await workMonitorApi.getTodayWorkMonitor();

// 특정 날짜 근무 모니터링 데이터 갱신
const updatedMonitor = await workMonitorApi.updateWorkMonitorData("2024-01-15");

// 오늘 근무 모니터링 데이터 갱신
const updatedTodayMonitor = await workMonitorApi.updateTodayWorkMonitorData();
```

## 열거형 (Enums)

### AttendanceStatus (출근 상태)

- `NOT_CLOCKIN`: 미출근
- `REGULAR`: 정상 출근
- `LATE`: 지각
- `ABSENT`: 결근

### WorkStatus (근무 상태)

- `OFFICE`: 사무실 근무
- `REMOTE`: 재택 근무
- `BUSINESS_TRIP`: 출장
- `OUT_OF_OFFICE`: 외근
- `VACATION`: 휴가
- `SICK_LEAVE`: 병가
- `EARLY_LEAVE`: 조퇴

### ScheduleType (스케줄 타입)

- `WORK`: 근무
- `SICK_LEAVE`: 병가
- `VACATION`: 휴가
- `BUSINESS_TRIP`: 출장
- `OUT_OF_OFFICE`: 외근
- `OVERTIME`: 야근

### WorkPolicyType (근무 정책 타입)

- `FIXED`: 고정 근무
- `SHIFT`: 교대 근무
- `FLEXIBLE`: 유연 근무
- `OPTIONAL`: 선택 근무

### LeaveType (휴가 타입)

- `BASIC_ANNUAL`: 기본 연차
- `COMPENSATION_ANNUAL`: 보상 연차
- `SPECIAL_ANNUAL`: 특별 연차

## 에러 처리

모든 API 함수는 에러가 발생할 경우 예외를 던집니다. 적절한 에러 처리를 위해 try-catch 블록을 사용하세요:

```typescript
try {
  const attendance = await attendanceApi.checkIn({
    userId: 1,
    checkIn: "2024-01-15T09:00:00Z",
  });
  console.log("출근 기록 성공:", attendance);
} catch (error) {
  console.error("출근 기록 실패:", error);
}
```

## Employee Leave Balance API

직원 연차 잔액 관리 관련 API들입니다.

### 사용 예시

```typescript
import { employeeLeaveBalanceApi, LeaveType } from '@/lib/services/attendance'

// 연차 자동 부여
const grantedLeaves = await employeeLeaveBalanceApi.grantAnnualLeave(123, '2024-01-01')

// 특정 타입 잔여 연차 조회
const remainingDays = await employeeLeaveBalanceApi.getRemainingLeave(123, LeaveType.BASIC_ANNUAL)

// 전체 잔여 연차 조회
const totalRemaining = await employeeLeaveBalanceApi.getTotalRemainingLeave(123)

// 연차 잔액 상세 조회
const leaveBalances = await employeeLeaveBalanceApi.getLeaveBalances(123)

// 연차 잔액 요약 조회
const summary = await employeeLeaveBalanceApi.getLeaveBalanceSummary(123)

// 연차 초기화 및 재부여
const resetLeaves = await employeeLeaveBalanceApi.resetAndGrantAnnualLeave(123, '2024-01-01')

// 연차 복구
const restoreResult = await employeeLeaveBalanceApi.restoreLeave(123, LeaveType.BASIC_ANNUAL, 3)

// 전체 직원 연차 초기화 (관리자 전용)
const resetAllResult = await employeeLeaveBalanceApi.resetAllEmployeesAnnualLeave('2024-01-01')
```

## 타입 안전성

모든 API 함수는 TypeScript 타입을 제공하여 컴파일 타임에 타입 안전성을 보장합니다. IDE에서 자동완성과 타입 체크를 활용할 수 있습니다.
