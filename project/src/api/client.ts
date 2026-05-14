import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('hrms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const token = localStorage.getItem('hrms_token');
      // Only log out if it's a real token that expired. 
      // If we are using mock auth, ignore the 401 and don't force a logout.
      if (!token?.startsWith('mock_jwt_')) {
        localStorage.removeItem('hrms_token');
        localStorage.removeItem('hrms_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default apiClient;
