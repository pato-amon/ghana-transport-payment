// frontend/src/services/api.js
import axios from 'axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor — attach token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor — handle errors globally
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || 'Something went wrong';
        const status = error.response?.status;

        if (status === 401) {
            useAuthStore.getState().logout();
            window.location.href = '/login';
            toast.error('Session expired. Please login again.');
        } else if (status === 429) {
            toast.error('Too many requests. Please slow down.');
        } else if (status >= 500) {
            toast.error('Server error. Please try again later.');
        }

        return Promise.reject({ message, status });
    }
);

export default api;


