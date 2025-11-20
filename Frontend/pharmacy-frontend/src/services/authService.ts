import { API_BASE_URL } from './config';
import type { RegisterCustomerDto, RegisterPharmacistDto } from '../types';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response;
  },

  registerCustomer: async (data: RegisterCustomerDto) => {
    const response = await fetch(`${API_BASE_URL}/Auth/register-customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response;
  },

  registerPharmacist: async (data: RegisterPharmacistDto) => {
    const response = await fetch(`${API_BASE_URL}/Auth/register-pharmacist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response;
  },

  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/Auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/Auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    return response;
  }
};
