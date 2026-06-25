import { createContext, useContext, useEffect, useRef, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const focusHandlerRef = useRef(null);

  // Refresh user data when window regains focus (avatar changed on another device)
  // NOTE: no [user] dependency — re-registering on every user change causes focus loops
  const userRef = useRef(null);
  userRef.current = user;
  
  useEffect(() => {
    focusHandlerRef.current = async () => {
      if (!userRef.current || userRef.current === false) return;
      try {
        const { data } = await api.get('/users/me/');
        setUser(data);
      } catch { /* silent */ }
    };
    
    window.addEventListener('focus', focusHandlerRef.current);
    return () => {
      if (focusHandlerRef.current) {
        window.removeEventListener('focus', focusHandlerRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setUser(false);
      setAuthReady(true);
      return;
    }
    api.get('/users/me/')
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(false);
      })
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    const handler = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(false);
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = (token, refreshToken, profile) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(false);
  };

  if (!authReady) return null;

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
