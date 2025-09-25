import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.detail || 'An error occurred');
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to connect to server');
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred');
    }
  }
);

export const searchSpecies = async (query, limit = 10) => {
  try {
    const response = await api.get('/api/species/search', {
      params: { query, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching species:', error);
    throw error;
  }
};

export const getSpeciesObservations = async (speciesKey) => {
  try {
    const response = await api.get(`/api/species/${speciesKey}/observations`);
    return response.data;
  } catch (error) {
    console.error('Error getting species observations:', error);
    throw error;
  }
};

export const getSpeciesTimeline = async (speciesKey) => {
  try {
    const response = await api.get(`/api/species/${speciesKey}/timeline`);
    return response.data;
  } catch (error) {
    console.error('Error getting species timeline:', error);
    throw error;
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
};

export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking API health:', error);
    throw error;
  }
};
