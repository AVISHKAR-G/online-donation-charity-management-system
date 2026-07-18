import { createContext, useContext, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    persistSession(data);
    return data;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    persistSession(data);
    return data;
  };

  const loginWithGoogle = async (idToken) => {
    const data = await authService.googleLogin(idToken);
    persistSession(data);
    return data;
  };

  const loginWithFacebook = async (accessToken) => {
    const data = await authService.facebookLogin(accessToken);
    persistSession(data);
    return data;
  };

  const persistSession = (data) => {
    const sessionUser = { userId: data.userId, name: data.name, email: data.email, role: data.role };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <AuthContext.Provider
      value={{ user, login, register, loginWithGoogle, loginWithFacebook, logout, isAdmin, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);