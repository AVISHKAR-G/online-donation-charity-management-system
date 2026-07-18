import api from './api';

export const donorService = {
  async getAll(search = '') {
    const { data } = await api.get('/donor', { params: { search } });
    return data;
  },
  async toggleActive(id) {
    const { data } = await api.put(`/donor/${id}/deactivate`);
    return data;
  },
  async getMyProfile() {
    const { data } = await api.get('/donor/me');
    return data;
  },
  async updateMyProfile(payload) {
    const { data } = await api.put('/donor/me', payload);
    return data;
  },
  async sendUrgentCampaignEmail(payload) {
  const { data } = await api.post('/donation/send-urgent-campaign', payload);
  return data;
  },
};