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
  // Forgot password: email a 6-digit verification code to the logged-in donor
  async sendPasswordCode() {
    const { data } = await api.post('/donor/me/password/send-code');
    return data;
  },
  // Change the password: { currentPassword, newPassword }  OR (forgot password) { code, newPassword }
  async changePassword(payload) {
    const { data } = await api.put('/donor/me/password', payload);
    return data;
  },
  // Admin: update any donor's name/email
  async update(id, payload) {
    const { data } = await api.put(`/donor/${id}`, payload);
    return data;
  },
  // Admin: soft-delete a donor
  async remove(id) {
    await api.delete(`/donor/${id}`);
  },
  async sendUrgentCampaignEmail(payload) {
    const { data } = await api.post('/donation/send-urgent-campaign', payload);
    return data;
  },
};