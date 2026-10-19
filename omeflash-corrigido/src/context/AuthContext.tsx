import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api, setAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  isVip: boolean;
  isLoading: boolean;
  authModalOpen: boolean;
  authModalTab: 'login' | 'register';
  plansModalOpen: boolean;
  stripeGuideOpen: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  openPlansModal: () => void;
  closePlansModal: () => void;
  openStripeGuide: () => void;
  closeStripeGuide: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isVip, setIsVip] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [plansModalOpen, setPlansModalOpen] = useState<boolean>(false);
  const [stripeGuideOpen, setStripeGuideOpen] = useState<boolean>(false);

  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      setIsVip(data.isVip);
    } catch (err) {
      setUser(null);
      setIsVip(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    setUser(data.user);
    setIsVip(data.isVip);
    setAuthModalOpen(false);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.register(name, email, password);
    setUser(data.user);
    setIsVip(data.isVip);
    setAuthModalOpen(false);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setIsVip(false);
    setAuthToken(null);
  };

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const openPlansModal = () => {
    setPlansModalOpen(true);
  };

  const closePlansModal = () => {
    setPlansModalOpen(false);
  };

  const openStripeGuide = () => {
    setStripeGuideOpen(true);
  };

  const closeStripeGuide = () => {
    setStripeGuideOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isVip,
        isLoading,
        authModalOpen,
        authModalTab,
        plansModalOpen,
        stripeGuideOpen,
        login,
        register,
        logout,
        refreshUser,
        openAuthModal,
        closeAuthModal,
        openPlansModal,
        closePlansModal,
        openStripeGuide,
        closeStripeGuide,
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
