import { API_BASE_URL, getAuthHeaders } from './config';
import type { User } from '../types';

// Simple cache to prevent excessive API calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; 

export const userService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/Users`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/Users/${id}`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  create: async (data: Partial<User>) => {
    const response = await fetch(`${API_BASE_URL}/Users/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response;
  },

  update: async (id: number, data: Partial<User>) => {
    const response = await fetch(`${API_BASE_URL}/Users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response;
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/Users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response;
  },

  updateStatus: async (id: number, data: { status: number; rejectionReason?: string }) => {
    const response = await fetch(`${API_BASE_URL}/Users/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response;
  },

  getCount: async () => {
    const response = await fetch(`${API_BASE_URL}/Users/count`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  getProfile: async (id: number) => {
    const cacheKey = `user_profile_${id}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return {
        ok: true,
        json: async () => cached.data
      } as Response;
    }
    
    const response = await fetch(`${API_BASE_URL}/Users/profile/${id}`, {
      headers: getAuthHeaders()
    });
    
    if (response.ok) {
      const data = await response.clone().json();
      cache.set(cacheKey, { data, timestamp: Date.now() });
    }
    
    return response;
  },

  updateProfile: async (id: number, data: Partial<User>) => {
    const response = await fetch(`${API_BASE_URL}/Users/profile/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response;
  }
};
