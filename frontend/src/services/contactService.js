import api from './api';

export const contactService = {
  async submit(payload) {
    const { data } = await api.post('/contact', payload);
    return data;
  },
};