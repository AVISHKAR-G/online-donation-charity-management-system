import api from './api';

export const assistanceApplicationService = {
  async submit(formData) {
    const { data } = await api.post('/assistanceapplication', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async myApplications() {
    const { data } = await api.get('/assistanceapplication/my');
    return data;
  },
  async getAll() {
    const { data } = await api.get('/assistanceapplication');
    return data;
  },
  async updateStatus(id, status) {
    const { data } = await api.patch(`/assistanceapplication/${id}/status`, { status });
    return data;
  },
  async allocateFunds(id, campaignId, allocatedAmount) {
    const { data } = await api.patch(`/assistanceapplication/${id}/allocate-funds`, {
      campaignId,
      allocatedAmount,
    });
    return data;
  },
};