import api from './api';

export const campaignService = {
  async getAll(params = {}) {
    const { data } = await api.get('/campaign', { params });
    return data;
  },
  async getById(id) {
    const { data } = await api.get(`/campaign/${id}`);
    return data;
  },
  async create(payload) {
    const { data } = await api.post('/campaign', payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await api.put(`/campaign/${id}`, payload);
    return data;
  },
  async remove(id) {
    await api.delete(`/campaign/${id}`);
  },
  async getTransparency(id) {
    const { data } = await api.get(`/campaign/${id}/transparency`);
    return data;
  },
};