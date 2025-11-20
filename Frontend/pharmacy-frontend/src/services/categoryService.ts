import { API_BASE_URL, getAuthHeaders } from './config';

export const categoryService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/MedicineCategories`, {
      headers: getAuthHeaders()
    });
    return response;
  }
};
