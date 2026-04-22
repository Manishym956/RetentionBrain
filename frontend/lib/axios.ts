import axios from 'axios';

const CLIENT_ID_STORAGE_KEY = 'retentionbrain_client_id';

function getClientId() {
    if (typeof window === 'undefined') {
        return null;
    }

    let clientId = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
    if (!clientId) {
        clientId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        localStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId);
    }

    return clientId;
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const clientId = getClientId();
        const token = localStorage.getItem('access_token');
        if (config.headers) {
            if (clientId) {
                config.headers['X-RetentionBrain-Client-Id'] = clientId;
            }
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            typeof window !== 'undefined' &&
            error.response?.status === 401 &&
            !error.config?.url?.includes('/login') &&
            !error.config?.url?.includes('/register')
        ) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/auth/signin';
        }
        return Promise.reject(error);
    }
);

export default api;
