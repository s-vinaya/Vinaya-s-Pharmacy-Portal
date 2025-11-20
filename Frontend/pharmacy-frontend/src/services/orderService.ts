import { API_BASE_URL, getAuthHeaders } from "./config";

// Simple cache to prevent excessive API calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000;

const orderService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/Orders`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/Orders/${id}`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  getByStatus: async (status: string) => {
    const response = await fetch(`${API_BASE_URL}/Orders/status/${status}`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  getByUserId: async (userId: number) => {
    const cacheKey = `orders_user_${userId}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return {
        ok: true,
        json: async () => cached.data,
      } as Response;
    }

    const response = await fetch(`${API_BASE_URL}/Orders/user/${userId}`, {
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const data = await response.clone().json();
      cache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return response;
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/Orders`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response;
  },

  updateStatus: async (id: number, status: string) => {
    const response = await fetch(`${API_BASE_URL}/Orders/${id}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return response;
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/Orders/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response;
  },

  getCount: async () => {
    const response = await fetch(`${API_BASE_URL}/Orders/count`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  getActiveCount: async () => {
    const response = await fetch(`${API_BASE_URL}/Orders/active/count`, {
      headers: getAuthHeaders(),
    });
    return response;
  },

  recalculateTotals: async () => {
    const response = await fetch(`${API_BASE_URL}/Orders/recalculate-totals`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return response;
  },

  canUpdateStatus: async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/Orders/${orderId}/can-update-status/${newStatus}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        return await response.json();
      } else {
        return { canUpdate: false, reason: "Error validating order status" };
      }
    } catch (error) {
      return {
        canUpdate: false,
        reason: "Error validating prescription status",
      };
    }
  },
};

export { orderService };
