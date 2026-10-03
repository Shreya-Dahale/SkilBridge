const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CANDIDATE' | 'EMPLOYER';
  profile?: any;
}

export const getStoredToken = (): string | null => {
  return localStorage.getItem('skilbridge_token');
};

export const setStoredToken = (token: string) => {
  localStorage.setItem('skilbridge_token', token);
};

export const clearStoredToken = () => {
  localStorage.removeItem('skilbridge_token');
  localStorage.removeItem('skilbridge_user');
};

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('skilbridge_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

export const setStoredUser = (user: User) => {
  localStorage.setItem('skilbridge_user', JSON.stringify(user));
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}
