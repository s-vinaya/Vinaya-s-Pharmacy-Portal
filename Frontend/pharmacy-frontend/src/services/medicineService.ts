import { API_BASE_URL, getAuthHeaders } from './config';
import type { MedicineFormData } from '../types';

export const medicineService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/Medicines`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/Medicines/${id}`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  create: async (data: Partial<MedicineFormData>) => {
    const response = await fetch(`${API_BASE_URL}/Medicines`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response;
  },

  update: async (id: number, data: Partial<MedicineFormData>) => {
    const response = await fetch(`${API_BASE_URL}/Medicines/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response;
  },

  updateStock: async (id: number, stock: number) => {
    const response = await fetch(`${API_BASE_URL}/Medicines/${id}/stock`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(stock)
    });
    return response;
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/Medicines/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response;
  },

  getCount: async () => {
    const response = await fetch(`${API_BASE_URL}/Medicines/count`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  getLowStock: async () => {
    const response = await fetch(`${API_BASE_URL}/Medicines/low-stock`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  getExpiring: async () => {
    const response = await fetch(`${API_BASE_URL}/Medicines/expiring`, {
      headers: getAuthHeaders()
    });
    return response;
  }
};
