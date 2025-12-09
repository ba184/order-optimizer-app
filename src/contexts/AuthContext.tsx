import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Record<UserRole, User> = {
  sales_executive: {
    id: 'se-001',
    name: 'Rajesh Kumar',
    email: 'rajesh@toagosei.com',
    role: 'sales_executive',
    phone: '+91 98765 43210',
    territory: 'North Delhi',
    region: 'Delhi NCR',
    geoHierarchy: {
      country: 'India',
      state: 'Delhi',
      zone: 'North Zone',
      city: 'New Delhi',
      area: 'Connaught Place',
    },
    reportingTo: 'asm-001',
  },
  asm: {
    id: 'asm-001',
    name: 'Priya Sharma',
    email: 'priya@toagosei.com',
    role: 'asm',
    phone: '+91 98765 43211',
    territory: 'Delhi',
    region: 'Delhi NCR',
    geoHierarchy: {
      country: 'India',
      state: 'Delhi',
      zone: 'North Zone',
      city: 'New Delhi',
      area: '',
    },
    reportingTo: 'rsm-001',
  },
  rsm: {
    id: 'rsm-001',
    name: 'Vikram Singh',
    email: 'vikram@toagosei.com',
    role: 'rsm',
    phone: '+91 98765 43212',
    territory: 'North India',
    region: 'North Zone',
    geoHierarchy: {
      country: 'India',
      state: '',
      zone: 'North Zone',
      city: '',
      area: '',
    },
    reportingTo: 'admin-001',
  },
  admin: {
    id: 'admin-001',
    name: 'Suresh Patel',
    email: 'suresh@toagosei.com',
    role: 'admin',
    phone: '+91 98765 43213',
    geoHierarchy: {
      country: 'India',
      state: '',
      zone: '',
      city: '',
      area: '',
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (password.length >= 4) {
      setUser(mockUsers[role]);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
