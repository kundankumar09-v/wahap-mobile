import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let currentBaseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

export const getBaseApiUrl = () => currentBaseUrl;

export const setBaseApiUrl = (url) => {
  if (url) {
    currentBaseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    api.defaults.baseURL = currentBaseUrl;
  }
};

// Initialize custom URL if stored
(async () => {
  try {
    const saved = await AsyncStorage.getItem('wahap_custom_api_url');
    if (saved) {
      setBaseApiUrl(saved);
    }
  } catch (e) {
    // ignore
  }
})();

export const api = axios.create({
  baseURL: currentBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for attaching auth token
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('wahap_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // continue without token
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
