import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true,
    timeout: 120000 // 2 minutes timeout for bulk analysis
});

// Add request interceptor
instance.interceptors.request.use(
    (config) => {
        // Log the request for debugging
        console.log('Making request to:', config.url, 'with method:', config.method);
        
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
instance.interceptors.response.use(
    (response) => {
        console.log('Received successful response:', response.status);
        return response;
    },
    (error) => {
        if (error.response) {
            // The request was made and server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response error:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Request error - no response received');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error);
    }
);

export default instance;
