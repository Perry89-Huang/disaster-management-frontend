import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTokenFromStorage, setTokenToStorage, removeTokenFromStorage, verifyToken } from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getTokenFromStorage();
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const claims = decoded['https://hasura.io/jwt/claims'];
        setUser({
          id: claims['x-hasura-user-id'],
          role: claims['x-hasura-default-role'],
        });
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    setTokenToStorage(token);
    const decoded = verifyToken(token);
    const claims = decoded['https://hasura.io/jwt/claims'];
    setUser({
      id: claims['x-hasura-user-id'],
      role: claims['x-hasura-default-role'],
    });
  };

  const logout = () => {
    removeTokenFromStorage();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};