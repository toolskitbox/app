import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  avatar?: string;
}

interface UserResponse {
  user: User;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use window.env for environment variables in the browser
  const API_URL = (window as any).env?.REACT_APP_API_URL || 'http://localhost:8000/api';
  
  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          const response = await axios.get<UserResponse>(`${API_URL}/user`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          setUser(response.data.user);
        } catch (err) {
          localStorage.removeItem('auth_token');
          console.error('Session expired or invalid');
        }
      }
      
      setLoading(false);
    };
    
    checkAuthStatus();
  }, [API_URL]);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      // Redirect to Laravel's Google OAuth route
      window.location.href = `${API_URL}/auth/google/redirect`;
    } catch (err) {
      setError('Failed to sign in with Google');
      console.error(err);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        await axios.post(`${API_URL}/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } catch (err) {
      setError('Failed to log out');
      console.error(err);
    }
  };

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
