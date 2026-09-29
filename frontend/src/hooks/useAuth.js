import { useState, useCallback } from 'react';

export const useAuth = () => {
  const [token, setToken] = useState(() => localStorage.getItem('review_canvas_token'));

  const login = (newToken) => {
    localStorage.setItem('review_canvas_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('review_canvas_token');
    setToken(null);
  };

  const apiFetch = useCallback(async (url, options = {}) => {
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      logout();
      window.location.href = '/admin/login';
      throw new Error('Unauthorized');
    }

    return response;
  }, [token]);

  return {
    isAuthenticated: !!token,
    token,
    login,
    logout,
    apiFetch,
  };
};
