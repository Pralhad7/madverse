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

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        logout();
        window.location.href = '/admin/login';
        throw new Error('Unauthorized');
      }
      
      // Global handling for 500s or unexpected errors on mutating requests
      if (!response.ok && options.method && options.method !== 'GET') {
         console.error(`API Error on ${options.method} ${url}:`, response.status);
         // Optionally, we could show a global toast here if we had a toast library
      }

      return response;
    } catch (error) {
      console.error(`Network or fetch error on ${url}:`, error);
      if (options.method && options.method !== 'GET') {
          alert('A network error occurred while contacting the server. Please try again.');
      }
      throw error;
    }
  }, [token]);

  return {
    isAuthenticated: !!token,
    token,
    login,
    logout,
    apiFetch,
  };
};
