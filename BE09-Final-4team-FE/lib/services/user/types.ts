export interface EmploymentType {
  id: number;
  name: string;
  sortOrder: number;
}

export interface Job {
  id: number;
  name: string;
  sortOrder: number;
}

export interface Position {
  id: number;
  name: string;
  sortOrder: number;
}

export interface Rank {
  id: number;
  name: string;
  sortOrder: number;
}

export interface UserCreateDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  joinDate?: string;
  isAdmin?: boolean;
  needsPasswordReset?: boolean;
  employmentType?: EmploymentType;
  rank?: Rank;
  position?: Position;
  job?: Job;
  role?: string;
  workPolicyId?: number;
}

export interface UserUpdateDto {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  joinDate?: string;
  isAdmin?: boolean;
  needsPasswordReset?: boolean;
  employmentType?: EmploymentType;
  rank?: Rank;
  position?: Position;
  job?: Job;
  role?: string;
  workPolicyId?: number;
  profileImageUrl?: string;
  selfIntroduction?: string;
}

export interface UserResponseDto {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  joinDate?: string;
  isAdmin: boolean;
  needsPasswordReset: boolean;
  employmentType?: EmploymentType;
  
  rank?: string;
  position?: string;
  job?: string;
  
  rankDto?: Rank;
  positionDto?: Position;
  jobDto?: Job;
  
  role?: string;
  profileImageUrl?: string;
  selfIntroduction?: string;
  workPolicyId?: number;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  workPolicy?: WorkPolicyResponseDto;
  organizations?: UserOrganizationDto[];
}

export interface UserOrganizationDto {
  id: number;
  organizationId: number;
  organizationName: string;
  isPrimary: boolean;
  isLeader: boolean;
  assignedAt: string;
}

export interface WorkPolicyResponseDto {
  id: number;
  name: string;
  type: string;
  workCycle: string;
  startDayOfWeek: string;
  workCycleStartDay: number;
  workDays: string[];
  weeklyWorkingDays: number;
  startTime: string;
  startTimeEnd: string;
  workHours: number;
  workMinutes: number;
  coreTimeStart: string;
  coreTimeEnd: string;
  breakStartTime: string;
  avgWorkTime: string;
  totalRequiredMinutes: number;
  annualLeaves: AnnualLeaveResponseDto[];
  createdAt: string;
  updatedAt: string;
  totalWorkMinutes: number;
  isCompliantWithLaborLaw: boolean;
  isOptionalWork: boolean;
  isShiftWork: boolean;
  isFlexibleWork: boolean;
  isFixedWork: boolean;
}

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

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  userId: number;
  email: string;
  name: string;
  role: string;
  needsPasswordReset: boolean;
}

export interface PasswordChangeRequestDto {
  currentPassword: string;
  newPassword: string;
}

export interface DetailProfileResponseDto {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profileImageUrl?: string;
  address?: string;
  joinDate?: string;
}

export interface ColleagueSearchRequestDto {
  searchKeyword?: string;
  department?: string;
  position?: string;
  page?: number;
  size?: number;
}

export interface ColleagueResponseDto {
  userId: number;
  name: string;
  email: string;
  phoneNumber?: string;
  position?: string;
  department?: string;
  avatar?: string;
  employeeNumber?: string;
  status?: string;
}

