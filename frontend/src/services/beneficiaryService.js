import api from './api';

export const beneficiaryService = {
  async getAll() {
    const { data } = await api.get('/beneficiary');
    return data;
  },
  async create(payload) {
    const { data } = await api.post('/beneficiary', payload);
    return data;
  },
  async updateStatus(id, status) {
    const { data } = await api.patch(`/beneficiary/${id}/status`, { status });
    return data;
  },
  async remove(id) {
    await api.delete(`/beneficiary/${id}`);
  },
};