import api from './api';

export const searchService = {
  async search(query) {
    const { data } = await api.get('/search', { params: { q: query } });
    return data;
  },
};