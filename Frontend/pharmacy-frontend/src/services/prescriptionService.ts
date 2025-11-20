import { API_BASE_URL, getAuthHeaders, getAuthHeadersMultipart } from './config';

// Simple cache to prevent excessive API calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export const prescriptionService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/Prescriptions`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  verify: async (prescriptionId: number) => {
    const response = await fetch(`${API_BASE_URL}/Prescriptions/${prescriptionId}/verify`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(1)
    });
    return response;
  },

  update: async (prescriptionId: number, data: { status: string; remarks: string }) => {
    const response = await fetch(`${API_BASE_URL}/Prescriptions/${prescriptionId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return response;
  },

  upload: async (userId: number, file: File) => {
    const formData = new FormData();
    formData.append('prescriptionFile', file);
    
    const response = await fetch(`${API_BASE_URL}/Prescriptions/upload?userId=${userId}`, {
      method: 'POST',
      headers: getAuthHeadersMultipart(),
      body: formData
    });
    return response;
  },

  getByUserId: async (userId: number) => {
    const cacheKey = `prescriptions_user_${userId}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return {
        ok: true,
        json: async () => cached.data
      } as Response;
    }
    
    const response = await fetch(`${API_BASE_URL}/Prescriptions/user/${userId}`, {
      headers: getAuthHeaders()
    });
    
    if (response.ok) {
      const data = await response.clone().json();
      cache.set(cacheKey, { data, timestamp: Date.now() });
    }
    
    return response;
  },

  download: async (prescriptionId: number) => {
    const response = await fetch(`${API_BASE_URL}/Prescriptions/${prescriptionId}/download`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  getCount: async () => {
    const response = await fetch(`${API_BASE_URL}/Prescriptions/count`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  getByStatus: async (status: string) => {
    const response = await fetch(`${API_BASE_URL}/Prescriptions/status/${status}`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  delete: async (prescriptionId: number) => {
    const response = await fetch(`${API_BASE_URL}/Prescriptions/${prescriptionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response;
  }
};
