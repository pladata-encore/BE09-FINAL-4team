export interface CreateOrganizationRequest {
  name: string;
  parentId?: number;
}

export interface UpdateOrganizationRequest {
  name: string;
  parentId?: number;
}

export interface OrganizationDto {
  organizationId: number;
  name: string;
  parentId?: number;
  parentName?: string;
  children?: OrganizationDto[];
  memberCount: number;
  leaderCount: number;
}

export interface OrganizationHierarchyDto {
  organizationId: number;
  name: string;
  parentId?: number;
  parentName?: string;
  children?: OrganizationHierarchyDto[];
  memberCount: number;
  leaderCount: number;
  isExpanded: boolean;
}

export interface CreateAssignmentRequest {
  employeeId: number;
  organizationId: number;
  isPrimary?: boolean;
  isLeader?: boolean;
}

export interface EmployeeAssignmentDto {
  assignmentId: number;
  employeeId: number;
  employeeName: string;
  organizationId: number;
  organizationName: string;
  isPrimary: boolean;
  isLeader: boolean;
  assignedAt: string;
}


