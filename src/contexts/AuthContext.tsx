// MIGRATION MYSQL: Ce fichier reste identique - aucune modification nécessaire
// Le contexte d'authentification est indépendant de la base de données backend

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('hr_token');
      if (token) {
        try {
          const userData = await apiClient.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
          localStorage.removeItem('hr_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      localStorage.setItem('hr_token', response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('hr_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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