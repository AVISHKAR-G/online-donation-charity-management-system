import api from './api';

export const securityService = {
  // Fetch the current user's security settings
  getSecuritySettings: async () => {
    const response = await api.get('/settings/security');
    return response.data;
  },
  // Update the current user's security settings
  updateSecuritySettings: async (settings) => {
    // settings: { twoFactorEnabled, loginAlertsEnabled }
    const response = await api.put('/settings/security', settings);
    return response.data;
  },
};

export default securityService;