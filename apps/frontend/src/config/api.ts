// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || (
    import.meta.env.PROD ? '' : 'http://localhost:3000'
  ),
  ENDPOINTS: {
    CHAT: '/api/chat',
    HEALTH: '/health',
  },
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// API service functions
export const apiService = {
  async post(endpoint: string, data: Record<string, unknown>) {
    const response = await fetch(buildApiUrl(endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },
  
  async get(endpoint: string) {
    const response = await fetch(buildApiUrl(endpoint), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },
}; 