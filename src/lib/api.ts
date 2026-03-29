// ============================================================
// API CLIENT - Centralized HTTP client for all API calls
// Works with Web (React) and can be adapted for Flutter
// ============================================================

import { auth } from './firebase';
import { ROUTES } from '../../shared/constants';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Core fetch wrapper ───────────────────────────────────────
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Generic CRUD factory ─────────────────────────────────────
function createCrudApi<T>(route: string) {
  return {
    list: () => apiFetch<T[]>(route),
    get: (id: string) => apiFetch<T>(`${route}/${id}`),
    create: (data: Partial<T>) => apiFetch<T>(route, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<T>) => apiFetch<T>(`${route}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch<void>(`${route}/${id}`, { method: 'DELETE' }),
  };
}

// ── API modules ──────────────────────────────────────────────
export const profileApi = {
  get: () => apiFetch<any>(ROUTES.PROFILE),
  update: (data: any) => apiFetch<any>(ROUTES.PROFILE, { method: 'PUT', body: JSON.stringify(data) }),
};

export const subjectsApi = createCrudApi<any>(ROUTES.SUBJECTS);
export const tasksApi = createCrudApi<any>(ROUTES.TASKS);
export const projectsApi = createCrudApi<any>(ROUTES.PROJECTS);
export const coursesApi = createCrudApi<any>(ROUTES.COURSES);
export const habitsApi = createCrudApi<any>(ROUTES.HABITS);
export const lifestyleApi = createCrudApi<any>(ROUTES.LIFESTYLE);

export const financeApi = {
  transactions: createCrudApi<any>(ROUTES.FINANCE.TRANSACTIONS),
  wishlist: createCrudApi<any>(ROUTES.FINANCE.WISHLIST),
  commitments: createCrudApi<any>(ROUTES.FINANCE.COMMITMENTS),
  getSalary: () => apiFetch<{ monthlySalary: number }>(ROUTES.FINANCE.SALARY),
  setSalary: (amount: number) => apiFetch<any>(ROUTES.FINANCE.SALARY, { method: 'PUT', body: JSON.stringify({ monthlySalary: amount }) }),
};

export const focusApi = {
  list: () => apiFetch<any[]>(ROUTES.FOCUS),
  create: (data: any) => apiFetch<any>(ROUTES.FOCUS, { method: 'POST', body: JSON.stringify(data) }),
};

export default apiFetch;
