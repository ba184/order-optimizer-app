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
    email: 'rajesh@company.com',
    role: 'sales_executive',
    phone: '+91 98765 43210',
    territory: 'North Delhi',
    region: 'Delhi NCR',
  },
  asm: {
    id: 'asm-001',
    name: 'Priya Sharma',
    email: 'priya@company.com',
    role: 'asm',
    phone: '+91 98765 43211',
    territory: 'Delhi',
    region: 'Delhi NCR',
  },
  rsm: {
    id: 'rsm-001',
    name: 'Amit Verma',
    email: 'amit@company.com',
    role: 'rsm',
    phone: '+91 98765 43212',
    region: 'North India',
  },
  admin: {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin',
    phone: '+91 98765 43213',
  },
  credit_team: {
    id: 'credit-001',
    name: 'Sneha Gupta',
    email: 'sneha@company.com',
    role: 'credit_team',
    phone: '+91 98765 43214',
  },
  distributor: {
    id: 'dist-001',
    name: 'Krishna Traders',
    email: 'krishna@traders.com',
    role: 'distributor',
    phone: '+91 98765 43215',
    territory: 'South Delhi',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulate API call
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
