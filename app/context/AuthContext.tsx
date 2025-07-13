'use client';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCookie, setCookie, removeCookie } from '../utils/cookies';

interface AuthContextProps {
  token: string | null;
  user: string | null; 
  login: (token: string, user: string) => void; 
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null); 

  useEffect(() => {
    const storedToken = getCookie('token');
    const storedUser = getCookie('user'); 
    if (storedToken && storedUser) { 
      setToken(storedToken);
      setUser(storedUser);
    }
  }, []);

  const login = (token: string, user: string) => {
    setCookie('token', token, { expires: 7, secure: true, sameSite: 'Strict' });
    setCookie('user', user, { expires: 7, secure: true, sameSite: 'Strict' }); 
    setToken(token);
    setUser(user); 
  };

  const logout = () => {
    removeCookie('token');
    removeCookie('user');
    setToken(null);
    setUser(null); 
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
