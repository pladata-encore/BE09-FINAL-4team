import apiClient from "../common/api-client";
import {
  // Types
  AttendanceResponse,
  CheckInRequest,
  CheckOutRequest,
  ScheduleResponseDto,
  CreateScheduleRequestDto,
  UpdateScheduleRequestDto,
  WorkPolicyResponseDto,
  WorkPolicyRequestDto,
  AnnualLeaveResponseDto,
  AnnualLeaveRequestDto,
  AnnualLeaveUpdateDto,
  LeaveRequestResponseDto,
  CreateLeaveRequestDto,
  WorkMonitorDto,
  AdjustWorkTimeRequestDto,
  WorkTimeAdjustment,
  UserWorkPolicyDto,
  ColleagueScheduleResponseDto,
  WeeklyWorkDetail,
  EmployeeLeaveBalanceResponseDto,
  EmployeeLeaveBalanceSummaryDto,
  ApiResult,
  // Enums
  AttendanceStatus,
  WorkStatus,
  LeaveType,
} from "./types";

// Attendance API
export const attendanceApi = {
  // 출근 체크인
  checkIn: async (request: CheckInRequest): Promise<AttendanceResponse> => {
    const response = await apiClient.post<ApiResult<AttendanceResponse>>(
      "/api/attendance/check-in",
      request
    );
    const result = response.data;
    if (!result?.data) {
      const msg = result?.message || "출근 실패";
      throw { message: msg, data: result };
    }
    return result.data;
  },

  // 퇴근 체크아웃
  checkOut: async (request: CheckOutRequest): Promise<AttendanceResponse> => {
    const response = await apiClient.post<ApiResult<AttendanceResponse>>(
      "/api/attendance/check-out",
      request
    );
    const result = response.data;
    if (!result?.data) {
      const msg = result?.message || "퇴근 실패";
      throw { message: msg, data: result };
    }
    return result.data;
  },

  // 출근 상태 기록
  markAttendanceStatus: async (
    userId: number,
    date: string,
    attendanceStatus: AttendanceStatus,
    autoRecorded: boolean = true,
    checkInTime?: string,
    checkOutTime?: string
  ): Promise<AttendanceResponse> => {
    const params = new URLSearchParams({
      userId: userId.toString(),
      date,
      attendanceStatus,
      autoRecorded: autoRecorded.toString(),
    });

    if (checkInTime) params.append("checkInTime", checkInTime);
    if (checkOutTime) params.append("checkOutTime", checkOutTime);

    const response = await apiClient.post<ApiResult<AttendanceResponse>>(
      `/api/attendance/attendance-status?${params}`
    );
    return response.data.data;
  },

  // 근무 상태 기록
  markWorkStatus: async (
    userId: number,
    date: string,
    workStatus: WorkStatus,
    autoRecorded: boolean = true,
    checkInTime?: string,
    checkOutTime?: string
  ): Promise<AttendanceResponse> => {
    const params = new URLSearchParams({
      userId: userId.toString(),
      date,
      workStatus,
      autoRecorded: autoRecorded.toString(),
    });

    if (checkInTime) params.append("checkInTime", checkInTime);
    if (checkOutTime) params.append("checkOutTime", checkOutTime);

    const response = await apiClient.post<ApiResult<AttendanceResponse>>(
      `/api/attendance/work-status?${params}`
    );
    return response.data.data;
  },

  // 주간 근무 조회
  getWeeklyAttendance: async (
    userId: number,
    weekStart: string
  ): Promise<WeeklyWorkDetail> => {
    const params = new URLSearchParams({
      userId: userId.toString(),
      weekStart,
    });
    const response = await apiClient.get<ApiResult<WeeklyWorkDetail>>(
      `/api/attendance/weekly?${params}`
    );
    return response.data.data;
  },

  // 이번 주 근무 조회
  getThisWeekAttendance: async (userId: number): Promise<WeeklyWorkDetail> => {
    const params = new URLSearchParams({
      userId: userId.toString(),
    });
    const response = await apiClient.get<ApiResult<WeeklyWorkDetail>>(
      `/api/attendance/weekly/this?${params}`
    );
    return response.data.data;
  },

  // 출근 가능 시간 조회
  getCheckInAvailableTime: async (
    userId: number
  ): Promise<Record<string, any>> => {
    const params = new URLSearchParams({
      userId: userId.toString(),
    });
    const response = await apiClient.get<ApiResult<Record<string, any>>>(
      `/api/attendance/check-in-available-time?${params}`
    );
    return response.data.data;
  },
};

