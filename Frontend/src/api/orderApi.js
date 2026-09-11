import api from './axiosConfig';

export const getAllOrders = () => api.get('/orders');
export const placeOrder = (customerId, productId, qty) =>
  api.post(`/orders/${customerId}/${productId}/${qty}`);
export const countOrdersByCustomer = (customerId) =>
  api.get(`/orders/count/${customerId}`);
export const totalAmountByCustomer = (customerId) =>
  api.get(`/orders/total/${customerId}`);
export const totalRevenue = () => api.get('/orders/revenue');
