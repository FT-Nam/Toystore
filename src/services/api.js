// api.js
import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (req) => {
    const user = JSON.parse(localStorage.getItem(config.USER_STORAGE_KEY));
    if (user?.token) {
      req.headers.Authorization = `Bearer ${user.token}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(config.USER_STORAGE_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services
export const productService = {
  getProducts: (params) => api.get('/product', { params }),
  getProductById: (id) => api.get(`/product/${id}`),
  getBestSellers: (limit = 8) => api.get('/product', { params: { type: 'best_seller', limit } }),
  getNewProducts: (limit = 8) => api.get('/product', { params: { type: 'new', limit } }),
  getSaleProducts: (limit = 8) => api.get('/product', { params: { type: 'sale', limit } })
};

export const cartService = {
  getCart: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await axios.get(`${config.API_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  getCartItem: async (cartItemId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await axios.get(`${config.API_URL}/cart/${cartItemId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  addToCart: async (data) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await axios.post(`${config.API_URL}/cart/add`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  updateCart: async (data) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await axios.put(`${config.API_URL}/cart/update`, data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  removeFromCart: async (cartItemId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await axios.delete(`${config.API_URL}/cart/remove/${cartItemId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }
};

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  logout: () => api.post('/auth/logout')
};

export default api;
