import api from './axiosConfig';

export const getAllCustomers = () => api.get('/customers');
export const getCustomerById = (id) => api.get(`/customers/${id}`);
export const getCustomerByEmail = (email) => api.get(`/customers/email/${email}`);
export const getCustomersByCity = (city) => api.get(`/customers/city/${city}`);
export const getCustomersByAge = (age) => api.get(`/customers/age/${age}`);
export const createCustomer = (data) => api.post('/customers', data);
export const createCustomersBulk = (data) => api.post('/customers/list', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);
