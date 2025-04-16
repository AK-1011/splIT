'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { db, User } from './db';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: async () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth session on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have auth data in localStorage
        const userId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('authToken');

        if (userId && authToken) {
          // Verify the token is valid
          const isValid = await db.isLoggedIn(userId, authToken);
          
          if (isValid) {
            // Fetch the user object
            const user = await db.users.get(userId);
            if (user) {
              setUser(user);
            } else {
              // Clear invalid auth data
              localStorage.removeItem('userId');
              localStorage.removeItem('authToken');
            }
          } else {
            // Clear invalid auth data
            localStorage.removeItem('userId');
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const authenticatedUser = await db.authenticateUser(email, password);
      
      if (authenticatedUser && authenticatedUser.authToken) {
        setUser(authenticatedUser);
        
        // Store auth data in localStorage
        localStorage.setItem('userId', authenticatedUser.id);
        localStorage.setItem('authToken', authenticatedUser.authToken);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      if (user) {
        await db.logoutUser(user.id);
      }
      
      // Clear auth data
      localStorage.removeItem('userId');
      localStorage.removeItem('authToken');
      
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 