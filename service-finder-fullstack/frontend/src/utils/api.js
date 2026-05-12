import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL ,
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Services
export const getServices = (params) => API.get('/services', { params });
export const getService = (id) => API.get(`/services/${id}`);
export const getMyServices = () => API.get('/services/provider/my-services');
export const createService = (data) => API.post('/services', data);
export const updateService = (id, data) => API.put(`/services/${id}`, data);
export const deleteService = (id) => API.delete(`/services/${id}`);

// Bookings
export const getBookings = () => API.get('/bookings');
export const getBooking = (id) => API.get(`/bookings/${id}`);
export const createBooking = (data) => API.post('/bookings', data);
export const updateBookingStatus = (id, status) =>
  API.put(`/bookings/${id}/status`, { status });

// Reviews
export const getReviews = (serviceId) => API.get(`/reviews/${serviceId}`);
export const addReview = (serviceId, data) => API.post(`/reviews/${serviceId}`, data);

// Admin
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminUsers = () => API.get('/admin/users');
export const toggleUserStatus = (id) => API.put(`/admin/users/${id}/toggle`);
export const adminDeleteService = (id) => API.delete(`/admin/services/${id}`);

export default API;
