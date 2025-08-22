const API_BASE = import.meta.env.PROD 
  ? '/api'  // In production, use relative path (handled by Vercel routing)
  : 'http://localhost:5000';  // In development, use proxy

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

// Usage example:
// const data = await apiRequest('/users');
// const result = await apiRequest('/posts', { method: 'POST', body: JSON.stringify({ title: 'Hello' }) });