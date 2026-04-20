import api from './api';

export const fetchProducts = async () => {
    const response = await api.get('/products');
    return response.data;
};

export const createProduct = async (payload) => {
    const response = await api.post('/products', payload);
    return response.data;
};

export const updateProduct = async (id, payload) => {
    const response = await api.put(`/products/${id}`, payload);
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};

export const updateProductStock = async (id, quantity, isDelta) => {
    const response = await api.patch(`/products/${id}/stock`, { quantity, isDelta });
    return response.data;
};

export const fetchSuppliers = async () => {
    const response = await api.get('/suppliers');
    return response.data;
};

export const createSupplier = async (payload) => {
    const response = await api.post('/suppliers', payload);
    return response.data;
};

export const updateSupplier = async (id, payload) => {
    const response = await api.put(`/suppliers/${id}`, payload);
    return response.data;
};

export const deleteSupplier = async (id) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
};

export const fetchNotifications = async () => {
    const response = await api.get('/notifications');
    return response.data;
};

export const markNotificationRead = async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
};

export const markAllNotificationsRead = async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
};

export const fetchSystemUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

export const createSystemUser = async (payload) => {
    const response = await api.post('/auth/register', payload);
    return response.data;
};
