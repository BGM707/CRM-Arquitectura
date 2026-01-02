import { useState, useEffect } from 'react';
import { User } from '../types';

const DEFAULT_USER = {
  username: 'victormonaresespinoza',
  password: 'josesarajessica2025$$',
  isLoggedIn: false,
};

export function useAuth() {
  const [user, setUser] = useState<User>(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsedUser = JSON.parse(stored);
        return {
          username: parsedUser.username || DEFAULT_USER.username,
          password: parsedUser.password || DEFAULT_USER.password,
          isLoggedIn: parsedUser.isLoggedIn || false,
        };
      }
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }, [user]);

  const login = (username: string, password: string): boolean => {
    if (username === user.username && password === user.password) {
      setUser(prev => ({ ...prev, isLoggedIn: true }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(prev => ({ ...prev, isLoggedIn: false }));
  };

  const changePassword = (currentPassword: string, newPassword: string): boolean => {
    if (currentPassword === user.password) {
      setUser(prev => ({ ...prev, password: newPassword }));
      return true;
    }
    return false;
  };

  return {
    user,
    isLoggedIn: user.isLoggedIn,
    login,
    logout,
    changePassword,
  };
}