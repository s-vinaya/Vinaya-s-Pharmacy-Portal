import { API_BASE_URL, getAuthHeaders } from './config';
import type { AddressFormData } from '../types';

export const addressService = {
  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/Addresses/${id}`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  getByUserId: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/Addresses/user/${userId}`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  create: async (data: Partial<AddressFormData & { userId: number }>) => {
    const response = await fetch(`${API_BASE_URL}/Addresses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response;
  },

  update: async (id: number, data: Partial<AddressFormData>) => {
    const response = await fetch(`${API_BASE_URL}/Addresses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response;
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/Addresses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response;
  }
};
