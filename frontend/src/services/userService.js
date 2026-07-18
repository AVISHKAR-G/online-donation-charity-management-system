import api from './api';

export const userService = {
  async getAll() {
    const { data } = await api.get('/user');
    return data;
  },
  async toggleActive(id) {
    const { data } = await api.put(`/user/${id}/toggle-active`);
    return data;
  },
  async getHistory(id) {
    const { data } = await api.get(`/user/${id}/history`);
    return data;
  },
  async getMyHistory() {
    const { data } = await api.get('/user/me/history');
    return data;
  },
};