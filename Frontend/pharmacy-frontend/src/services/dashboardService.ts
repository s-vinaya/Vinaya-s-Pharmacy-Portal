import { API_BASE_URL, getAuthHeaders } from './config';

// Simple cache to prevent excessive API calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export const dashboardService = {
  getAdminDashboardSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/Dashboard/admin-summary`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  getPharmacistDashboardSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/Dashboard/pharmacist-summary`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  getCustomerDashboardSummary: async () => {
    const cacheKey = 'customer_dashboard_summary';
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return {
        ok: true,
        json: async () => cached.data
      } as Response;
    }
    
    const response = await fetch(`${API_BASE_URL}/Dashboard/customer-summary`, {
      headers: getAuthHeaders()
    });
    
    if (response.ok) {
      const data = await response.clone().json();
      cache.set(cacheKey, { data, timestamp: Date.now() });
    }
    
    return response;
  },

  getRecentActivity: async () => {
    const response = await fetch(`${API_BASE_URL}/Dashboard/recent-activity`, {
      headers: getAuthHeaders()
    });
    return response;
  },

  getSystemAlerts: async () => {
    const response = await fetch(`${API_BASE_URL}/Dashboard/system-alerts`, {
      headers: getAuthHeaders()
    });
    return response;
  }
};
