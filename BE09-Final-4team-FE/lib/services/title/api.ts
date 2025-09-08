import apiClient from '../common/api-client';
import { ApiResult } from '../common/types';

export interface TitleDto {
  id: number;
  name: string;
  sortOrder?: number;
}

export interface CreateTitleRequest {
  name: string;
  sortOrder?: number;
}

export interface UpdateTitleRequest {
  name: string;
  sortOrder?: number;
}

export const titleApi = {
  // 직급 관련 API
  getRanks: async (): Promise<TitleDto[]> => {
    try {
      const response = await apiClient.get<TitleDto[]>('/api/v1/titles/ranks');
      return response.data;
    } catch (error) {
      console.error('Error fetching ranks:', error);
      return [];
    }
  },

  getRankById: async (id: number): Promise<TitleDto> => {
    const response = await apiClient.get<TitleDto>(`/api/v1/titles/ranks/${id}`);
    return response.data;
  },

  createRank: async (request: CreateTitleRequest): Promise<TitleDto> => {
    const response = await apiClient.post<TitleDto>('/api/v1/titles/ranks', request);
    return response.data;
  },

  updateRank: async (id: number, request: UpdateTitleRequest): Promise<TitleDto> => {
    const response = await apiClient.put<TitleDto>(`/api/v1/titles/ranks/${id}`, request);
    return response.data;
  },

  deleteRank: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/titles/ranks/${id}`);
  },

  // 직위 관련 API
  getPositions: async (): Promise<TitleDto[]> => {
    try {
      const response = await apiClient.get<TitleDto[]>('/api/v1/titles/positions');
      return response.data;
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  },

  getPositionById: async (id: number): Promise<TitleDto> => {
    const response = await apiClient.get<TitleDto>(`/api/v1/titles/positions/${id}`);
    return response.data;
  },

  createPosition: async (request: CreateTitleRequest): Promise<TitleDto> => {
    const response = await apiClient.post<TitleDto>('/api/v1/titles/positions', request);
    return response.data;
  },

  updatePosition: async (id: number, request: UpdateTitleRequest): Promise<TitleDto> => {
    const response = await apiClient.put<TitleDto>(`/api/v1/titles/positions/${id}`, request);
    return response.data;
  },

  deletePosition: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/titles/positions/${id}`);
  },

  // 직책 관련 API
  getJobs: async (): Promise<TitleDto[]> => {
    try {
      const response = await apiClient.get<TitleDto[]>('/api/v1/titles/jobs');
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  },

  getJobById: async (id: number): Promise<TitleDto> => {
    const response = await apiClient.get<TitleDto>(`/api/v1/titles/jobs/${id}`);
    return response.data;
  },

  createJob: async (request: CreateTitleRequest): Promise<TitleDto> => {
    const response = await apiClient.post<TitleDto>('/api/v1/titles/jobs', request);
    return response.data;
  },

  updateJob: async (id: number, request: UpdateTitleRequest): Promise<TitleDto> => {
    const response = await apiClient.put<TitleDto>(`/api/v1/titles/jobs/${id}`, request);
    return response.data;
  },

  deleteJob: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/titles/jobs/${id}`);
  },
};
