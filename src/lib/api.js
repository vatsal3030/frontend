import axios from 'axios';
import { supabase } from './supabase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
});

// Add a request interceptor to inject the token natively from Supabase
api.interceptors.request.use(
  async (config) => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Supabase getSession Error:", error);
    }
    
    if (session?.access_token) {
      console.log("Token found, injecting Authorization header...");
      config.headers['Authorization'] = `Bearer ${session.access_token}`;
    } else {
      console.error("Interceptor Failure: No active session found to inject!");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
