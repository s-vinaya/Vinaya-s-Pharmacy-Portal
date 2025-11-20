export const API_BASE_URL = 'https://localhost:7041/api';

export const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
  'Content-Type': 'application/json'
});

export const getAuthHeadersMultipart = () => ({
  'Authorization': `Bearer ${localStorage.getItem('userToken')}`
});
