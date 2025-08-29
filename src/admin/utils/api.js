// src/utils/api.js
const API_BASE = import.meta.env.PROD
  ? '/api'  // In production, frontend calls /api/* which Vercel routes to backend
  : 'http://localhost:5000/api';  // In development, calls local Express server

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // allow cookies/JWT
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};
