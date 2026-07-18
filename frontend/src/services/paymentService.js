import api from './api';

export const paymentService = {
  async createOrder(amount, method) {
    const { data } = await api.post('/payment/create-order', { amount, method });
    return data;
  },
  async verify(payload) {
    const { data } = await api.post('/payment/verify', payload);
    return data;
  },
  async getAll() {
    const { data } = await api.get('/payment');
    return data;
  },
  async remove(id) {
    await api.delete(`/payment/${id}`);
  },
};