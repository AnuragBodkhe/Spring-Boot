import api from './axiosConfig';

export const getAllProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/products/${id}`);
export const getProductsByCategory = (category) => api.get(`/products/category/${category}`);
export const createProduct = (data) => api.post('/products', data);
export const createProductsBulk = (data) => api.post('/products/list', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
