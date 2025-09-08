import apiClient from '../common/api-client';
import {
    CreateOrganizationRequest,
    UpdateOrganizationRequest,
    OrganizationDto,
    OrganizationHierarchyDto,
    CreateAssignmentRequest,
    EmployeeAssignmentDto,
} from './types';
import { ApiResult } from '../common/types';

export const organizationApi = {
    getAllOrganizations: async (): Promise<OrganizationDto[]> => {
        try {
            const response = await apiClient.get<ApiResult<OrganizationDto[]>>('/api/organizations');
            if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                if (Array.isArray(response.data.data)) {
                    return response.data.data;
                } else {
                    console.warn('Response data is not an array:', response.data.data);
                    return [];
                }
            } else if (Array.isArray(response.data)) {
                return response.data;
            } else {
                console.warn('Unexpected response structure:', response.data);
                return [];
            }
        } catch (error) {
            console.error('Error fetching organizations:', error);
            return [];
        }
    },

    getOrganization: async (organizationId: number): Promise<OrganizationDto> => {
        const response = await apiClient.get(`/api/organizations/${organizationId}`);
        return response.data;
    },

    createOrganization: async (data: CreateOrganizationRequest): Promise<OrganizationDto> => {
        const response = await apiClient.post('/api/organizations', data);
        return response.data.data || response.data;
    },

    updateOrganization: async (organizationId: number, data: UpdateOrganizationRequest): Promise<OrganizationDto> => {
        const response = await apiClient.put(`/api/organizations/${organizationId}`, data);
        return response.data.data || response.data;
    },

    deleteOrganization: async (organizationId: number): Promise<ApiResult<void>> => {
        const response = await apiClient.delete(`/api/organizations/${organizationId}`);
        return response.data;
    },

    searchOrganizations: async (keyword: string): Promise<OrganizationDto[]> => {
        const response = await apiClient.get('/api/organizations/search', {
            params: { keyword },
        });
        return response.data;
    },

    getRootOrganizations: async (): Promise<OrganizationDto[]> => {
        const response = await apiClient.get('/api/organizations/root');
        return response.data;
    },

    getOrganizationHierarchy: async (): Promise<OrganizationHierarchyDto[]> => {
        try {
            const response = await apiClient.get<ApiResult<OrganizationHierarchyDto[]>>('/api/organizations/hierarchy');
            if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray(response.data.data)) {
                return response.data.data;
            } else if (Array.isArray(response.data)) {
                return response.data;
            } else {
                console.warn('Unexpected organization hierarchy response structure:', response.data);
                return [];
            }
        } catch (error) {
            console.error('Error fetching organization hierarchy:', error);
            return [];
        }
    },

    getAllAssignments: async (): Promise<EmployeeAssignmentDto[]> => {
        const response = await apiClient.get('/api/assignments');
        return response.data.data;
    },

    getAssignment: async (assignmentId: number): Promise<EmployeeAssignmentDto> => {
        const response = await apiClient.get(`/api/assignments/${assignmentId}`);
        return response.data.data;
    },

    createAssignment: async (data: CreateAssignmentRequest): Promise<EmployeeAssignmentDto> => {
        const response = await apiClient.post('/api/assignments', data);
        return response.data.data;
    },

    updateAssignment: async (assignmentId: number, data: CreateAssignmentRequest): Promise<EmployeeAssignmentDto> => {
        const response = await apiClient.put(`/api/assignments/${assignmentId}`, data);
        return response.data.data;
    },

    deleteAssignment: async (assignmentId: number): Promise<ApiResult<void>> => {
        const response = await apiClient.delete(`/api/assignments/${assignmentId}`);
        return response.data;
    },

    getAssignmentsByOrganizationId: async (organizationId: number): Promise<EmployeeAssignmentDto[]> => {
        const response = await apiClient.get(`/api/assignments/organization/${organizationId}`);
        return response.data.data;
    },

    getLeadersByOrganizationId: async (organizationId: number): Promise<EmployeeAssignmentDto[]> => {
        const response = await apiClient.get(`/api/assignments/organization/${organizationId}/leaders`);
        return response.data.data;
    },

    getAssignmentsByEmployeeId: async (employeeId: number): Promise<EmployeeAssignmentDto[]> => {
        const response = await apiClient.get(`/api/assignments/employee/${employeeId}`);
        return response.data.data;
    },

    getPrimaryAssignmentsByEmployeeId: async (employeeId: number): Promise<EmployeeAssignmentDto[]> => {
        const response = await apiClient.get(`/api/assignments/employee/${employeeId}/primary`);
        return response.data.data;
    },
};