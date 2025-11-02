import React, { createContext, useState, useContext, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';

interface IAuth {
  email: string;
  id: string;
}

interface IGlobalContext {
  user: IAuth | null;
  saveUser: (data: IAuth) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  logout: () => void;
}

export const GlobalContext = createContext<IGlobalContext | null>(null);

const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<IAuth | null>(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('token'));

  const saveUser = (data: IAuth) => {
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    setIsAuthenticated(true);
    navigate('/dashboard');
  };
  

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <GlobalContext.Provider value={{ user, saveUser, isAuthenticated, setIsAuthenticated, logout }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};

export default GlobalProvider;
