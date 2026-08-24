import axios from 'axios';

// Default config
const instance = axios.create({
    baseURL: '/api',
});

// Add a request interceptor to attach JWT token
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for global error handling
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // If 401 Unauthorized, maybe logout the user by clearing localStorage
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            // window.location = '/login'; // Optional: Redirect if unauthorized
        }
        return Promise.reject(error);
    }
);

export default instance;
