// Configuration for different environments
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend-app.onrender.com' // Replace with your actual Render URL
  : 'http://localhost:10000';

export const config = {
  apiBaseUrl: API_BASE_URL,
  pollInterval: 2000, // 2 seconds
  maxFileSize: 100 * 1024 * 1024, // 100MB
};