"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  id_Rol: number;
  id_CentroVacunacion?: number; // Optional, as not all roles might have it
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // This effect runs once on mount to load the token from localStorage.
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        // If there's no token, we're not authenticated.
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      // Clear any corrupted data.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } finally {
      // This ensures that we are done loading, regardless of the outcome.
      setLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    console.log('[AuthContext] User object received in login:', JSON.stringify(newUser, null, 2));
    console.log('[AuthContext] Condition (newUser.id_Rol === 2):', newUser.id_Rol === 2);
    if (newUser.id_Rol === 2) { // Role ID for 'Médico'
      console.log('[AuthContext] Redirecting to /management/medical/appointments');
      router.push('/management/medical/appointments');
    } else if (newUser.id_Rol === 1 || newUser.id_Rol === 6) {
      // Admin: redirigir a disponibilidad (gestión)
      console.log('[AuthContext] User with role', newUser.id_Rol, 'redirecting to /management/availability');
      router.push('/management/availability');
    } else {
      router.push('/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };



  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
