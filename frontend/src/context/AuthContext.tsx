import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  getStoredUser,
  setStoredUser,
  apiRequest,
} from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  loginCandidate: (credentials: { email: string; password: string }) => Promise<void>;
  loginEmployer: (credentials: { email: string; password: string }) => Promise<void>;
  registerCandidate: (data: any) => Promise<void>;
  registerEmployer: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!getStoredToken()) {
        setUser(null);
        setLoading(false);
        return;
      }
      const data = await apiRequest<{ user: User }>('/auth/me');
      setUser(data.user);
      setStoredUser(data.user);
    } catch (err) {
      console.warn('Failed to refresh user auth state:', err);
      clearStoredToken();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const loginCandidate = async (credentials: { email: string; password: string }) => {
    const data = await apiRequest<{ token: string; user: User }>('/auth/login/candidate', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setToken(data.token);
    setUser(data.user);
    setStoredToken(data.token);
    setStoredUser(data.user);
  };

  const loginEmployer = async (credentials: { email: string; password: string }) => {
    const data = await apiRequest<{ token: string; user: User }>('/auth/login/employer', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setToken(data.token);
    setUser(data.user);
    setStoredToken(data.token);
    setStoredUser(data.user);
  };

  const registerCandidate = async (formData: any) => {
    const data = await apiRequest<{ token: string; user: User }>('/auth/register/candidate', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    setToken(data.token);
    setUser(data.user);
    setStoredToken(data.token);
    setStoredUser(data.user);
  };

  const registerEmployer = async (formData: any) => {
    const data = await apiRequest<{ token: string; user: User }>('/auth/register/employer', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    setToken(data.token);
    setUser(data.user);
    setStoredToken(data.token);
    setStoredUser(data.user);
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        loginCandidate,
        loginEmployer,
        registerCandidate,
        registerEmployer,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
