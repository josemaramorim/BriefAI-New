import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:3001',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
    (config) => {
        // Prefer the main auth token first (admin/editor), fall back to respondent token.
        // Using respondent_token by default caused management endpoints to be called
        // with a Respondent token which returns 403. Swap order to avoid that.
        const token = localStorage.getItem('token') || localStorage.getItem('respondent_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token inválido ou expirado
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
