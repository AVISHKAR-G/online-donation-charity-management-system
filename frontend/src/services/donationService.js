import api from './api';

export const donationService = {
  async create(payload) {
    try {
      const { data } = await api.post('/donation', payload);
      return data;
    } catch (error) {
      console.error('Donation creation failed:', error.response?.data);
      throw error;
    }
  },
  async myDonations() {
    const { data } = await api.get('/donation/my-donations');
    return data;
  },
  async getById(id) {
    const { data } = await api.get(`/donation/${id}`);
    return data;
  },
  async getAll() {
    const { data } = await api.get('/donation');
    return data;
  },
  async updateStatus(id, status) {
    const { data } = await api.patch(`/donation/${id}/status`, { status });
    return data;
  },
  async remove(id) {
    await api.delete(`/donation/${id}`);
  },
  async getRecentPublic() {
    const { data } = await api.get('/donation/recent-public');
    return data;
  },
  async sendUrgentCampaignEmail(payload) {
    const { data } = await api.post('/donation/send-urgent-campaign', payload);
    return data;
  },
};