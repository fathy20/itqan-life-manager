// ═══════════════════════════════════════════════════════════════
//  src/lib/api/core.ts
//  Core request function + apiNew HTTP methods
//  Used by all api modules — never import directly in screens
// ═══════════════════════════════════════════════════════════════

import { auth } from '../firebase';
import type { ApiResponse } from '../../types/new';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || `Error ${res.status}`,
        code: data.code || 'UNKNOWN_ERROR',
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
      code: 'NETWORK_ERROR',
    };
  }
}

export const apiNew = {
  get:    <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'GET' }),
  post:   <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put:    <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};
