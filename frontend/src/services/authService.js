import api from './api';

export const authService = {
  async register(payload) {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },
  async login(payload) {
    const { data } = await api.post('/auth/login', payload);
    return data;
  },
  async googleLogin(idToken) {
    const { data } = await api.post('/auth/google', { idToken });
    return data;
  },
  async facebookLogin(accessToken) {
    const { data } = await api.post('/auth/facebook', { accessToken });
    return data;
  },
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};