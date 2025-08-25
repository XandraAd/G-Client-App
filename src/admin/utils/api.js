// src/utils/api.js (client-side)
const API_BASE = import.meta.env.PROD 
  ? '/api'  // In production, calls go to /api/* (routed to your server)
  : 'http://localhost:5000/api';  // In development, calls go to local server

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
};
