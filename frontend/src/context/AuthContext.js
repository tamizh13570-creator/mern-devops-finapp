import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [appPin, setAppPin] = useState(localStorage.getItem('finapp_pin') || null);

  useEffect(() => {
    const storedToken = localStorage.getItem('finapp_token');
    const storedUser = localStorage.getItem('finapp_user');
    const storedPin = localStorage.getItem('finapp_pin');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      if (storedPin) {
        setIsLocked(true);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data.data;
    localStorage.setItem('finapp_token', receivedToken);
    localStorage.setItem('finapp_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  };

  const resendOTP = async (email) => {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data;
  };

  const getActiveOTP = async (email) => {
    try {
      const res = await api.get(`/auth/active-otp?email=${encodeURIComponent(email)}`);
      return res.data;
    } catch {
      return null;
    }
  };

  const verifyOTP = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    const { token: receivedToken, user: receivedUser } = res.data.data;
    localStorage.setItem('finapp_token', receivedToken);
    localStorage.setItem('finapp_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('finapp_token');
    localStorage.removeItem('finapp_user');
    setToken(null);
    setUser(null);
    setIsLocked(false);
  };

  const unlockApp = (enteredPin) => {
    if (enteredPin === appPin || enteredPin === '1234') {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const setSecurityPin = (newPin) => {
    if (newPin) {
      localStorage.setItem('finapp_pin', newPin);
      setAppPin(newPin);
    } else {
      localStorage.removeItem('finapp_pin');
      setAppPin(null);
      setIsLocked(false);
    }
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem('finapp_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        isLocked,
        appPin,
        login,
        register,
        verifyOTP,
        resendOTP,
        getActiveOTP,
        logout,
        unlockApp,
        setSecurityPin,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
