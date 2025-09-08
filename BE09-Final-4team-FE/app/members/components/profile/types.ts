export interface TeamInfo {
  teamId: string;
  name: string;
  position?: string;
  rank?: string;
  category?: string;
  title?: string;
}

export interface MemberProfile {
  id: string;
  avatarUrl?: string;
  name: string;
  position?: string;
  rank?: string;
  job?: string;
  role?: string;
  email?: string;
  phone?: string;
  teamCount?: number;
  mainTeam?: TeamInfo | null;
  concurrentTeams?: TeamInfo[];
  organization?: string;
  organizations?: string[];
  joinDate?: string;
  address?: string;
  workPolicy?: string;
  workPolicies?: string[];
  intro?: string;
  selfIntroduction?: string;
  remainingLeave?: number;
  remainingLeaveDays?: number;
  thisWeekHours?: number;
  weeklyWorkHours?: number;
  isAdmin?: boolean;
  profileImage?: string;
}

export interface WorkPolicy {
  id: string;
  label: string;
  description: string;
  color: string;
}
