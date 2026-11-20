import { apiClient } from '../api/baseApi';
import { Crane, CraneDetailsResponse, InspectionLog } from '../types/crane.types';

export const craneService = {
  getAll: async (params?: Record<string, any>): Promise<Crane[]> => {
    const { data } = await apiClient.get('/cranes', { params });
    return data;
  },
  getById: async (id: string): Promise<CraneDetailsResponse> => {
    const { data } = await apiClient.get(`/cranes/${id}`);
    return data;
  },
  create: async (payload: Omit<Crane, 'id' | 'status'>): Promise<Crane> => {
    const { data } = await apiClient.post('/cranes', payload);
    return data;
  },
  update: async (id: string, payload: Omit<Crane, 'id' | 'status'>): Promise<Crane> => {
    const { data } = await apiClient.put(`/cranes/${id}`, payload);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/cranes/${id}`);
  },
  addInspection: async (craneId: string, payload: Omit<InspectionLog, 'id' | 'craneId'>): Promise<InspectionLog> => {
    const { data } = await apiClient.post(`/cranes/${craneId}/inspections`, payload);
    return data;
  },
  deleteInspection: async (id: string): Promise<void> => {
    await apiClient.delete(`/inspections/${id}`);
  }
};
