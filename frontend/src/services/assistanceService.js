import api from './api';

export const assistanceService = {
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
};