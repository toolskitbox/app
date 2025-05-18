import axios from 'axios';

// Get the API base URL from a global variable or use default
// This avoids using process.env directly which can cause TypeScript errors
const apiUrl = process.env.REACT_APP_API_URL || '/api';

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to include authorization header
apiClient.interceptors.request.use(
  (config: any) => {
    // Get token from localStorage or wherever it's stored
    const token = localStorage.getItem('auth_token');
    
    // If token exists, add it to the authorization header
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Generic GET request
export const get = async <T>(url: string, config?: any): Promise<any> => {
  return apiClient.get<T>(url, config);
};

// Generic POST request
export const post = async <T>(url: string, data?: any, config?: any): Promise<any> => {
  return apiClient.post<T>(url, data, config);
};

// Generic PUT request
export const put = async <T>(url: string, data?: any, config?: any): Promise<any> => {
  return apiClient.put<T>(url, data, config);
};

// Generic DELETE request
export const del = async <T>(url: string, config?: any): Promise<any> => {
  return apiClient.delete<T>(url, config);
};

export default apiClient;