// Work Schedule API
export const workScheduleApi = {
  // 스케줄 생성
  createSchedule: async (
    request: CreateScheduleRequestDto
  ): Promise<ScheduleResponseDto> => {
    const response = await apiClient.post<ApiResult<ScheduleResponseDto>>(
      "/api/work-schedule/schedules",
      request
    );
    const result = response.data;
    if (!result || result.status !== "success" || !result.data) {
      const msg = result?.message || "스케줄 생성 실패";
      throw { message: msg, data: result };
    }
    return result.data;
  },

  // 스케줄 조회 (사용자별)
  getUserSchedules: async (userId: number): Promise<ScheduleResponseDto[]> => {
    const response = await apiClient.get<ApiResult<ScheduleResponseDto[]>>(
      `/api/work-schedule/users/${userId}/schedules`
    );
    return response.data.data;
  },

  // 스케줄 조회 (날짜 범위)
  getUserSchedulesByDateRange: async (
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<ScheduleResponseDto[]> => {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await apiClient.get<ApiResult<ScheduleResponseDto[]>>(
      `/api/work-schedule/users/${userId}/schedules/range?${params}`
    );
    return response.data.data;
  },

  // 스케줄 조회 (ID)
  getScheduleById: async (
    userId: number,
    scheduleId: number
  ): Promise<ScheduleResponseDto> => {
    const response = await apiClient.get<ApiResult<ScheduleResponseDto>>(
      `/api/work-schedule/users/${userId}/schedules/${scheduleId}`
    );
    return response.data.data;
  },

  // 스케줄 수정
  updateSchedule: async (
    userId: number,
    scheduleId: number,
    request: UpdateScheduleRequestDto
  ): Promise<ScheduleResponseDto> => {
    const response = await apiClient.put<ApiResult<ScheduleResponseDto>>(
      `/api/work-schedule/users/${userId}/schedules/${scheduleId}`,
      request
    );
    return response.data.data;
  },

  // 스케줄 삭제
  deleteSchedule: async (userId: number, scheduleId: number): Promise<void> => {
    await apiClient.delete<ApiResult<object>>(
      `/api/work-schedule/users/${userId}/schedules/${scheduleId}`
    );
  },

  // 고정 스케줄 생성
  createFixedSchedules: async (
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<ScheduleResponseDto[]> => {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await apiClient.post<ApiResult<ScheduleResponseDto[]>>(
      `/api/work-schedule/users/${userId}/fixed-schedules?${params}`
    );
    return response.data.data;
  },

  // 근무 정책 적용
  applyWorkPolicyToSchedule: async (
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<ScheduleResponseDto[]> => {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await apiClient.post<ApiResult<ScheduleResponseDto[]>>(
      `/api/work-schedule/users/${userId}/apply-work-policy?${params}`
    );
    return response.data.data;
  },

  // 사용자 근무 정책 조회
  getUserWorkPolicy: async (userId: number): Promise<UserWorkPolicyDto> => {
    const response = await apiClient.get<ApiResult<UserWorkPolicyDto>>(
      `/api/work-schedule/users/${userId}/work-policy`
    );
    return response.data.data;
  },

  // 동료 스케줄 조회
  getColleagueSchedule: async (
    colleagueId: number,
    startDate: string,
    endDate: string
  ): Promise<ColleagueScheduleResponseDto> => {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await apiClient.get<
      ApiResult<ColleagueScheduleResponseDto>
    >(`/api/work-schedule/colleagues/${colleagueId}/schedules?${params}`);
    return response.data.data;
  },

  // 근무 시간 조정
  createWorkTimeAdjustment: async (
    request: AdjustWorkTimeRequestDto
  ): Promise<WorkTimeAdjustment> => {
    const response = await apiClient.post<ApiResult<WorkTimeAdjustment>>(
      "/api/work-schedule/work-time-adjustments",
      request
    );
    return response.data.data;
  },
};

// Work Policy API
export const workPolicyApi = {
  // 전체 근무 정책 목록 조회
  getAllWorkPolicies: async (): Promise<WorkPolicyResponseDto[]> => {
    const response = await apiClient.get<ApiResult<WorkPolicyResponseDto[]>>(
      "/api/workpolicy"
    );
    return response.data.data;
  },

  // 근무 정책 조회 (ID)
  getWorkPolicyById: async (
    workPolicyId: number
  ): Promise<WorkPolicyResponseDto> => {
    const response = await apiClient.get<ApiResult<WorkPolicyResponseDto>>(
      `/api/workpolicy/${workPolicyId}`
    );
    return response.data.data;
  },

  // 근무 정책 생성
  createWorkPolicy: async (
    request: WorkPolicyRequestDto
  ): Promise<WorkPolicyResponseDto> => {
    const response = await apiClient.post<ApiResult<WorkPolicyResponseDto>>(
      "/api/workpolicy",
      request
    );
    return response.data.data;
  },
};

// Annual Leave API
export const annualLeaveApi = {
  // 연차 정책 조회 (ID)
  getAnnualLeaveById: async (id: number): Promise<AnnualLeaveResponseDto> => {
    const response = await apiClient.get<ApiResult<AnnualLeaveResponseDto>>(
      `/api/annual-leaves/${id}`
    );
    return response.data.data;
  },

  // 연차 정책 수정
  updateAnnualLeave: async (
    id: number,
    request: AnnualLeaveUpdateDto
  ): Promise<AnnualLeaveResponseDto> => {
    const response = await apiClient.put<ApiResult<AnnualLeaveResponseDto>>(
      `/api/annual-leaves/${id}`,
      request
    );
    return response.data.data;
  },

  // 연차 정책 삭제
  deleteAnnualLeave: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResult<object>>(`/api/annual-leaves/${id}`);
  },

  // 근무 정책별 연차 정책 목록 조회
  getAnnualLeavesByWorkPolicyId: async (
    workPolicyId: number
  ): Promise<AnnualLeaveResponseDto[]> => {
    const response = await apiClient.get<ApiResult<AnnualLeaveResponseDto[]>>(
      `/api/annual-leaves/work-policies/${workPolicyId}`
    );
    return response.data.data;
  },

  // 연차 정책 생성
  createAnnualLeave: async (
    workPolicyId: number,
    request: AnnualLeaveRequestDto
  ): Promise<AnnualLeaveResponseDto> => {
    const response = await apiClient.post<ApiResult<AnnualLeaveResponseDto>>(
      `/api/annual-leaves/work-policies/${workPolicyId}`,
      request
    );
    return response.data.data;
  },

  // 근무 정책별 총 연차 일수 계산
  calculateTotalLeaveDays: async (workPolicyId: number): Promise<number> => {
    const response = await apiClient.get<ApiResult<number>>(
      `/api/annual-leaves/work-policies/${workPolicyId}/total-leave-days`
    );
    return response.data.data;
  },

  // 근무 정책별 총 휴일 일수 계산
  calculateTotalHolidayDays: async (workPolicyId: number): Promise<number> => {
    const response = await apiClient.get<ApiResult<number>>(
      `/api/annual-leaves/work-policies/${workPolicyId}/total-holiday-days`
    );
    return response.data.data;
  },
};

// Leave API
export const leaveApi = {
  // 휴가 신청 생성
  createLeaveRequest: async (
    request: CreateLeaveRequestDto
  ): Promise<LeaveRequestResponseDto> => {
    const response = await apiClient.post<ApiResult<LeaveRequestResponseDto>>(
      "/api/leaves",
      request
    );
    return response.data.data;
  },

  // 휴가 신청 조회
  getLeaveRequest: async (
    requestId: number
  ): Promise<LeaveRequestResponseDto> => {
    const response = await apiClient.get<ApiResult<LeaveRequestResponseDto>>(
      `/api/leaves/${requestId}`
    );
    return response.data.data;
  },

  // 휴가 신청 수정
  modifyLeaveRequest: async (
    requestId: number,
    request: CreateLeaveRequestDto
  ): Promise<LeaveRequestResponseDto> => {
    const response = await apiClient.put<ApiResult<LeaveRequestResponseDto>>(
      `/api/leaves/${requestId}`,
      request
    );
    return response.data.data;
  },
};

// Work Monitor API
export const workMonitorApi = {
  // 특정 날짜 근무 모니터링 조회
  getWorkMonitorByDate: async (date: string): Promise<WorkMonitorDto> => {
    try {
      const response = await apiClient.get<ApiResult<WorkMonitorDto>>(
        `/api/work-monitor/${date}`
      );
      console.log("WorkMonitor API Response:", response.data);

      if (response.data.status !== "success" || !response.data.data) {
        throw new Error(response.data.message || "근무 모니터링 조회 실패");
      }

      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch work monitor by date:", error);
      throw error;
    }
  },

  // 오늘 근무 모니터링 조회
  getTodayWorkMonitor: async (): Promise<WorkMonitorDto> => {
    try {
      const response = await apiClient.get<ApiResult<WorkMonitorDto>>(
        "/api/work-monitor/today"
      );
      console.log("Today WorkMonitor API Response:", response.data);

      if (response.data.status !== "success" || !response.data.data) {
        throw new Error(
          response.data.message || "오늘 근무 모니터링 조회 실패"
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch today work monitor:", error);
      throw error;
    }
  },

  // 특정 날짜 근무 모니터링 데이터 갱신
  updateWorkMonitorData: async (date: string): Promise<WorkMonitorDto> => {
    try {
      const response = await apiClient.post<ApiResult<WorkMonitorDto>>(
        `/api/work-monitor/update/${date}`
      );
      console.log("Update WorkMonitor API Response:", response.data);

      if (response.data.status !== "success" || !response.data.data) {
        throw new Error(response.data.message || "근무 모니터링 갱신 실패");
      }

      return response.data.data;
    } catch (error) {
      console.error("Failed to update work monitor data:", error);
      throw error;
    }
  },

  // 오늘 근무 모니터링 데이터 갱신
  updateTodayWorkMonitorData: async (): Promise<WorkMonitorDto> => {
    try {
      const response = await apiClient.post<ApiResult<WorkMonitorDto>>(
        "/api/work-monitor/update/today"
      );
      console.log("Update Today WorkMonitor API Response:", response.data);

      if (response.data.status !== "success" || !response.data.data) {
        throw new Error(
          response.data.message || "오늘 근무 모니터링 갱신 실패"
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("Failed to update today work monitor data:", error);
      throw error;
    }
  },
};

// Employee Leave Balance API
export const employeeLeaveBalanceApi = {
  // 연차 자동 부여
  grantAnnualLeave: async (
    employeeId: number,
    baseDate?: string
  ): Promise<EmployeeLeaveBalanceResponseDto[]> => {
    const params = baseDate ? new URLSearchParams({ baseDate }) : "";
    const response = await apiClient.post<
      ApiResult<EmployeeLeaveBalanceResponseDto[]>
    >(
      `/api/leave-balance/grant-annual/${employeeId}${
        params ? `?${params}` : ""
      }`
    );
    return response.data.data;
  },

  // 특정 타입 잔여 연차 조회
  getRemainingLeave: async (
    employeeId: number,
    leaveType: LeaveType
  ): Promise<number> => {
    const params = new URLSearchParams({ leaveType });
    const response = await apiClient.get<ApiResult<number>>(
      `/api/leave-balance/remaining/${employeeId}?${params}`
    );
    return response.data.data;
  },

  // 전체 잔여 연차 조회
  getTotalRemainingLeave: async (employeeId: number): Promise<number> => {
    const response = await apiClient.get<ApiResult<number>>(
      `/api/leave-balance/remaining-total/${employeeId}`
    );
    return response.data.data;
  },

  // 연차 잔액 상세 조회
  getLeaveBalances: async (
    employeeId: number
  ): Promise<EmployeeLeaveBalanceResponseDto[]> => {
    const response = await apiClient.get<
      ApiResult<EmployeeLeaveBalanceResponseDto[]>
    >(`/api/leave-balance/details/${employeeId}`);
    return response.data.data;
  },

  // 연차 잔액 요약 조회
  getLeaveBalanceSummary: async (
    employeeId: number
  ): Promise<EmployeeLeaveBalanceSummaryDto> => {
    const response = await apiClient.get<
      ApiResult<EmployeeLeaveBalanceSummaryDto>
    >(`/api/leave-balance/summary/${employeeId}`);
    return response.data.data;
  },

  // 연차 초기화 및 재부여
  resetAndGrantAnnualLeave: async (
    employeeId: number,
    newGrantDate?: string
  ): Promise<EmployeeLeaveBalanceResponseDto[]> => {
    const params = newGrantDate ? new URLSearchParams({ newGrantDate }) : "";
    const response = await apiClient.post<
      ApiResult<EmployeeLeaveBalanceResponseDto[]>
    >(`/api/leave-balance/reset/${employeeId}${params ? `?${params}` : ""}`);
    return response.data.data;
  },

  // 연차 복구
  restoreLeave: async (
    employeeId: number,
    leaveType: LeaveType,
    days: number
  ): Promise<string> => {
    const params = new URLSearchParams({
      leaveType,
      days: days.toString(),
    });
    const response = await apiClient.post<ApiResult<string>>(
      `/api/leave-balance/restore/${employeeId}?${params}`
    );
    return response.data.data;
  },

  // 전체 직원 연차 초기화
  resetAllEmployeesAnnualLeave: async (
    newGrantDate: string
  ): Promise<string> => {
    const params = new URLSearchParams({ newGrantDate });
    const response = await apiClient.post<ApiResult<string>>(
      `/api/leave-balance/reset-all?${params}`
    );
    return response.data.data;
  },
};
